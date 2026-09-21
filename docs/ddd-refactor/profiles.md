# Plan BC Profiles

**Modelo:** REMOTE FEATURE. El backend posee profile/preferences; los value objects actuales solo deben conservarse si protegen una validación local realmente usada.

## Hallazgos

- El cambio no comprometido introdujo `File` en `domain/model/commands/update-profile.command.ts`; Domain queda acoplado al Web API.
- Infrastructure importa mapper/schema de Interfaces.
- `application/factory.ts` compone `HttpProfileRepository`; Application depende outward.
- Repository/commands aceptan token raw y repository importa `ProfileViewModel` desde Application.
- Entity/IDs/query de Profile no se usan en el flujo remoto.
- Shell obtiene profile y sidebar vuelve a pedirlo.
- `update-preferences.action.ts` no aísla fallo de invalidación después del write.

## Plan

1. Restaurar el contrato transport-neutral del upload: `File/FormData` solo en Interfaces/Infrastructure; usar un input de upload propiedad del port o adaptar a bytes/Blob dentro del borde server.
2. Mover response schema/mapper a `infrastructure/contracts`; `interfaces/rest` queda para input.
3. Crear ports profile reader/writer y composition server-only; eliminar factory de Application y no capturar token en singleton.
4. Pasar auth/request context desde edge al adapter, no exponerlo en Domain.
5. Eliminar entity/IDs/query de Profile no usados y mover commands/queries a Application.
6. Hacer update preferences success independiente de `updateTag`/revalidation.
7. Reusar `currentProfile` de `getAppShellData` en sidebar; añadir límites de tamaño/MIME si el contrato backend lo exige.

## Tests/gates

Upload conversion solo en Infrastructure; malformed profile response; input/auth stable errors; invalidation failure preserves success; shell hace una sola lectura; header precedence.

**Unknowns:** límites de upload y autorización del backend de self-profile.
