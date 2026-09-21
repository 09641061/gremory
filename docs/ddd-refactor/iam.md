# Plan BC IAM

**Modelo:** REMOTE FEATURE/BFF de autenticación. Backend posee identidad y sesión; se conservan solo normalización segura de return path, email/input helpers, cookies y coordinación request-scoped.

## Hallazgos

- Application command/session services instancian `IamApiGateway` y usan `server-only`.
- `create-session.action.ts` escribe tokens recibidos sin validar runtime.
- Actions/component `verify` hacen `console.error` de excepciones crudas.
- Doble borrado de cookie de establishment.
- Gateway valida session responses, pero verify/request endpoints necesitan contrato explícito.
- Proxy hace autenticación/entry routing, no reemplaza autorización de cada operation.

## Plan

1. Crear ports IAM en Application; handlers puros para auth/session; composición `interfaces/server/iam-composition.ts` construye gateway/coordinator.
2. Validar `authenticationSessionSchema` antes de escribir cookies; centralizar set/delete y limpieza de workspace.
3. Mantener `normalizeAuthReturnPath` como política pura; no poner cookies/redirects en Domain/Application.
4. Añadir diagnóstico sanitizado/correlation en resend, sign-out y verify; ningún log raw en browser.
5. Validar respuestas de verify/sign-in según contrato real; mapear técnico/business errors.
6. Mantener Proxy delgado, con checks optimistas; reforzar autorización en actions/routes.

## Tests/gates

Malformed/empty tokens no se guardan; cookie cleanup; refresh unavailable/invalid; header spoofing; logs redactados; proxy redirect/session rotation.

**Unknowns:** body de endpoints de verify, autorización backend y coordinación de refresh en múltiples instancias.
