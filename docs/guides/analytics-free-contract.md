# Contrato de API - Analytics Free

Este contrato describe lo que el backend espera recibir y lo que devuelve para el dashboard de analytics del plan Free.

El objetivo es mantener un solo endpoint, con baja complejidad y bajo costo computacional, pero con suficiente valor visual para la UI actual.

## Estado del frontend

La vista actual de `analytics` usa un subconjunto minimo del snapshot base y solo conserva lo que aporta lectura rapida:

- `hasOrganization`
- `appointmentsTrend`
- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `inProgressAppointmentsLastSevenDays`
- `topCustomers`
- `topServices`

### Datos visibles hoy

- `hasOrganization`
- `appointmentsTrend`
- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `inProgressAppointmentsLastSevenDays`
- `topCustomers`
- `topServices`

### Datos retirados de esta vista

Los siguientes campos ya no forman parte del contrato que consume la pagina de analytics Free:

- `ownerId`
- `organizationId`
- `organizationName`
- `establishmentsCount`
- `activeEstablishmentsCount`
- `activeCustomersCount`
- `activeServicesCount`
- `activeMembersCount`
- `customersCount`
- `appointmentsToday`
- `appointmentsLastSevenDays`
- `assistantChatsLastSevenDays`
- `assistantMessagesLastSevenDays`
- `customersTrend`
- `assistantMessagesTrend`
- `performanceRates`
- `topItems`

Se eliminaron porque no aportaban valor visual directo en esta pantalla y aumentaban el ruido del snapshot.

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
  "hasOrganization": true,
  "completedAppointmentsLastSevenDays": 31,
  "cancelledAppointmentsLastSevenDays": 6,
  "noShowAppointmentsLastSevenDays": 2,
  "inProgressAppointmentsLastSevenDays": 3,
  "appointmentsTrend": [
    { "date": "2026-08-04", "value": 4 },
    { "date": "2026-08-05", "value": 7 }
  ],
  "topCustomers": [
    {
      "rank": 1,
      "customerId": "uuid",
      "customerName": "string",
      "appointmentsCount": 12,
      "completedAppointmentsCount": 9,
      "cancelledAppointmentsCount": 2,
      "noShowAppointmentsCount": 1,
      "lastAppointmentAt": "2026-08-09T12:00:00Z"
    }
  ],
  "topServices": [
    {
      "rank": 1,
      "serviceId": "uuid",
      "serviceName": "string",
      "appointmentsCount": 18,
      "completedAppointmentsCount": 15,
      "cancelledAppointmentsCount": 2,
      "noShowAppointmentsCount": 1,
      "lastBookedAt": "2026-08-09T12:00:00Z"
    }
  ]
}
```

## Campos de respuesta

### Nivel raiz

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `hasOrganization` | `boolean` | No | Indica si existe una organizacion activa para ese owner |
| `completedAppointmentsLastSevenDays` | `number` | No | Citas completadas en los ultimos 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | No | Citas canceladas en los ultimos 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | No | Citas no show en los ultimos 7 dias |
| `inProgressAppointmentsLastSevenDays` | `number` | No | Citas en progreso en los ultimos 7 dias |
| `appointmentsTrend` | `array` | No | Serie diaria de citas |
| `topCustomers` | `array` | No | Ranking de clientes mas activos |
| `topServices` | `array` | No | Ranking de servicios mas reservados |

### Serie diaria

Cada item de `appointmentsTrend` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `date` | `string (YYYY-MM-DD)` | No | Dia de la serie |
| `value` | `number` | No | Valor agregado de ese dia |

### Ranking de clientes

Cada item de `topCustomers` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `rank` | `number` | No | Posicion en el ranking |
| `customerId` | `string (UUID)` | No | Identificador del cliente |
| `customerName` | `string` | No | Nombre visible del cliente |
| `appointmentsCount` | `number` | No | Total de citas del periodo |
| `completedAppointmentsCount` | `number` | No | Citas completadas del periodo |
| `cancelledAppointmentsCount` | `number` | No | Citas canceladas del periodo |
| `noShowAppointmentsCount` | `number` | No | Citas no show del periodo |
| `lastAppointmentAt` | `string (date-time)` | No | Fecha de la ultima cita registrada |

### Ranking de servicios

Cada item de `topServices` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `rank` | `number` | No | Posicion en el ranking |
| `serviceId` | `string (UUID)` | No | Identificador del servicio |
| `serviceName` | `string` | No | Nombre visible del servicio |
| `appointmentsCount` | `number` | No | Total de citas del periodo |
| `completedAppointmentsCount` | `number` | No | Citas completadas del periodo |
| `cancelledAppointmentsCount` | `number` | No | Citas canceladas del periodo |
| `noShowAppointmentsCount` | `number` | No | Citas no show del periodo |
| `lastBookedAt` | `string (date-time)` | No | Fecha de la ultima reserva |

## Reglas de negocio del contrato

- Las fechas se calculan en UTC.
- Si la organizacion no existe, el backend devuelve `hasOrganization = false`.
- Las series diarias vienen normalizadas para una ventana de 7 dias.
- Si no hay datos, los valores se devuelven en cero.
- `topCustomers` y `topServices` representan el ranking del mismo periodo de 7 dias.

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

- usar `appointmentsTrend` como grafico principal
- usar `topCustomers` como ranking de clientes
- usar `topServices` como ranking de servicios

## Observacion importante
