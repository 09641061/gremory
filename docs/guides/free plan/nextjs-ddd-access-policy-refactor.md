# Next.js DDD Access Policy Refactor

Fecha de referencia: 2026-08-07

Este documento resume el refactor aplicado para que los módulos de acceso sigan de forma más estricta la guía `nextjs-ddd`.

La idea principal fue esta:

- mantener `app/` como capa de orquestación
- mover la lógica repetida a un helper compartido y server-only
- conservar cada regla de negocio dentro de su contexto correspondiente
- evitar duplicación entre `business`, `catalog`, `crm`, `workforce`, `scheduling` e `iam`

## 1. Qué problema se corrigió

Antes, varios servicios de permisos repetían la misma mecánica:

- buscar el establishment activo
- revisar si el usuario tiene rol `read`
- comparar listas de permisos efectivos
- decidir si era owner o employee

Eso no estaba mal funcionalmente, pero sí estaba dejando el código más difícil de mantener.

El riesgo era este:

- si cambiaba la forma de elegir el establishment activo, había que tocar varios archivos
- si cambiaba la definición de `read`, había que repetir el cambio en varios contextos
- si aparecía otro contexto con la misma lógica, se copiaba otra vez el patrón

## 2. Cambio principal: helper compartido de contexto de acceso

Se agregó:

- [`contexts/shared/application/internal/queryservices/access-context.helpers.ts`](../../contexts/shared/application/internal/queryservices/access-context.helpers.ts)

### Qué contiene

El archivo expone helpers puros y simples:

- `pickActiveEstablishment(...)`
- `findFirstMatchingEstablishment(...)`
- `hasReadRole(...)`
- `hasAnyPermission(...)`

### Por qué este lugar

Se ubicó en `contexts/shared/application` porque:

- no pertenece solo a `business`
- no es una regla exclusiva de `catalog` o `crm`
- es lógica de aplicación reutilizable entre varios bounded contexts

Eso respeta mejor la separación pedida por `nextjs-ddd`.

## 3. Qué módulos se refactorizaron

Se ajustaron estos servicios:

- [`contexts/business/application/internal/queryservices/business-access-policy.service.ts`](../../contexts/business/application/internal/queryservices/business-access-policy.service.ts)
- [`contexts/catalog/application/internal/queryservices/catalog-access-policy.service.ts`](../../contexts/catalog/application/internal/queryservices/catalog-access-policy.service.ts)
- [`contexts/crm/application/internal/queryservices/crm-access-policy.service.ts`](../../contexts/crm/application/internal/queryservices/crm-access-policy.service.ts)
- [`contexts/workforce/application/internal/queryservices/workforce-access-policy.service.ts`](../../contexts/workforce/application/internal/queryservices/workforce-access-policy.service.ts)
- [`contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service.ts`](../../contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service.ts)
- [`contexts/iam/application/internal/queryservices/landing-path-query.service.ts`](../../contexts/iam/application/internal/queryservices/landing-path-query.service.ts)

### Qué cambió en ellos

No se cambió la regla de negocio principal de cada módulo.

Lo que cambió fue la forma de expresar la lógica:

- menos `find(...)` repetidos
- menos `roles.some(...)` duplicados
- menos `permissions.includes(...)` repetidos
- mejor reutilización de helpers

## 4. Qué se movió y qué no

### Lo que sí se centralizó

- selección del establishment activo
- validación del rol `read`
- chequeo de permisos contra listas permitidas

### Lo que no se centralizó

- las reglas específicas de `catalog`
- las reglas específicas de `crm`
- las reglas específicas de `workforce`
- las reglas específicas de `scheduling`
- la decisión de home route de `iam`

Eso fue intencional.

La idea no era crear una “capa mágica” que esconda todo, sino compartir solo la parte mecánica que se repetía.

## 5. Impacto por contexto

### Business

Ahora la política de negocio lee mejor:

- se detecta el establishment activo con un helper
- se reutiliza la detección de permisos y rol `read`
- la lógica owner/employee sigue viviendo en el mismo servicio

Implicación práctica:

- si cambia la forma de resolver el active establishment, se corrige en un solo lugar

### Catalog

Se simplificó la lectura de permisos para categorías y servicios.

Implicación práctica:

- el permiso real sigue viniendo desde workforce
- la pantalla de catálogo sigue dependiendo de permisos efectivos
- solo se redujo duplicación

### CRM

Se aplicó el mismo patrón que en catalog.

Implicación práctica:

- el acceso a clientes queda más fácil de mantener
- la lógica de `read` queda consistente con otros módulos

### Workforce

Se consolidó la evaluación de roles e invitaciones.

Implicación práctica:

- cambia menos el comportamiento accidental entre pantallas parecidas
- el default establishment y la búsqueda de accesos quedan más uniformes

### Scheduling

Se limpió el criterio de acceso a citas.

Implicación práctica:

- la app sigue usando permisos efectivos
- el refactor no tocó la política de acceso, solo su implementación

### IAM

Se reutilizaron los helpers compartidos para decidir la landing page.

Implicación práctica:

- el cálculo de ruta inicial sigue siendo el mismo
- el código queda menos acoplado a funciones locales duplicadas

## 6. Qué se eliminó

Se retiró la copia del helper que había quedado dentro de `business`.

### Por qué

Porque un helper compartido dentro de `business` podía dar una impresión equivocada:

- parecía una utilidad del bounded context de negocio
- pero en realidad la usan varios contextos

Moverlo a `shared/application` deja más clara la intención.

## 7. Resultado esperado

Con este refactor:

- el código es más fácil de leer
- la lógica repetida está mejor contenida
- el proyecto se alinea mejor con `nextjs-ddd`
- los cambios futuros de acceso serán más baratos de mantener

## 8. Validación hecha

Se verificó que el refactor no rompiera el flujo:

- `bunx eslint ...`
- `bunx vitest run tests/unit/contexts/iam/interfaces/proxy.test.ts`

Ambos pasaron correctamente.

## 9. Relación con la guía anterior

Esta guía complementa a:

- [`docs/guides/access-routing-and-setup-changes.md`](./access-routing-and-setup-changes.md)

La guía anterior explica el flujo de navegación y redirecciones.

Esta guía explica la limpieza estructural y de capas que se hizo después para dejar ese flujo más alineado con `nextjs-ddd`.

## 10. Resumen corto

En simple:

- antes había lógica repetida de acceso en varios contextos
- ahora esa parte común vive en `shared/application`
- cada contexto sigue conservando sus reglas propias
- el frontend quedó más ordenado, más mantenible y más cercano a la arquitectura DDD que pide el proyecto
