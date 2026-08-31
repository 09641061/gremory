# Contrato de API - Analytics Free

Snapshot del estado actual del proyecto al `2026-08-12`.
Este documento sirve como referencia historica de lo que el frontend consume hoy en la pagina `analytics` del plan Free.

## Estado actual del frontend

- La pagina muestra analytics por grupos.
- Los grupos visibles son `Activity`, `Revenue`, `Rankings` y `Friction`.
- El usuario solo ve un grupo a la vez para mantener la pantalla mas limpia.
- Los graficos se muestran ya normalizados por el backend.
- Las cards compactas de snapshot fueron reducidas a badges y KPIs de bajo costo visual.
- Ya no se usan los bloques legacy `appointmentsByMonth`, `completionVsCancellationTrend` ni `leadTimeTrend`.

## Endpoint

`GET /api/analytics/free`

## Autenticacion

- Requiere `Bearer JWT`
- El backend resuelve el `ownerId` desde el token
- El `ownerId` no viaja en el payload

## Respuesta actual

El endpoint devuelve un snapshot unico con estos campos:

- `completedAppointmentsLastSevenDays`
- `cancelledAppointmentsLastSevenDays`
- `noShowAppointmentsLastSevenDays`
- `appointmentsTrend`
- `appointmentsByHour`
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

## Como se usa hoy en pantalla

### Activity

- `appointmentsTrend` se pinta como linea de tendencia de 7 dias y representa conteo de citas por dia.
- `completedAppointmentsLastSevenDays`, `cancelledAppointmentsLastSevenDays` y `noShowAppointmentsLastSevenDays` se muestran como mix de estado final.
- `appointmentsTrend` tambien se usa para derivar el dia pico.
- `appointmentsByHour` se usa para derivar la hora pico.
- `newVsRecurringCustomers` se muestra como comparativa compacta.

### Revenue

- `weeklyRevenueBalance` se muestra como balance semanal con linea diaria.
- `averageTicket` se muestra como KPI.
- `lostRevenue` se muestra como bloque de perdida estimada por cancelados y no-show.
- `topServicesByRevenue` se muestra como barras.
- `topCustomersBySpend` se muestra como ranking.

### Rankings

- `topServices` se muestra como ranking de servicios mas usados.
- `topCustomers` se muestra como ranking de clientes mas activos.

### Friction

- `cancellationRateByService` se muestra como ranking por tasa de cancelacion.
- `noShowRateByService` se muestra como ranking por tasa de no-show.

## Cambios que debe hacer el frontend

- No esperar `appointmentsByMonth`
- No esperar `completionVsCancellationTrend`
- No esperar `leadTimeTrend`
- Consumir `appointmentsTrend` como serie diaria ya normalizada
- Consumir `appointmentsByHour` como buckets ya ordenados de `00:00` a `23:00`
- Tratar `weeklyRevenueBalance`, `lostRevenue`, `averageTicket` y `newVsRecurringCustomers` como bloques fijos del snapshot
- Mostrar los rankings como maximo con 5 elementos
- Mantener el selector de grupos como la forma principal de navegar la pagina

## Cambios que debe hacer el backend

- Resolver la zona horaria IANA del establecimiento activo y usarla como referencia para todo el snapshot
- Calcular `appointmentsTrend` en hora y dia local del negocio, no en UTC
- Calcular `appointmentsByHour` en la hora local del negocio, con buckets fijos de `00:00` a `23:00`
- Mantener las series ya normalizadas, sin pedirle al frontend que complete huecos o recalcule buckets
- Limitar `topCustomers`, `topServices`, `topServicesByRevenue` y `topCustomersBySpend` a maximo 5 items
- Exponer `weeklyRevenueBalance`, `lostRevenue`, `averageTicket` y `newVsRecurringCustomers` en el mismo snapshot para no separar consultas

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
  "appointmentsByHour": [
    { "label": "00:00", "value": 0 },
    { "label": "01:00", "value": 0 },
    { "label": "02:00", "value": 0 }
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

## Campos

| Campo | Tipo | Descripcion |
|---|---|---|
| `completedAppointmentsLastSevenDays` | `number` | Citas completadas en los ultimos 7 dias |
| `cancelledAppointmentsLastSevenDays` | `number` | Citas canceladas en los ultimos 7 dias |
| `noShowAppointmentsLastSevenDays` | `number` | Citas marcadas como no show en los ultimos 7 dias |
| `appointmentsTrend` | `array<{date,value}>` | Serie diaria de conteo de citas |
| `appointmentsByHour` | `array<{label,value}>` | 24 buckets fijos de `00:00` a `23:00` |
| `weeklyRevenueBalance` | `object` | Balance semanal de ingresos con tendencia diaria |
| `topServicesByRevenue` | `array` | Top 5 servicios por ingreso |
| `topCustomersBySpend` | `array` | Top 5 clientes por gasto |
| `lostRevenue` | `object` | Ingreso estimado perdido por cancelaciones y no-shows |
| `averageTicket` | `object` | Ticket promedio del periodo actual y comparacion contra el periodo anterior |
| `newVsRecurringCustomers` | `object` | Segmentacion de clientes nuevos vs recurrentes |
| `topCustomers` | `array` | Top 5 clientes por cantidad de citas |
| `topServices` | `array` | Top 5 servicios por cantidad de citas |
| `cancellationRateByService` | `array` | Servicios ordenados por tasa de cancelacion |
| `noShowRateByService` | `array` | Servicios ordenados por tasa de no show |

## Reglas de consumo

- El frontend no debe enviar `ownerId`
- El frontend no debe reconstruir buckets por su cuenta
- `appointmentsTrend` ya viene normalizado por dia
- `appointmentsByHour` ya viene ordenado de `00:00` a `23:00`
- `topCustomers` y `topServices` devuelven como maximo 5 items
- `cancellationRateByService` y `noShowRateByService` devuelven valores entre `0` y `1`
- Si no hay organizacion o no hay locales activos, el backend devuelve un snapshot valido con series en cero y rankings vacios
- El frontend no debe depender de campos legacy que ya no forman parte del contrato

## Nota de tiempo

- Todo lo que llegue con fecha u hora en este endpoint debe interpretarse y agruparse en la zona horaria del local, no en la del navegador ni en UTC
- El backend resuelve la zona horaria IANA desde el establecimiento activo de la organizacion
- Si no puede encontrar una zona horaria valida, usa `UTC` como fallback
- El payload no cambia aunque la base temporal interna del negocio cambie

## Nota de semantica

- `appointmentsTrend` nunca debe contener valores monetarios
- `weeklyRevenueBalance.dailyTrend` es la serie de dinero recaudado por dia
- Si ambos valores muestran el mismo numero visual, el backend esta cruzando las metricas y debe corregirse
