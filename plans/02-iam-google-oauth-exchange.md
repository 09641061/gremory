# 02 — Login con Google roto: adoptar el flujo de exchange code de un solo uso

## Contexto / problema

**El login con Google está muerto en `develop`.**

Backend (antes): `GET /api/v1/auth/google/callback` redirigía a
`{frontend}/auth/callback#access_token=...&refresh_token=...`.

Backend (ahora), en
`haimiya:src/main/java/com/takodu/iam/interfaces/rest/controllers/IamAuthenticationController.java`
(método `googleCallback`):

```java
var exchangeCode = commands.createGoogleExchangeCode(
    commands.authenticateGoogle(new AuthenticateGoogleCommand(code)));
var location = UriComponentsBuilder.fromUriString(frontendUrl)
    .path("/auth/callback")
    .fragment("code=" + exchangeCode)
    .build().toUri();
return ResponseEntity.status(302).header("Cache-Control", "no-store").location(location).build();
```

Redirige a `{frontend}/auth/callback#code=<exchangeCode>` y expone
`GET /api/v1/auth/google/exchange?code=...` (ruta pública en
`SecurityConfiguration`) que devuelve `{accessToken, refreshToken}`.

El código de intercambio es **de un solo uso**: se guarda en Redis y se
consume atómicamente con un script Lua `GET+DEL`, con TTL. Un segundo
intento de canje devuelve `401 "Invalid or expired Google exchange code"`.

Estado actual del frontend (sin tocar, todo roto):

- `contexts/iam/interfaces/components/auth-callback.tsx` lee `access_token`
  y `refresh_token` del `location.hash`. Como el backend ahora manda `code=`,
  ninguno de los dos existe, así que el componente hace `router.replace(returnTo ?? "/")`,
  el `proxy.ts` detecta que no hay sesión y termina mandando al usuario a
  `/login`. **El login "falla en silencio"**: no hay error visible, el
  usuario simplemente vuelve a la pantalla de login sin saber por qué.
- `api.config.ts` (`routes.authentication`) no tiene ninguna ruta de
  exchange.
- No existe ningún command/método `exchangeGoogleCode` en la capa de
  dominio/aplicación/infraestructura de IAM.

El flujo de **magic link** (`GET /api/v1/auth/verify`) sigue funcionando
como antes: `contexts/iam/interfaces/components/verify.tsx` llama a
`verifyMagicLink()` (server-side, sin redirect HTTP) y arma él mismo el
fragment `#access_token=...&refresh_token=...` para redirigir a
`/auth/callback`. **Este flujo no cambió en el backend y no debe romperse.**

## Archivos a tocar

- `api.config.ts` — nueva ruta de exchange
- `contexts/iam/domain/services/iam-authentication-command.service.ts` — nuevo método en la interfaz
- `contexts/iam/application/internal/commandservices/iam-authentication-command.service.ts` — delega al gateway (mismo patrón que `verifyMagicLink`)
- `contexts/iam/infrastructure/gateways/iam-api.gateway.ts` — implementación HTTP
- Nuevo: `contexts/iam/domain/model/commands/exchange-google-code.command.ts`
- Nueva server action (ubicación sugerida: `contexts/iam/interfaces/actions/exchange-google-code.action.ts`, junto a las demás actions de IAM — verificar convención con `ls contexts/iam/interfaces/actions/`)
- `contexts/iam/interfaces/components/auth-callback.tsx` — soportar ambas formas del fragment
- Opcional/cosmético: `app/auth/callback/page.tsx`

## Pasos

### 1. Ruta en `api.config.ts`

Agregar dentro de `routes.authentication`:

```ts
googleExchange: "/api/v1/auth/google/exchange",
```

(junto a `googleAuthorize: "/api/v1/auth/google/authorize"`, que ya existe).

### 2. Command de dominio

`contexts/iam/domain/model/commands/exchange-google-code.command.ts`:

```ts
export type ExchangeGoogleCodeCommand = Readonly<{
  code: string;
}>;
```

### 3. Interfaz del servicio de dominio

En `contexts/iam/domain/services/iam-authentication-command.service.ts`,
agregar al `interface IamAuthenticationCommandService`:

```ts
exchangeGoogleCode(command: ExchangeGoogleCodeCommand): Promise<AuthenticationSession>;
```

(con el import correspondiente de `ExchangeGoogleCodeCommand`). Reutiliza
`AuthenticationSession` (`{accessToken, refreshToken}`), que ya existe y es
exactamente el shape que devuelve `/google/exchange`.

### 4. Application service

En
`contexts/iam/application/internal/commandservices/iam-authentication-command.service.ts`,
seguir el mismo patrón delgado que `verifyMagicLink`:

```ts
exchangeGoogleCode(command: ExchangeGoogleCodeCommand) {
  return this.gateway.exchangeGoogleCode(command);
}
```

(con el import de `ExchangeGoogleCodeCommand` agregado arriba).

### 5. Gateway HTTP

En `contexts/iam/infrastructure/gateways/iam-api.gateway.ts`, seguir
**exactamente** el patrón de `verifyMagicLink` (GET con query param,
`apiClient.request`, parseo con `authenticationSessionSchema`):

```ts
async exchangeGoogleCode(
  command: ExchangeGoogleCodeCommand
): Promise<AuthenticationSession> {
  const session = await apiClient.request<unknown>(
    `${apiConfig.routes.authentication.googleExchange}?code=${encodeURIComponent(command.code)}`,
    {
      errorMessage: "Authentication request failed",
      errorType: IamApiError,
    },
  );

  return authenticationSessionSchema.parse(session);
}
```

No hace falta un schema nuevo: `authenticationSessionSchema` ya valida
`{accessToken, refreshToken}` y el backend devuelve exactamente ese shape.

### 6. Server action de exchange + creación de sesión

Nueva action que:
1. Recibe el `code` del fragment.
2. Llama a `createIamAuthenticationCommandService().exchangeGoogleCode({ code })`.
3. Si tiene éxito, reusa `createSessionAction({ accessToken, refreshToken })`
   (ya existe en `contexts/iam/interfaces/actions/create-session.action.ts`,
   setea cookies y limpia el estado de workspace de la sesión anterior — no
   dupliques esa lógica).
4. Propaga el error si el exchange falla (401 por código inválido/expirado,
   o cualquier otro), para que el componente decida el redirect.

Ejemplo (ajustar nombre/ubicación a la convención real del directorio
`contexts/iam/interfaces/actions/`, verificarla antes de escribir el
archivo):

```ts
"use server";

import "server-only";
import { createIamAuthenticationCommandService } from "@/contexts/iam/application/internal/commandservices/iam-authentication-command.service";
import { createSessionAction } from "./create-session.action";

export async function exchangeGoogleCodeAction(code: string): Promise<void> {
  const session = await createIamAuthenticationCommandService().exchangeGoogleCode({ code });
  await createSessionAction(session);
}
```

Nota: verificar la ruta real de import de
`createIamAuthenticationCommandService` (puede diferir del ejemplo, seguir
el mismo import que usa `verify.tsx`).

### 7. `auth-callback.tsx`: soportar ambas formas del fragment, con guard de consumo único

**Esto es el punto más delicado del plan.** El componente debe distinguir
dos formas posibles en `location.hash`:

- Magic link (sin cambios, viene de `verify.tsx`): `#access_token=...&refresh_token=...`
- Google OAuth (nuevo): `#code=...`

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { createSessionAction } from "@/contexts/iam/interfaces/actions/create-session.action";
import { exchangeGoogleCodeAction } from "@/contexts/iam/interfaces/actions/exchange-google-code.action";

export function AuthCallback({ returnTo = null }: { returnTo?: string | null }) {
  const router = useRouter();
  const consumed = useRef(false); // ver punto crítico (a) más abajo

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const code = params.get("code");

    // Limpiar el fragment del historial: no queremos que un token/código
    // de un solo uso quede visible en el historial del navegador.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const redirectToLogin = () =>
      router.replace(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");

    if (accessToken && refreshToken) {
      void (async () => {
        try {
          await createSessionAction({ accessToken, refreshToken });
          router.replace(returnTo ?? "/");
        } catch {
          redirectToLogin();
        }
      })();
      return;
    }

    if (code) {
      void (async () => {
        try {
          await exchangeGoogleCodeAction(code);
          router.replace(returnTo ?? "/");
        } catch {
          redirectToLogin();
        }
      })();
      return;
    }

    router.replace("/");
  }, [returnTo, router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background text-foreground"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">Signing you in</span>
    </main>
  );
}
```

## Puntos críticos (obligatorios, no opcionales)

### (a) Guard de consumo único

React StrictMode (activo en dev) monta y desmonta el efecto dos veces. Sin
un guard como el `useRef` de arriba (o una técnica equivalente que
garantice que el `code`/tokens solo se consuman una vez por montaje real),
el `useEffect` se ejecuta dos veces: la primera consume el código
correctamente y crea la sesión; la segunda intenta canjear el mismo código
—ya borrado de Redis por el script Lua `GET+DEL`— y recibe `401 "Invalid or
expired Google exchange code"`, lo que dispara `redirectToLogin()` **después**
de que la sesión ya se creó. El usuario ve que el login "falla" (termina en
`/login`) aunque la sesión quedó bien armada en cookies. **Esto ya se
reprodujo en vivo.** El guard debe existir tanto para la rama de `code` como
para la de `access_token`/`refresh_token` (aunque el magic link no consuma
nada de un solo uso del lado del navegador, mantener un único punto de
entrada al efecto simplifica el componente y evita doble llamada a
`createSessionAction` en general).

### (b) No romper el flujo de magic link

`verify.tsx` sigue construyendo `#access_token=...&refresh_token=...` y
redirigiendo a `/auth/callback` — **esto no cambia en el backend ni debe
cambiar acá**. El componente `AuthCallback` tiene que seguir soportando esa
forma exactamente como hoy (rama `accessToken && refreshToken`), además de
la nueva rama `code`. No reemplazar una por otra: son dos flujos válidos que
conviven, distinguibles solo por qué claves trae el fragment.

### Limpieza del fragment

Usar `history.replaceState` para quitar el `#code=...` o
`#access_token=...` del historial del navegador apenas se lee, antes de
esperar la respuesta async del exchange/creación de sesión — no dejar un
código o token de un solo uso visible en el historial más tiempo del
necesario, y evitar que un refresh accidental de la página reintente
consumir un código ya gastado.

## Paso opcional (cosmético) — warning de Next en `app/auth/callback/page.tsx`

Con `cacheComponents: true` en `next.config.ts`, Next emite un warning
("runtime data during prerendering") en `app/auth/callback/page.tsx` porque
lee `searchParams`/`cookies()` de forma dinámica. Se resuelve agregando
`export const instant = false` (verificar el nombre exacto de la opción
soportada por la versión de Next del repo — puede llamarse distinto) o
envolviendo el contenido en `<Suspense>`. No afecta funcionalidad, hacerlo
al final si sobra tiempo.

## Tests requeridos

Dado que gran parte del flujo es server-side (`server-only`, cookies,
`fetch`), priorizar tests unitarios en las capas que sí son testeables sin
DOM/Next runtime:

1. **Gateway** (`iam-api.gateway.test.ts` si existe, o nuevo archivo junto a
   los tests existentes de IAM): `exchangeGoogleCode` hace `GET` a
   `googleExchange?code=...` con el código URL-encodeado, parsea la
   respuesta con `authenticationSessionSchema`, y en caso de 401 lanza
   `IamApiError` con status 401 y el mensaje del backend (dependiendo del
   plan 01, debería venir de `detail`).
2. **Application service**: `exchangeGoogleCode` delega al gateway sin
   transformar el resultado (test trivial, mismo patrón que el que exista
   hoy para `verifyMagicLink`, si lo hay).
3. **Componente `AuthCallback`** (si el repo ya testea componentes client
   con vitest + testing-library — verificar con `find contexts/iam -iname
   "*.test.tsx"`):
   - Con `#access_token=x&refresh_token=y` en el hash → llama a
     `createSessionAction` una sola vez y redirige a `returnTo ?? "/"`.
   - Con `#code=abc` en el hash → llama a `exchangeGoogleCodeAction("abc")`
     una sola vez y redirige a `returnTo ?? "/"`.
   - Sin ninguna de las dos formas → redirige a `/`.
   - Si `exchangeGoogleCodeAction` rechaza (simulando 401) → redirige a
     `/login` (o `/login?next=...`).
   - **Doble montaje del efecto (simular StrictMode)**: verificar que
     `exchangeGoogleCodeAction`/`createSessionAction` se llaman exactamente
     una vez, no dos, dado el guard.

Si el repo no tiene infraestructura de test de componentes React con
efectos, dejar este último bloque como test manual documentado en el
criterio de aceptación, pero no omitir los tests de gateway/application
service, que sí son alcanzables sin DOM.

## Criterio de aceptación

- `bunx tsc --noEmit` sin nuevos errores.
- `bun run test` en verde (gateway + application service, al menos).
- Prueba manual end-to-end con backend local corriendo la rama
  `feature/add-reviwer-e2df` de `haimiya`:
  1. Iniciar login con Google desde `/login`.
  2. Completar el consentimiento de Google.
  3. Verificar que se redirige a `{frontend}/auth/callback#code=...` y de
     ahí, sin pasar por `/login`, al destino final (`returnTo` o `/`).
  4. Verificar en las DevTools que las cookies de sesión (`accessToken`,
     `refreshToken`) quedaron seteadas.
  5. Con React StrictMode activo (`next dev`, comportamiento por defecto),
     confirmar que el paso 3 no falla intermitentemente — repetir el login
     varias veces.
  6. Copiar la URL con `#code=...` (antes de que se limpie) y volver a
     pegarla en el navegador manualmente para simular un reintento con
     código ya consumido → debe terminar en `/login`, sin excepciones no
     controladas en consola.
  7. Probar el flujo de **magic link** end-to-end (pedir enlace por email,
     abrirlo) y confirmar que sigue funcionando exactamente igual que antes
     de este cambio.

## Riesgos / qué no romper

- **No romper el flujo de magic link** (`verify.tsx` → `#access_token=&refresh_token=`):
  es el riesgo principal de este plan porque ambos flujos comparten el
  mismo componente `AuthCallback`. Los tests y la prueba manual del punto 7
  son obligatorios, no opcionales.
- **No romper el flujo de sesión del `proxy.ts`**: `createSessionAction` ya
  limpia cookies de workspace de la sesión anterior; no dupliques esa
  limpieza en la nueva action de exchange, solo reusala.
- El guard de consumo único (`useRef`) debe sobrevivir a StrictMode sin
  introducir un doble-fetch visible al usuario ni una carrera entre las dos
  ramas (`code` vs `access_token`) si por algún motivo el hash trajera
  ambas cosas a la vez (no debería pasar, pero el código no debe asumir
  que son mutuamente excluyentes solo por convención del backend).
- El código de exchange es de un solo uso con TTL: si el usuario tarda
  demasiado en cargar la página `/auth/callback` (conexión lenta, tab en
  background suspendida por el navegador), el exchange puede fallar por
  TTL vencido. Este plan no cubre una UX de reintento — documentarlo como
  limitación conocida, no como bug a resolver acá.

## Tamaño estimado

**M** — toca 4-5 archivos de producción (dominio, aplicación,
infraestructura, interfaces) más el componente y tests; lógica de por sí
simple pero con un punto de concurrencia (StrictMode) que requiere cuidado
y verificación manual.
