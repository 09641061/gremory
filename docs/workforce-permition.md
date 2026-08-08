# Guía de Permisos de Workforce en Frontend (CRM, Catalog, Business y Scheduling)

Esta guía detalla la estructura de permisos granulares del sistema y cómo deben ser implementados en el Frontend para controlar el acceso a módulos, vistas y acciones interactivas.

---

## 1. Permisos del Contexto de Scheduling (Agenda y Citas)

Se han introducido permisos específicos para gestionar la creación, visualización y modificación de citas. En el frontend, se deben usar para proteger el calendario, formularios de reserva y flujos de edición.

### Permisos Granulares de Scheduling
- **`scheduling:appointments:read`**
  - **Uso**: Permite ver el calendario de citas, realizar búsquedas de disponibilidad y consultar los detalles de una cita específica por su ID.
  - **Componentes a proteger**: Calendario principal, listado de citas, modales de detalle de cita.
- **`scheduling:appointments:create`**
  - **Uso**: Permite agendar una nueva cita (creación inicial).
  - **Componentes a proteger**: Botón de "Nueva Cita", formulario de reserva.
- **`scheduling:appointments:update`**
  - **Uso**: Permite modificar los datos de una cita o reprogramarla (cambiar de fecha, hora o empleado).
  - **Componentes a proteger**: Botones de "Editar cita", "Arrastrar y soltar" (drag-and-drop) en el calendario, y formulario de reprogramación.
- **`scheduling:appointments:delete`**
  - **Uso**: Permite cancelar una cita o eliminarla permanentemente del roster activo.
  - **Componentes a proteger**: Botones de "Cancelar Cita" y "Eliminar".
- **`scheduling:appointments:manage`**
  - **Uso**: Otorga control administrativo total sobre la agenda. Equivalente a poseer todos los permisos anteriores.

### Regla Crítica del Frontend para Scheduling
- Al realizar la búsqueda/listado de citas (calendario), el parámetro `establishmentId` es **obligatorio**. Si no se proporciona o el usuario no tiene permisos en ese establecimiento, la API responderá con `400 Bad Request` o `403 Forbidden`. Por lo tanto, el frontend siempre debe asegurar la selección de un establecimiento antes de cargar el calendario.

---

## 2. Permisos del Contexto de CRM (Clientes)

Controla la gestión de fichas de clientes y visualización de su historial.

### Permisos Granulares de CRM
- **`crm:customers:read`**: Ver lista de clientes y buscar por nombre/teléfono.
- **`crm:customers:create`**: Agregar nuevos clientes al sistema.
- **`crm:customers:update`**: Modificar datos de clientes existentes.
- **`crm:customers:delete`**: Borrar clientes.
- **`crm:customers:manage`**: Permiso total de administración de clientes.

---

## 3. Permisos de Workforce (Personal y Roles)

Controla quién puede invitar personal, revocar invitaciones, eliminar miembros y configurar roles.

### Permisos Granulares de Workforce
- **`workforce:roles:read`**: Listar roles y permisos asignables.
- **`workforce:roles:create`**: Crear nuevos roles organizacionales.
- **`workforce:roles:update`**: Modificar roles existentes, asignar roles a miembros o revocar roles de miembros.
- **`workforce:roles:delete`**: Eliminar roles de la organización.
- **`workforce:roles:manage`**: Gestión total de roles.
- **`workforce:invitations:create`**: Invitar nuevo personal.
- **`workforce:invitations:read`**: Ver estado de invitaciones enviadas.
- **`workforce:invitations:delete`**: Revocar invitaciones pendientes de aceptación.
- **`workforce:invitations:manage`**: Gestión total de invitaciones.
- **`workforce:members:read`**: Ver lista de personal activo y removed del establecimiento.
- **`workforce:members:delete`**: Dar de baja a un miembro de personal del establecimiento.
- **`workforce:members:manage`**: Gestión total de miembros de personal.

---

## 4. Eliminación de Permisos Redundantes (Acceso)

Se han eliminado por completo del backend los permisos gatekeeper globales:
- `business:access` (eliminado)
- `catalog:access` (eliminado)

**Importante**: El frontend **no debe** utilizar ni validar estos strings. Si el backend recibe una validación o consulta asociada a estos permisos, no surtirá efecto o dará error.

### ¿Cómo manejar el acceso a nivel de módulo en los menús de navegación del frontend?
Para decidir si se muestra una sección o módulo completo (ej: botón del menú lateral), el frontend debe evaluar si el usuario tiene **al menos uno** de los permisos específicos de ese contexto.

**Ejemplos de lógica en Frontend:**
```typescript
// Mostrar menú de Clientes (CRM)
const canAccessCRM = hasPermission("crm:customers:read") || hasPermission("crm:customers:manage");

// Mostrar menú de Calendario/Agenda (Scheduling)
const canAccessScheduling = hasPermission("scheduling:appointments:read") || hasPermission("scheduling:appointments:manage");

// Mostrar menú de Personal (Workforce)
const canAccessWorkforce = hasPermission("workforce:members:read") || hasPermission("workforce:roles:read");
```
