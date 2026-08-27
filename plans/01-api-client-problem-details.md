# 01 — `api-client.ts` no lee errores RFC 7807 ProblemDetail

## Contexto / problema

El backend migró **todos** sus `@RestControllerAdvice` (IAM, CRM, Catalog,
Billing, Profiles) del shape legacy `{timestamp, status, message}` al shape
estándar RFC 7807 `ProblemDetail`:

```json
{
  "type": "about:blank",
  "title": "Category not found",
  "status": 404,
  "detail": "Category with id ... does not exist",
  "instance": "/api/catalog/categories/...",
  "timestamp": "2026-08-26T12:00:00Z"
}
```

El frontend, en `contexts/shared/infrastructure/http/api-client.ts:143-147`,
solo sabe leer `.message`:

```ts
function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const message = (body as Record<string, unknown>).message;
  return typeof message === "string" ? message : undefined;
}
```

Como el nuevo cuerpo de error no tiene `message`, esta función siempre
devuelve `undefined`, y en `requestWithResponse` (líneas ~92-98) se cae al
fallback genérico:

```ts
throw new ErrorType(
  extractMessage(responseBody) ??
    errorMessage ??
    `API request failed with status ${response.status}`,
  ...
);
```

Efecto observable: **todos** los mensajes de error específicos del backend
(validaciones, "ya existe", "no encontrado", permisos, etc.) desaparecen de
toda la app y se reemplazan por el `errorMessage` genérico que cada gateway
pasa como opción (p. ej. `"Authentication request failed"`,
`"Failed to retrieve user profile"`) o por
`API request failed with status 404`. Esto afecta a los 6 bounded contexts
que usan `apiClient` (todos, ya que es el único cliente HTTP compartido).

Es el fix de mayor relación impacto/esfuerzo: un solo archivo, sin tocar
gateways ni schemas de cada BC.

## Archivos a tocar

- `contexts/shared/infrastructure/http/api-client.ts` (función `extractMessage`, líneas 143-147)
- Nuevo: `contexts/shared/infrastructure/http/api-client.test.ts` (si no existe ya un test file para este módulo — verificar primero con `find`/`ls`; si existe, extender ese archivo en vez de crear uno nuevo)

## Pasos

1. Reemplazar `extractMessage` para que intente, en este orden de
   prioridad, `message` → `detail` → `title`, manteniendo compatibilidad
   hacia atrás con cualquier endpoint que todavía devuelva el shape legacy
   `{message}` (no se puede asumir que el backend migró el 100% de las
   respuestas de error; algunas excepciones no capturadas por un
   `@ExceptionHandler` específico pueden seguir devolviendo otro shape, y
   algunos tests/mocks del propio frontend usan `{message}`):

   ```ts
   function extractMessage(body: unknown): string | undefined {
     if (!body || typeof body !== "object") return undefined;
     const record = body as Record<string, unknown>;

     const message = record.message;
     if (typeof message === "string" && message.length > 0) return message;

     const detail = record.detail;
     if (typeof detail === "string" && detail.length > 0) return detail;

     const title = record.title;
     if (typeof title === "string" && title.length > 0) return title;

     return undefined;
   }
   ```

   Nota: usar `.length > 0` en vez de solo `typeof === "string"` porque
   `ProblemDetail` puede traer `title: ""` en algunos casos de Spring cuando
   no se setea explícitamente — no queremos mostrar un mensaje vacío como si
   fuera un mensaje real.

2. No cambiar la firma de `extractMessage` ni el resto de
   `requestWithResponse`: el orden de fallback (`extractMessage(body) ??
   errorMessage ?? "API request failed..."`) ya es correcto y no necesita
   tocarse.

3. Revisar si algún gateway o componente ya intenta leer campos del error
   distintos a `.message` accediendo directamente a `error.details` (el
   `ApiError.details` guarda el `responseBody` crudo). Buscar con:

   ```
   grep -rn "\.details" contexts --include=*.ts | grep -v test
   ```

   Si hay algún lugar que ya parsea `details.message` manualmente para
   mostrar algo más específico, no hace falta tocarlo (seguirá funcionando
   igual, ahora simplemente `error.message` también será correcto), pero
   dejarlo anotado por si conviene simplificarlo en un fix aparte — **no lo
   toques en este plan**, es fuera de alcance.

## Tests requeridos

Crear/extender `contexts/shared/infrastructure/http/api-client.test.ts` con
casos que mockeen `fetch` y verifiquen `error.message` para:

1. Respuesta de error legacy `{ timestamp, status, message: "Invalid email" }`
   → `error.message === "Invalid email"` (no debe romperse la compatibilidad
   hacia atrás).
2. Respuesta de error RFC 7807 completa
   `{ type, title: "Not Found", status: 404, detail: "Category with id X does not exist", instance, timestamp }`
   → `error.message === "Category with id X does not exist"` (debe preferir
   `detail` sobre `title`).
3. Respuesta de error RFC 7807 **sin** `detail` (solo `title`)
   `{ type, title: "Conflict", status: 409, instance, timestamp }`
   → `error.message === "Conflict"`.
4. Respuesta de error sin ningún campo reconocible (`{}` o body no-JSON) →
   cae al `errorMessage` pasado en las opciones, o al fallback
   `` `API request failed with status ${status}` `` si no se pasó
   `errorMessage`.
5. (Regresión) Respuesta 204/205 sin body → sigue sin lanzar y `data` es
   `undefined`.

Si ya existen tests de `ApiClient`/`requestWithResponse`, agregar estos casos
ahí en vez de duplicar el setup de mocks de `fetch`.

## Criterio de aceptación

- `bunx tsc --noEmit` sin nuevos errores.
- `bun run test contexts/shared/infrastructure/http/api-client.test.ts`
  (o el comando de test equivalente del repo) en verde, cubriendo los 5
  casos de arriba.
- Prueba manual: forzar un error conocido en cualquier BC (p. ej. intentar
  crear una categoría de catálogo con nombre duplicado, o loguearse con
  credenciales inválidas) y confirmar que el mensaje mostrado en la UI ya
  no es genérico sino el `detail`/`title` real que devuelve el backend.

## Riesgos / qué no romper

- No degradar el caso legacy: mientras haya endpoints (propios o de
  terceros, p. ej. si el backend no migró el 100%) que sigan devolviendo
  `{message}`, ese campo debe seguir teniendo prioridad sobre `detail`/`title`.
- No asumir que `detail` siempre existe: `ProblemDetail` de Spring permite
  omitirlo; el fallback a `title` y luego al `errorMessage` de la opción es
  obligatorio para no volver a caer en `undefined` silencioso.
- Este cambio es puramente de lectura de errores; no toca ninguna ruta, ni
  el flujo de sesión del `proxy.ts`, ni el manejo de 401 para refresh de
  tokens (si existe) — verificar que ningún componente use
  `error.message === "algo hardcodeado"` para tomar decisiones de control de
  flujo (buscar con `grep -rn "error.message ===" contexts`). Si aparece
  algún caso así, listarlo como riesgo adicional pero no cambiarlo salvo que
  sea trivialmente seguro.

## Tamaño estimado

**S** — un archivo de producción + un archivo de test, sin cambios de
arquitectura.
