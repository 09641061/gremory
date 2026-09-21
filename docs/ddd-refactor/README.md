# Refactor DDD-oriented de bounded contexts

Estos documentos son los planes de revisión e implementación para el proyecto. La guía aplicada es `ddd-nextjs` y el contrato DDD-Oriented Architecture Guide proporcionado por el usuario.

- [Plan maestro y gates](./00-overall-plan.md)
- [Analytics](./analytics.md)
- [Assistant](./assistant.md)
- [Billing](./billing.md)
- [Business](./business.md)
- [Catalog](./catalog.md)
- [CRM](./crm.md)
- [IAM](./iam.md)
- [Notifications](./notifications.md)
- [Profiles](./profiles.md)
- [Scheduling](./scheduling.md)
- [Shared y app shell](./shared.md)

Todos los BC fueron clasificados como **REMOTE FEATURE** en la revisión inicial. La implementación debe respetar los unknowns anotados: no duplicar reglas de Spring ni inventar contratos backend ausentes.
