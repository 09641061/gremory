# Contrato de API - Analytics Free

Este documento define el contrato estable para la pagina `analytics` del plan Free.

Objetivos:
- exponer un solo endpoint
- devolver solo los bloques que la UI consume hoy
- entregar series y rankings ya normalizados para pintar sin logica extra en frontend

## Endpoint

`GET /api/analytics/free`

## Autenticacion

La peticion debe llegar autenticada con `Bearer JWT`.

```http
Authorization: Bearer <token>
Accept: application/json
```

El backend toma la identidad autenticada y resuelve el snapshot de analytics para la organizacion activa asociada.

## Que debe consultar el frontend

La vista debe consultar este endpoint cuando cargue la pagina `analytics`.

El frontend debe esperar un snapshot con estos bloques:

- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsTrend`
- `appointmentsByWeekday`
- `appointmentsByHour`
- `completionVsCancellationTrend`
- `leadTimeTrend`
- `newVsRecurringCustomers`
- `topCustomers`
- `topServices`
- `cancellationRateByService`
- `noShowRateByService`

La UI no debe depender de:

- `ownerId`
- `organizationId`
- `organizationName`
- `hasOrganization`
- `performanceRates`
- `topItems`
- series antiguas de mensajes o chats
- cards de resumen que no forman parte de este contrato

## Respuesta esperada

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
    { "label": "Tue", "value": 6 },
    { "label": "Wed", "value": 5 },
    { "label": "Thu", "value": 4 },
    { "label": "Fri", "value": 3 },
    { "label": "Sat", "value": 2 },
    { "label": "Sun", "value": 1 }
  ],
  "appointmentsByHour": [
    { "label": "00:00", "value": 0 },
    { "label": "01:00", "value": 0 },
    { "label": "02:00", "value": 0 }
  ],
  "completionVsCancellationTrend": [
    { "date": "2026-08-04", "completed": 3, "cancelled": 1 }
  ],
  "leadTimeTrend": [
    { "date": "2026-08-04", "value": 12.4 }
  ],
  "newVsRecurringCustomers": {
    "newCustomers": 18,
    "recurrentCustomers": 12,
    "totalCustomers": 30
  },
  "topCustomers": [],
  "topServices": [],
  "cancellationRateByService": [],
  "noShowRateByService": []
}
```

## Contrato por bloque

### Base

| Campo | Tipo | Descripcion |
|---|---|---|
| `completedAppointmentsLastSevenDays` | `number` | Citas completadas en la ventana de 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | Citas canceladas en la ventana de 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | Citas marcadas como no show en la ventana de 7 dias |

### Series

| Campo | Tipo | Descripcion |
|---|---|---|
| `appointmentsTrend` | `array<{date,value}>` | Serie diaria de volumen |
| `appointmentsByWeekday` | `array<{label,value}>` | 7 buckets fijos, de `Mon` a `Sun` |
| `appointmentsByHour` | `array<{label,value}>` | 24 buckets fijos en UTC, de `00:00` a `23:00` |
| `completionVsCancellationTrend` | `array<{date,completed,cancelled}>` | Serie diaria comparada |
| `leadTimeTrend` | `array<{date,value}>` | Lead time promedio en horas |

### Mix de clientes

| Campo | Tipo | Descripcion |
|---|---|---|
| `newVsRecurringCustomers` | `object` | Segmentacion operacional de clientes |

Definicion:
- `newCustomers` = clientes con 1 cita en el periodo
- `recurrentCustomers` = clientes con 2 o mas citas en el periodo
- `totalCustomers` = clientes unicos con citas en el periodo

### Rankings

| Campo | Tipo | Descripcion |
|---|---|---|
| `topCustomers` | `array` | Top 5 clientes por cantidad de citas |
| `topServices` | `array` | Top 5 servicios por cantidad de citas |
| `cancellationRateByService` | `array` | Servicios ordenados por tasa de cancelacion |
| `noShowRateByService` | `array` | Servicios ordenados por tasa de no show |

## Forma de cada item

### `appointmentsTrend`

| Campo | Tipo | Descripcion |
|---|---|---|
| `date` | `string` | Fecha en formato `YYYY-MM-DD` |
| `value` | `number` | Cantidad total de citas del dia |

### `appointmentsByWeekday`

| Campo | Tipo | Descripcion |
|---|---|---|
| `label` | `string` | Uno de `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun` |
| `value` | `number` | Cantidad de citas para el dia de la semana |

### `appointmentsByHour`

| Campo | Tipo | Descripcion |
|---|---|---|
| `label` | `string` | Uno de `00:00` a `23:00` |
| `value` | `number` | Cantidad de citas para esa hora UTC |

### `completionVsCancellationTrend`

| Campo | Tipo | Descripcion |
|---|---|---|
| `date` | `string` | Fecha en formato `YYYY-MM-DD` |
| `completed` | `number` | Citas completadas ese dia |
| `cancelled` | `number` | Citas canceladas ese dia |

### `leadTimeTrend`

| Campo | Tipo | Descripcion |
|---|---|---|
| `date` | `string` | Fecha en formato `YYYY-MM-DD` |
| `value` | `number` | Lead time promedio en horas |

### `newVsRecurringCustomers`

| Campo | Tipo | Descripcion |
|---|---|---|
| `newCustomers` | `number` | Clientes con una sola cita en el periodo |
| `recurrentCustomers` | `number` | Clientes con dos o mas citas en el periodo |
| `totalCustomers` | `number` | Clientes unicos con citas en el periodo |

### `topCustomers`

| Campo | Tipo | Descripcion |
|---|---|---|
| `rank` | `number` | Posicion en el ranking |
| `customerId` | `string` | Identificador del cliente |
| `customerName` | `string` | Nombre visible |
| `appointmentsCount` | `number` | Total de citas |
| `completedAppointmentsCount` | `number` | Citas completadas |
| `cancelledAppointmentsCount` | `number` | Citas canceladas |
| `noShowAppointmentsCount` | `number` | Citas no show |
| `lastAppointmentAt` | `string` | Ultima cita registrada |

### `topServices`

| Campo | Tipo | Descripcion |
|---|---|---|
| `rank` | `number` | Posicion en el ranking |
| `serviceId` | `string` | Identificador del servicio |
| `serviceName` | `string` | Nombre visible |
| `appointmentsCount` | `number` | Total de citas |
| `completedAppointmentsCount` | `number` | Citas completadas |
| `cancelledAppointmentsCount` | `number` | Citas canceladas |
| `noShowAppointmentsCount` | `number` | Citas no show |
| `lastBookedAt` | `string` | Ultima reserva |

### `cancellationRateByService`

| Campo | Tipo | Descripcion |
|---|---|---|
| `rank` | `number` | Posicion en el ranking |
| `serviceId` | `string` | Identificador del servicio |
| `serviceName` | `string` | Nombre visible |
| `appointmentsCount` | `number` | Total de citas |
| `affectedCount` | `number` | Citas canceladas |
| `rate` | `number` | `affectedCount / appointmentsCount` |
| `lastAppointmentAt` | `string` | Ultima cita registrada |

### `noShowRateByService`

| Campo | Tipo | Descripcion |
|---|---|---|
| `rank` | `number` | Posicion en el ranking |
| `serviceId` | `string` | Identificador del servicio |
| `serviceName` | `string` | Nombre visible |
| `appointmentsCount` | `number` | Total de citas |
| `affectedCount` | `number` | Citas no show |
| `rate` | `number` | `affectedCount / appointmentsCount` |
| `lastAppointmentAt` | `string` | Ultima cita registrada |

## Reglas de calculo

- Ventana de 7 dias en UTC
- `appointmentsTrend` y `completionVsCancellationTrend` se normalizan dia por dia, incluso si no hubo actividad
- `appointmentsByWeekday` siempre viene en orden fijo de `Mon` a `Sun`
- `appointmentsByHour` siempre viene en orden fijo de `00:00` a `23:00`
- `appointmentsByHour` usa hora UTC
- `newVsRecurringCustomers` es una clasificacion operacional del periodo, no historica
- `topCustomers` y `topServices` devuelven como maximo 5 items
- `cancellationRateByService` y `noShowRateByService` devuelven tasas entre `0` y `1`
- Si no hay organizacion o no hay locales activos, el backend devuelve un snapshot valido con rankings vacios y series en cero

## Datos minimos requeridos

Para calcular este contrato, cada cita debe exponer al menos:

- `startsAt`
- `createdAt`
- `status`
- `customerId`
- `serviceId`
- `establishmentId`

## Notas para frontend

- No es necesario hacer transformaciones de buckets en cliente
- No es necesario completar dias u horas faltantes en cliente
- No es necesario inferir rankings ni tasas en cliente
- Este contrato reemplaza cualquier payload anterior del modulo analytics free
