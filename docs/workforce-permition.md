# Workforce Permissions Guide de Workforce en Frontend (CRM, Catalog, Business y Scheduling)

This guide details la estructura de permisos granulares del sistema y how they should be implemented en el Frontend para controlar el access to modules, views and interactive actions.

---

## 1. Context Permissions de Scheduling (Scheduling and Appointments)

The following permissions were introduced specific permissions para manage the creation, viewing, and modification de appointments. En el frontend, se deben usar para proteger el calendar, booking forms y editing workflows.

### Granular Permissions de Scheduling
- **`scheduling:appointments:read`**
  - **Use**: Allows users to view el calendar de appointments, search availability y view the details de una cita específica por su ID.
  - **Components to protect**: Calendario principal, list of appointments, detail modals de cita.
- **`scheduling:appointments:create`**
  - **Use**: Permite schedule a new cita (initial creation).
  - **Components to protect**: Button for "New Appointment", booking form.
- **`scheduling:appointments:update`**
  - **Use**: Permite modify the details de una cita o reschedule it (change the date, time, or employee).
  - **Components to protect**: Botones de "Edit appointment", "Drag and drop" (drag-and-drop) en el calendar, y rescheduling form.
- **`scheduling:appointments:delete`**
  - **Use**: Permite cancel or permanently delete an appointment del roster activo.
  - **Components to protect**: Botones de "Cancel Appointment" y "Delete".
- **`scheduling:appointments:manage`**
  - **Use**: Otorga full administrative control sobre la agenda. Equivalent to having all previous permissions.

### Critical Rule del Frontend para Scheduling
- Al realizar la búsqueda/list of appointments (calendar), el parámetro `establishmentId` es **required**. If it is not provided o the user does not have permission en ese establecimiento, la API responderá con `400 Bad Request` o `403 Forbidden`. Therefore, el frontend siempre debe ensure selection de un establecimiento before loading el calendar.

---

## 2. Context Permissions de CRM (Customers)

Controls customer records and history visibility.

### Granular Permissions de CRM
- **`crm:customers:read`**: View the customer list and search by name/phone.
- **`crm:customers:create`**: Add new customers to the system.
- **`crm:customers:update`**: Modify existing customer data.
- **`crm:customers:delete`**: Delete customers.
- **`crm:customers:manage`**: Full customer management permission.

---

## 3. Permisos de Workforce (Staff and Roles)

Controls who can invite staff, revoke invitations, remove members, and configure roles.

### Granular Permissions de Workforce
- **`workforce:roles:read`**: List roles and assignable permissions.
- **`workforce:roles:create`**: Create new organization roles.
- **`workforce:roles:update`**: Modificar roles existentes, asignar roles a miembros o revocar roles de miembros.
- **`workforce:roles:delete`**: Delete organization roles.
- **`workforce:roles:manage`**: Full role management.
- **`workforce:invitations:create`**: Invitar nuevo personal.
- **`workforce:invitations:read`**: Ver estado de invitaciones enviadas.
- **`workforce:invitations:delete`**: Revoke pending invitations.
- **`workforce:invitations:manage`**: Full invitation management.
- **`workforce:members:read`**: View active staff and removed members for the establishment.
- **`workforce:members:delete`**: Remove a staff member from the establishment.
- **`workforce:members:manage`**: Full staff member management.

---

## 4. Removal of Redundant Permissions (Acceso)

The following have been completely removed del backend los permisos gatekeeper globales:
- `business:access` (eliminado)
- `catalog:access` (eliminado)

**Important**: El frontend **must not** use or validate estos strings. If the backend receives una validation or query associated a estos permisos, it will have no effect or will return an error.

### How should module-level access be handled in frontend navigation menus?
To decide whether to show una an entire section or module (ej: sidebar menu button), el frontend should check whether the user has **at least one** de los specific permissions de ese contexto.

**Logic examples en Frontend:**
```typescript
// Show the Customers (CRM)
const canAccessCRM = hasPermission("crm:customers:read") || hasPermission("crm:customers:manage");

// Show the Calendario/Agenda (Scheduling)
const canAccessScheduling = hasPermission("scheduling:appointments:read") || hasPermission("scheduling:appointments:manage");

// Show the Personal (Workforce)
const canAccessWorkforce = hasPermission("workforce:members:read") || hasPermission("workforce:roles:read");
```
