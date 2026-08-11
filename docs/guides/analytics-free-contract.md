# Contrato de API - Analytics Free

Este documento define el contrato estable para la pagina `analytics` del plan Free.

## Endpoint

`GET /api/analytics/free`

## Respuesta

El frontend debe esperar estos bloques:

- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsTrend`
- `appointmentsByMonth`
- `appointmentsByHour`
- `completionVsCancellationTrend`
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
- `topCustomers` y `topServices` devuelven como maximo 5 items
- `cancellationRateByService` y `noShowRateByService` devuelven tasas entre `0` y `1`
- Si no hay organizacion o no hay locales activos, el backend devuelve un snapshot valido con rankings vacios y series en cero

## Notas

- No es necesario hacer transformaciones de buckets en cliente
- No es necesario completar meses, dias u horas faltantes en cliente
- No es necesario inferir rankings ni tasas en cliente
