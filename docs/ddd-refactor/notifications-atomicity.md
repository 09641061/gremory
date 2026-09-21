# Notification invitation acceptance

The current backend contract exposes two operations: mark the notification as
accepted and accept the invitation. The frontend cannot make those requests
atomic, so `NotificationCommandService.acceptInvitation` deliberately performs
both and only persists the workspace cookies after the invitation request
succeeds.

A failure in the second request can therefore leave the notification marked as
accepted while the invitation remains pending. The UI must treat the backend as
authoritative and allow retry through the pending-invitation action; it must not
claim that both operations committed as one transaction. A future backend
endpoint should replace this two-call sequence with one idempotent acceptance
operation before the client removes the reconciliation note.

## Target token boundary

The current backend contract still requires an invitation token for the
notification-specific acceptance request. Until the backend confirms an
ID-only endpoint, `targetToken` is treated as sensitive invitation material:
it is validated server-side, sent only to the authenticated server action, and
must not be logged. It is currently serialized in the notification read model
because the existing provider contract requires it; this is a documented
compatibility constraint, not an authorization decision. Once the provider
accepts `notificationId` alone, the field must be removed from the browser
model and the action signature.
