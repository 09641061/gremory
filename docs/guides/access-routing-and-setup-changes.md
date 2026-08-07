# Access, Routing, and Setup Changes

Fecha de referencia: 2026-08-07

Este documento resume los cambios realizados en el frontend para corregir el flujo de acceso, la ruta inicial de entrada, el comportamiento de usuarios free y el caso de usuarios invitados al equipo.

La idea principal fue esta:

- no asumir que `schedule` es la pantalla correcta para todos
- no mandar a un usuario invitado a crear una organization propia
- no dejar al usuario atrapado en un bucle entre `chat`, `schedule` y `organizations`
- respetar mejor los permisos reales que llegan desde el backend

## 1. Problema que se estaba resolviendo

Antes, el frontend tomaba decisiones demasiado simples:

- si no habia organization propia, se mandaba a `/organizations`
- si el usuario era free, se asumia que siempre debia ir a `/schedule`
- si una pantalla no tenia acceso, se enviaba muchas veces a `/chat`

Eso funcionaba en algunos casos, pero rompia otros:

- un user free con acceso al core app podia quedar mal redirigido
- un invitado al team no tenia organization propia, pero si acceso a una organization ajena
- algunos redirects terminaban rebotando entre pantallas sin salida clara

## 2. Cambio principal: decidir la ruta inicial por accesos reales

Se agrego una politica nueva de landing en:

- [`contexts/iam/domain/services/landing-path.policy.ts`](../../contexts/iam/domain/services/landing-path.policy.ts)

Esa politica centraliza la decision de entrada al sistema.

### Que hace

Evalua:

- si el usuario tiene suscripcion activa
- si el usuario tiene organization propia
- si el usuario es miembro invitado de una o mas establishments
- que permisos efectivos tiene en esas establishments

### Resultado

En lugar de elegir siempre una sola ruta fija, ahora el frontend puede mandar al usuario al primer modulo que realmente puede usar.

El orden de preferencia para invitados queda asi:

1. `schedule`
2. `catalog`
3. `crm`
4. `team`
5. `organizations`

Si no tiene acceso util a ninguno, cae en la ruta por defecto.

## 3. Cambio en el proxy de entrada

Se modifico:

- [`proxy.ts`](../../proxy.ts)

### Antes

El proxy hacia una lectura demasiado simple:

- si habia organization propia, usaba la ruta del plan
- si no habia organization, mandaba a `/organizations`

Eso era incorrecto para invitados al equipo.

### Ahora

El proxy:

- valida la sesion
- valida la suscripcion
- valida si existe organization propia
- valida si existe acceso de workforce para invitados
- resuelve la ruta inicial con permisos reales

### Implicaciones

Esto corrige tres casos importantes:

- un user free con setup incompleto sigue yendo a `organizations`
- un invitado al team ya no intenta crear organization propia
- un usuario con permiso limitado entra al primer modulo util en vez de quedar atrapado

## 4. Cambios en el layout protegido

Se modifico:

- [`app/(protected)/layout.tsx`](../../app/(protected)/layout.tsx)

### Que cambio

El logo del header ya no apunta a una ruta fija. Ahora usa la misma politica de landing que el proxy.

### Por que importa

Antes el logo podia mandar a una pantalla incorrecta para un invitado o para un user free.

Ahora el logo sigue la misma logica que la entrada principal del sistema.

## 5. Cambios en pantallas protegidas

Se ajustaron estos archivos:

- [`app/(protected)/(app)/chat/page.tsx`](../../app/(protected)/(app)/chat/page.tsx)
- [`app/(protected)/(app)/schedule/page.tsx`](../../app/(protected)/(app)/schedule/page.tsx)
- [`app/(protected)/(app)/catalog/page.tsx`](../../app/(protected)/(app)/catalog/page.tsx)
- [`app/(protected)/(app)/crm/page.tsx`](../../app/(protected)/(app)/crm/page.tsx)
- [`app/(protected)/(app)/team/page.tsx`](../../app/(protected)/(app)/team/page.tsx)
- [`app/(protected)/(configuration)/establishments/page.tsx`](../../app/(protected)/(configuration)/establishments/page.tsx)
- [`app/(protected)/(configuration)/organizations/page.tsx`](../../app/(protected)/(configuration)/organizations/page.tsx)

### Que se cambio

Se corrigieron los redirects de acceso denegado para que vuelvan a `/` en vez de mandar siempre a `/chat`.

### Por que importa

Si una pantalla no es accesible, volver a `/chat` podia producir un rebote:

- `chat` manda a `schedule`
- `schedule` no encuentra `establishmentId`
- el usuario vuelve a caer en otra pantalla incorrecta

Con `redirect("/")`, el proxy vuelve a tomar control y puede resolver la mejor ruta disponible.

## 6. Cambio en la aceptacion de invitaciones

Se modifico:

- [`contexts/workforce/interfaces/components/invitations/invitation-acceptance-view.tsx`](../../contexts/workforce/interfaces/components/invitations/invitation-acceptance-view.tsx)

### Que cambio

Despues de aceptar una invitacion, ya no se manda al usuario fijo a `/chat`.

Ahora se manda a `/`.

### Por que importa

Un invitado puede no tener acceso a chat.

Si se lo mandaba directamente a chat, podia pasar esto:

- `chat` lo redirige a `schedule`
- `schedule` no tiene `establishmentId` o no tiene permiso
- se produce un bucle o una salida incorrecta

Con `/`, el proxy decide mejor segun los permisos reales.

## 7. Cambios en el acceso al assistant

Ya venia aplicado el ajuste para assistant, pero forma parte del flujo general.

### Resultado

- un usuario free puede usar la app core
- un usuario free no ve assistant en sidebar
- `/chat` ya no es una pantalla universal
- si no tiene acceso al assistant, se manda a la ruta correcta del core app

### Implicaciones

Esto separa dos cosas distintas:

- acceso al producto base
- acceso al modulo assistant

No todo usuario activo necesita ver chat.

## 8. Impacto por tipo de usuario

### Usuario nuevo sin organization ni establishment

- entra al flujo de setup
- si no puede avanzar, vuelve a la ruta base para que el proxy lo redirija correctamente
- no queda atrapado en schedule o chat

### Usuario free con organization propia

- no ve assistant
- puede entrar al core app
- la ruta inicial depende de si tiene setup y acceso efectivo

### Usuario invitado al team

- no necesita crear organization propia
- puede entrar a la primera pantalla que si tenga permitido usar
- ya no se queda trabado en organizations

### Usuario con permisos parciales

- entra al modulo que le corresponde
- si no puede leer uno, se le busca el siguiente accesible

## 9. Resumen de archivos tocados

### Cambios grandes

- [`proxy.ts`](../../proxy.ts)
- [`app/(protected)/layout.tsx`](../../app/(protected)/layout.tsx)
- [`contexts/iam/domain/services/landing-path.policy.ts`](../../contexts/iam/domain/services/landing-path.policy.ts)

### Cambios medianos

- [`app/(protected)/(app)/chat/page.tsx`](../../app/(protected)/(app)/chat/page.tsx)
- [`app/(protected)/(app)/schedule/page.tsx`](../../app/(protected)/(app)/schedule/page.tsx)
- [`app/(protected)/(app)/catalog/page.tsx`](../../app/(protected)/(app)/catalog/page.tsx)
- [`app/(protected)/(app)/crm/page.tsx`](../../app/(protected)/(app)/crm/page.tsx)
- [`app/(protected)/(app)/team/page.tsx`](../../app/(protected)/(app)/team/page.tsx)
- [`app/(protected)/(configuration)/establishments/page.tsx`](../../app/(protected)/(configuration)/establishments/page.tsx)
- [`app/(protected)/(configuration)/organizations/page.tsx`](../../app/(protected)/(configuration)/organizations/page.tsx)
- [`contexts/workforce/interfaces/components/invitations/invitation-acceptance-view.tsx`](../../contexts/workforce/interfaces/components/invitations/invitation-acceptance-view.tsx)

### Soporte de pruebas

- [`tests/unit/contexts/iam/interfaces/proxy.test.ts`](../../tests/unit/contexts/iam/interfaces/proxy.test.ts)

## 10. Resultado esperado

Con estos cambios, el frontend ahora:

- respeta mejor el tipo de usuario
- evita redirecciones incorrectas
- evita bucles entre pantallas protegidas
- separa mejor free, owner e invited user
- usa una sola logica para decidir el destino inicial

## 11. Nota practica para soporte

Si un usuario cae en una pantalla inesperada, revisar primero:

- si tiene organization propia
- si tiene acceso real de workforce
- que permisos efectivos trae la establishment activa
- si la ruta de entrada fue `/` o una ruta interna manual

Ese orden ayuda a diagnosticar el 90% de los problemas de navegacion que se corrigieron aqui.
