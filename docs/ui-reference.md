# Luma UI reference

Component catalog and theming guide for `@pinooxhq/luma`.

> **Powered by [PrimeVue 4](https://primevue.org/).**
> Luma adds themed wrappers (`LCard`, `LBadge`, `LField`, `LToolbar`, `LToast`, …) and page-kit primitives PrimeVue does not cover (`LPage`, `LPageHeader`, `LPanel`, `LEmptyPanel`, `LIcon`, …).
>
> **Default rule:** use PrimeVue directly for forms, tables, and overlays. Reach for an `L*` component when you need Luma’s themed chrome.

App boot, layouts, auth, and Vite setup live in the [root README](../README.md). Docs index: [`README.md`](./README.md). Canonical page composition: [`page-kit.md`](./page-kit.md). Entity forms: [`guides/entity-form.md`](./guides/entity-form.md).

---

## Table of contents

1. [Install & import](#install--import)
2. [Vite plugin](#vite-plugin)
3. [Theming via tokens](#theming-via-tokens)
4. [Component catalog](#component-catalog)
5. [Layout utilities](#layout-utilities)
6. [Theme config & `usePage`](#theme-config--usepage)
7. [Customizing per theme](#customizing-per-theme)
8. [When to use what](#when-to-use-what)
9. [Adding a new component](#adding-a-new-component)
10. [Peer dependencies](#peer-dependencies)

---

## Install & import

```sh
npm install @pinooxhq/luma
npm install primevue@^4 @primeuix/themes@^2 pinia@^4 @vue/devtools-api@^8 vue-router axios lucide-vue-next
npm install -D sass
```

```js
import {
  LButton, LBadge, LCard, LConfirmDialog, LDatePicker, LEmptyPanel,
  LField, LIcon, LPage, LPageContainer, LPageHeader, LPageToolbar,
  LPanel, LRichEditor, LSlugField, LSpinner, LLoading, LStatCard, LTabs, LToast, LToolbar, LView,
  LDataTable, LColumnBody, LTableSkel,
} from '@pinooxhq/luma/ui';

import { usePage, http, auth } from '@pinooxhq/luma';
```

```scss
@use '@pinooxhq/luma/styles';
```

Omit the styles import only if you are not consuming Luma SCSS.

---

## Vite plugin

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import luma from '@pinooxhq/luma/vite';

export default defineConfig({
  plugins: [luma(), vue()],
});
```

| Concern | What it configures |
|---------|-------------------|
| Peer dedupe | Vue, Pinia, Vue Router, PrimeVue, axios, yup, … resolve once (avoids broken `useToast()` with `file:` links) |
| Pre-bundling & Perf | Pre-bundles peer dependencies (`LUMA_OPTIMIZE_DEPS`) for faster dev server cold starts |
| Vendor chunk splitting | Splits production bundles into structured vendor groups (`vendor-vue`, `vendor-luma`, `vendor-prime`, `vendor-tiptap`, `vendor-icons`, `vendor-date`, `vendor-http`) |
| Theme auto-detection | Auto-detects theme entry (`frontend.config.php`, `index.html`, `src/main.js`) and warms up client files |
| App aliases | Standard `@/`, `@views`, `@stores`, `@components`, `@composables`, `@config`, `@utils`, `@api`, `@assets`, `@layouts` |
| Diagnostics (`lumaDoctor`) | Warns about missing peer dependencies or bad `LUMA_LOCAL` paths during dev |
| `ssr.noExternal` | Same package set for dev and build |
| `server.fs.allow` | Allows Luma + project roots (Windows-safe path handling) |
| `server.watch` | Polling so HMR works for `file:` / symlink installs |

```js
luma({
  perf: true,                          // Dev pre-bundling & build chunk splitting (default: true)
  entry: 'src/main.js',                // Custom entry or auto-detected
  doctor: true,                        // Run dependency health checks (default: true)
  configFile: 'luma.config.js',        // Theme config file (or appConfig: false)
  dedupe: ['my-shared-lib'],           // Extra dedupe packages
  alias: { '@custom': 'src/custom' },  // Extra aliases
  fsAllow: ['/custom/peer-dir'],       // Extra server.fs.allow paths
  watchPolling: false,                 // Polling options
});
```

---

## Theming via tokens

Every Luma component reads colors and sizes from semantic `--px-*` CSS variables. Override them once; the UI re-skins without markup changes.

| Token | Purpose |
|-------|---------|
| `--px-primary`, `--px-primary-hover`, `--px-primary-active` | Brand color stops |
| `--px-primary-soft`, `--px-primary-soft-strong` | Translucent fills |
| `--px-primary-contrast` | Text on accent surfaces |
| `--px-bg`, `--px-bg-alt`, `--px-surface` | Backgrounds |
| `--px-border`, `--px-border-soft`, `--px-divider` | Borders |
| `--px-text`, `--px-text-soft`, `--px-text-muted`, `--px-text-inverse` | Text |
| `--px-success`, `--px-warning`, `--px-danger`, `--px-info` (+ `-600` / `-soft`) | Status |
| `--px-radius-{xs,sm,md,lg,xl,pill}` | Radii |
| `--px-space-{1..12}` | Spacing |
| `--px-text-{2xs…5xl}` | Type scale |
| `--px-shadow-{xs…xl,glass,floating,focus}` | Shadows |
| `--px-duration-*`, `--px-easing-*` | Motion |
| `--px-blur-{sm,md,lg,xl}` | Backdrop blurs |
| `--px-font-sans`, `--px-font-mono` | Font stacks |

### Precedence

Last declaration wins:

```scss
@use '@pinooxhq/luma/styles';

:root {
  --px-primary: #FF6B6B;
}

.luma-card--featured {
  --px-btn-gradient-angle: 90deg;
}
```

### Dark mode

`createApp` / `useTheme()` toggle `data-theme="dark"` on `<html>` (persisted). Override tokens under that selector:

```scss
[data-theme='dark'] {
  --px-primary: #5F95F9;
  --px-bg: #0F1115;
  --px-surface: #181B22;
  --px-text: #F5F7FA;
}
```

```js
import { useTheme } from '@pinooxhq/luma';
const { isDark, toggleTheme } = useTheme();
```

Runtime brand / layout CSS variables: `applyThemeConfig()` (see [root README](../README.md#customization)).

---

## Component catalog

### Page kit — `LPage`

Default admin page shell. Reads title / lead / badge from `themeConfig.pageMeta` via `usePage()`.

```vue
<LPage icon="users" header-tone="gradient">
  <template #actions>
    <LButton icon="plus">Add</LButton>
  </template>
  <template #toolbar-info>12 items</template>
  <template #toolbar>
    <LButton variant="outline" size="sm">Export</LButton>
  </template>
  <LPanel flush>
    <DataTable class="luma-table" :value="rows" />
  </LPanel>
</LPage>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `title` / `lead` / `eyebrow` / `icon` | `string` | from `usePage()` / nav | Override meta |
| `header` | `boolean` | `true` | Hide header with `:header="false"` |
| `tone` | `default` \| `glass` | `default` | Page surface |
| `headerTone` | `default` \| `glass` \| `gradient` | derived | Header treatment |
| `toolbarTone` | `glass` \| `flat` \| `solid` | `glass` | Toolbar surface |
| `iconColor` | `string` | — | Icon tile color |

Slots: `#actions`, `#toolbar-info`, `#toolbar`, default (body inside `LPageContainer`).

See [`page-kit.md`](./page-kit.md).

---

### Page header — `LPageHeader`

```vue
<LPageHeader
  eyebrow="Catalog"
  title="Items"
  lead="Create and manage records."
  icon="folder"
  tone="gradient"
>
  <LButton variant="outline" shape="rounded" icon="plus">Add</LButton>
</LPageHeader>
```

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` (required) | H1 |
| `lead` | `string` | Subtitle |
| `eyebrow` | `string` | Small label above title |
| `icon` | `string` | Lucide name (empty = no tile) |
| `iconColor` | `string` | CSS color override |
| `tone` | `default` \| `glass` \| `gradient` | Visual treatment |

Default slot = actions (end-aligned).

---

### Page toolbar — `LPageToolbar`

```vue
<LPageToolbar>
  <template #info>
    <span>Showing 12 items</span>
  </template>
  <LButton variant="soft" severity="warn" size="sm">Live</LButton>
</LPageToolbar>
```

Slots: `#info` (start), default (end).

---

### Page container — `LPageContainer`

Padded content column aligned with header / toolbar. Used inside `LPage`; can be used alone.

```vue
<LPageContainer>
  <LCard>…</LCard>
</LPageContainer>
```

---

### Panel — `LPanel`

Default content surface for lists, forms, and tables.

```vue
<LPanel title="Orders" lead="Last 30 days" tone="glass">
  <template #actions>
    <LButton size="sm" icon="plus">New</LButton>
  </template>
  <DataTable class="luma-table" :value="rows" />
</LPanel>

<LPanel flush tone="muted">
  <DataTable class="luma-table" :value="rows" />
</LPanel>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `title` / `lead` | `string` | — | Header text |
| `tone` | `solid` \| `muted` \| `glass` | `solid` | Surface |
| `flush` | `boolean` | `false` | No body padding (tables) |

Slots: `#header`, `#actions`, default, `#footer`.

---

### View shell — `LView`

Flex column page wrapper with consistent gap. Prefer `LPage` for full admin pages.

```vue
<LView>
  <LPageHeader title="…" />
  <LPageContainer>…</LPageContainer>
</LView>
```

---

### Buttons — `LButton` / `luma-btn`

Typed wrapper over PrimeVue `Button`. Lucide icons via `icon` / `iconRight` (do **not** use `icon="pi pi-…"` with Lucide).

```vue
<LButton icon="save" @click="save">Save</LButton>
<LButton variant="ghost" severity="neutral" size="sm">Cancel</LButton>
<LButton icon="refresh-cw" :loading="syncing">Sync</LButton>
<LButton icon="trash" icon-only variant="ghost" severity="danger" aria-label="Delete" />
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `solid` \| `gradient` \| `soft` \| `outline` \| `ghost` \| `glass` | `gradient` |
| `severity` | `primary` \| `neutral` \| `success` \| `warn` \| `danger` \| `info` | `primary` |
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | `md` |
| `shape` | `pill` \| `square` \| `rounded` \| `circle` | `pill` |
| `icon` / `iconRight` | `string` | — |
| `iconOnly` | `boolean` | `false` |
| `loading` / `disabled` | `boolean` | `false` |
| `bare` | `boolean` | `false` — skip auto classes; use `rawClass` |

Other PrimeVue `Button` props and DOM attrs fall through.

#### Escape hatch — raw classes

```vue
<Button class="luma-btn luma-btn--gradient luma-btn--primary luma-btn--spin-on-hover">
  <LIcon name="refresh-cw" size="sm" class="luma-btn__icon" />
  <span>Save</span>
</Button>
```

Modifiers: `--icon-only`, `--block`, `--spin-on-hover`, `--loading`, `--icon-start`, `--icon-end`.

---

### Spinner — `LSpinner`

Themed [ProgressSpinner](https://primevue.org/progressspinner/).

```vue
<LSpinner />
<LSpinner center />
<LSpinner size="sm" severity="success" />
```

| Prop | Type | Default |
|------|------|---------|
| `size` | `xs`…`xl` | `md` (36px) |
| `severity` | same as buttons | `primary` |
| `center` | `boolean` | `false` |

`LCard` / `LEmptyPanel` accept `:loading` and swap body content for a centered spinner without layout shift.

---

### Loading overlay — `LLoading`

Full-viewport overlay used by `RootShell`. It watches Luma `http` automatically (see README: Global HTTP loading). Pass `:active` to drive it yourself.

```vue
<LLoading />
<LLoading :active="saving" label="Saving" />
```

| Prop | Type | Default |
|------|------|---------|
| `active` | `boolean` | global HTTP pending |
| `label` | `string` | `themeConfig.loading.label` or `Loading` |

---

### Cards — `LCard`

Themed [Card](https://primevue.org/card/).

```vue
<LCard :active="selected" :featured="true" :loading="fetching">
  <template #title>Title</template>
  <template #content>Body</template>
  <template #footer>Footer</template>
</LCard>
```

| Prop | Type | Notes |
|------|------|-------|
| `interactive` | `boolean` | Hover lift + pointer |
| `active` | `boolean` | Selected chrome |
| `featured` | `boolean` | Soft gradient |
| `busy` | `boolean` | Dimmed, non-interactive |
| `loading` | `boolean` | Body → `LSpinner`; header/footer stay |

Also accepts free-form default-slot content.

---

### Stat card — `LStatCard`

KPI / metric tile on Luma surface tokens.

```vue
<LStatCard label="Orders" :value="128" hint="+12% this week" icon="shopping-cart" tone="primary" />
```

| Prop | Type | Default |
|------|------|---------|
| `label` / `value` / `hint` | `string` \| `number` | — |
| `icon` | Lucide name | — |
| `tone` | `primary` \| `success` \| `warning` \| `danger` \| `info` \| `violet` \| `neutral` | `primary` |
| `interactive` | `boolean` | `false` |

Slots: `#icon`, `#label`, default (value), `#hint`.

---

### Badges — `LBadge`

Themed [Tag](https://primevue.org/tag/).

```vue
<LBadge variant="success" dot>Active</LBadge>
```

Variants: `primary` · `neutral` · `success` · `warn` · `danger` · `info`. Props: `variant`, `dot`.

---

### Form fields — `LField`

Static label or [FloatLabel](https://primevue.org/floatlabel/).

```vue
<LField id="email" label="Email" hint="Never shared" :error="errors.email">
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

| Prop | Type | Notes |
|------|------|-------|
| `label` / `hint` / `error` | `string` | Copy |
| `inline` | `boolean` | Horizontal layout |
| `floating` | `boolean` | FloatLabel mode |
| `float-variant` | `over` \| `in` \| `on` | FloatLabel variant |
| `id` | `string` | Auto-generated if omitted |

Default slot scoped `{ id }`.

---

### Slug — `slugify` / `LSlugField`

Persian titles become Finglish URL slugs.

```js
import { slugify, sanitizeSlug } from '@pinooxhq/luma'
import { useSlugField } from '@pinooxhq/luma/composables'
import { LSlugField } from '@pinooxhq/luma/ui'
```

```vue
<LSlugField
  v-model:title="form.title"
  v-model:slug="form.slug"
  title-label="Title"
  slug-label="Slug"
/>
```

---

### Date picker — `LDatePicker`

Jalali-first picker (Gregorian via PrimeVue `DatePicker` inline).

```vue
<LDatePicker v-model="date" calendar="jalali" />
<LDatePicker v-model="date" calendar="gregorian" placeholder="Pick a date" />
```

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `Date` \| `string` \| `number` | `null` |
| `calendar` | `jalali` \| `gregorian` | `jalali` |
| `placeholder` | `string` | `انتخاب تاریخ` |
| `disabled` | `boolean` | `false` |
| `showIcon` | `boolean` | `true` |
| `persianDigits` | `boolean` | `true` |

Emits `update:modelValue`. For pure PrimeVue calendars, import `primevue/datepicker` directly.

---

### Tabs — `LTabs`

Page / workspace tab strip (`table` chrome or soft `pill`).

```vue
<LTabs
  variant="table"
  :items="[
    { label: 'Board', icon: 'columns-3', to: { name: 'board' } },
    { label: 'Table', icon: 'table', to: { name: 'table' } },
  ]"
/>

<LTabs
  v-model="tab"
  variant="pill"
  :items="[
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active', badge: 3 },
  ]"
/>
```

| Prop | Type | Default |
|------|------|---------|
| `items` | `{ label, icon?, badge?, to?, value? }[]` | `[]` |
| `modelValue` | `string` \| `number` | — |
| `variant` | `table` \| `pill` | `table` |
| `flush` | `boolean` | `false` — nest inside `LPanel` |
| `exact` | `boolean` | `false` — route match |

Emits `update:modelValue`, `select`.

---

### Toolbar — `LToolbar`

Themed [Toolbar](https://primevue.org/toolbar/).

```vue
<LToolbar align="between">
  <template #start><h3>Users</h3></template>
  <template #end>
    <LButton variant="soft">Add</LButton>
  </template>
</LToolbar>
```

`align`: `start` \| `center` \| `end` \| `between` (default). Slots: `#start` · `#center` · `#end`.

---

### Toast — `LToast`

Themed [Toast](https://primevue.org/toast/). `RootShell` already mounts a global Toast; use `LToast` for an extra in-page host.

```vue
<LToast position="bottom-right" />
```

```js
import { useToast } from 'primevue/usetoast';
const toast = useToast();
toast.add({ severity: 'success', summary: 'Saved', life: 3000 });
```

`position` defaults to a start-side placement when omitted (LTR/RTL aware). Slot `#message` for custom rendering.

---

### Confirm — `LConfirmDialog`

Luma-styled [ConfirmDialog](https://primevue.org/confirmdialog/). Mount once (included in `RootShell`). Teleported card sets `dir` from Luma’s direction resolver.

```js
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();
confirm.require({
  header: 'Delete project',
  message: 'This cannot be undone.',
  severity: 'danger',
  acceptLabel: 'Delete',
  accept: () => deleteProject(),
});
```

Optional `lucideIcon` on the require payload overrides the severity icon.

---

### Empty state — `LEmptyPanel`

```vue
<LEmptyPanel
  icon="inbox"
  title="No items yet"
  message="Create the first item to get started."
  action-label="Add item"
  @action="openCreate"
/>
```

Or with a custom `#actions` slot and `:loading` for fetch placeholders.

Props: `icon`, `title`, `message`, `tone` (`dashed` \| `solid` \| `plain`), `size` (`sm` \| `md` \| `lg`), `loading`, `actionLabel`, `actionIcon`, `actionVariant`. Slot `#actions`. Event `@action`.

Tables can skip the slot entirely:

```vue
<LDataTable
  :value="rows"
  :loading="loading"
  empty-icon="package"
  empty-title="No products"
  empty-message="Create the first product."
  empty-action-label="Add product"
  @empty-action="openCreate"
>
  <Column field="name" header="Name">
    <template #body="{ data }">
      <LColumnBody :data="data" part="entity">
        {{ data.name }}
      </LColumnBody>
    </template>
  </Column>
</LDataTable>
```

`:loading` replaces `value` with skeleton rows, hides the paginator, and suppresses the global HTTP overlay. Wrap each custom cell with `LColumnBody` (`part`: `check`, `id`, `entity`, `count`, `status-pill`, `tone-badge`, `meta`, `line`, `chips`, `actions`, `tree`). Shop-specific shapes stay in the app.

For a custom PrimeVue `DataTable`, import `useTableRows` / `isSkelRow` / `LTableSkel` from Luma. Other local spinners can call `useLocalLoading(loading)` so they also hide the cube overlay.

**Mobile lists** (opt-in per table):

```vue
<LDataTable
  mobile
  :swipe-actions="(row) => [
    { key: 'edit', icon: 'pencil', label: 'Edit', onClick: () => openEdit(row.id) },
    { key: 'delete', icon: 'trash-2', variant: 'danger', label: 'Delete', onClick: () => remove(row.id) },
  ]"
  :value="rows"
  :loading="loading"
>
  <template #mobile-item="{ data }">
  </template>
  <template #mobile-leading="{ data }">
    <!-- optional checkbox / avatar rail -->
  </template>
  <Column … />
</LDataTable>
```

| Prop | Role |
|------|------|
| `mobile` | Below `mobileBreakpoint` (default 768px), render `LMobileTable` + `LSwipeReveal` instead of the column grid |
| `swipe-actions` | Array or `(row) => actions` — `{ key, icon, label?, variant?: 'default'|'danger', disabled?, onClick }` |
| `mobile-breakpoint` | Max width (px) for mobile layout |

Below the breakpoint, `LDataTable` renders `LMobileTable` with `LSwipeReveal` rows instead of the column grid. Swipe direction follows `resolveDirection()` (RTL-aware). Override per row with `#swipe-actions`. `useIsMobile()` / `useMediaQuery()` share the same breakpoint helpers as modal drawer mode.

`LEmptyState` from `@pinooxhq/luma/ds` is a deprecated alias — prefer `LEmptyPanel`.

---

### Rich editor — `LRichEditor`

TipTap-based rich text field (bundled TipTap deps). Prefer this over PrimeVue’s Quill Editor for Luma apps.

```vue
<LRichEditor v-model="html" />
```

---

### Icon — `LIcon`

Lucide resolver (kebab-case names).

```vue
<LIcon name="refresh-cw" size="sm" />
```

`size`: `xs` \| `sm` \| `md` \| `lg` \| `xl` or pixel number (default `sm`). Icons: [lucide.dev/icons](https://lucide.dev/icons).

---

## Layout utilities

Global CSS helpers — use on any element.

| Class | Role |
|-------|------|
| `.luma-grid` | Auto-fit responsive grid (`--xs`…`--xl`, `--cols-1`…`6`, `--gap-1`…`6`) |
| `.luma-stack` | Vertical flex + gap (`--gap-*`, `--center` / `--start` / `--end`) |
| `.luma-cluster` | Horizontal wrap row (`--gap-*`, `--end`, `--between`, `--around`) |
| `.luma-defs` | Semantic `<dl>` layout |
| `.luma-section` | Grouped block + `.luma-section__title` (`--flush` optional) |
| `.luma-table` | Native table + DataTable chrome |
| `.luma-actions` | Action rows (`--end`, `--between`) |

```vue
<div class="luma-grid luma-grid--md luma-grid--gap-4">…</div>
<div class="luma-cluster luma-cluster--end luma-cluster--gap-2">…</div>
```

---

## Theme config & `usePage`

Pass a theme config into `createApp()` (see [root README](../README.md#quick-start)):

```js
export const themeConfig = {
  brand: { title: 'Acme Admin', subtitle: 'Operations', logo },
  nav: { sections: [/* … */] },
  pageMeta: {
    'app.dashboard': {
      title: 'Dashboard',
      lead: 'System overview',
      badge: 'Live',
      metaTitle: 'Admin Dashboard',
    },
  },
  user: { roleLabel: 'Admin' },
  direction: 'rtl', // optional
};
```

```js
import { createApp } from '@pinooxhq/luma';
import { RootShell } from '@pinooxhq/luma/layouts';

createApp({
  AppRoot: RootShell,
  themeConfig,
  routes,
  pinia,
});
```

### `pageMeta` fields

| Field | Purpose |
|-------|---------|
| `title` | Visible heading (`LPage` / `LPageHeader`) |
| `lead` | Subheading |
| `badge` | Pill / eyebrow source |
| `metaTitle` | Browser tab title (page portion) |

`document.title` sync: `metaTitle` → `title` → `brand.title`, then `"<page> · <brand>"`.

Per-route override: set `route.meta.title` (wins over `pageMeta.metaTitle`).

### `usePage`

```js
import { usePage } from '@pinooxhq/luma';

const {
  pageTitle,
  pageLead,
  pageBadge,
  metaTitle,
  metaTitlePage,
  pageMeta,
  navItem,
} = usePage();
```

| Return | Description |
|--------|-------------|
| `pageTitle` / `pageLead` / `pageBadge` | From active `pageMeta` |
| `metaTitle` | Full `"<page> · <brand>"` |
| `metaTitlePage` | Page portion only |
| `pageMeta` | Raw entry (custom fields) |
| `navItem` | Matching sidebar item |

```vue
<script setup>
import { usePage } from '@pinooxhq/luma';
import { LPageHeader, LButton } from '@pinooxhq/luma/ui';

const { pageTitle, pageLead, pageBadge } = usePage();
</script>

<template>
  <LPageHeader :title="pageTitle" :lead="pageLead" :eyebrow="pageBadge">
    <LButton icon="refresh-cw">Sync</LButton>
  </LPageHeader>
</template>
```

---

## Customizing per theme

### 1. Brand recolor

```scss
@use '@pinooxhq/luma/styles';

:root {
  --px-primary: #FF6B6B;
  --px-primary-hover: #E63946;
  --px-primary-active: #C1121F;
}

[data-theme='dark'] {
  --px-primary: #FF8E8E;
}
```

### 2. Button shape tokens

```scss
:root {
  --px-btn-radius: 12px;
  --px-btn-gradient-angle: 145deg;
  --px-btn-height: 40px;
}
```

### 3. Component-local override

```scss
.luma-card {
  --px-radius-lg: 24px;
}
```

---

## When to use what

| Need | Use |
|------|-----|
| Full admin page | `<LPage>` (+ `LPanel` / `LEmptyPanel`) — see [page kit](./page-kit.md) |
| Hero CTA | `<LButton>` (default gradient + primary) |
| Secondary / destructive / icon-only | `variant` + `severity` + `icon-only` on `LButton` |
| Page / section loading | `<LSpinner center />` or `:loading` on `LCard` / `LEmptyPanel` |
| Global HTTP loading | `<LLoading />` in `RootShell` — configure `themeConfig.loading` |
| KPI tile | `<LStatCard>` |
| Card surface | `<LCard>` — or PrimeVue `<Card>` for full slot API |
| Content / table surface | `<LPanel flush>` + `.luma-table` |
| Status pill | `<LBadge>` |
| Form label | `<LField>` |
| Title + URL slug | `<LSlugField>` / `slugify()` |
| Jalali / themed date | `<LDatePicker>` — or PrimeVue `DatePicker` |
| Tab strip | `<LTabs>` — or PrimeVue `<Tabs>` |
| Toast | Global Toast + `useToast()`; optional `<LToast>` |
| Confirm | `<LConfirmDialog>` (in `RootShell`) + `useConfirm()` |
| Dialog / DataTable / Menu | PrimeVue directly |
| Rich text | `<LRichEditor>` |
| Layout helpers | `.luma-grid` / `.luma-stack` / `.luma-cluster` |
| Icon | `<LIcon name="…" />` |

---

## Adding a new component

```
Need a new component?
│
├─ Does PrimeVue have it?
│   ├─ Yes → Use PrimeVue. Add a thin L* wrapper only if themed defaults help.
│   └─ No ─┐
│          ├─ One-off page? → Keep local to that page.
│          └─ Reused? → Add under src/ui/, export from index.js, document here.
```

Checklist:

1. Colors / radii / spacing from `--px-*` only  
2. BEM: `.luma-<component>__el--mod`  
3. Light + dark without special cases  
4. Export from `src/ui/index.js`  
5. Document in this file (+ page-kit if it is a page primitive)  
6. No inline styles  
7. Compose utilities (`.luma-grid`, …) instead of forking  
8. Typed props for class chains; keep a `bare` escape hatch when wrapping PrimeVue  

---

## Peer dependencies

| Package | Version |
|---------|---------|
| `vue` | `^3.5` |
| `primevue` | `^4.5` |
| `@primeuix/themes` | `^2` |
| `pinia` | `^4` |
| `@vue/devtools-api` | `^8` |
| `vue-router` | `^5` |
| `axios` | `^1` |
| `lucide-vue-next` | `^1` |
| `sass` | `^1` (devDependency for styles) |
| `@pinooxhq/auth` | `^0.1` (optional) |
| `@pinooxhq/slug` | `^0.1` (bundled — Finglish slugs) |

Theme CSS for PrimeVue comes through Luma’s Console preset (`@primeuix/themes` + `setupPrimeVue`). You do not need a separate PrimeVue CSS import for the default Luma look — import `@pinooxhq/luma/styles` for Luma tokens and chrome.
