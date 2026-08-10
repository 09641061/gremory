# Contrato de API - Analytics Free

Este contrato describe exactamente lo que el backend espera recibir y lo que devuelve para el dashboard de analytics del plan Free.

El objetivo es que el frontend pueda consumir un solo endpoint, con baja complejidad y bajo costo computacional.

## Endpoint

`GET /api/analytics/free`

## Autenticacion requerida

El backend espera que la peticion llegue autenticada con `Bearer JWT`.

Headers esperados:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Lo que el backend recibe

Este endpoint no recibe body ni query params.

El backend obtiene el `ownerId` desde la autenticacion actual:

- lee el `Authentication`
- toma `authentication.getName()`
- interpreta ese valor como `UUID`

Si el token no es valido o no existe autenticacion, el backend responde error.

## Lo que el backend devuelve

Respuesta exitosa:

- `200 OK`
- `application/json`

### Estructura de respuesta

```json
{
  "ownerId": "uuid",
  "organizationId": "uuid|null",
  "organizationName": "string|null",
  "hasOrganization": true,
  "establishmentsCount": 2,
  "activeEstablishmentsCount": 2,
  "customersCount": 120,
  "activeCustomersCount": 110,
  "activeServicesCount": 18,
  "activeMembersCount": 6,
  "appointmentsToday": 8,
  "appointmentsLastSevenDays": 42,
  "completedAppointmentsLastSevenDays": 31,
  "cancelledAppointmentsLastSevenDays": 6,
  "noShowAppointmentsLastSevenDays": 2,
  "inProgressAppointmentsLastSevenDays": 3,
  "assistantChatsLastSevenDays": 5,
  "assistantMessagesLastSevenDays": 18,
  "appointmentsTrend": [
    { "date": "2026-08-04", "value": 4 },
    { "date": "2026-08-05", "value": 7 }
  ],
  "customersTrend": [
    { "date": "2026-08-04", "value": 1 },
    { "date": "2026-08-05", "value": 3 }
  ],
  "assistantMessagesTrend": [
    { "date": "2026-08-04", "value": 2 },
    { "date": "2026-08-05", "value": 6 }
  ],
  "generatedAt": "2026-08-10T15:30:00Z"
}
```

## Campos de respuesta

### Nivel raiz

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `ownerId` | `string (UUID)` | No | Usuario propietario autenticado |
| `organizationId` | `string (UUID)` | Si | Organizacion principal del owner |
| `organizationName` | `string` | Si | Nombre de la organizacion |
| `hasOrganization` | `boolean` | No | Indica si existe una organizacion activa para ese owner |
| `establishmentsCount` | `number` | No | Total de locales asociados |
| `activeEstablishmentsCount` | `number` | No | Locales activos |
| `customersCount` | `number` | No | Clientes totales de la organizacion |
| `activeCustomersCount` | `number` | No | Clientes activos |
| `activeServicesCount` | `number` | No | Servicios activos |
| `activeMembersCount` | `number` | No | Miembros activos del equipo |
| `appointmentsToday` | `number` | No | Citas del dia actual |
| `appointmentsLastSevenDays` | `number` | No | Total de citas en los ultimos 7 dias |
| `completedAppointmentsLastSevenDays` | `number` | No | Citas completadas en los ultimos 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | No | Citas canceladas en los ultimos 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | No | Citas no show en los ultimos 7 dias |
| `inProgressAppointmentsLastSevenDays` | `number` | No | Citas en progreso en los ultimos 7 dias |
| `assistantChatsLastSevenDays` | `number` | No | Chats creados en los ultimos 7 dias |
| `assistantMessagesLastSevenDays` | `number` | No | Mensajes enviados en los ultimos 7 dias |
| `appointmentsTrend` | `array` | No | Serie diaria de citas |
| `customersTrend` | `array` | No | Serie diaria de clientes |
| `assistantMessagesTrend` | `array` | No | Serie diaria de mensajes del asistente |
| `generatedAt` | `string (date-time)` | No | Momento en que se genero el snapshot |

### Serie diaria

Cada item de `appointmentsTrend`, `customersTrend` y `assistantMessagesTrend` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `date` | `string (YYYY-MM-DD)` | No | Dia de la serie |
| `value` | `number` | No | Valor agregado de ese dia |

## Reglas de negocio del contrato

- El dashboard se calcula para el `owner` autenticado.
- Las fechas se calculan en UTC.
- Si la organizacion no existe, el backend devuelve `organizationId = null`, `organizationName = null` y `hasOrganization = false`.
- Las series diarias vienen normalizadas para una ventana de 7 dias.
- Si no hay datos, los valores se devuelven en cero.

## Errores posibles

### `401 Unauthorized`

Ocurre cuando la peticion no tiene autenticacion valida.

Ejemplo:

```json
{
  "status": 401,
  "message": "Authentication required"
}
```

### `403 Forbidden`

Puede ocurrir si el usuario autenticado no tiene acceso activo segun la politica global de suscripcion.

Ejemplo:

```json
{
  "status": 403,
  "message": "An active subscription is required"
}
```

### `500 Internal Server Error`

Puede ocurrir si hay un problema tecnico con la consulta o con el mapeo del dashboard.

## Uso recomendado en frontend

La pantalla del plan Free puede consumir este endpoint una sola vez al cargar la vista.

Sugerencias:

- mostrar primero las tarjetas de resumen
- usar `appointmentsTrend` como grafico principal
- usar `customersTrend` y `assistantMessagesTrend` como grafico secundario o tabs
- mostrar `generatedAt` como referencia de frescura de los datos

## Observacion importante

`appointmentsToday` hoy se calcula como el valor del ultimo punto de la serie de 7 dias. Si luego queremos hacerlo mas exacto por zona horaria del negocio, conviene pasar a una fecha local por organizacion o establecimiento.

