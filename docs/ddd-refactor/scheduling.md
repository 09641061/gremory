# Plan BC Scheduling

**Modelo:** REMOTE FEATURE. Backend posee appointment lifecycle, conflictos, permisos, persistencia, IDs y estados. `Appointment`/commands/queries de Domain son DTO/duplicación salvo que se documente un invariant local.

## Hallazgos

- Application command/query services construyen `SchedulingApiGateway`; Infrastructure implementa interfaces de Application, creando dependencia circular.
- Employee/service/customer responses no se validan runtime.
- Actions de employee visibility/availability instancian gateway directamente y no invalidan schedule.
- Autorización se duplica: inline checks, `requireAppointmentOperationAuthorization` y policy hard-coded false.
- Errores de lecturas se convierten en arrays/empty pages/null, ocultando forbidden/outage.
- Calendar mantiene estado cliente con estrategia de refresh incompleta; helpers de fecha/timezone se solapan.

## Plan

1. Crear ports `scheduling-appointments` y `scheduling-roster`, commands/queries/read models en Application; inyectarlos.
2. Mover gateway construction a `interfaces/server/scheduling-composition.ts`; quitar `server-only` de Application.
3. Mover schemas de roster a Infrastructure y parsear appointments/pages/employees/services/customers.
4. Centralizar autorización de establecimiento/organización y de cada operación; eliminar policy falsa/duplicada.
5. Encaminar employee mutations por Application y definir revalidación/refresh explícito.
6. No mapear fallos a datos vacíos: distinguir not-found/forbidden/technical y entregar action/read error estable.
7. Simplificar `domain/model` remoto, actualizar componentes a read models; unificar utilidades de timezone solo donde la semántica sea la misma.
8. Definir estrategia única de sincronización del calendario: retorno de read model o reload controlado, no depender solo de `revalidatePath`.

## Tests/gates

Ports/fakes; malformed roster; cada autorización; error distinction; DST/rangos; mutation + calendar refresh; request header/correlation.

**Unknowns:** campos opcionales appointment, garantía auth de workspace query y política de caché backend.
