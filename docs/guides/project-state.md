# Project State Snapshot

Snapshot del estado actual del proyecto al `2026-08-12`.
Este indice resume como esta organizado hoy el frontend y que contratos forman parte del flujo vigente.

## Objetivo de este documento

- Servir como referencia historica del estado actual del proyecto.
- Dejar claro que funciones existen hoy y que datos maneja cada modulo.
- Facilitar cambios futuros sin depender de conversaciones previas.

## Modulos principales

### Business Establishments

- Crea, edita y muestra locales.
- Cada local maneja `timeZone` como zona IANA.
- `America/Lima` sigue siendo el valor sugerido por defecto.
- El detalle del local muestra `timeZone`.

Guia vigente:
- [business-establishments-contract.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/business-establishments-contract.md)

### Scheduling

- La agenda se muestra en vista semanal.
- El calendario usa la `timeZone` del local como fuente de verdad.
- Crear, reprogramar y mostrar citas ya respetan la zona del establecimiento.
- `startsAt`, `endsAt`, `from` y `to` se construyen con la zona del local.
- El navegador ya no define la zona operativa.

Guia vigente:
- [scheduling-api.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/scheduling-api.md)

### Analytics Free

- La pantalla de analytics se organiza por grupos.
- Los grupos actuales son `Activity`, `Revenue`, `Rankings` y `Friction`.
- El frontend consume un snapshot unico del backend.
- `appointmentsTrend` representa conteo de citas por dia.
- `weeklyRevenueBalance.dailyTrend` representa ingresos por dia.
- Los bloques legacy `appointmentsByMonth`, `completionVsCancellationTrend` y `leadTimeTrend` ya no forman parte del contrato.

Guia vigente:
- [analytics-free-contract.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/analytics-free-contract.md)

### Assistant

- Existen contratos y guias separadas para el chat y la API del assistant.
- Este indice solo las referencia, no las redefine.

Guias relacionadas:
- [assistant-api-contract.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/assistant-api-contract.md)
- [assistant-backend-contrast.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/assistant-backend-contrast.md)
- [assistant-chat-visual-guide.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/assistant-chat-visual-guide.md)
- [assistant-frontend-chat-flow.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/assistant-frontend-chat-flow.md)

## Contratos vigentes resumidos

### Business Establishments

- `timeZone` viaja en create, edit y get.
- El frontend usa la zona IANA del local para agenda y analytics.

### Scheduling

- El calendario y los formularios usan la zona IANA del local.
- La zona horaria del navegador no es fuente de verdad.

### Analytics Free

- El dashboard devuelve un snapshot unico.
- Los rankings vienen limitados a maximo 5 elementos.
- Las series ya vienen normalizadas por el backend.

## Datos que ya no se usan

### Analytics

- `appointmentsByMonth`
- `completionVsCancellationTrend`
- `leadTimeTrend`

### Vista de analytics

- Las cards compactas viejas de snapshot ya fueron reducidas o reemplazadas por badges y bloques mas utiles.

## Regla general del proyecto

- El frontend consume contratos ya normalizados siempre que el backend pueda asumir esa responsabilidad.
- La zona horaria del negocio prevalece sobre la del navegador para scheduling y analytics.
- Los documentos de `docs/guides` deben reflejar el estado real del proyecto, no solo ideas futuras.

## Orden recomendado de consulta

1. Revisar `project-state.md` para ubicar el modulo.
2. Revisar el contrato especifico del modulo.
3. Revisar el componente frontend que lo consume.
4. Revisar el backend solo si el contrato no coincide con la UI actual.
