# Contrato de API - Scheduling

Snapshot del estado actual del proyecto al `2026-08-12`.
Este documento resume el flujo de datos que el frontend usa hoy para agenda y citas.

## Estado actual del frontend

- La pagina de schedule muestra una vista semanal.
- El calendario, los slots y el detalle de cita ya usan la `timeZone` del local.
- El frontend ya no toma la zona horaria del navegador como fuente de verdad.
- El selector de fechas y la creacion/reprogramacion de citas trabajan sobre la zona del establecimiento.
- El calendario semanal pide las citas del rango visible usando el timezone del local.

## Fuente de zona horaria

- El frontend debe tomar `timeZone` desde `GET /api/business/establishments`
- El calendario, los slots y los filtros de hora deben usar la zona horaria del local
- La zona horaria del navegador no debe usarse como fuente de verdad
- Si no existe `timeZone`, el backend puede usar `UTC` como fallback

## Cambios que debe hacer el frontend

- Usar `timeZone` del local para pintar el calendario
- Usar `timeZone` del local para calcular y mostrar slots
- Construir `startsAt`, `endsAt`, `from` y `to` con la zona del local
- No convertir la agenda con la zona horaria del navegador
- Mantener `UTC` solo como fallback cuando no exista una zona del local

## Cambios que debe hacer el backend

- Devolver `timeZone` en el contrato de establecimientos
- Usar `timeZone` del local para normalizar y agrupar citas
- Aceptar y procesar fechas de agenda en hora local del establecimiento
- No asumir la zona del navegador del usuario final
- Si el backend necesita buckets de tiempo, construirlos en la zona horaria del local

## Flujo actual de pantalla

- `WeeklyCalendar` obtiene el rango semanal visible
- Ese rango se convierte a ISO con offset usando la zona del local
- La lista de appointments se pide con `from` y `to` ya normalizados
- Cada cita se muestra con su hora formateada en la zona del local
- El modal de crear y el modal de editar cita calculan `startsAt` y `endsAt` con la zona del local
- El modal de detalle tambien presenta fecha y hora en esa misma zona

## Datos esperados

El frontend espera que el backend trate estas fechas como locales al establecimiento:

- `startsAt`
- `endsAt`
- `from`
- `to`

## Regla de prioridad

1. `timeZone` del local
2. `UTC` como fallback tecnico
3. Nunca la zona del navegador como fuente de verdad

## Nota corta para backend

La agenda debe representarse y persistirse con la zona horaria del local.
El frontend ya consume `timeZone` desde establishments y no debe inventar la zona con el navegador.
