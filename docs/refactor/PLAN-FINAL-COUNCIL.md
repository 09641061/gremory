# Plan de Refactorización - Decisión del Council

**Fecha:** 2024-09-20  
**Roster:** Arquitecto + Diseñador UX  
**Pasos:** Pass 1 (independiente) + Pass 2 (cross-exam)  
**Confianza:** Alta (ambos advisors converged)

---

## Pregunta Original

¿El plan de refactorización de 3 fases (Fase 1: reorganizar carpeta, Fase 2: sidebar/hooks, Fase 3: proxy/view models) prioriza correctamente los cambios?

---

## Recomendación Final

**EJECUTAR el plan refactorizado con nueva priorización:**

```
┌─────────────────────────────────────────────────────────────┐
│  NUEVA PRIORIDAD (basada en ROI: impacto / esfuerzo)        │
├─────────────────────────────────────────────────────────────┤
│  1. FormFieldSystem (~6h)      → Mayor ROI, afecta 6+ files│
│  2. NotificationContext (~4h)   → Performance + consistencia│
│  3. app-sidebar.tsx fix (~2h)  → Problema real identificado │
│  4. Tests (Fase 0)             → Regression safety primero  │
│  5. shared/components reorganize(~4h) → Descubribilidad     │
│  6. Hooks extraction (~10h)    → Maintainability           │
│  7. Proxy (BAJA)              → No hay bugs reportados     │
└─────────────────────────────────────────────────────────────┘
```

---

## Decisiones del Owner Aceptadas

### ✅ Decisión 1: FormFieldSystem es PRIORIDAD #1

**Rationale:** Ambos advisors converged que el FormFieldSystem tiene el mayor ROI:
- Impacta 6+ archivos simultáneamente
- Reduce 300+ líneas de código duplicado
- Mejora consistencia de UX (error placement, focus management, aria)
- Fácil de testear

**Scope:**
```
contexts/shared/interfaces/components/
├── form/                              # NUEVO
│   ├── form-field.tsx               # Label + Input + ErrorMessage
│   ├── form-section.tsx              # Agrupación con header
│   ├── use-form-validation.ts        # Hook reutilizable
│   └── form-submit-button.tsx        # Con loading state
```

### ✅ Decisión 2: Fase 0 (Tests) es obligatoria

**Rationale:** Diseñador强烈要求 - sin tests no hay regression safety para cambios de UX.

**Scope:**
- Unit tests para estados de FormFieldSystem (empty, loading, error, success)
- Integration tests para validaciones
- E2E tests para flujos críticos

### ✅ Decisión 3: app-sidebar.tsx es el problema real

**Rationale:** UI/sidebar.tsx es componente shadcn base (legítimo). El problema es app-sidebar.tsx que mezcla lógica de navegación con permisos.

**Cambio:**
- **ANTES:** Refactorizar ui/sidebar.tsx (728 líneas)
- **DESPUÉS:** Solo arreglar app-sidebar.tsx (144 líneas) - mover lógica de rutas a servicio

**Estructura propuesta:**
```
contexts/shared/interfaces/components/sidebar/
├── app-sidebar.tsx        # Composición sin lógica de negocio
├── sidebar-config.ts      # Configuration-driven, recibe EntryRoute[]
└── use-sidebar-routes.ts # Hook que extrae lógica de políticas
```

### ✅ Decisión 4: Reorganizar shared/components con sub-carpetas semánticas

**Rationale:** Ambos aceptan que mejora descubribilidad.

**Estructura propuesta:**
```
contexts/shared/interfaces/components/
├── feedback/              # error, alert, loading
├── dialogs/               # confirm, delete
├── navigation/            # back-button, header
├── lists/                # entity-list, search-bar
├── layout/               # shell, page, protected
├── upload/               # image-upload
├── sidebar/
├── header/
├── hooks/
├── icons/
├── kodu/
└── ui/                  # 64 shadcn (EXCEPCIÓN DOCUMENTADA)
```

### ✅ Decisión 5: NotificationContext separado

**Rationale:** Mejora performance (single polling interval) + consistencia.

**Scope:**
```
contexts/shared/interfaces/components/
├── notification/
│   ├── notification-item.tsx
│   ├── notification-badge.tsx
│   ├── notification-dropdown.tsx  # Refactorizado
│   └── use-notifications.ts       # Context provider
```

### ✅ Decisión 6: View Models requeridos PARA FormFieldSystem

**Rationale:** Diseñador disagreed con "nice-to-have". View models son necesarios para:
- Estados controlables en fields (isLoading, hasError)
- Validación asíncrona con feedback visual
- Reset de formularios con clean state

**Cambio del Arquitecto:** Aceptó que view models son requeridos, pero scoped al FormFieldSystem, no al proxy completo.

### ⚠️ Decisión 7: Proxy refactor es BAJA prioridad

**Rationale:** No hay bugs reportados, funciona correctamente. ROI no justifica el riesgo de cambiar código crítico de auth.

**Acción:** Mover a "nice-to-have" con implementación incremental cuando sea necesario.

---

## Feedback Rechazado

| Feedback | Rechazado porque |
|----------|------------------|
| "23 archivos directos es violación crítica" | Severidad baja - son componentes de shell legítimos |
| "Fase 3 completa (32h) es necesaria" | Proxy funciona; view models solo para FormFieldSystem |
| "UI/sidebar.tsx necesita refactor" | Es componente shadcn base, no tiene problemas |

---

## Riesgos Identificados

| Riesgo | Mitigation |
|--------|------------|
| Reescribir imports rompe consumers | Tests en Fase 0 |
| Inconsistencia temporal durante transición | Implementar en feature branches |
| FormFieldSystem requiere adopción del equipo | Documentación + ejemplos |

---

## Evidencia y Run IDs

| Advisor | Pass 1 Run | Pass 2 Run |
|---------|------------|------------|
| Arquitecto | `e7e4cf23-2439-46b6-afcc-3c90f34a6398` | `6669aea7-e316-492b-9b41-2869d5fd9159` |
| Diseñador | `649ec37a-de20-4490-9f1e-cc702e1352b1` | `8f54d217-e17c-457d-8fc9-4784be7dfd79` |

---

## Confianza

**Alta (High)**

- Ambos advisors converged en 6/7 decisiones
- Dispute residual: alcance de view models (resuelto: scoped a FormFieldSystem)
- Evidencia directa de archivos fuentes
- Métricas objetivas (líneas de código, archivos por carpeta)

**Lo que cambiaría la decisión:**
- Bugs reportados en proxy
- Tests existentes que demuestran cobertura insuficiente
- Feedback negativo del equipo sobre adopción de FormFieldSystem

---

## Plan Ejecutable

### Sprint 1: Foundation (2-3 días)

```
□ Fase 0: Tests para FormFieldSystem
□ Fase 0: Tests para NotificationDropdown
□ Crear shared/components/form/
□ Crear shared/components/notification/
□ Crear shared/components/feedback/
```

### Sprint 2: Core Refactors (1-2 semanas)

```
□ Implementar FormFieldSystem
□ Migrar customer-form a FormFieldSystem
□ Migrar edit-service-form a FormFieldSystem
□ Migrar create-category-modal a FormFieldSystem
□ Refactorizar notification-dropdown
□ Crear NotificationContext
□ Fix app-sidebar.tsx
□ Tests para cada migración
```

### Sprint 3: Polish ( según capacidad)

```
□ Reorganizar resto de shared/components
□ Extraer hooks identificados
□ Documentar decisiones en ADRs
□ Code review de adoptantes
```

### Nice-to-have ( cuando necesario)

```
□ Proxy incremental
□ MetricCard primitive
□ View models para otros bounded contexts
```

---

*Memo generado por Council Mode - Arquitectura de Software*
*Proyecto: Gremory | Next.js + DDD*
