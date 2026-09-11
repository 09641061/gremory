# Frontend Capabilities Audit

Recursive audit of every user-triggerable interactive element (buttons, forms, modals, dropdown
actions, confirmations and other mutating controls) in the Takodu frontend.

- **Scope**: `takodu/ui` — Next.js App Router. Modules: **Catalog**, **CRM**, **Schedule**, **Chat/Assistant**.
- **Sources scanned**: `contexts/**` and `app/**` (grep for `onClick`, `onSubmit`, `action={`, `type="submit"`, `<Button>`, `<Dialog>`, `<AlertDialog>`, `<DropdownMenuItem>`, `useActionState`, `formAction`).
- **`Inferred Privilege String`**: proposed structured permission in English, format `module:resource:action`.
  These are **proposals**. The backend currently enforces coarse grants (`catalog:manage`, `crm:manage`,
  `scheduling:manage`, `assistant:manage`), not the granular codes below.

Legend:

- **Mutation** actions change server state and should be privilege-gated.
- **Read/Navigation** actions are view-only affordances. Their privilege string is only a nearest-match
  suggestion and, in practice, likely needs no permission beyond module read access.
- **UI-only** actions are pure client state (open/close a menu, expand, cancel) and require no privilege.

---

## Catalog

### Service

1. - Module: Catalog
   - User Interaction: Submit form "Create New Service" via the "Save" button
   - File Path: `contexts/catalog/interfaces/components/create-service/create-service-form.tsx`
   - Inferred Privilege String: `catalog:service:create`

2. - Module: Catalog
   - User Interaction: Dropdown item "Create Service" in the sidebar's "More things to create" menu
   - File Path: `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx`
   - Inferred Privilege String: `catalog:service:create`

3. - Module: Catalog
   - User Interaction: Dropdown item "Create Service" in "More actions for {category}"
   - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
   - Inferred Privilege String: `catalog:service:create`

4. - Module: Catalog
   - User Interaction: Submit form "Service Settings" (edit service) via "Save"
   - File Path: `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`
   - Inferred Privilege String: `catalog:service:update`

5. - Module: Catalog
   - User Interaction: Dropdown item "Activate" / "Deactivate" in "More actions for {service}"
   - File Path: `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`
   - Inferred Privilege String: `catalog:service:update` (or `catalog:service:change-status`)

6. - Module: Catalog
   - User Interaction: Drag a service row and drop it onto a category (move/assign category)
   - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
   - Inferred Privilege String: `catalog:service:update`

7. - Module: Catalog
   - User Interaction: Drag a service row and drop it onto the empty sidebar / "Uncategorized" area
   - File Path: `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx`
   - Inferred Privilege String: `catalog:service:update`

8. - Module: Catalog
   - User Interaction: Dropdown item "Delete" in "More actions for {service}"
   - File Path: `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`
   - Inferred Privilege String: `catalog:service:delete`

9. - Module: Catalog
   - User Interaction: Dialog "Delete service?" — confirm "Delete" button
   - File Path: `contexts/catalog/interfaces/components/catalog/delete-service-dialog.tsx`
   - Inferred Privilege String: `catalog:service:delete`

### Category

10. - Module: Catalog
    - User Interaction: Primary sidebar button "Create Category" (renders "Create Service" fallback when the user lacks category-create)
    - File Path: `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx`
    - Inferred Privilege String: `catalog:category:create`

11. - Module: Catalog
    - User Interaction: Dialog "New Category" — submit "Save" button
    - File Path: `contexts/catalog/interfaces/components/catalog/create-category-modal.tsx`
    - Inferred Privilege String: `catalog:category:create`

12. - Module: Catalog
    - User Interaction: Dropdown item "Edit" in "More actions for {category}"
    - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
    - Inferred Privilege String: `catalog:category:update`

13. - Module: Catalog
    - User Interaction: Dialog "Edit Category" — submit "Save" button
    - File Path: `contexts/catalog/interfaces/components/catalog/edit-category-modal.tsx`
    - Inferred Privilege String: `catalog:category:update`

14. - Module: Catalog
    - User Interaction: Dropdown item "Delete" in "More actions for {category}"
    - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
    - Inferred Privilege String: `catalog:category:delete`

15. - Module: Catalog
    - User Interaction: Dialog "Delete category?" — confirm "Delete" button
    - File Path: `contexts/catalog/interfaces/components/catalog/delete-category-dialog.tsx`
    - Inferred Privilege String: `catalog:category:delete`

### Read / Navigation / UI-only

16. - Module: Catalog
    - User Interaction: Expand/collapse a category row (folder/chevron button) — Read/Navigation
    - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
    - Inferred Privilege String: `catalog:category:read`

17. - Module: Catalog
    - User Interaction: Click a service row to display it — Read/Navigation
    - File Path: `contexts/catalog/interfaces/components/catalog/service-row.tsx`
    - Inferred Privilege String: `catalog:service:read`

18. - Module: Catalog
    - User Interaction: Open "More actions for {category}" menu trigger — UI-only
    - File Path: `contexts/catalog/interfaces/components/catalog/category-item.tsx`
    - Inferred Privilege String: `(none - client-side only)`

19. - Module: Catalog
    - User Interaction: Open "More actions for {service}" menu trigger — UI-only
    - File Path: `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`
    - Inferred Privilege String: `(none - client-side only)`

20. - Module: Catalog
    - User Interaction: Open "More things to create" split-dropdown trigger — UI-only
    - File Path: `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx`
    - Inferred Privilege String: `(none - client-side only)`

21. - Module: Catalog
    - User Interaction: Open mobile "Categories ({count})" drawer trigger — UI-only
    - File Path: `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx`
    - Inferred Privilege String: `(none - client-side only)`

22. - Module: Catalog
    - User Interaction: Click "Cancel" in the create/edit service forms and create/edit/delete category dialogs — UI-only
    - File Path: `contexts/catalog/interfaces/components/create-service/create-service-form.tsx`, `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`, `contexts/catalog/interfaces/components/catalog/create-category-modal.tsx`, `contexts/catalog/interfaces/components/catalog/edit-category-modal.tsx`
    - Inferred Privilege String: `(none - client-side only)`

23. - Module: Catalog
    - User Interaction: Dismiss catalog error toast ("Dismiss alert" X) — UI-only
    - File Path: `contexts/shared/interfaces/components/error.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Dead / unreachable code (listed for completeness)

24. - Module: Catalog
    - User Interaction: Click "Activate" / "Deactivate" in unused `ServiceDetailView` (component never rendered)
    - File Path: `contexts/catalog/interfaces/components/catalog/service-detail-view.tsx`
    - Inferred Privilege String: `catalog:service:update`

---

## CRM

### Customer Directory (list)

1. - Module: CRM
   - User Interaction: Click "Add customer" (navigates to the Add customer form)
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:create`

2. - Module: CRM
   - User Interaction: Type in search box ("Search by name, email, or document ID") — Read/Navigation
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:read`

3. - Module: CRM
   - User Interaction: Open row actions menu "More actions for {name}" — Read/Navigation
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:read`

4. - Module: CRM
   - User Interaction: Dropdown item "Edit profile"
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:update`

5. - Module: CRM
   - User Interaction: Dropdown item "Delete"
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:delete`

6. - Module: CRM
   - User Interaction: Dialog "Delete customer?" — confirm "Delete" button
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:delete`

7. - Module: CRM
   - User Interaction: Dialog "Delete customer?" — "Cancel" — UI-only
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `(none - client-side only)`

8. - Module: CRM
   - User Interaction: Pagination "First/Previous/Next/Last page" — Read/Navigation
   - File Path: `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx`
   - Inferred Privilege String: `crm:customer:read`

### Create Customer

9. - Module: CRM
   - User Interaction: Form "Add customer" — submit "Save customer"
   - File Path: `contexts/crm/interfaces/components/customer-registration/create-customer-form.tsx`
   - Inferred Privilege String: `crm:customer:create`

10. - Module: CRM
    - User Interaction: Click "Cancel" in the customer form (navigates back) — UI-only
    - File Path: `contexts/crm/interfaces/components/customer-management/customer-form.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Edit Customer

11. - Module: CRM
    - User Interaction: Form "Edit customer" — submit "Save changes"
    - File Path: `contexts/crm/interfaces/components/customer-management/edit-customer-form.tsx`
    - Inferred Privilege String: `crm:customer:update`

### Shared Customer Form (create + edit)

12. - Module: CRM
    - User Interaction: Click "Autofill" (resolve DNI/RUC identity document)
    - File Path: `contexts/crm/interfaces/components/customer-management/customer-form.tsx`
    - Inferred Privilege String: `crm:customer:resolve-document`

13. - Module: CRM
    - User Interaction: Submit the shared customer form ("Save customer" / "Save changes")
    - File Path: `contexts/crm/interfaces/components/customer-management/customer-form.tsx`
    - Inferred Privilege String: `crm:customer:create` (create) / `crm:customer:update` (edit)

---

## Schedule

### Calendar toolbar

1. - Module: Schedule
   - User Interaction: Click the current date heading to open the date-picker popover — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

2. - Module: Schedule
   - User Interaction: Select a day in the calendar popover — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

3. - Module: Schedule
   - User Interaction: Click "Today" — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

4. - Module: Schedule
   - User Interaction: Click previous day (ChevronLeft) — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

5. - Module: Schedule
   - User Interaction: Click next day (ChevronRight) — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

6. - Module: Schedule
   - User Interaction: Click "Schedule appointment"
   - File Path: `contexts/scheduling/interfaces/components/calendar/calendar-toolbar.tsx`
   - Inferred Privilege String: `scheduling:appointment:create`

### Staff column paging

7. - Module: Schedule
   - User Interaction: Click "Previous staff members" — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/staff-columns-header.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

8. - Module: Schedule
   - User Interaction: Click "Next staff members" — Read/Navigation
   - File Path: `contexts/scheduling/interfaces/components/calendar/staff-columns-header.tsx`
   - Inferred Privilege String: `scheduling:calendar:view`

### Calendar grid

9. - Module: Schedule
   - User Interaction: Click an empty time slot in an employee column (prefilled create)
   - File Path: `contexts/scheduling/interfaces/components/calendar/daily-staff-grid.tsx`
   - Inferred Privilege String: `scheduling:appointment:create`

10. - Module: Schedule
    - User Interaction: Click an appointment block to open "Appointment details" — Read/Navigation
    - File Path: `contexts/scheduling/interfaces/components/calendar/appointment-block.tsx`
    - Inferred Privilege String: `scheduling:appointment:read`

### Appointment detail dialog / status actions

11. - Module: Schedule
    - User Interaction: Click "Start"
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-actions.tsx`
    - Inferred Privilege String: `scheduling:appointment:start`

12. - Module: Schedule
    - User Interaction: Click "No show"
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-actions.tsx`
    - Inferred Privilege String: `scheduling:appointment:mark-no-show`

13. - Module: Schedule
    - User Interaction: Click "Complete"
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-actions.tsx`
    - Inferred Privilege String: `scheduling:appointment:complete`

14. - Module: Schedule
    - User Interaction: Click "Reschedule"
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-actions.tsx`
    - Inferred Privilege String: `scheduling:appointment:reschedule`

15. - Module: Schedule
    - User Interaction: Click "Cancel" (opens cancel confirmation)
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-actions.tsx`
    - Inferred Privilege String: `scheduling:appointment:cancel`

16. - Module: Schedule
    - User Interaction: Open/close "Appointment details" dialog — Read/Navigation
    - File Path: `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-modal.tsx`
    - Inferred Privilege String: `scheduling:appointment:read`

### Status transition confirmation dialogs (start / complete / no-show)

17. - Module: Schedule
    - User Interaction: Confirm "Start appointment"
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/appointment-status-confirm-dialog.tsx`
    - Inferred Privilege String: `scheduling:appointment:start`

18. - Module: Schedule
    - User Interaction: Confirm "Complete appointment"
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/appointment-status-confirm-dialog.tsx`
    - Inferred Privilege String: `scheduling:appointment:complete`

19. - Module: Schedule
    - User Interaction: Confirm "Confirm no show"
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/appointment-status-confirm-dialog.tsx`
    - Inferred Privilege String: `scheduling:appointment:mark-no-show`

20. - Module: Schedule
    - User Interaction: Dismiss a status confirmation dialog ("Cancel" / backdrop / X) — UI-only
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/appointment-status-confirm-dialog.tsx`, `contexts/scheduling/interfaces/components/confirm-dialogs/appointment-confirm-dialog-shell.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Cancel appointment confirmation

21. - Module: Schedule
    - User Interaction: Submit "Cancel appointment" with a required "Reason for cancellation"
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/cancel-confirm-dialog.tsx`
    - Inferred Privilege String: `scheduling:appointment:cancel`

22. - Module: Schedule
    - User Interaction: Click "Go back" to dismiss — UI-only
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/cancel-confirm-dialog.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Reschedule / edit appointment

23. - Module: Schedule
    - User Interaction: Submit "Confirm changes" in "Edit appointment"
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/reschedule-form-modal.tsx`
    - Inferred Privilege String: `scheduling:appointment:update`

24. - Module: Schedule
    - User Interaction: Click "Delete" (opens delete confirmation)
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/reschedule-form-modal.tsx`
    - Inferred Privilege String: `scheduling:appointment:delete`

25. - Module: Schedule
    - User Interaction: Click "Cancel" to dismiss the edit-appointment dialog — UI-only
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/reschedule-form-modal.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Delete appointment confirmation

26. - Module: Schedule
    - User Interaction: Submit "Delete appointment?" confirmation
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/delete-confirm-dialog.tsx`
    - Inferred Privilege String: `scheduling:appointment:delete`

27. - Module: Schedule
    - User Interaction: Click "Cancel" to dismiss delete confirmation — UI-only
    - File Path: `contexts/scheduling/interfaces/components/confirm-dialogs/delete-confirm-dialog.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Create appointment (dedicated page)

28. - Module: Schedule
    - User Interaction: Submit "Create appointment"
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/create-appointment-form.tsx`
    - Inferred Privilege String: `scheduling:appointment:create`

29. - Module: Schedule
    - User Interaction: Click "Cancel" on the new-appointment page — UI-only
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/create-appointment-form.tsx`
    - Inferred Privilege String: `(none - client-side only)`

30. - Module: Schedule
    - User Interaction: Open the `/schedule/new` page (page-level create entry)
    - File Path: `app/(protected)/(app)/schedule/new/page.tsx`
    - Inferred Privilege String: `scheduling:appointment:create`

### Shared appointment form field controls (create + reschedule)

31. - Module: Schedule
    - User Interaction: Open date picker, browse months and select a day (`DateField`)
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/date-field.tsx`
    - Inferred Privilege String: `scheduling:appointment:create` / `scheduling:appointment:update`

32. - Module: Schedule
    - User Interaction: Adjust hour/minutes and toggle AM/PM (`TimePickerField`)
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/time-picker-field.tsx`
    - Inferred Privilege String: `scheduling:appointment:create` / `scheduling:appointment:update`

33. - Module: Schedule
    - User Interaction: Select Service / Customer / Employee from dropdown items (`DropdownField`)
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/dropdown-field.tsx`
    - Inferred Privilege String: `scheduling:appointment:create` / `scheduling:appointment:update`

34. - Module: Schedule
    - User Interaction: Edit appointment title/date/time and submit the shared field set (`AppointmentFormFields`)
    - File Path: `contexts/scheduling/interfaces/components/appointment-form/appointment-form-fields.tsx`
    - Inferred Privilege String: `scheduling:appointment:create` / `scheduling:appointment:update`

---

## Chat / Assistant

### Composer

1. - Module: Chat
   - User Interaction: Type a message in the composer (placeholder "Ask what you need about Takodu")
   - File Path: `contexts/assistant/interfaces/components/chat-view/assistant-chat-composer.tsx`
   - Inferred Privilege String: `assistant:message:send`

2. - Module: Chat
   - User Interaction: Click the composer send button (aria-label "Send message" / "Sending")
   - File Path: `contexts/assistant/interfaces/components/chat-view/assistant-chat-composer.tsx`
   - Inferred Privilege String: `assistant:message:send`

3. - Module: Chat
   - User Interaction: Press Enter (without Shift) in the composer to send
   - File Path: `contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts`
   - Inferred Privilege String: `assistant:message:send`

### Sidebar

4. - Module: Chat
   - User Interaction: Click "New Chat" sidebar entry (conversation is created on first send)
   - File Path: `contexts/shared/interfaces/components/sidebar/app-sidebar.tsx`
   - Inferred Privilege String: `assistant:conversation:create`

5. - Module: Chat
   - User Interaction: Click "Chats" section header to expand/collapse the list — Read/Navigation
   - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-chats-section.tsx`
   - Inferred Privilege String: `assistant:conversation:list`

6. - Module: Chat
   - User Interaction: Click a conversation title link (open conversation) — Read/Navigation
   - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-list-item.tsx`
   - Inferred Privilege String: `assistant:conversation:read`

7. - Module: Chat
   - User Interaction: Open conversation options trigger ("Options for {title}") — UI-only
   - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-list-item.tsx`
   - Inferred Privilege String: `(none - client-side only)`

8. - Module: Chat
   - User Interaction: Dropdown item "Edit name"
   - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-list-item.tsx`
   - Inferred Privilege String: `assistant:conversation:rename`

9. - Module: Chat
   - User Interaction: Dropdown item "Delete"
   - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-list-item.tsx`
   - Inferred Privilege String: `assistant:conversation:delete`

### Rename conversation dialog ("Edit chat")

10. - Module: Chat
    - User Interaction: Dialog "Edit chat" — type in the "Chat name" input
    - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-rename-modal.tsx`
    - Inferred Privilege String: `assistant:conversation:rename`

11. - Module: Chat
    - User Interaction: Dialog "Edit chat" — click "Save"
    - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-rename-modal.tsx`
    - Inferred Privilege String: `assistant:conversation:rename`

12. - Module: Chat
    - User Interaction: Dialog "Edit chat" — click "Cancel" / close (X, overlay, Escape) — UI-only
    - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-rename-modal.tsx`
    - Inferred Privilege String: `(none - client-side only)`

### Delete conversation dialog

13. - Module: Chat
    - User Interaction: Dialog "Delete conversation?" — confirm "Delete"
    - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-delete-dialog.tsx`
    - Inferred Privilege String: `assistant:conversation:delete`

14. - Module: Chat
    - User Interaction: Dialog "Delete conversation?" — "Cancel" / close (X, overlay, Escape) — UI-only
    - File Path: `contexts/assistant/interfaces/components/sidebar/assistant-conversation-delete-dialog.tsx`
    - Inferred Privilege String: `(none - client-side only)`

---

## Notes

- **Current authorization is coarse.** Catalog actions are gated by `catalog:manage` (page level),
  CRM by `crm:manage` / `crm:read`, Schedule by `scheduling:manage` and workspace `accessPolicy.canOpenScheduling`,
  and Chat by `assistant:manage`. The granular `module:resource:action` codes above are proposals for a
  future fine-grained model.
- **Server endpoints (non-UI) mirror these actions.** e.g. `app/api/assistant/conversations/*`,
  `app/api/catalog/*`, and the CRM/Schedule server actions in `contexts/*/interfaces/actions/`. They are
  not interactive elements and are therefore not listed as interactions.
- **Dead code excluded where unreachable.** Catalog `service-detail-view.tsx` and Schedule
  `appointment-form-modal.tsx` (plus unused server actions) are never rendered/triggered in the current app.
- **Read/Navigation and UI-only** entries are included for completeness; most need no dedicated privilege.
