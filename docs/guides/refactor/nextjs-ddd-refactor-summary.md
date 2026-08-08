# Next.js DDD Refactor Summary

Fecha de referencia: 2026-08-07

Este documento resume el estado actual del refactor aplicado al frontend para alinearlo mejor con la guia `nextjs-ddd`.

La meta principal fue esta:

- dejar `app/` como capa de orquestacion
- mover la resolucion de accesos y rutas a la capa de aplicacion
- hacer que los componentes UI solo rendericen y emitan eventos
- evitar duplicacion entre contextos
- reducir bucles de navegacion para usuarios free, owners e invitados

## 1. Que problema se estaba corrigiendo

Antes habia mezcla de responsabilidades en varios puntos:

- el header decidia rutas y permisos por su cuenta
- algunos selectores conocian detalles de navegacion
- el flujo de entrada no estaba unificado para todos los tipos de usuario
- varias pantallas protegidas dependian de supuestos distintos sobre `chat`, `schedule` u `organizations`

Eso generaba estos sintomas:

- usuarios free enviados a una pantalla que no debian ver
- invitados al equipo atrapados en pantallas de setup
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
- la UI solo ejecuta la navegacion con callbacks o destinos ya resueltos

## 3. Flujo de entrada principal

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

Esto evita que cada componente o layout calcule permisos y rutas de forma distinta.

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

El layout ya no contiene logica de negocio.

Solo coordina:

- lectura de sesion
- obtencion de suscripcion
- resolucion de shell
- render del header y del contenido

## 5. Header compartido

Se ajusto:

- [`contexts/shared/interfaces/components/header.tsx`](../../contexts/shared/interfaces/components/header.tsx)

### Que cambio

Antes el header conocia el selector de establecimientos y parte de la navegacion.

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

- muestra establecimientos
- emite `onSelect`
- emite `onSelectAll`
- emite `onNew`
- no usa `router` ni `pathname`

### Implicacion practica

Los selectores ya no mezclan UI con reglas de navegacion.

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
- arma los callbacks de navegacion para `OrganizationSelector` y `EstablishmentSelector`

### Que no hace

- no inventa permisos
- no decide reglas de negocio
- no contiene la logica central de acceso

### Implicacion practica

La navegacion sigue siendo client-side y sigue siendo rapida.

Lo que cambio fue la responsabilidad:

- la aplicacion decide
- el cliente ejecuta

## 8. View model de shell

Se agrego:

- `HeaderNavigationViewModel`

### Contenido

Incluye:

- `organizationListHref`
- `establishmentListHref`
- `newEstablishmentHref`

### Por que existe

Para que la aplicacion entregue al cliente solo lo que puede hacer.

Eso evita que el cliente tenga que volver a evaluar permisos con ifs propios.

## 9. Impacto por tipo de usuario

### Usuario free

- puede seguir entrando al core app si tiene acceso
- no ve assistant si no corresponde
- no queda atado a una pantalla fija solo por ser free

### Usuario owner

- mantiene acceso completo al workspace propio
- puede crear y ver establecimientos segun corresponda
- el header sigue reflejando su contexto actual

### Usuario invitado

- no se le exige crear una organization propia
- puede entrar a la organization a la que fue invitado
- ya no se queda atrapado en `organizations` si no le toca ese flujo

### Usuario con permisos parciales

- entra a la ruta que realmente puede usar
- si no puede ver una opcion, la app ya conoce ese limite
- se reducen bucles y redirecciones fallidas

## 10. Acceso y landing

Se mantuvieron y reforzaron las decisiones de acceso en aplicacion:

- acceso al assistant separado del core app
- rutas visibles calculadas desde permisos reales
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

- resume el flujo de acceso y redireccion
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
- los permisos y rutas quedaron mejor centralizados
- el flujo de usuarios free, owner e invited quedo mas consistente

Si quieres mantener un solo documento de referencia para el refactor actual, este es el recomendado.
