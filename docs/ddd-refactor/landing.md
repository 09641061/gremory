# Plan BC Landing

**Modelo:** REMOTE FEATURE. Spring (Billing) es dueño de planes, precios y disponibilidad; la landing es el frontend público que los proyecta. **Domain local: NO.** El copy de marketing es contenido editorial (i18n), no reglas de negocio; el único dato remoto es el catálogo de planes.

**Guía aplicada:** `ddd-nextjs` (Next.js 16.3.4, React 19.2.8, Tailwind v4, `cacheComponents: true`).

**Diseño de referencia:** <https://imgur.com/a/ftrjV2k> — **5 fotos** (ver abajo). Tokens ya alineados con el tema del proyecto: verde `#2DC7A0` ≈ `--primary` actual, verde oscuro `#178768` ≈ `--accent-foreground`, mascot `KoduStaIcon` (shared) ya es el mismo alien de las capturas.

---

## Estado de implementación

| Fase | Estado |
|---|---|
| 0 — Cimientos (contexto + i18n ES/EN) | ✅ Hecho |
| 1 — Tokens y chrome (layout + navbar) | ✅ Hecho |
| 2 — Secciones (hero, cómo funciona, dueño, precios, FAQ, CTA) | ✅ Hecho |
| 3 — Precios desde el backend (`getPlans`) | ⏸️ **Aplazado por decisión del owner** — los precios salen del i18n |
| 4 — Tests/gates | ✅ Hecho (unit + e2e pendiente) |

**Consecuencia de aplazar la Fase 3:** la landing no tiene datos remotos, así que **no se creó `application/` ni `infrastructure/`**. Crear un port y un adapter sin un consumidor real es exactamente la ceremonia que la guía prohíbe (checklist #11). Las capas aparecen cuando se cablee `getPlans`.

**Patrón de i18n aplicado (ajuste sobre el plan original):** el repo resuelve el locale en el servidor (`getServerLocale()`) y lo pasa como prop serializable a la presentación — igual que `app/(protected)/(app)/analytics/page.tsx`. Por eso las secciones son **Server Components** y solo el navbar y el acordeón de FAQ son client. El toggle de idioma escribe la cookie y hace `router.refresh()` para re-renderizar el copy en servidor.

**Estructura final implementada:**

```txt
app/(landing)/
  layout.tsx                 # Server: resuelve locale -> navbar + <main id="app-main-content">
  page.tsx                   # Server: resuelve locale -> compone las 6 secciones
  loading.tsx                # skeleton
contexts/landing/
  interfaces/
    components/landing-navbar.tsx          # Client (Sheet móvil + toggle idioma)
    components/hero/{hero-section,whatsapp-mockup}.tsx
    components/how-it-works/how-it-works-section.tsx
    components/owner/{owner-section,agenda-board-mockup,pending-reminders-mockup,weekly-summary-card}.tsx
    components/pricing/pricing-section.tsx
    components/faq/{faq-section,faq-accordion}.tsx   # accordion = Client
    components/cta/final-cta-section.tsx
    components/index.ts
    i18n/{index.ts,locales/{es,en}.ts}
```

---

## Las 5 fotos del álbum y qué implementa cada una

| # | id imgur | Sección | Contenido |
|---|----------|---------|-----------|
| 1 | `bak0ZXT` | **Hero + nav** | Nav: Takodu · Cómo funciona · Funciones · Precios · Preguntas \| Ingresar · Probar gratis. H1 "Tu agenda se llena sola por WhatsApp.", subtítulo, 2 CTAs, mockup de chat de WhatsApp + tarjeta "Nueva cita por WhatsApp". Franja inferior con 4 verticales: Barberías, Spas y estética, Uñas y pestañas, Consultorios. |
| 2 | `G2JdlwN` | **Cómo funciona** | Eyebrow "CÓMO FUNCIONA", H2 "Listo en una tarde, sin cambiar cómo trabajas.", 3 tarjetas numeradas: 1 Conecta tu WhatsApp · 2 Carga servicios y equipo · 3 Deja que agende por ti. |
| 3 | `T3NvRvK` | **Para el dueño** | 3 bloques alternados texto/mockup: (a) "Tu día en una sola pantalla" + mockup kanban de agenda; (b) "MENOS SILLAS VACÍAS / Recordatorios que sí se responden" + lista "Mañana sin confirmar" con botón "Reenviar a todas"; (c) "REPORTES / Sabes cómo va tu negocio, en palabras" + tarjeta "Resumen de la semana". |
| 4 | `7HcVFSs` | **Precios + Preguntas** | Eyebrow "PRECIOS", H2 "Paga por el tamaño de tu negocio.", 3 planes (Inicial S/79 · Negocio S/149 "El más elegido" · Multisede S/299) con 4 features c/u y CTA distinto por plan. Debajo: eyebrow "PREGUNTAS", H2 "Lo que más nos preguntan" y acordeón de 4 preguntas (la primera abierta, `+`/`−` a la derecha). |
| 5 | `hkmX9Xg` | **CTA final** | Mascot grande centrado, H2 "Deja que tu agenda trabaje mientras tú atiendes.", botón "Probar gratis". |

## Estado actual del repo

- `app/(landing)/page.tsx` es la landing **vacía** (11 líneas, solo `<main id="app-main-content" />`). No hay `app/(landing)/layout.tsx`.
- `contexts/landing/` no existe (borrado en la limpieza anterior); la ruta `/pricing` no existe y `proxy.ts` ya no la tiene como caso especial.
- El namespace `landing` fue quitado de `contexts/shared/infrastructure/i18n/locales/{es,en}.ts`.
- `proxy.ts` **redirige a los autenticados fuera de `/`** (`pathname === "/" → homePath`). ⇒ **La landing solo la ven visitantes anónimos**: no necesita leer cookies, ni resolver sesión, ni lógica de auth. Página 100% estática/cachable.
- UI kit reutilizable en `contexts/shared/interfaces/components/ui/` (`button`, `accordion`, `sheet`, `navigation-menu`, `card`…).
- Mascot: `contexts/shared/interfaces/components/icons/kodu.tsx` (`KoduStaIcon`, fill `#2DC7A0`/`#178768`) — **no duplicar**.
- Billing: `BillingApiGateway.getPlans(currency)` → `GET /api/v1/billing/plans` **sin token** (público) ⇒ habilita caché compartida sin credenciales.
- Rutas públicas disponibles: `/login`, `/auth/callback`, `/auth/verify`. No hay `/signup`: todos los CTAs de conversión apuntan a `/login`.

---

## Decisiones de diseño (ownership)

| Decisión | Motivo |
|---|---|
| **Sin Domain local** | No hay invariantes ni reglas locales: el backend ya valida planes/precios. Modelar agregados en TS sería duplicar Spring (checklist #1). |
| **Copy en i18n del contexto** (`interfaces/i18n/locales/{es,en}.ts`) | Es contenido editorial versionado con el diseño, no reglas de negocio. Sigue el patrón de los demás BC del repo. |
| **Precios desde el backend** vía port propio | `Billing` es la fuente de verdad de precio/moneda. El port evita que Application dependa de Infrastructure. |
| **Prices con fallback local** | Si el backend no responde, la landing degrada a los precios del diseño en vez de romperse (§ Degradación). |
| **Caché pública con `use cache`** | Lectura pública, determinista, sin credenciales ⇒ `cacheLife('hours')` + `cacheTag('landing:plans')` es justificable (reads.md #5). |
| **Un solo route** | El diseño es un scroll largo; "Precios" y "Preguntas" son anclas, no rutas. |
| **Sin estado de auth en la landing** | El proxy ya saca a los autenticados. El CTA es siempre "Probar gratis" → `/login`. |
| **Mockups como DOM estático** | Los 3 mockups (chat WhatsApp, kanban de agenda, resumen) son ilustración, no UI real: se renderizan en Server Components sin JS. |

---

## Estructura propuesta

```txt
app/(landing)/
  layout.tsx                    # chrome: nav + <main id="app-main-content"> + footer
  page.tsx                      # Server Component delgado: compone secciones
  loading.tsx                   # skeleton de la landing
contexts/landing/
  application/
    models/landing-plan.model.ts            # read model serializable
    models/landing-view.model.ts            # view models de secciones (si hacen falta)
    queries/list-landing-plans.query.ts     # { currency }
    ports/landing-plan-reader.ts            # port consumer-owned
    internal/queryservices/list-landing-plans.service.ts
    errors/{application-error,technical-error}.ts
  infrastructure/
    gateways/landing-plans-reader.adapter.ts   # implementa el port sobre BillingApiGateway
    contracts/landing-plans.contracts.ts      # zod runtime (solo si el contrato de billing no alcanza)
  interfaces/
    components/landing-navbar.tsx          # Client (Sheet móvil + toggle idioma)
    components/landing-footer.tsx          # Server
    components/hero/hero-section.tsx       # Server
    components/hero/whatsapp-mockup.tsx    # Server (ilustración)
    components/how-it-works/how-it-works-section.tsx
    components/owner/owner-section.tsx
    components/owner/{agenda-mockup,reminders-mockup,weekly-summary-card}.tsx
    components/pricing/pricing-section.tsx  # Server
    components/pricing/plan-card.tsx
    components/faq/faq-section.tsx         # Server
    components/faq/faq-accordion.tsx        # Client (base-ui Accordion del kit shared)
    components/cta/final-cta-section.tsx
    i18n/{index.ts,locales/{es,en}.ts}
    server/landing-composition.ts          # server-only
    server/landing-reads.ts                # lectura cacheada + degradación
```

**No se crea** `contexts/landing/domain/`, ni `actions/`, ni `rest/schemas/`: no hay mutaciones propias ni API propia. La landing no escribe nada.

---

## Plan de ejecución

### Fase 0 — Cimientos
1. Crear `contexts/landing/` con la estructura REMOTE FEATURE (Application / Infrastructure / Interfaces). Sin Domain.
2. `interfaces/i18n/locales/es.ts` y `en.ts` con el copy de las 5 secciones (nav, hero,Mockup, cómo funciona, para el dueño, precios, FAQ, CTA) + `interfaces/i18n/index.ts` con `createLocalTranslationHook`/`createLocalDictionaryGetter` (patrón `federated.ts`).
3. Re-registrar el namespace en `contexts/shared/infrastructure/i18n/locales/{es,en}.ts` (`landing: landingEs.landing`).

### Fase 1 — Tokens y chrome
4. **Verificar mapeo de color** antes de maquetar: `--primary` (oklch 0.7031 0.1568 159.15) ≈ `#2DC7A0`; eyebrow/verde oscuro ≈ `--accent-foreground` (oklch 0.4126 0.1089 151.86) ≈ `#178768`. No crear tokens nuevos salvo que el diff visual lo pida.
5. `app/(landing)/layout.tsx`: `LandingNavbar` + `<main id="app-main-content">` + `LandingFooter`. El `id` es obligatorio: el skip-link del root layout lo apunta.
6. `LandingNavbar` (Client): links a anclas (`#como-funciona`, `#funciones`, `#precios`, `#preguntas`), botón "Ingresar" (ghost) y "Probar gratis" (primary) → `/login`; en `<768px` menú `Sheet` del kit shared; toggle de idioma ES/EN con el `I18nProvider` global (`useLandingI18n().setLocale`).

### Fase 2 — Secciones (Server Components por defecto)
7. **Hero** (foto 1): H1 con `text-4xl→6xl`, `font-extrabold tracking-tight`; eyebrow con el mascot; CTA primario "Probar gratis" (→`/login`) y secundario "Ver cómo funciona" (→`#como-funciona`); mockup de WhatsApp en `card` con borde suave + tarjeta flotante "Nueva cita por WhatsApp"; franja inferior de 4 verticales con iconos de `lucide-react`.
8. **Cómo funciona** (foto 2): 3 `card` con número grande en `text-primary`, título y descripción.
9. **Para el dueño** (foto 3): grid alternado (texto/mockup) ×3; los mockups son DOM estático con `bg-muted/40` y `border-border/60`.
10. **FAQ** (foto 4): sección server + `faq-accordion.tsx` client con `Accordion`/`AccordionItem`/`AccordionTrigger` del kit shared (el `+`/`−` del diseño lo da base-ui); primera pregunta abierta por defecto.
11. **CTA final** (foto 5): mascot grande (`KoduStaIcon`), H2 centrado, botón primario.

### Fase 3 — Precios (única parte remota)
12. `application/models/landing-plan.model.ts`:
    ```ts
    export type LandingPlan = Readonly<{
      id: number; name: string; monthlyPrice: number; annualPrice: number;
      currency: string; isPopular: boolean; maxEstablishments: number;
    }>;
    ```
    `features` **no** viene del backend hoy (ver Unknown #2) → el read model las deja fuera y la UI las toma del i18n indexadas por `planId`.
13. `application/ports/landing-plan-reader.ts` → `list(query: ListLandingPlansQuery): Promise<readonly LandingPlan[]>`.
14. `application/internal/queryservices/list-landing-plans.service.ts` → orquesta el port y traduce fallos del adapter a `TechnicalError` (sin exponer `error.message` al navegador).
15. `infrastructure/gateways/landing-plans-reader.adapter.ts` → implementa el port sobre `BillingApiGateway.getPlans(currency)` (reutiliza el contrato zod de billing; **no** duplicarlo). Si el contrato no alcanza, contrato propio en `infrastructure/contracts/`.
16. `interfaces/server/landing-composition.ts` → `server-only`; entrega el query service con su adapter cableado.
17. `interfaces/server/landing-reads.ts` → la lectura cacheada:
    - `use cache` + `cacheLife('hours')` + `cacheTag('landing:plans')` (lectura **pública**, sin credenciales de sesión);
    - **sin credenciales de sesión** (adaptador público);
    - `currency` viene de `searchParams` (Zod en el borde) con default `PEN` ⇒ la moneda es estado de URL, compartible y cacheable por clave;
    - ante `TechnicalError`: log sanitizado (operación + BC, sin cuerpos/credenciales) y **fallback** a los precios del i18n con `source: "fallback"`.
18. `app/(landing)/page.tsx` → delgado: parsea `searchParams`, invoca la read, y renderiza las secciones con view models serializables. `loading.tsx` con skeleton.

### Fase 4 — Calidad y entrega
19. **Tests**
    - `tests/unit/contexts/landing/landing-i18n.test.ts`: paridad de claves ES/EN y ausencia de claves sin traducir.
    - `tests/unit/contexts/landing/landing-plans.service.test.ts`: port fake — una llamada, mapeo a `LandingPlan`, error del port → `TechnicalError` con causa preservada.
    - `tests/unit/contexts/landing/landing-reads.test.ts`: caché pública sin token; fallo → fallback; `currency` inválida → 400/valor por defecto.
    - `tests/unit/contexts/landing/landing-sections.test.tsx`: render de cada sección con el `I18nProvider` (ES y EN) y assert de copy clave.
    - `tests/unit/contexts/landing/landing-faq-accordion.test.tsx`: client component — abrir/cerrar la primera pregunta.
    - `tests/e2e/landing.spec.ts`: `/` carga, hero visible, precios visibles, FAQ abre, CTA "Probar gratis" → `/login`.
20. **Gates:** `bunx tsc --noEmit`, `bun run lint`, `bun run build`, `bun run test`, `bun run test:e2e`.
21. **Extra opcional:** `metadata` + OpenGraph image, `robots`/`sitemap` si el repo los tiene.

---

## Degradación y errores

| Situación | Comportamiento |
|---|---|
| Backend de planes caído / timeout | La landing renderiza igual con los precios de respaldo del i18n; log sanitizado; nunca se muestra un mensaje técnico al visitante. |
| `?currency=` inválido | Zod en el borde → se ignora y se usa `PEN` (no 500 en una página pública). |
| `TechnicalError` | Nunca se serializa al cliente: solo log protegido con `operation` + `BC` + causa sanitizada. |
| Sin sesión | Es el caso normal: el proxy saca a los autenticados, así que la landing no depende de la sesión. |

## Cache y correlación

- `use cache` solo sobre la lectura **pública** de planes, con tag `landing:plans` y clave por `currency`.
- Nada de la landing lee cookies/headers dentro de un scope cacheado.
- Si en el futuro la landing llama a un endpoint autenticado, ese read **no** se cachea compartido (reads.md #5).

---

## Tests/gates (checklist de la guía aplicado)

- [ ] Domain inexistente y justificado (REMOTE FEATURE); Application sin imports de React/Next/Infrastructure.
- [ ] `app/` thin; Server Components por defecto; sin loopback HTTP.
- [ ] Composición `server-only`; adapters no se filtran al browser; props serializables.
- [ ] `use cache` solo en lectura pública sin credenciales.
- [ ] Errores técnicos con causa preservada para diagnóstico protegido; nada crudo al cliente.
- [ ] i18n ES/EN con paridad verificada por test.
- [ ] Mockups de las 5 fotos implementados sin JS innecesario.

## Riesgos / unknowns

1. **Planes reales vs. diseño.** El diseño muestra **Inicial S/79 · Negocio S/149 · Multisede S/299**; el código existente habla de **Standard/Max**. ¿Qué devuelve hoy `GET /api/v1/billing/plans`? Si no coincide, ¿se ajusta el diseño o se pide al backend los 3 planes con esos nombres/precios? Bloqueante para la sección de precios.
2. **`features`, `description` e `isPopular` no están en el contrato de `billingPlanResponseSchema`** (`id, name, maxEstablishments, monthlyPriceAmount, annualPriceAmount, currency, active`). Hoy `ListPlansQueryService` los rellena con `""`/`[]`/`false`. Decisión propuesta: las features y el badge "El más elegido" viven en el i18n del contexto indexados por plan; si el backend los expone, se mueven al read model. **Confirmar con backend.**
3. **Moneda por defecto.** El diseño usa soles; el endpoint acepta `PEN|USD|EUR`. Se propone `PEN` por defecto con `?currency=` en la URL. Confirmar si debe seguir la preferencia del navegador o ir siempre en PEN.
4. **Copy EN.** El álbum solo tiene copy en español. El i18n exige ES/EN: hay que redactar la traducción EN (o dejar el contexto solo en ES con fallback documentado). Decidir antes de escribir el diccionario.
5. **Copy de las verticales** (Barberías, Spas y estética, Uñas y pestañas, Consultorios) y del CTA final: son del mockup, no están en el i18n previo que se borró. Hay que reescribirlos desde las capturas.
6. **`use cache` + `cacheComponents: true`**: **verificado** en `node_modules/next/dist/docs` — `cacheLife('hours')` es un preset válido en Next 16.3.4 y `cacheComponents: true` ya está activo en `next.config.ts`. La clave de caché la forman los argumentos de la función, así que `currency` parametrizado da una entrada por moneda. Falta confirmar que `cacheTag('landing:plans')` es el único tag y que la landing prerenderiza sin leer cookies.
7. **Imágenes**: no hay assets de marca en `public/` para los mockups. Decidir: DOM/CSS puro (recomendado, sin binarios) vs. exportar los mockups a SVG/WebP.
