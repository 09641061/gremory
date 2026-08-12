# Contrato de API - Analytics Free

Este documento define el contrato estable para la pagina `analytics` del plan Free.
Todo sale de un solo endpoint: `GET /api/analytics/free`.

## Endpoint

`GET /api/analytics/free`

## Autenticacion

La peticion debe llegar autenticada con `Bearer JWT`.

El backend resuelve el `ownerId` desde el token y con eso busca la organizacion activa. Ese identificador no debe venir en el payload.

## Respuesta

El frontend debe esperar estos bloques en la misma respuesta:

- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsTrend`
- `appointmentsByMonth`
- `appointmentsByHour`
- `completionVsCancellationTrend`
- `weeklyRevenueBalance`
- `topServicesByRevenue`
- `topCustomersBySpend`
- `lostRevenue`
- `averageTicket`
- `newVsRecurringCustomers`
- `topCustomers`
- `topServices`
- `cancellationRateByService`
- `noShowRateByService`

## Ejemplo

```json
{
  "completedAppointmentsLastSevenDays": 31,
  "cancelledAppointmentsLastSevenDays": 6,
  "noShowAppointmentsLastSevenDays": 2,
  "appointmentsTrend": [
    { "date": "2026-08-04", "value": 4 },
    { "date": "2026-08-05", "value": 7 }
  ],
  "appointmentsByMonth": [
    { "label": "Jan", "value": 8 },
    { "label": "Feb", "value": 6 },
    { "label": "Mar", "value": 5 },
    { "label": "Apr", "value": 4 },
    { "label": "May", "value": 3 },
    { "label": "Jun", "value": 2 },
    { "label": "Jul", "value": 1 },
    { "label": "Aug", "value": 0 }
  ],
  "appointmentsByHour": [
    { "label": "00:00", "value": 0 },
    { "label": "01:00", "value": 0 },
    { "label": "02:00", "value": 0 }
  ],
  "completionVsCancellationTrend": [
    { "date": "2026-08-04", "completed": 3, "cancelled": 1 }
  ],
  "weeklyRevenueBalance": {
    "totalRevenue": 1540.5,
    "appointmentsCount": 28,
    "averageTicket": 55.02,
    "dailyTrend": [
      { "date": "2026-08-06", "value": 210.0 },
      { "date": "2026-08-07", "value": 340.5 }
    ]
  },
  "topServicesByRevenue": [
    {
      "rank": 1,
      "serviceId": "svc-1",
      "serviceName": "Haircut",
      "revenue": 420.0,
      "appointmentsCount": 12,
      "averagePrice": 35.0
    }
  ],
  "topCustomersBySpend": [
    {
      "rank": 1,
      "customerId": "cus-1",
      "customerName": "Jane Doe",
      "totalSpent": 180.0,
      "appointmentsCount": 4,
      "averageTicket": 45.0
    }
  ],
  "lostRevenue": {
    "cancelledRevenue": 120.0,
    "noShowRevenue": 75.0,
    "totalLostRevenue": 195.0
  },
  "averageTicket": {
    "currentValue": 55.02,
    "lastPeriodValue": 51.4,
    "delta": 3.62
  },
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

## Contrato

| Campo | Tipo | Descripcion |
|---|---|---|
| `completedAppointmentsLastSevenDays` | `number` | Citas completadas en la ventana de 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | Citas canceladas en la ventana de 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | Citas marcadas como no show en la ventana de 7 dias |
| `appointmentsTrend` | `array<{date,value}>` | Serie diaria de volumen |
| `appointmentsByMonth` | `array<{label,value}>` | Buckets mensuales en orden cronologico, de enero al mes actual |
| `appointmentsByHour` | `array<{label,value}>` | 24 buckets fijos en UTC, de `00:00` a `23:00` |
| `completionVsCancellationTrend` | `array<{date,completed,cancelled}>` | Serie diaria comparada |
| `weeklyRevenueBalance` | `object` | Balance semanal de ingresos con total, cantidad y tendencia diaria |
| `topServicesByRevenue` | `array` | Top 5 servicios por ingreso generado |
| `topCustomersBySpend` | `array` | Top 5 clientes por gasto total |
| `lostRevenue` | `object` | Ingreso estimado perdido por cancelaciones y no-shows |
| `averageTicket` | `object` | Ticket promedio del periodo actual y comparacion contra el periodo anterior |
| `newVsRecurringCustomers` | `object` | Segmentacion operacional de clientes |
| `topCustomers` | `array` | Top 5 clientes por cantidad de citas |
| `topServices` | `array` | Top 5 servicios por cantidad de citas |
| `cancellationRateByService` | `array` | Servicios ordenados por tasa de cancelacion |
| `noShowRateByService` | `array` | Servicios ordenados por tasa de no show |

## Reglas

- Ventana de 7 dias en UTC
- `appointmentsTrend` y `completionVsCancellationTrend` se normalizan dia por dia, incluso si no hubo actividad
- `appointmentsByMonth` cubre de enero al mes actual y siempre viene en orden cronologico
- `appointmentsByHour` siempre viene en orden fijo de `00:00` a `23:00`
- `appointmentsByHour` usa hora UTC
- `weeklyRevenueBalance`, `topServicesByRevenue`, `topCustomersBySpend`, `lostRevenue` y `averageTicket` vienen en el mismo payload del endpoint, no en una ruta separada
- `topCustomers` y `topServices` devuelven como maximo 5 items
- `cancellationRateByService` y `noShowRateByService` devuelven tasas entre `0` y `1`
- Si no hay organizacion o no hay locales activos, el backend devuelve un snapshot valido con rankings vacios y series en cero

## Datos minimos requeridos

Para que el backend calcule el snapshot actual, el origen de datos debe exponer al menos:

- `startsAt`
- `createdAt`
- `status`
- `customerId`
- `serviceId`
- `establishmentId`
- `price` del servicio asociado para calcular los montos monetarios

Ademas, para resolver la organizacion del usuario autenticado, el backend necesita que exista relacion entre:

- `ownerId`
- `organizationId`
- `establishmentId`
- `active` en establecimientos

## Notas

- No es necesario hacer transformaciones de buckets en cliente
- No es necesario completar meses, dias u horas faltantes en cliente
- No es necesario inferir rankings ni tasas en cliente
- El bloque monetario usa el precio vigente del servicio asociado para estimar ingresos, porque las citas no almacenan historico de precio
- Si un cliente necesita un subconjunto, puede ignorar los campos que no use sin romper compatibilidad
- En pantalla, la vista se organiza por grupos para facilitar la busqueda: operacional, financiero, comparativo y rankings/friccion
