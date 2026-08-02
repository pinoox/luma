# Luma UI

> **Luma is powered by [PrimeVue](https://primevue.org/).**
> We extend PrimeVue with themed wrappers (`<LCard>`, `<LBadge>`, `<LField>`, `<LToolbar>`, `<LToast>`) and add Luma-only primitives for patterns PrimeVue doesn't cover (`<LPageHeader>`, `<LPageToolbar>`, `<LPageContainer>`, `<LView>`, `<LEmptyPanel>`, `<LIcon>`).
> **Default rule: use PrimeVue directly. Reach for a `L*` wrapper only when you need Luma's themed styling on top.**

Luma is a **framework-agnostic Vue 3 + Vite UI library**. It has no opinion about the project layout around it — the `apps/<package>/theme/<name>/` structure used in the examples is one possible convention, used by the Pinoox platform reference project.

---

## Table of contents

1. [Installation](#installation)
2. [Importing](#importing)
3. [Vite plugin](#vite-plugin)
4. [Theming via tokens](#theming-via-tokens)
5. [Component catalog](#component-catalog)
   - [Buttons (`LButton` / `luma-btn`)](#buttons-lbutton--luma-btn)
   - [Spinner (`LSpinner`)](#spinner-lspinner)
   - [Cards (`LCard`)](#cards-lcard)
   - [Badges & tags (`LBadge`)](#badges--tags-lbadge)
   - [Form fields (`LField`)](#form-fields-lfield)
   - [Toolbar (`LToolbar`)](#toolbar-ltoolbar)
   - [Toast notifications (`LToast`)](#toast-notifications-ltoast)
   - [Page header (`LPageHeader`)](#page-header-lpageheader)
   - [Page toolbar (`LPageToolbar`)](#page-toolbar-lpagetoolbar)
   - [Page container (`LPageContainer`)](#page-container-lpagecontainer)
   - [Empty state (`LEmptyPanel`)](#empty-state-lemptypanel)
   - [View shell (`LView`)](#view-shell-lview)
   - [Icon (`LIcon`)](#icon-licon)
   - [Layout utilities](#layout-utilities)
6. [Theme config & page metadata](#theme-config--page-metadata)
   - [`pageMeta` and `metaTitle`](#pagemeta-and-metatitle)
   - [`usePage` composable](#usepage-composable)
7. [Customizing per theme](#customizing-per-theme)
8. [When to use what](#when-to-use-what)
9. [Adding a new component](#adding-a-new-component)
10. [Peer dependencies](#peer-dependencies)

---

## Installation

```bash
# npm
npm install @pinooxhq/luma
```

**Requirements:** [Peer dependencies](#peer-dependencies)

## Importing

Three entry points cover everything:

```js
// Components
import {
  LButton, LBadge, LCard, LEmptyPanel, LField, LIcon,
  LPageContainer, LPageHeader, LPageToolbar, LSpinner,
  LToast, LToolbar, LView,
} from '@pinooxhq/luma/ui';

// Composables / helpers
import { usePage, http, auth } from '@pinooxhq/luma';

// Styles (entry SCSS — import once at the root of your app)
@use '@pinooxhq/luma/styles';
```

Each entry point is independent. Omit the styles import if you're not consuming Luma's SCSS.

## Vite plugin

Vite-specific setup lives behind a single `luma()` plugin so your `vite.config.js` stays minimal:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import luma from '@pinooxhq/luma/vite';

export default defineConfig({
  plugins: [luma(), vue()],
});
```

What `luma()` does with **zero config**:

| Concern | What it configures |
|---|---|
| Peer-deduplication | Forces Vue, Pinia, Vue Router, PrimeVue, axios, etc. to resolve once against your `node_modules` so a `file:`-linked Luma doesn't keep its own copies (which would break PrimeVue's `useToast()` due to two `Symbol()` identities) |
| `optimizeDeps.exclude` | Skips `@pinooxhq/luma` from pre-bundling so `file:` symlinks hot-reload without nuking `.vite/deps/` |
| `ssr.noExternal` | Same package list, kept consistent between dev and build |
| `server.fs.allow` | Auto-allows Luma's source directory and your project root for dev serving |
| `server.watch` | Polling-based watcher (`usePolling: true`, `interval: 300`) so HMR fires inside `file:`-linked packages on macOS |

### Overrides (optional)

Every option is layered on top of the defaults — pass what you want to change:

```js
luma({
  dedupe:             ['my-shared-lib'],         // append to the default dedupe list
  excludeFromOptimize:['some/heavy/package'],    // append to optimizeDeps.exclude
  fsAllow:            ['/custom/peer-dir'],      // append to server.fs.allow
  watchPolling:       false,                    // disable HMR polling entirely
});
```

That's the entire Vite surface area. No boilerplate, no peer-resolution gotchas.

---

## Theming via tokens

**Every Luma component reads colors and sizes from semantic `--px-*` CSS variables.** Override these in your app's stylesheet and every component in the system re-skins automatically — no markup edits, no component forking.

| Token | Purpose |
|---|---|
| `--px-primary`, `--px-primary-hover`, `--px-primary-active` | Brand color stops |
| `--px-primary-soft`, `--px-primary-soft-strong` | Translucent fills |
| `--px-primary-contrast` | Text on accent surfaces |
| `--px-bg`, `--px-bg-alt`, `--px-surface` | Backgrounds |
| `--px-border`, `--px-border-soft`, `--px-divider` | Borders |
| `--px-text`, `--px-text-soft`, `--px-text-muted`, `--px-text-inverse` | Text |
| `--px-success`, `--px-success-600`, `--px-success-soft` | Status: success |
| `--px-warning`, `--px-warning-600`, `--px-warning-soft` | Status: warning |
| `--px-danger`, `--px-danger-600`, `--px-danger-soft` | Status: danger |
| `--px-info`, `--px-info-500`, `--px-info-soft` | Status: info |
| `--px-radius-{xs,sm,md,lg,xl,pill}` | Border radii |
| `--px-space-{1..12}` | Spacing scale |
| `--px-text-{2xs,xs,sm,base,md,lg,xl,2xl,3xl,4xl,5xl}` | Type scale |
| `--px-shadow-{xs,sm,md,lg,xl,glass,floating,focus}` | Shadows |
| `--px-duration-{instant,fast,base,slow,slower}` | Motion durations |
| `--px-easing-{standard,emphasized,decelerate,accelerate}` | Motion easings |
| `--px-blur-{sm,md,lg,xl}` | Backdrop blurs |
| `--px-font-sans`, `--px-font-mono` | Font stacks |

### Token precedence

SCSS `@use` is order-sensitive: the **last** declaration wins.

```scss
// 1. Luma defaults (always present)
@use '@pinooxhq/luma/styles';

// 2. Your app's brand overrides
:root {
  --px-primary: #FF6B6B;
}

// 3. Component-specific overrides (rare — only when the token system can't reach what you need)
.luma-card--featured {
  --px-btn-gradient-angle: 90deg;
}
```

### Dark mode

Luma has no built-in "dark mode" hook — it's just CSS variables. Toggle a class or attribute on `<html>` and override the variables under that selector:

```scss
[data-theme="dark"] {
  --px-primary: #5F95F9;
  --px-bg: #0F1115;
  --px-surface: #181B22;
  --px-text: #F5F7FA;
  // ...
}
```

---

## Component catalog

### Buttons (`<LButton>` / `luma-btn`)

The recommended way to render a button in Luma is the `<LButton>` wrapper. It hides the full `luma-btn--*` class chain behind composable props (`variant`, `severity`, `size`, `shape`) and adds ergonomic helpers for icons and loading state. Underneath it is still PrimeVue's `<Button>`, so every PrimeVue `Button` prop/event still works.

```vue
<LButton icon="save" @click="save">Save</LButton>

<LButton
  variant="ghost"
  severity="neutral"
  size="sm"
  @click="cancel"
>Cancel</LButton>

<LButton
  icon="refresh-cw"
  :loading="syncing"
  @click="sync"
>Sync</LButton>

<LButton
  icon="trash"
  icon-only
  variant="ghost"
  severity="danger"
  aria-label="Delete"
  @click="remove"
/>
```

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `solid` \| `gradient` \| `soft` \| `outline` \| `ghost` \| `glass` | `gradient` | Visual treatment. |
| `severity` | `primary` \| `neutral` \| `success` \| `warn` \| `danger` \| `info` | `primary` | Color channel. |
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | `md` | Affects both padding and icon size. |
| `shape` | `pill` \| `square` \| `rounded` \| `circle` | `pill` | Corner radius / aspect ratio. |
| `icon` | `string` | — | Lucide name, rendered as a leading icon. |
| `iconRight` | `string` | — | Trailing icon. |
| `iconOnly` | `boolean` | `false` | Hides label, keeps square hit area. Always pair with `aria-label`. |
| `loading` | `boolean` | `false` | Spins the icon, marks `aria-busy`, and forces `disabled`. |
| `disabled` | `boolean` | `false` | Native disabled. |
| `bare` | `boolean` | `false` | Drops the auto-class chain entirely. Use `rawClass` for a fully custom button. |
| `rawClass` | `string \| array \| object` | `''` | Extra class(es) appended after the auto chain. |

Any other PrimeVue `Button` prop (e.g. `type="submit"`, `name`, `value`) and DOM attribute (`data-*`, `aria-*`) flows through via attribute fallthrough.

#### Escape hatch — raw `luma-btn` classes

The full class system is still available if you need pixel-perfect control (for example, to compose a button outside a Vue component) or if you need a class chain `<LButton>` can't express. The semantics are identical — `<LButton variant="gradient" severity="primary">` is just a typed shortcut for `class="luma-btn luma-btn--gradient luma-btn--primary"`.

```vue
<Button
  class="luma-btn luma-btn--gradient luma-btn--primary luma-btn--spin-on-hover"
  :disabled="busy"
  :aria-busy="busy"
  @click="save"
>
  <LIcon name="refresh-cw" size="sm" class="luma-btn__icon" />
  <span>Save</span>
</Button>
```

#### Variants (visual treatment)

| Class | Description |
|---|---|
| `luma-btn--solid` | Flat color, lifted shadow |
| `luma-btn--gradient` | 135° gradient pill (premium) |
| `luma-btn--soft` | Translucent fill |
| `luma-btn--outline` | Border only |
| `luma-btn--ghost` | Text only |
| `luma-btn--glass` | Frosted glass |

#### Severities (color channel — composable with any variant)

| Class | Color |
|---|---|
| `luma-btn--primary` (default) | Brand |
| `luma-btn--neutral` | Text gray |
| `luma-btn--success` | Green |
| `luma-btn--warn` | Amber |
| `luma-btn--danger` | Red |
| `luma-btn--info` | Blue |

#### Sizes — `xs`, `sm`, `md` (default), `lg`, `xl`

#### Shapes — `pill` (default), `square`, `rounded`, `circle`

#### Modifiers

- `luma-btn--icon-only` — square icon button
- `luma-btn--block` — full width
- `luma-btn--spin-on-hover` — icon rotates 180° on hover
- `luma-btn--loading` — adds the spin animation (replace `:loading` prop with this class)
- `luma-btn--icon-start`, `luma-btn--icon-end` — flex direction

#### Examples

```vue
<!-- Hero CTA -->
<Button class="luma-btn luma-btn--gradient luma-btn--primary">Save</Button>

<!-- Subtle secondary action -->
<Button class="luma-btn luma-btn--ghost luma-btn--neutral luma-btn--sm">Cancel</Button>

<!-- Destructive -->
<Button class="luma-btn luma-btn--soft luma-btn--danger">Delete</Button>

<!-- Icon-only stepper -->
<Button class="luma-btn luma-btn--ghost luma-btn--neutral luma-btn--sm luma-btn--icon-only" aria-label="Next">
  <LIcon name="chevron-right" size="sm" class="luma-btn__icon" />
</Button>

<!-- Busy -->
<Button class="luma-btn luma-btn--gradient luma-btn--primary" :class="{ 'luma-btn--loading': busy }">
  <LIcon name="refresh-cw" size="sm" class="luma-btn__icon" />
  <span>Sync</span>
</Button>
```

#### Icon note

**Do not pass `icon="pi pi-..."` on PrimeVue Button when using Lucide icons** — that prop is PrimeIcons-only and will silently fail to render. Place `<LIcon>` (or any Vue component) inside the default slot. See [PrimeVue issue #6248](https://github.com/primefaces/primevue/issues/6248). `<LButton>` handles this for you with its `icon` / `iconRight` props (which internally render `<LIcon>`).

#### Loading state

`<LButton :loading="busy">` is the equivalent of the `[class.luma-btn--loading]` + `:disabled` + `:aria-busy` triple. Internally it sets all three and swaps the spin animation on. The icon stays in place and spins continuously. Pair with `disabled` if you need to prevent double-submits.

---

### Spinner (`<LSpinner>`)

A themed wrapper around [PrimeVue ProgressSpinner](https://primevue.org/progressspinner/). Defaults to 36px and brand-colored (`primary`) — drop one in a page-level loading state without setting any size or color classes.

```vue
<!-- Inline spinner -->
<LSpinner />

<!-- Centered in its parent — full-page or section loader -->
<LSpinner center />

<!-- Smaller success indicator -->
<LSpinner size="sm" severity="success" />

<!-- Large warn spinner -->
<LSpinner size="lg" severity="warn" />
```

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | `md` (36px) | `xs`=16, `sm`=24, `md`=36, `lg`=56, `xl`=80. |
| `severity` | `primary` \| `neutral` \| `success` \| `warn` \| `danger` \| `info` | `primary` | Color channel driven by `--px-*` tokens. |
| `center` | `boolean` | `false` | Wraps the spinner in a flex block that fills its parent and centers itself. Replaces one-off `.loading-state` CSS most pages end up writing. |

#### Loading states — composed

A spinner is rarely used alone. Most pages need a "loading" version of a card, panel, or table row. The Luma components that have meaningful body content expose a `loading` prop that swaps the body for a centered `<LSpinner>` while keeping the surrounding chrome (header, footer, borders, padding) stable. This avoids layout shift between loading and loaded.

```vue
<!-- Card skeleton -->
<LCard :loading="busy">
  <template #title>Account</template>
  <!-- body content omitted while loading -->
</LCard>

<!-- Empty state can flip between "loading" and "no results" without changing layout -->
<LEmptyPanel :loading="fetching" icon="inbox" title="No items yet">
  ...
</LEmptyPanel>
```

See [`<LCard>`](#cards-pcard) and [`<LEmptyPanel>`](#empty-state-pemptypanel) for the full prop list.

#### Escape hatch

For absolute control, drop the wrapper and use PrimeVue's raw `<ProgressSpinner>` with the same `luma-spinner--*` modifier classes:

```vue
<ProgressSpinner class="luma-spinner luma-spinner--md luma-spinner--primary" />
```

The styling is identical — `<LSpinner>` is just the typed shortcut.

---

### Cards (`LCard`)

Themed wrapper around [PrimeVue Card](https://primevue.org/card/).

```vue
<LCard :active="isSelected" :featured="isFeatured" :loading="fetching">
  <template #header>...</template>
  <template #title>Title</template>
  <template #subtitle>Subtitle</template>
  <template #content>Body content</template>
  <template #footer>Footer</template>
</LCard>
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `interactive` | `boolean` | Adds hover lift + cursor pointer |
| `active` | `boolean` | Highlights as selected (primary border + glow) |
| `featured` | `boolean` | Subtle gradient background |
| `busy` | `boolean` | Reduced opacity, no pointer events. Keep existing content visible. |
| `loading` | `boolean` | Replace body content with a centered `<LSpinner />`. Header/footer stay visible so context is preserved and layout doesn't shift. |

#### Free-form (no slots)

You can also drop any content directly in the default slot — Luma auto-lays it out:

```vue
<LCard>
  <header>...</header>
  <dl>...</dl>
  <template #footer>Footer</template>
</LCard>
```

---

### Badges & tags (`LBadge`)

Themed wrapper around [PrimeVue Tag](https://primevue.org/tag/).

```vue
<LBadge variant="primary">New</LBadge>
<LBadge variant="success" dot>Active</LBadge>
<LBadge variant="warn">Pending</LBadge>
<LBadge variant="danger">Failed</LBadge>
<LBadge variant="info">Info</LBadge>
<LBadge variant="neutral">Archived</LBadge>
```

#### Variants

`primary` · `neutral` · `success` · `warn` · `danger` · `info`

#### Props

- `variant` — color variant
- `dot` — leading dot indicator

---

### Form fields (`LField`)

Two modes: static label or [PrimeVue FloatLabel](https://primevue.org/floatlabel/) (floating).

```vue
<LField id="email" label="Email" hint="We will never share your email">
  <template #default="{ id }">
    <InputText :id="id" v-model="email" />
  </template>
</LField>

<LField id="name" label="Name" floating float-variant="over">
  <template #default="{ id }">
    <InputText :id="id" v-model="name" />
  </template>
</LField>
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Field label |
| `hint` | `string` | Helper text below field |
| `inline` | `boolean` | Inline horizontal layout |
| `floating` | `boolean` | Use FloatLabel (label inside input) |
| `float-variant` | `'over' \| 'in' \| 'on'` | PrimeVue FloatLabel variant |
| `id` | `string` | Custom input id (auto-generated if omitted) |

#### Slot

The default slot receives scoped `{ id }` to bind to your input.

---

### Toolbar (`LToolbar`)

Themed wrapper around [PrimeVue Toolbar](https://primevue.org/toolbar/).

```vue
<LToolbar align="between">
  <template #start>
    <h3>Users</h3>
  </template>
  <template #end>
    <Button class="luma-btn luma-btn--soft luma-btn--primary">Add</Button>
  </template>
</LToolbar>
```

#### Props

- `align` — `'start' | 'center' | 'end' | 'between'` (default `'between'`)

#### Slots

`#start` · `#center` · `#end`

---

### Toast notifications (`LToast`)

Themed wrapper around [PrimeVue Toast](https://primevue.org/toast/).

```vue
<template>
  <LView>
    <!-- ... -->
    <LToast position="bottom-right" />
  </LView>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();

function notify() {
  toast.add({
    severity: 'success',
    summary: 'Saved',
    detail: 'Your changes have been saved.',
    life: 3000,
  });
}
</script>
```

#### Props

- `position` — PrimeVue Toast position (default `'bottom-right'`)

#### Slot

`#message` — for fully custom message rendering.

---

### Page header (`LPageHeader`)

Luma-only. Composed of: icon tile + eyebrow + title + lead + actions slot.

```vue
<LPageHeader
  eyebrow="Catalog"
  title="Items"
  lead="Create and manage records."
  icon="folder"
>
  <LButton variant="outline" shape="rounded" icon="plus">Add</LButton>
</LPageHeader>
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` (required) | H1 title |
| `lead` | `string` | Subtitle below |
| `eyebrow` | `string` | Tiny uppercase label above title |
| `icon` | `string` | Lucide icon name |
| `iconColor` | `string` | Override icon tile color (any CSS color) |

#### Slot

`default` — actions go in here (right-aligned)

---

### Page toolbar (`LPageToolbar`)

Luma-only. Lightweight toolbar row below the header.

```vue
<LPageToolbar>
  <template #info>
    <span>Showing 12 items · 3 active</span>
  </template>
  <LButton variant="soft" severity="warn" size="sm" shape="rounded">Live</LButton>
</LPageToolbar>
```

#### Slot

`#info` — left-aligned content (counts, status pills, etc.)
`default` — right-aligned actions

---

### Page container (`LPageContainer`)

Luma-only. Padded content area that aligns horizontally with `LPageHeader` and `LPageToolbar`.

```vue
<LPageContainer>
  <LCard>...</LCard>
</LPageContainer>
```

---

### Empty state (`LEmptyPanel`)

Luma-only. Centered empty state with icon, title, message, and actions.

```vue
<LEmptyPanel
  icon="inbox"
  title="No items yet"
  message="Create the first item to get started."
>
  <template #actions>
    <LButton variant="outline" shape="rounded" icon="plus">Add</LButton>
  </template>
</LEmptyPanel>
```

#### Props

- `icon` — Lucide icon name
- `title` — main heading
- `message` — descriptive text
- `iconColor` — override default color
- `tone` — `dashed` (default) | `solid` | `plain`
- `loading` — when `true`, the icon/title/message are replaced with a centered `<LSpinner />`. The panel keeps its border/padding/min-height so the layout stays stable between "fetching" and "no results yet."

#### Slot

`#actions` — call-to-action buttons

#### Loading vs. empty

The `loading` prop lets the same panel stand in for two states without rewriting layout — useful for "fetching data, no result yet" vs. "we have a definitive empty answer". Switch between them by flipping the prop:

```vue
<LEmptyPanel :loading="fetching" icon="inbox" title="No items yet" />
```

---

### View shell (`LView`)

Luma-only. Page-level layout container with flex column + consistent gap.

```vue
<LView>
  <LPageHeader ... />
  <LPageToolbar>...</LPageToolbar>
  <LPageContainer>...</LPageContainer>
</LView>
```

---

### Icon (`LIcon`)

Luma-only. Lucide icon resolver — pass kebab-case names.

```vue
<LIcon name="refresh-cw" size="sm" />
<LIcon name="chevron-down" size="xs" />
<LIcon name="alert-triangle" size="md" />
```

#### Props

- `name` (required) — Lucide icon name (kebab-case)
- `size` — `xs | sm | md | lg | xl` or pixel number (default `sm`)

Browse all available icons at https://lucide.dev/icons

---

## Layout utilities

Pure-CSS, composable layout helpers. Use as global classes on any element.

```vue
<div class="luma-grid">
  <LCard v-for="item in items" :key="item.id">...</LCard>
</div>

<div class="luma-cluster luma-cluster--end">
  <Button>Cancel</Button>
  <Button class="luma-btn--primary">Save</Button>
</div>

<dl class="luma-defs">
  <div><dt>Status</dt><dd>Active</dd></div>
</dl>

<div class="luma-section">
  <h4 class="luma-section__title">Credentials</h4>
  ...
</div>
```

### `.luma-grid` — auto-fit responsive grid

```vue
<div class="luma-grid luma-grid--md luma-grid--gap-4">...</div>
```

| Modifier | Min column width |
|---|---|
| `luma-grid--xs` | 180px |
| `luma-grid--sm` | 220px |
| `luma-grid` (default) | 280px |
| `luma-grid--md` | 320px |
| `luma-grid--lg` | 400px |
| `luma-grid--xl` | 520px |

| Modifier | Columns |
|---|---|
| `luma-grid--cols-1` through `--cols-6` | Fixed column count |

Gap modifiers: `luma-grid--gap-1` through `--gap-6`.

### `.luma-stack` — vertical flex column with gap

```vue
<div class="luma-stack luma-stack--gap-3">...</div>
```

Modifiers: `--gap-1..6`, `--center`, `--start`, `--end`.

### `.luma-cluster` — horizontal flex row, wrap-friendly

```vue
<div class="luma-cluster luma-cluster--end luma-cluster--gap-2">...</div>
```

Modifiers: `--gap-1..4`, `--end`, `--between`, `--around`.

### `.luma-defs` — semantic `<dl>` with auto layout

```vue
<dl class="luma-defs">
  <div><dt>Created</dt><dd>2026-01-15</dd></div>
  <div><dt>Status</dt><dd><LBadge variant="success">Active</LBadge></dd></div>
</dl>
```

### `.luma-section` — grouped content with optional title

```vue
<div class="luma-section">
  <h4 class="luma-section__title">Advanced settings</h4>
  <!-- ... -->
</div>
```

Modifier: `luma-section--flush` (no top border/padding).

---

## Theme config & page metadata

`usePage()` and the router's `document.title` sync both read from a single **theme config** object you pass into `Luma.createApp()`. It carries your brand, navigation, and page metadata.

```js
// src/config/theme.js  (path is up to you — this is just an example)
import icon from './assets/app-icon.png';

export const themeConfig = {
  brand: {
    title: 'Acme Admin',                // also used as suffix in <title>
    subtitle: 'Operations console',
    logo: icon,
  },
  nav: { sections: [/* ... sidebar items ... */] },
  pageMeta: {
    'app.dashboard': { title: 'Dashboard', lead: 'System overview', badge: 'Live', metaTitle: 'Admin Dashboard' },
    'app.items': { title: 'Items', lead: 'Active records' },
  },
  user: { roleLabel: 'Admin' },
};
```

Then bootstrap the app:

```js
import { createApp } from '@pinooxhq/luma';
import { themeConfig } from './config/theme';
import { routes } from './router';

createApp({ routes, themeConfig }).then(({ app, router }) => {
  app.mount('#app');
});
```

### `pageMeta` and `metaTitle`

Each `pageMeta` entry maps a route name → page metadata:

| Field | Purpose | Example |
|---|---|---|
| `title` | Visible heading rendered by `<LPageHeader>` | `"Dashboard"` |
| `lead` | Subheading below the title | `"System overview"` |
| `badge` | Optional pill rendered next to the title | `"Live"`, `"Beta"` |
| `metaTitle` | `<title>` tag for this page (browser tab) | `"Admin Dashboard"` |

`metaTitle` resolution order (first non-empty wins):

```
metaTitle  →  title  →  brand.title
```

The router auto-syncs `document.title` to `"<page> · <brand>"` after every navigation, so pages don't need to call anything — just declare the values in `themeConfig.pageMeta`. Example end result:

```
<title>Admin Dashboard · Acme Admin</title>
```

#### Per-route override (dynamic titles)

For pages that need a fully dynamic title (e.g. an edit page that shows the entity name), set `meta.title` on the route — it wins over `pageMeta.metaTitle`:

```js
router.addRoute({
  path: '/items/:id/edit',
  name: 'items.edit',
  component: EditItem,
  meta: { title: 'Edit Item' },
});

// Or set it after mount for entity-name binding:
import { useRoute } from 'vue-router';
const route = useRoute();
watch(entityName, (n) => { route.meta.title = `Edit ${n}`; });
```

### `usePage` composable

```js
import { usePage } from '@pinooxhq/luma';

const { pageTitle, pageLead, pageBadge, metaTitle, metaTitlePage, navItem } = usePage();
```

| Return | Type | Description |
|---|---|---|
| `pageTitle` | `ComputedRef<string>` | The `title` field — drives `<LPageHeader>` |
| `pageLead` | `ComputedRef<string>` | The `lead` field — drives `<LPageHeader>` |
| `pageBadge` | `ComputedRef<string>` | The `badge` field, empty string if absent |
| `metaTitle` | `ComputedRef<string>` | Full `"<page> · <brand>"` value used in `<title>` |
| `metaTitlePage` | `ComputedRef<string>` | Just the page portion (no brand suffix) |
| `pageMeta` | `ComputedRef<object>` | Raw `pageMeta` entry — for custom fields |
| `navItem` | `ComputedRef<object \| null>` | Matching sidebar item for the active route |

Typical usage inside a page:

```vue
<script setup>
import { usePage } from '@pinooxhq/luma';
const { pageTitle, pageLead, pageBadge } = usePage();
</script>

<template>
  <LPageHeader :title="pageTitle" :lead="pageLead" :badge="pageBadge">
    <template #actions>
      <Button class="luma-btn luma-btn--gradient luma-btn--primary" icon="pi pi-refresh">Sync</Button>
    </template>
  </LPageHeader>
</template>
```

The page never has to touch `document.title` directly — the router does it for you.

---

## Customizing per theme

### 1. Brand recolor (99% of cases)

```scss
// your app's main stylesheet
@use '@pinooxhq/luma/styles';

:root {
  --px-primary:        #FF6B6B;
  --px-primary-hover:  #E63946;
  --px-primary-active: #C1121F;
}

[data-theme="dark"] {
  --px-primary: #FF8E8E;
}
```

Every button, badge, card highlight, and active state re-skins automatically.

### 2. Button shape (rare)

```scss
:root {
  --px-btn-radius: 12px;            // square-ish instead of pill
  --px-btn-gradient-angle: 145deg;  // different gradient angle
  --px-btn-height: 40px;            // bigger default
}
```

### 3. Component-specific override (very rare)

```scss
// Only when the token system can't express what you need
.luma-card {
  --px-radius-lg: 24px;
}
```

---

## When to use what

| Need | Use |
|---|---|
| Hero CTA button | `<LButton>Save</LButton>` (defaults to gradient + primary) |
| Secondary action | `<LButton variant="ghost" severity="neutral">Cancel</LButton>` |
| Destructive | `<LButton variant="soft" severity="danger">Delete</LButton>` |
| Icon-only action | `<LButton icon="trash" icon-only aria-label="Delete" />` |
| Button with busy state | `<LButton :loading="busy" icon="refresh">Sync</LButton>` |
| Page loading spinner | `<LSpinner center />` (36px, brand color, fills container) |
| Card-level loading | `<LCard :loading="fetching" />` (body replaced by spinner, header/footer kept) |
| Empty state while fetching | `<LEmptyPanel :loading="fetching" />` (icon/title/message replaced by spinner) |
| Card surface | `<LCard>` (themed) — fall back to PrimeVue `<Card>` if you need its full slot API |
| Status pill | `<LBadge variant="success" dot>Active</LBadge>` |
| Form field with label | `<LField label="..." hint="...">` |
| Form field with floating label | `<LField label="..." floating>` |
| Toast notification | `<LToast />` + `useToast()` from PrimeVue |
| Toolbar | `<LToolbar>` — fall back to PrimeVue `<Toolbar>` if you need more slots |
| Page header | `<LPageHeader>` (Luma-only) |
| Page toolbar | `<LPageToolbar>` (Luma-only) |
| Empty state | `<LEmptyPanel>` (Luma-only) |
| Dialog | PrimeVue `<Dialog>` directly — no Luma wrapper |
| DataTable | PrimeVue `<DataTable>` directly — no Luma wrapper |
| Tabs | PrimeVue `<Tabs>` directly — no Luma wrapper |
| Menu / Dropdown | PrimeVue `<Menu>` / `<Select>` directly |
| Layout grid | `.luma-grid` utility |
| Layout stack | `.luma-stack` utility |
| Layout cluster | `.luma-cluster` utility |
| Definition list | `.luma-defs` utility |
| Grouped content | `.luma-section` utility |
| Icon | `<LIcon name="..." size="..." />` (Lucide) |

---

## Adding a new component

### Decision tree

```
Need a new component?
│
├─ Does PrimeVue have it?
│   ├─ Yes ──> Use PrimeVue directly. Add Luma styling only if needed
│   │           by creating a thin P* wrapper.
│   └─ No ──┐
│           │
│           ├─ Is it a one-off for a single page?
│           │   └─ Yes ──> Keep it in that page's local SCSS. No need to add to Luma.
│           │
│           └─ Is it reused across multiple pages?
│               └─ Yes ──> Add to luma-ui/src/ui/ as a Vue component + CSS.
│                            Document it in this README.
```

### Checklist for new Luma components

1. **Reuse tokens only** — every color, radius, spacing must come from `--px-*` vars
2. **Use BEM naming** — `.luma-<component>` + `__<element>` + `--<modifier>`
3. **Themed** — works with both light and dark mode without code changes
4. **Export from `index.js`** — barrel export from `luma-ui/src/ui/index.js`
5. **Document here** — add a section to this README with examples
6. **No inline styles** — all styles in `<style>` block or imported SCSS
7. **Compose, don't fork** — prefer reusing existing utilities (`.luma-grid`, `.luma-cluster`, etc.) inside the component
8. **Sensible defaults** — when wrapping a verbose class chain (e.g. `luma-btn--*`), expose the chain through typed props (`variant`, `severity`, `size`) so consumers don't repeat the boilerplate. Keep a `bare` escape hatch for fully custom usage.

---

## Peer dependencies

Luma wraps and complements PrimeVue; you need both installed. Lucide is bundled (peer-importable too).

```jsonc
{
  "dependencies": {
    "@pinooxhq/luma": "^1.0.0",
    "primevue": "^4.x",
    "lucide-vue-next": "^0.4.x"
  }
}
```

Luma does **not** include PrimeVue's CSS — install the PrimeVue theme you want separately and include it before `@pinooxhq/luma/styles`, or skip it entirely if you're using Luma's token-based re-skin only.
