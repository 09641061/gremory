# Contrato de API - Analytics Free

Este contrato describe lo que el backend espera recibir y lo que devuelve para el dashboard de analytics del plan Free.

El objetivo es mantener un solo endpoint, con baja complejidad y bajo costo computacional, pero con suficiente valor visual para la UI actual.

## Estado del frontend

La vista actual de `analytics` usa un subconjunto minimo del snapshot base y solo conserva lo que aporta lectura rapida:

- `appointmentsTrend`
- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsByWeekday`
- `appointmentsByHour`
- `completionVsCancellationTrend`
- `leadTimeTrend`
- `newVsRecurringCustomers`
- `topCustomers`
- `topServices`
- `cancellationRateByService`
- `noShowRateByService`

### Datos visibles hoy

- `appointmentsTrend`
- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsByWeekday`
- `appointmentsByHour`
- `completionVsCancellationTrend`
- `leadTimeTrend`
- `newVsRecurringCustomers`
- `topCustomers`
- `topServices`
- `cancellationRateByService`
- `noShowRateByService`

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
  "completedAppointmentsLastSevenDays": 31,
  "cancelledAppointmentsLastSevenDays": 6,
  "noShowAppointmentsLastSevenDays": 2,
  "appointmentsTrend": [
    { "date": "2026-08-04", "value": 4 },
    { "date": "2026-08-05", "value": 7 }
  ],
  "appointmentsByWeekday": [
    { "label": "Mon", "value": 8 },
    { "label": "Tue", "value": 6 }
  ],
  "appointmentsByHour": [
    { "label": "08:00", "value": 3 },
    { "label": "09:00", "value": 5 }
  ],
  "completionVsCancellationTrend": [
    { "date": "2026-08-04", "completed": 3, "cancelled": 1 },
    { "date": "2026-08-05", "completed": 5, "cancelled": 0 }
  ],
  "leadTimeTrend": [
    { "date": "2026-08-04", "value": 12.4 },
    { "date": "2026-08-05", "value": 9.1 }
  ],
  "newVsRecurringCustomers": {
    "newCustomers": 18,
    "recurrentCustomers": 12,
    "totalCustomers": 30
  },
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
  ],
  "cancellationRateByService": [
    {
      "rank": 1,
      "serviceId": "uuid",
      "serviceName": "string",
      "appointmentsCount": 18,
      "affectedCount": 5,
      "rate": 0.28,
      "lastAppointmentAt": "2026-08-09T12:00:00Z"
    }
  ],
  "noShowRateByService": [
    {
      "rank": 1,
      "serviceId": "uuid",
      "serviceName": "string",
      "appointmentsCount": 18,
      "affectedCount": 2,
      "rate": 0.11,
      "lastAppointmentAt": "2026-08-09T12:00:00Z"
    }
  ]
}
```

## Campos de respuesta

### Nivel raiz

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `completedAppointmentsLastSevenDays` | `number` | No | Citas completadas en los ultimos 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | No | Citas canceladas en los ultimos 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | No | Citas no show en los ultimos 7 dias |
| `appointmentsTrend` | `array` | No | Serie diaria de citas |
| `appointmentsByWeekday` | `array` | No | Citas agrupadas por dia de la semana |
| `appointmentsByHour` | `array` | No | Citas agrupadas por hora UTC |
| `completionVsCancellationTrend` | `array` | No | Tendencia diaria de completadas vs canceladas |
| `leadTimeTrend` | `array` | No | Tendencia diaria del lead time promedio |
| `newVsRecurringCustomers` | `object` | No | Clientes nuevos vs recurrentes en el periodo |
| `topCustomers` | `array` | No | Ranking de clientes mas activos |
| `topServices` | `array` | No | Ranking de servicios mas reservados |
| `cancellationRateByService` | `array` | No | Servicios con mayor tasa de cancelacion |
| `noShowRateByService` | `array` | No | Servicios con mayor tasa de no show |

### Serie diaria

Cada item de `appointmentsTrend` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `date` | `string (YYYY-MM-DD)` | No | Dia de la serie |
| `value` | `number` | No | Valor agregado de ese dia |

### Series por categoria

Cada item de `appointmentsByWeekday` y `appointmentsByHour` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `label` | `string` | No | Etiqueta visible de la categoria |
| `value` | `number` | No | Total de citas en esa categoria |

### Tendencia comparada

Cada item de `completionVsCancellationTrend` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `date` | `string (YYYY-MM-DD)` | No | Dia de la serie |
| `completed` | `number` | No | Citas completadas ese dia |
| `cancelled` | `number` | No | Citas canceladas ese dia |

### Lead time promedio

Cada item de `leadTimeTrend` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `date` | `string (YYYY-MM-DD)` | No | Dia de la serie |
| `value` | `number` | No | Lead time promedio en horas |

### Clientes nuevos vs recurrentes

`newVsRecurringCustomers` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `newCustomers` | `number` | No | Clientes con una sola cita en el periodo |
| `recurrentCustomers` | `number` | No | Clientes con dos o mas citas en el periodo |
| `totalCustomers` | `number` | No | Total de clientes unicos con citas en el periodo |

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

### Tasa de cancelacion por servicio

Cada item de `cancellationRateByService` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `rank` | `number` | No | Posicion en el ranking |
| `serviceId` | `string (UUID)` | No | Identificador del servicio |
| `serviceName` | `string` | No | Nombre visible del servicio |
| `appointmentsCount` | `number` | No | Total de citas del servicio en el periodo |
| `affectedCount` | `number` | No | Citas canceladas del servicio en el periodo |
| `rate` | `number` | No | `affectedCount / appointmentsCount` |
| `lastAppointmentAt` | `string (date-time)` | No | Fecha de la ultima cita registrada |

### Tasa de no show por servicio

Cada item de `noShowRateByService` tiene esta forma:

| Campo | Tipo | Nullable | Descripcion |
|---|---|---:|---|
| `rank` | `number` | No | Posicion en el ranking |
| `serviceId` | `string (UUID)` | No | Identificador del servicio |
| `serviceName` | `string` | No | Nombre visible del servicio |
| `appointmentsCount` | `number` | No | Total de citas del servicio en el periodo |
| `affectedCount` | `number` | No | Citas no show del servicio en el periodo |
| `rate` | `number` | No | `affectedCount / appointmentsCount` |
| `lastAppointmentAt` | `string (date-time)` | No | Fecha de la ultima cita registrada |

## Reglas de negocio del contrato

- Las fechas se calculan en UTC.
- Las series diarias vienen normalizadas para una ventana de 7 dias.
- Si no hay datos, los valores se devuelven en cero.
- `topCustomers` y `topServices` representan el ranking del mismo periodo de 7 dias.
- `appointmentsByWeekday` y `appointmentsByHour` usan citas del mismo periodo de 7 dias.
- `newVsRecurringCustomers` clasifica como nuevo al cliente con una sola cita en el periodo.
- Si no hay organizacion o no hay locales activos, el backend devuelve rankings vacios y el resto del snapshot sigue siendo valido.

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
- usar `appointmentsByWeekday` y `appointmentsByHour` para patrones operativos
- usar `completionVsCancellationTrend` para comparar volumen de resultados finales
- usar `leadTimeTrend` para medir anticipacion de reserva
- usar `newVsRecurringCustomers` para segmentar la base de clientes
- usar `topCustomers` como ranking de clientes
- usar `topServices` como ranking de servicios
- usar `cancellationRateByService` y `noShowRateByService` para detectar servicios con friccion

## Observacion importante
