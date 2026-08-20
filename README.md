# @pinooxhq/luma

Vue 3 dashboard framework for [Pinoox](https://github.com/pinoox) apps — routing, Pinia, auth, layouts, theming, and a PrimeVue 4 UI layer in one package.

Luma is more than a component kit. It is the front-end foundation of a Pinoox admin app: boot the shell with `createApp()`, drop in `PageLayout`, and ship pages with PrimeVue + Luma wrappers. Every layer (tokens, layouts, router, auth, components) can be replaced without forking.

---

## Table of contents

1. [Requirements](#requirements)
2. [Install](#install)
3. [Vite plugin](#vite-plugin)
4. [Quick start](#quick-start)
5. [`createApp` options](#createapp-options)
6. [Direction (RTL / LTR)](#direction-rtl--ltr)
7. [Customization](#customization)
8. [Authentication](#authentication)
9. [Usage examples](#usage-examples)
10. [Components](#components)
11. [Subpath exports](#subpath-exports)
12. [Upgrading](#upgrading)
13. [License](#license)

Full prop / slot reference: [`docs/ui-reference.md`](./docs/ui-reference.md) · docs index: [`docs/README.md`](./docs/README.md) · page kit: [`docs/page-kit.md`](./docs/page-kit.md) · entity forms: [`docs/guides/entity-form.md`](./docs/guides/entity-form.md) · release notes: [`CHANGELOG.md`](./CHANGELOG.md)

---

## Requirements

| Package | Version | Role |
|---------|---------|------|
| `vue` | `^3.5` | Runtime |
| `primevue` | `^4.5` | UI components |
| `@primeuix/themes` | `^2` | Aura-based theming (Luma Console preset) |
| `pinia` | `^4` | State |
| `@vue/devtools-api` | `^8` | Required by Pinia 4 |
| `vue-router` | `^5` | Routing |
| `axios` | `^1` | HTTP (used by auth / `http`) |
| `lucide-vue-next` | `^1` | Icons for `<LIcon>` |
| `sass` | `^1` | Compile `@pinooxhq/luma/styles` (devDependency) |
| `@pinooxhq/auth` | `^0.1` | Optional — bundled auth helpers |
| `@pinooxhq/slug` | `^0.1` | Persian → Finglish slugs (`slugify`, `LSlugField`) |

Node **≥ 18**. Luma targets **PrimeVue 4.x** (latest 4.5 line) with `@primeuix/themes` **2.x**.

---

## Install

```sh
npm install @pinooxhq/luma
```

Peers (and Sass for styles):

```sh
npm install primevue@^4 @primeuix/themes@^2 pinia@^4 @vue/devtools-api@^8 vue-router axios lucide-vue-next
npm install -D sass
```

Optional auth package (needed for `useAuthStore` / `configureAuth` flows):

```sh
npm install @pinooxhq/auth
```

Without `@pinooxhq/auth`, `createApp` still boots and public pages work; `requiresAuth` routes redirect.

Import styles once in your app entry SCSS:

```scss
@use '@pinooxhq/luma/styles';
```

---

## Vite plugin

Use the official plugin so peer packages are deduped and `file:`-linked Luma hot-reloads correctly:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import luma from '@pinooxhq/luma/vite';

export default defineConfig({
  plugins: [luma(), vue()],
  resolve: {
    alias: {
      // app aliases…
    },
  },
});
```

What `luma()` does by default:

1. **Dedupes** peers (`primevue`, `pinia`, `vue-router`, …) against the consumer `node_modules` — avoids duplicate PrimeVue inject keys (e.g. broken `useToast()`).
2. **Allows** the Luma package root through `server.fs.allow` and enables watch polling for `file:` / symlink installs.
3. Keeps Luma out of `optimizeDeps` pre-bundle so source edits HMR cleanly.
4. **Optional local checkout** — set `LUMA_LOCAL=/path/to/luma-ui` or `luma({ local: '/path/to/luma-ui' })`. Aliases every `@pinooxhq/luma` entry (JS, Sass, Vazir fonts) to that tree. Leave unset to use npm.

**Typography:** Luma’s default stack is Vazir (`$px-font-sans` + `@font-face` in styles, and `DEFAULT_THEME_CONFIG.font`). Override with `applyThemeConfig({ font: { sans, mono } })` when needed.

Optional overrides: `local`, `dedupe`, `excludeFromOptimize`, `fsAllow`, `watchPolling`. See comments in [`vite.js`](./vite.js).

### Local ↔ npm switch

```bash
# .env.local (app) — use checkout
LUMA_LOCAL={PATH_TO_LOCAL_LUMA}/luma-ui

# unset / comment out — use published @pinooxhq/luma from node_modules
```

Prefer loading the checkout’s `vite.js` when `LUMA_LOCAL` is set so plugin fixes apply before publish:

```js
import { defineConfig, loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const local = (env.LUMA_LOCAL || '').trim();
  const { default: luma } = local
    ? await import(pathToFileURL(path.join(path.resolve(local), 'vite.js')).href)
    : await import('@pinooxhq/luma/vite');

  return {
    plugins: [luma(local ? { local } : {})],
  };
});
```

---

## Quick start

Minimal layout:

```
your-app/
├── package.json
├── vite.config.js
├── theme.config.js          ← visual tokens (colors, fonts, layout)
└── src/
    ├── main.js              ← createApp(...)
    └── config/
        ├── theme.js         ← brand, nav, pageMeta
        └── routes.js
```

### `theme.config.js` — visual tokens

Written to `:root` as CSS variables at boot (no Sass rebuild to rebrand):

```js
export default {
  brand: {
    primary:       '#0E73FD',
    primaryHover:  '#0858D4',
    primaryActive: '#0644A8',
    primarySoft:   '#DBE7FE',
    bgLight:       '#F4F4FE',
    bgDark:        '#060912',
  },
  font: {
    sans: 'Vazir, Vazirmatn, Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  layout: {
    sidebarWidth:          '280px',
    sidebarCollapsedWidth: '76px',
    topbarHeight:          '64px',
    pageMaxWidth:          '1280px',
    radius:                'lg',
  },
  // Optional:
  // direction: 'rtl',
  // auth: { endpoints: { me, login, logout }, skipMe, autoLoginFromUrl },
};
```

### `src/config/theme.js` — brand, nav, page meta

```js
import logo from '@/assets/images/brand.svg';

export const themeConfig = {
  brand: {
    title: 'Acme Shop',
    subtitle: 'Sales admin',
    logo,
  },
  nav: {
    sections: [
      {
        key: 'overview',
        label: 'Overview', // static heading; set collapsible: true for accordion
        items: [
          { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: 'shop.dashboard' },
          { key: 'orders',    label: 'Orders',    icon: 'shopping-cart',    route: 'shop.orders' },
          {
            key: 'catalog',
            label: 'Catalog',
            icon: 'layers',
            children: [
              { key: 'categories', label: 'Categories', icon: 'folder-tree', route: 'shop.products.categories' },
              { key: 'brands',     label: 'Brands',     icon: 'award',       route: 'shop.products.brands' },
            ],
          },
        ],
      },
    ],
  },
  pageMeta: {
    'shop.dashboard': { title: 'Dashboard', lead: 'Sales overview', badge: 'Live' },
    'shop.orders':    { title: 'Orders',    lead: 'Open and completed', badge: 'Sales' },
  },
  user: { roleLabel: 'Store manager' },
};

export default themeConfig;
```

### `src/config/routes.js`

```js
import { PageLayout } from '@pinooxhq/luma/layouts';

export const routes = [
  {
    path: '/',
    component: PageLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'shop.dashboard',
        component: () => import('@pages/dashboard/page-dashboard.vue'),
      },
      {
        path: 'orders',
        name: 'shop.orders',
        component: () => import('@pages/orders/page-orders.vue'),
      },
    ],
  },
];
```

### `src/main.js`

```js
import { createApp } from '@pinooxhq/luma';
import { RootShell } from '@pinooxhq/luma/layouts';
import pinia from '@stores/index.js';
import themeConfig from '../theme.config.js';
import { themeConfig as appThemeConfig } from '@/config/theme.js';
import { routes } from '@/config/routes.js';

createApp({
  AppRoot: RootShell,
  themeConfig: {
    ...appThemeConfig,
    brand:  { ...appThemeConfig.brand, ...themeConfig.brand },
    font:   themeConfig.font,
    layout: themeConfig.layout,
    direction: themeConfig.direction,
    auth: themeConfig.auth,
  },
  routes,
  pinia,
});
```

In pages:

```js
import { usePage } from '@pinooxhq/luma';
const { pageTitle, pageLead, pageBadge } = usePage();
```

---

## `createApp` options

| Option | Required | Description |
|--------|----------|-------------|
| `AppRoot` | yes | Top-level Vue component — usually `RootShell` from `@pinooxhq/luma/layouts` |
| `themeConfig` | no | Brand, nav, pageMeta, tokens, `direction`, `auth` |
| `routes` | no | Vue Router route table (default `[]`) |
| `pinia` | no | Pinia instance; installed and set active for guards |
| `mount` | no | Mount selector (default `#app`) |
| `auth` | no | Options passed to `configureAuth()` (overrides `themeConfig.auth`) |
| `verifyAuth` | no | Async hook — full control over session checks (skips built-in `me()`) |
| `IconComponent` | no | Global `<LIcon>` registration (e.g. pass Luma’s `LIcon`) |

`AppRoot` is required so the Node-safe root barrel never pulls `.vue` SFCs into smoke tests / tooling.

---

## Direction (RTL / LTR)

`createApp` resolves direction and syncs `<html dir>` + PrimeVue `rtl`:

1. `themeConfig.direction` (`'rtl'` \| `'ltr'`)
2. Existing `<html dir>` / `<body dir>`
3. `window.__PINOOX__.direction` (boot payload / `VITE_DIRECTION`)
4. Fallback: `'ltr'`

Teleported overlays (Select, DatePicker, menus, confirm) inherit direction via Luma SCSS — no per-app overlay CSS required for the common cases.

```js
// theme.config.js
export default {
  direction: 'rtl',
  // …
};
```

---

## Customization

### Visual tokens

| Group | Keys |
|-------|------|
| `brand` | `primary`, `primaryHover`, `primaryActive`, `primarySoft`, `bgLight`, `bgDark` |
| `font` | `sans`, `mono` |
| `layout` | `sidebarWidth`, `sidebarCollapsedWidth`, `topbarHeight`, `pageMaxWidth`, `radius` |

`createApp` calls `applyThemeConfig()` for you. You can also call it at runtime (white-label / multi-tenant):

```js
import { applyThemeConfig, useTheme } from '@pinooxhq/luma';

applyThemeConfig({ brand: { primary: '#10b981' } });
const { toggleTheme, isDark } = useTheme();
```

### Sass overrides

```scss
@use '@pinooxhq/luma/styles';

:root {
  --px-primary-soft: rgba(14, 115, 253, 0.08);
}

[data-theme='dark'] {
  --px-bg: #0a0a14;
}
```

### `themeConfig` shape

```ts
{
  brand:    { title, subtitle?, logo?, primary?, /* visual brand keys */ },
  nav:      { sections: Array<{ key, label, items: Array<{ key, label, icon, route?, children? }>, collapsible?, defaultCollapsed? }> },
  pageMeta: Record<string, { title, lead?, badge? }>,
  user?:    { roleLabel? },
  font?:    { sans?, mono? },
  layout?:  { sidebarWidth?, sidebarCollapsedWidth?, topbarHeight?, pageMaxWidth?, radius? },
  direction?: 'rtl' | 'ltr',
  auth?:    { endpoints?, skipMe?, autoLoginFromUrl? },
}
```

Omitted fields fall back to Luma defaults. Nav section `label` is a static heading; set `collapsible: true` for accordion sections. Nav items may include `children` for a nested submenu.

### Layouts

Typical pattern: `RootShell` as `AppRoot`, `PageLayout` as the authenticated route layout (sidebar, topbar, mobile nav, drawer).

```js
import { RootShell, PageLayout } from '@pinooxhq/luma/layouts';
import { LSidebar, LTopbar, LMobileNav } from '@pinooxhq/luma/ds';
import { LView, LHeader, LIcon } from '@pinooxhq/luma/ui';
```

Compose DS / UI pieces into a custom layout when `PageLayout` is too opinionated — `RootShell` only provides the outer wrapper, global Toast, and theme CSS variables.

---

## Authentication

Defaults match Pinoox account APIs. Override only what you need.

### Default guard flow

On first navigation, `authGuard`:

1. Optionally adopts `?__manager_token=…` when `themeConfig.auth.autoLoginFromUrl: true`
2. Calls `auth.me()` once (`remote` strategy → `/account/api/v1/auth/{login,logout,get}` by default)
3. Redirects to `/account/login` when `requiresAuth` cannot proceed

### Custom endpoints

```js
// theme.config.js
auth: {
  endpoints: {
    me:     '/api/v1/auth/me',
    login:  '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
  },
},
```

### Replace the strategy

```js
import { createApp, configureAuth } from '@pinooxhq/luma';
import { RootShell } from '@pinooxhq/luma/layouts';

configureAuth({
  endpoints: { me: '/api/auth/me', login: '/api/auth/login' },
});

createApp({ AppRoot: RootShell, themeConfig, routes, pinia });
```

### Skip `me()`

```js
auth: { skipMe: true, autoLoginFromUrl: true },
```

Trusts token presence and skips the HTTP round-trip.

### Full control — `verifyAuth`

```js
createApp({
  AppRoot: RootShell,
  themeConfig,
  routes,
  pinia,
  verifyAuth: async ({ store, route, adoptedFromUrl }) => {
    if (!store.token) return false;
    const profile = await fetchMyProfile();
    store.user = profile;
    return profile.active === true;
  },
});
```

| Return | Effect |
|--------|--------|
| `true` | Allow navigation |
| `false` / throw | Redirect to login |

### Helpers

```js
import { auth, useAuthStore, http, configureAuth, getActiveAuth } from '@pinooxhq/luma';
```

`http` is an axios client with auth headers wired — prefer it over a fresh axios instance.

---

## Usage examples

### DataTable page

```vue
<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { usePage } from '@pinooxhq/luma';
import { LView, LHeader, LCard } from '@pinooxhq/luma/ui';

const { pageTitle, pageLead } = usePage();
const orders = ref([
  { id: 1001, customer: 'Alex Rivera', total: 1250, status: 'paid' },
  { id: 1002, customer: 'Sam Chen',    total:  890, status: 'pending' },
]);
const filters = ref({ global: '' });
const statusSeverity = { paid: 'success', pending: 'warn', shipped: 'info' };
</script>

<template>
  <LView>
    <LHeader :title="pageTitle" :lead="pageLead">
      <Button label="New order" severity="primary" />
    </LHeader>
    <LCard>
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="filters.global" placeholder="Search…" />
      </IconField>
      <DataTable
        :value="orders"
        v-model:filters="filters"
        :global-filter-fields="['customer', 'status']"
        paginator
        :rows="10"
        striped-rows
      >
        <Column field="id" header="ID" sortable />
        <Column field="customer" header="Customer" sortable />
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity[data.status]" />
          </template>
        </Column>
      </DataTable>
    </LCard>
  </LView>
</template>
```

Docs: [primevue.org/datatable](https://primevue.org/datatable/)

### Form + `LField`

For entity CRUD with Yup defaults / `toForm` / `toPayload`, see **[Entity Form](./docs/guides/entity-form.md)** (index: [`docs/README.md`](./docs/README.md)).

```vue
<script setup>
import { reactive, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { http } from '@pinooxhq/luma';
import { LView, LHeader, LCard, LField } from '@pinooxhq/luma/ui';

const form = reactive({ name: '', category: null });
const errors = ref({});
const submitting = ref(false);
const categories = [
  { label: 'Apparel', value: 'apparel' },
  { label: 'Shoes', value: 'shoes' },
];

async function submit() {
  submitting.value = true;
  errors.value = {};
  try {
    await http.post('/api/v1/products', form);
  } catch (err) {
    errors.value = err.response?.data?.errors ?? {};
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <LView>
    <LHeader title="New product" lead="Add an item to the catalog" />
    <LCard>
      <form class="product-form" @submit.prevent="submit">
        <LField label="Name" :error="errors.name?.[0]">
          <InputText v-model="form.name" :invalid="!!errors.name" />
        </LField>
        <LField label="Category">
          <Select
            v-model="form.category"
            :options="categories"
            option-label="label"
            option-value="value"
            placeholder="Select…"
          />
        </LField>
        <Button type="submit" label="Save" :loading="submitting" />
      </form>
    </LCard>
  </LView>
</template>
```

### Toast / Dialog

Global Toast is mounted by `RootShell`. Use `useToast()` anywhere:

```vue
<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const open = ref(false);

function notify() {
  toast.add({
    severity: 'success',
    summary: 'Saved',
    detail: 'Changes were stored.',
    life: 3000,
  });
}
</script>

<template>
  <Button label="Notify" @click="notify" />
  <Button label="Delete" severity="danger" @click="open = true" />
  <Dialog v-model:visible="open" header="Confirm" modal>
    <p>Delete this item?</p>
    <template #footer>
      <Button label="Cancel" text @click="open = false" />
      <Button label="Delete" severity="danger" @click="open = false" />
    </template>
  </Dialog>
</template>
```

### Dark mode

```vue
<script setup>
import { useTheme } from '@pinooxhq/luma';
import { LThemeToggle } from '@pinooxhq/luma/ds';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <LThemeToggle :model-value="isDark" @update:model-value="toggleTheme" />
</template>
```

---

## Components

**Rule of thumb:** use PrimeVue directly for forms, tables, overlays. Reach for an `L*` wrapper when you want Luma’s themed chrome on top.

### Luma UI (`@pinooxhq/luma/ui`)

| Component | Purpose |
|-----------|---------|
| `LView` / `LPage` | Page shells with consistent padding |
| `LHeader` | Classic page header (`title`, `lead`, `badge`, actions slot) |
| `LPageHeader` | Modern header (`eyebrow`, `title`, `lead`, `icon`) |
| `LPageToolbar` | Sticky page actions |
| `LPageContainer` | Honors `pageMaxWidth` + gutters |
| `LPanel` | Content panel (incl. flush table chrome) |
| `LCard` | Themed card (PrimeVue Card) |
| `LStatCard` | KPI / metric card |
| `LEmptyPanel` | Empty state + CTA |
| `LBadge` | Status tag |
| `LButton` | Variant / severity / size / shape system |
| `LField` | Label, hint, error + input slot |
| `LDatePicker` | Themed date picker |
| `LTabs` | Tab strip helpers |
| `LToolbar` | Filter / action row |
| `LSpinner` | Loading spinner |
| `LToast` | In-page toast host (global Toast still in `RootShell`) |
| `LConfirmDialog` | Confirm surface with RTL-aware layout |
| `LRichEditor` | TipTap rich text |
| `LIcon` | Lucide wrapper (`<LIcon name="shopping-cart" />`) |

### Design-system chrome (`@pinooxhq/luma/ds`)

| Component | Purpose |
|-----------|---------|
| `LSidebar` | Nav sidebar (`PageLayout`) |
| `LTopbar` | Top bar |
| `LMobileNav` | Mobile bottom nav |
| `LThemeToggle` | Light / dark control |
| `LEmptyState` | **Deprecated** alias of `LEmptyPanel` |

### PrimeVue 4 (wired via Console preset)

Import any core component in pages — preset, ripple, RTL, and dark mode are already installed by `setupPrimeVue`:

| Area | Components |
|------|------------|
| Form | `InputText`, `Textarea`, `Password`, `InputMask`, `InputNumber`, `InputOtp`, `Select`, `MultiSelect`, `AutoComplete`, `Checkbox`, `RadioButton`, `ToggleSwitch`, `SelectButton`, `Slider`, `Rating`, `DatePicker`, … |
| Data | `DataTable`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `Paginator` |
| Panels | `Card`, `Panel`, `Accordion`, `Tabs`, `Stepper`, `Toolbar` |
| Overlay | `Dialog`, `Drawer`, `Popover`, `Tooltip`, `ConfirmDialog`, `ConfirmPopup` |
| Feedback | `Toast`, `Message`, `Tag`, `Badge`, `Chip`, `ProgressBar`, `ProgressSpinner`, `Skeleton` |
| Menu | `Menu`, `Menubar`, `MegaMenu`, `PanelMenu`, `TieredMenu`, `Breadcrumb` |
| Media | `Image`, `Carousel`, `FileUpload` |
| Misc | `Avatar`, `Divider`, `Splitter`, `ScrollPanel`, `Knob`, `Button`, `ToggleButton` |

See [primevue.org](https://primevue.org/) for the full API. Theme CSS comes from `@primeuix/themes` via Luma’s preset — you do not need a separate PrimeVue CSS import for the Console look.

---

## Subpath exports

| Path | Contents |
|------|----------|
| `@pinooxhq/luma` | Node-safe barrel (`createApp`, composables, auth, theme helpers — no `.vue` SFCs) |
| `@pinooxhq/luma/ui` | UI primitives listed above |
| `@pinooxhq/luma/ds` | Shell chrome + legacy `LEmptyState` |
| `@pinooxhq/luma/layouts` | `RootShell`, `PageLayout` |
| `@pinooxhq/luma/composables` | `usePage`, … |
| `@pinooxhq/luma/router` | `createAppRouter`, `authGuard`, `redirectToLogin`, history helpers |
| `@pinooxhq/luma/core` | `auth`, `http`, `useAuthStore`, `configureAuth`, `env`, dates, media helpers |
| `@pinooxhq/luma/plugins` | `setupPrimeVue`, `ConsolePreset` |
| `@pinooxhq/luma/styles` | Main SCSS bundle |
| `@pinooxhq/luma/tokens` | SCSS design tokens |
| `@pinooxhq/luma/fonts` | Vazir registration |
| `@pinooxhq/luma/theme-config` | Nav / pageMeta / theme resolution helpers |
| `@pinooxhq/luma/createApp` | Factory only |
| `@pinooxhq/luma/applyThemeConfig` | Runtime CSS variable writer |
| `@pinooxhq/luma/vite` | Vite plugin |
| `@pinooxhq/luma/preset` | Console preset (default export) |

---

## Upgrading

```sh
npm update @pinooxhq/luma
```

Semantic versioning (see [`CHANGELOG.md`](./CHANGELOG.md)):

- **Patch** — internal fixes, no public API break
- **Minor** — new components / helpers, backwards compatible
- **Major** — breaking changes, documented in the changelog

Pin to `^0.4.0` (or stricter) for predictable upgrades.

### Migrating from 0.3.x → 0.4.x

| Package | 0.3.x | 0.4.x |
|---------|-------|-------|
| `primevue` | `^4` | `^4.5` |
| `@primeuix/themes` | `^1` | `^2` |
| `pinia` | `^3` | `^4` |
| `@vue/devtools-api` | — | `^8` |

1. Install the peer set from [Install](#install).
2. Prefer `LEmptyPanel` over `LEmptyState`.
3. Prefer the `luma()` Vite plugin when developing against a `file:` link.
4. Set `themeConfig.direction` when you need explicit RTL.

---

## License

MIT © Pinoox
