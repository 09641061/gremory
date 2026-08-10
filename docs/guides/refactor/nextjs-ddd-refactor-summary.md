# Next.js DDD Refactor Summary

Reference date: 2026-08-07

This document summarizes el estado actual del refactor aplicado al frontend para alinearlo mejor con la guia `nextjs-ddd`.

La meta principal fue esta:

- dejar `app/` como capa de orquestacion
- mover la resolucion de accesos y rutas a la capa de aplicacion
- hacer que los componentes UI solo rendericen y emitan eventos
- evitar duplicacion entre contextos
- reducir bucles de navigation para usuarios free, owners e invitados

## 1. Que problema se estaba corrigiendo

Antes habia mezcla de responsabilidades en varios puntos:

- the header decided routes and permissions on its own
- algunos selectores conocian detalles de navigation
- the entry flow was not unified para todos los tipos de usuario
- varias protected screens dependian de supuestos distintos sobre `chat`, `schedule` u `organizations`

Eso generaba estos sintomas:

- free users sent a una pantalla que no debian ver
- team invitees trapped en pantallas de setup
- redirecciones repetidas entre paginas protegidas
- componentes UI con logica que deberia vivir en aplicacion

## 2. Separacion por capas

La estructura quedo mas cercana a la guia:

- `app/` orquesta rutas y layout
- `application/` resuelve accesos, landing pages y view models
- `interfaces/` contiene UI y componentes de presentacion
- `infrastructure/` sigue manejando IO y detalles tecnicos

### Lo importante

La regla ya no es "el componente decide a donde ir".

Ahora la regla es:

- la aplicacion decide que esta permitido
- la UI solo ejecuta la navigation con callbacks o destinos ya resueltos

## 3. Main entry flow

Se centralizo en la capa de aplicacion la resolucion de la shell del usuario:

- [`contexts/shared/application/internal/queryservices/app-shell-query.service.ts`](../../contexts/shared/application/internal/queryservices/app-shell-query.service.ts)
- [`contexts/shared/application/model/app-shell.view-models.ts`](../../contexts/shared/application/model/app-shell.view-models.ts)

### Que resuelve `AppShellQueryService`

Devuelve un `AppShellViewModel` con:

- `workspace`
- `hasAssistantAccess`
- `homeHref`
- `visibleSidebarRoutes`
- `headerNavigation`

### Por que importa

This prevents each component o layout calcule permisos y rutas de forma distinta.

La ruta de entrada ahora sale de un solo lugar y el resto de la app consume ese resultado.

## 4. Layout protegido

Se ajusto:

- [`app/(protected)/layout.tsx`](../../app/(protected)/layout.tsx)

### Que hace ahora

- pide la shell a la capa de aplicacion
- pasa el `workspace` al cliente protegido
- pasa `headerNavigation`
- pasa `homeHref`
- mantiene el fallback del header simple

### Implicacion practica

The layout no longer contains business logic.

Solo coordina:

- lectura de sesion
- subscription retrieval
- resolucion de shell
- render del header y del contenido

## 5. Header compartido

Se ajusto:

- [`contexts/shared/interfaces/components/header.tsx`](../../contexts/shared/interfaces/components/header.tsx)

### Que cambio

Previously, the header knew el establishment selector y parte de la navigation.

Ahora:

- recibe `organizationSlot`
- recibe `establishmentSlot`
- recibe `homeHref`
- no conoce contextos de negocio

### Por que es mejor

`shared` queda realmente compartido.

Eso reduce acoplamiento entre `shared` y `business`, y hace mas facil reutilizar el header en otros flujos.

## 6. Selectores

Se ajustaron estos componentes:

- [`contexts/business/interfaces/components/organization/organization-selector/organization-selector.tsx`](../../contexts/business/interfaces/components/organization/organization-selector/organization-selector.tsx)
- [`contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector.tsx`](../../contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector.tsx)

### OrganizationSelector

Quedo como componente de presentacion:

- muestra organizaciones
- emite `onSelect`
- emite `onSelectAll`
- no decide rutas por si mismo

### EstablishmentSelector

Tambien quedo como componente de presentacion:

- shows establishments
- emite `onSelect`
- emite `onSelectAll`
- emite `onNew`
- no usa `router` ni `pathname`

### Implicacion practica

Los selectores ya no mezclan UI con reglas de navigation.

Eso hace mas facil:

- probarlos
- reutilizarlos
- moverlos si cambia la estructura visual

## 7. Client del header protegido

Se ajusto:

- [`contexts/business/interfaces/components/organization/protected-header-client/protected-header-client.tsx`](../../contexts/business/interfaces/components/organization/protected-header-client/protected-header-client.tsx)

### Que hace ahora

Este componente sigue siendo el punto de composicion del header protegido, pero su logica quedo mas clara:

- usa `usePathname`, `useRouter` y `useSearchParams` porque depende del estado actual de la URL
- calcula el `homeHref` con `establishmentId` cuando corresponde
- usa `headerNavigation` del view model para decidir destinos permitidos
- arma los callbacks de navigation para `OrganizationSelector` y `EstablishmentSelector`

### Que no hace

- does not invent permissions
- does not decide business rules
- no contiene la logica central de acceso

### Implicacion practica

La navigation sigue siendo client-side y sigue siendo rapida.

Lo que cambio fue la responsabilidad:

- la aplicacion decide
- el cliente ejecuta

## 8. View model de shell

Se agrego:

- `HeaderNavigationViewModel`

### Contenido

Incluye:

- `organizationListHref`
- `newOrganizationHref`

### Por que existe

So the application delivers al cliente solo lo que puede hacer.

This prevents the client tenga que volver a evaluar permisos con ifs propios.

### Alcance

Solo navegacion de alcance de cuenta. Los accesos de establishment dependen de la
organizacion seleccionada en el header, so se resuelven con los flags por
organizacion del workspace view model (`canReadEstablishments`,
`canCreateEstablishment`) y no con hrefs del shell.

## 9. Impacto por tipo de usuario

### Usuario free

- puede seguir entrando al core app si tiene acceso
- no ve assistant si no corresponde
- no queda atado a una pantalla fija solo por ser free

### Usuario owner

- mantiene acceso completo al workspace propio
- can create and view establishments segun corresponda
- el header sigue reflejando su contexto actual

### Usuario invitado

- is not required to create una organization propia
- puede entrar a la organization a la que fue invitado
- is no longer stuck en `organizations` si no le toca ese flujo

### User with partial permissions

- entra a la ruta que realmente puede usar
- si no puede ver una opcion, la app ya conoce ese limite
- se reducen bucles y redirecciones fallidas

## 10. Acceso y landing

Se mantuvieron y reforzaron las decisiones de acceso en aplicacion:

- acceso al assistant separado del core app
- visible routes calculated desde permisos reales
- landing principal resuelta una sola vez

### Resultado

El frontend ya no trata `chat`, `schedule`, `catalog`, `crm`, `team` y `organizations` como si fueran todas equivalentes.

Cada una depende de accesos reales.

## 11. Archivos con cambios grandes

- [`app/(protected)/layout.tsx`](../../app/(protected)/layout.tsx)
- [`contexts/shared/application/internal/queryservices/app-shell-query.service.ts`](../../contexts/shared/application/internal/queryservices/app-shell-query.service.ts)
- [`contexts/shared/application/model/app-shell.view-models.ts`](../../contexts/shared/application/model/app-shell.view-models.ts)
- [`contexts/shared/interfaces/components/header.tsx`](../../contexts/shared/interfaces/components/header.tsx)
- [`contexts/business/interfaces/components/organization/protected-header-client/protected-header-client.tsx`](../../contexts/business/interfaces/components/organization/protected-header-client/protected-header-client.tsx)
- [`contexts/business/interfaces/components/organization/organization-selector/organization-selector.tsx`](../../contexts/business/interfaces/components/organization/organization-selector/organization-selector.tsx)
- [`contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector.tsx`](../../contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector.tsx)

## 12. Archivos de apoyo importantes

- [`contexts/business/application/internal/queryservices/business-workspace-query.service.ts`](../../contexts/business/application/internal/queryservices/business-workspace-query.service.ts)
- [`contexts/business/application/model/business-workspace.view-models.ts`](../../contexts/business/application/model/business-workspace.view-models.ts)
- [`contexts/shared/application/internal/queryservices/access-context.helpers.ts`](../../contexts/shared/application/internal/queryservices/access-context.helpers.ts)
- [`contexts/iam/application/internal/queryservices/landing-path-query.service.ts`](../../contexts/iam/application/internal/queryservices/landing-path-query.service.ts)
- [`proxy.ts`](../../proxy.ts)

## 13. Documento unico de referencia

Esta guia reemplaza las notas parciales anteriores y queda como la referencia principal del refactor.

La idea es que cualquier persona que quiera entender los cambios lea solo este documento:

- summarizes the access and redirection flow
- resume la limpieza de capas y view models
- explica el impacto por tipo de usuario
- apunta a los archivos clave sin dispersar la lectura en varios MD

## 14. Validacion realizada

Se valido el refactor con:

- `bunx tsc --noEmit --pretty false`
- `bunx eslint` sobre los archivos modificados

Ambos pasaron correctamente en el ultimo ajuste.

## 15. Conclusiones simples

En simple:

- la app ahora decide mejor a donde llevar al usuario
- la UI quedo mas presentacional
- `shared` dejo de depender de componentes de `business`
- los permisos y rutas are better centralized
- el flujo de usuarios free, owner e invited became more consistent

Si quieres mantener un solo documento de referencia para el refactor actual, este es el recomendado.
