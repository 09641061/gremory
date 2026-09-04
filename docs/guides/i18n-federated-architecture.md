# Arquitectura de Internacionalización Federada (i18n) en Takodu

Esta guía documenta el funcionamiento del sistema de internacionalización (**i18n**) del frontend de Takodu, los principios de su diseño híbrido/federado por contexto y el procedimiento paso a paso para agregar un nuevo idioma.

---

## 1. Filosofía y Objetivos

Takodu está organizado según **Domain-Driven Design (DDD)** con Bounded Contexts independientes (`crm`, `scheduling`, `catalog`, `workforce`, `billing`, `assistant`, `analytics`, `business`, `iam`, `notifications`, `profiles`, `shared`).

Para la internacionalización, se adoptó un **Modelo Híbrido / Federado por Contexto**:

- **Cada contexto es dueño de sus textos**: Las traducciones de agendamiento viven en `contexts/scheduling`, las de catálogo en `contexts/catalog`, etc. No existe un archivo monolítico gigante que cree conflictos de merge constantes entre desarrolladores.
- **Núcleo Global Centralizado**: El estado del idioma activo (`locale`), la persistencia en cookies, la detección en navegador y las utilidades compartidas residen en `contexts/shared`.
- **Zero Runtime Dependencies**: No se depende de librerías pesadas como `next-intl` o `i18next`. Todo funciona con TypeScript puro, React 19 Context y utilidades funcionales ligeras.
- **Tipado Estricto en Compile-Time**: La estructura del diccionario en inglés (`en.ts`) actúa como *Single Source of Truth* de tipos. Si se agrega una nueva clave en inglés, TypeScript alertará inmediatamente si falta en los demás idiomas.
- **Compatible con Partial Prerendering (PPR) de Next.js**: No se fuerza renderizado dinámico en layouts raíz; la hidratación y sincronización de preferencias ocurren de forma limpia en el cliente.

---

## 2. Diagrama de la Arquitectura

```
                               ┌────────────────────────────────┐
                               │     contexts/shared (Core)     │
                               │  - Locale: 'es' | 'en'         │
                               │  - I18nProvider & LocaleSync   │
                               │  - Cookie 'takodu_locale'      │
                               │  - createLocalTranslationHook  │
                               │  - Global Dictionaries (auth)  │
                               └───────────────┬────────────────┘
                                               │
       ┌──────────────┬──────────────┬─────────┴────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼              ▼              ▼
  [ catalog ]    [ scheduling ]   [ crm ]      [ workforce ]   [ billing ]   [ business ] ...
  ├── locales/   ├── locales/   ├── locales/   ├── locales/   ├── locales/   ├── locales/
  │   ├── en.ts  │   ├── en.ts  │   ├── en.ts  │   ├── en.ts  │   ├── en.ts  │   ├── en.ts
  │   └── es.ts  │   └── es.ts  │   └── es.ts  │   └── es.ts  │   └── es.ts  │   └── es.ts
  └── index.ts   └── index.ts   └── index.ts   └── index.ts   └── index.ts   └── index.ts
  (useCatalog)   (useScheduling)(useCrm)       (useWorkforce) (useBilling)   (useBusiness)
```

---

## 3. Estructura de Archivos

### 3.1. Núcleo Global (`contexts/shared`)

| Ruta | Propósito |
| --- | --- |
| `contexts/shared/domain/model/i18n.ts` | Tipos de dominio: `Locale` (`"es"` \| `"en"`), `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, cookies. |
| `contexts/shared/infrastructure/i18n/locales/` | Diccionarios globales (`common`, `navigation`, `auth`, `profile`, `preferences`, `shared`). |
| `contexts/shared/interfaces/i18n/i18n-provider.tsx` | `I18nProvider`, hook global `useI18n()`, función `setLocale()` y componente `<LocaleSync />`. |
| `contexts/shared/interfaces/i18n/federated.ts` | Constructores de hooks federados: `createLocalTranslationHook`, `createLocalDictionaryGetter` y el tipo transformador `StringLeaf<T>`. |

### 3.2. Estructura estándar dentro de cada Bounded Context

Cada contexto que maneja interfaz de usuario posee una carpeta `interfaces/i18n/`:

```
contexts/<contexto>/interfaces/i18n/
├── locales/
│   ├── en.ts       # Diccionario base en inglés (define tipos)
│   └── es.ts       # Diccionario en español tipado con StringLeaf<typeof en>
└── index.ts        # Exporta use<Context>Translations y get<Context>Dictionary
```

---

## 4. Cómo Consumir Traducciones en un Componente

### 4.1. En un componente del contexto (por ejemplo, Catalog)

Cada contexto exporta su hook tipado. Gracias a la ergonomía dual de `createLocalTranslationHook`, se puede usar de dos formas:

```tsx
"use client";

import { useCatalogTranslations } from "@/contexts/catalog/interfaces/i18n";

export function CategorySidebarHeader() {
  // Forma 1: Acceso directo como diccionario
  const t = useCatalogTranslations();

  return (
    <div>
      <h1>{t.sidebar.categoriesCount.replace("{count}", "5")}</h1>
      <button>{t.sidebar.createCategory}</button>
    </div>
  );
}
```

Si también necesitas el código del idioma actual (por ejemplo para formateo de fechas):

```tsx
export function CategoryItem() {
  // Forma 2: Acceso desestructurado con el locale
  const { t, locale } = useCatalogTranslations();

  const formattedDate = new Date().toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US"
  );

  return <span>{t.sidebar.edit} - {formattedDate}</span>;
}
```

### 4.2. En componentes transversales o layout (`shared`)

Para elementos de navegación global, auth o perfil, se usa el hook central:

```tsx
"use client";

import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function Navbar() {
  const { t, locale, setLocale } = useI18n();

  return (
    <nav>
      <span>{t.navigation.schedule}</span>
      <button onClick={() => setLocale(locale === "es" ? "en" : "es")}>
        {locale.toUpperCase()}
      </button>
    </nav>
  );
}
```

---

## 5. El Rol de `StringLeaf<T>`

En TypeScript, cuando defines un objeto con `as const`:

```ts
export const en = {
  button: "Save",
} as const;
```

El tipo inferido para `button` es el literal `"Save"`, no `string`. Si otro archivo en español intenta asignar `"Guardar"`, TypeScript marcará error (`Type '"Guardar"' is not assignable to type '"Save"'`).

Para resolver esto manteniendo **autocompletado perfecto** y validación de claves idénticas, se utiliza la utilidad recursiva `StringLeaf<T>`:

```ts
export type StringLeaf<T> = T extends string
  ? string
  : T extends object
    ? { readonly [K in keyof T]: StringLeaf<T[K]> }
    : T;
```

De esta forma:
1. `en.ts` se escribe con `as const`.
2. Se exporta `export type <Context>Dictionary = StringLeaf<typeof en>;`.
3. `es.ts` se tipea como `: <Context>Dictionary`, permitiendo cualquier texto en español pero exigiendo exactamente las mismas claves y objetos anidados.

---

## 6. Sincronización con el Perfil de Usuario

1. **Selección en UI**: En la pantalla de perfil (`contexts/profiles/interfaces/components/profile/profile-preferences-card.tsx`), el usuario puede elegir entre `Español` e `Inglés`.
2. **Mutación y Persistencia**:
   - Se ejecuta el Server Action `updatePreferencesAction` que guarda `"ES"` o `"EN"` en la base de datos del usuario.
   - En caso de éxito, el componente ejecuta `setLocale(language.toLowerCase())`.
   - `setLocale()` actualiza el estado en memoria de React y escribe la cookie `takodu_locale=<locale>; path=/; max-age=180 días; SameSite=Lax`.
3. **Sincronización Automática al Iniciar Sesión (`LocaleSync`)**:
   - `AppSidebar` renderiza el componente `<LocaleSync profileLanguage={currentProfile?.language} />`.
   - Si el perfil del usuario tiene un idioma registrado diferente al locale activo actual de la sesión, `LocaleSync` lo alinea automáticamente.

---

## 7. Guía Paso a Paso: Cómo Agregar un Nuevo Idioma (ejemplo: Portugués `pt`)

Si en el futuro se desea agregar un nuevo idioma (por ejemplo, Portugués `"pt"`):

### Paso 1: Actualizar el modelo de dominio en `contexts/shared`

Edita `contexts/shared/domain/model/i18n.ts`:

```ts
export const SUPPORTED_LOCALES = ["es", "en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number]; // "es" | "en" | "pt"
```

### Paso 2: Crear el diccionario global para el nuevo idioma

Crea `contexts/shared/infrastructure/i18n/locales/pt.ts`:

```ts
import type { GlobalTranslations } from "./en";

export const pt: GlobalTranslations = {
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    ...
  },
  navigation: { ... },
  auth: { ... },
  ...
};
```

Exporta `pt` en `contexts/shared/infrastructure/i18n/locales/index.ts`:

```ts
import { en } from "./en";
import { es } from "./es";
import { pt } from "./pt";

export const dictionaries = { en, es, pt };
```

### Paso 3: Agregar la opción al selector de perfil

En `contexts/profiles/interfaces/components/profile/profile-preferences-card.tsx`:

```tsx
const languageOptions = [
  { value: "ES" as const, label: t.preferences.languages.es },
  { value: "EN" as const, label: t.preferences.languages.en },
  { value: "PT" as const, label: t.preferences.languages.pt },
];
```

Y agrega la clave `pt` en `preferences.languages` de `en.ts`, `es.ts` y `pt.ts`.

### Paso 4: Crear el diccionario local en cada Bounded Context

En cada contexto (por ejemplo, `catalog`):
1. Crea `contexts/catalog/interfaces/i18n/locales/pt.ts`:
   ```ts
   import type { CatalogDictionary } from "../index";

   export const pt: CatalogDictionary = {
     sidebar: {
       createCategory: "Criar Categoria",
       ...
     },
     ...
   };
   ```
2. En `contexts/catalog/interfaces/i18n/index.ts`, registra el nuevo idioma:
   ```ts
   import { en } from "./locales/en";
   import { es } from "./locales/es";
   import { pt } from "./pt";

   export const catalogLocales = { en, es, pt };
   ```

*Repetir este paso para los demás contextos: `crm`, `scheduling`, `workforce`, `billing`, `assistant`, `analytics`, `business`, `notifications`.*

### Paso 5: Actualizar los Tests Unitarios de Paridad

Cada contexto cuenta con un archivo de test `*-i18n.test.ts` (por ejemplo, `tests/unit/contexts/catalog/catalog-i18n.test.ts`).

Agrega la aserción de paridad para el nuevo idioma:

```ts
it("should have matching keys between all dictionaries", () => {
  expect(collectKeys(es)).toEqual(collectKeys(en));
  expect(collectKeys(pt)).toEqual(collectKeys(en));
});
```

### Paso 6: Validar con la Suite de Pruebas y Compilación

Ejecuta en terminal:

```bash
# Ejecutar pruebas unitarias de todos los contextos
bun run test

# Validar tipado TypeScript y compilación de producción de Next.js
bun run build
```

---

## 8. Buenas Prácticas y Reglas de Desarrollo

1. **Nunca dejar textos planos "hardcodeados"**: Todo texto que vea el usuario debe provenir del hook del contexto correspondiente (`t.<sección>.<clave>`).
2. **Paridad total de claves**: Cada vez que agregues o renombres una clave en `en.ts`, debes actualizar `es.ts`. El test unitario fallará de inmediato si falta alguna clave.
3. **Placeholders estándar**: Usa llaves simples `{param}` para interpolación en strings (por ejemplo `"Página {page} de {totalPages}"`), y reemplázalas en el componente usando `.replace("{param}", valor)`.
4. **Evitar romper el Partial Prerendering**: No leas cookies directamente en el cuerpo de un Layout o Server Component fuera de un boundary `<Suspense>`. Deja que el `I18nProvider` hidrate en cliente el idioma detectado.
