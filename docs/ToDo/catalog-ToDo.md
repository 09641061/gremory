# Catalog Context - Pendientes Técnicos (ToDo)

## 📌 1. Dinamización del `establishmentId`
- **Ubicación actual**: `contexts/catalog/` (Gateways, Server Actions y Páginas de UI).
- **Estado actual**: Se está utilizando un `establishmentId` fijo / mock temporal (`11223344-5566-7788-9900-aabbccddeeff`).
- **Tarea pendiente**: Integrar con el contexto de sesión/autenticación o con el selector global de establecimiento para obtener dinámicamente el `establishmentId` activo del usuario/organización.
