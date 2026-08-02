# @pinooxhq/luma

A full-featured, highly customizable Vue 3 framework for building
dashboard-style web applications on the Pinoox platform. Powered by
PrimeVue 4.

Luma is more than a design system. It's the entire front-end foundation
of a Pinoox app — routing, state management, authentication, layouts,
theming, dev tooling, and the visual language — packaged together so
teams can ship a polished, production-ready admin dashboard in hours
instead of weeks.

Every layer is a customization point. Theme tokens, layouts, the router,
the auth flow, individual components, and even the boot factory itself
can be replaced or extended without forking the package.

> **Built for the Pinoox platform.**
> Luma is the canonical front-end stack for any app running on Pinoox,
> from e-commerce admin panels and CRM dashboards to internal tools and
> multi-tenant SaaS consoles.

---

## Table of contents

1. [What's inside](#whats-inside)
2. [Why Luma](#why-luma)
3. [Install](#install)
4. [Quick start](#quick-start)
5. [Customization](#customization)
   - [Visual tokens](#visual-tokens--themeconfigjs)
   - [Sass overrides](#sass-overrides--stylesappscss)
   - [Runtime app content](#runtime-app-content--themeconfig)
   - [Components and layouts](#components-and-layouts)
   - [Runtime mutability](#runtime-mutability)
6. [Authentication](#authentication)
7. [Usage examples](#usage-examples)
8. [Subpath exports](#subpath-exports)
9. [Upgrading](#upgrading)
10. [License](#license)

---

## What's inside

**App framework**

- **`createApp()` factory** — wires PrimeVue, Pinia, the router, the
  auth redirect handler, the dev bootstrap, and the theme system in a
  single call.
- **`createAppRouter()` + `authGuard()`** — auth-aware Vue Router with
  `window.__PINOOX__` history-base resolution.
- **Pinia** — explicit active-pinia setup so stores work inside router
  guards out of the box.
- **Auth integration** — `auth`, `http`, `useAuthStore` (via
  `@pinooxhq/auth`), and an unauthorized-redirect handler.

**Layouts**

- **`RootShell`** — minimal outer wrapper with global Toast and resets.
- **`PageLayout`** — production-ready dashboard shell: collapsible
  sidebar, topbar, mobile bottom navigation, side drawer, brand block,
  and user menu. Drop it into a route and you're done.

**Design system**

- **Tokens** — colors, typography, spacing, radius, shadow, motion, and
  z-index. First-class light and dark themes.
- **Components** — `LSidebar`, `LTopbar`, `LMobileNav`, `LCard`,
  `LBadge`, `LEmptyPanel`, `LThemeToggle`, plus primitives
  `LIcon`, `LView`, `LHeader`, `LButton`, `LField`, `LPageHeader`,
  `LPageToolbar`, `LPageContainer`, `LSpinner`, `LToast`, and `LToolbar`.
- **PrimeVue 4** — every component auto-registered with Luma's preset
  (DataTable, Forms, Calendar, Dialog, Toast, Charts, FileUpload, …).
  See the full table in [Usage examples](#available-primevue-components).
- **Glassmorphism** and a fully responsive mobile experience out of
  the box.

**Theming**

- **`useTheme()`** — reactive light/dark switching with persistence.
- **`applyThemeConfig()`** — runtime brand, font, and layout overrides
  written as CSS custom properties. No rebuild required.
- **`themeConfig`** — one object carries the brand, navigation, page
  metadata, role label, and visual tokens through the entire app.

**Tooling**

- **PrimeVue 4** preset derived from Aura, preconfigured for RTL, dark
  mode, and glassmorphism.
- **Vazir** web font, base resets, layout primitives, and Lucide icon
  overrides.
- **Dev bootstrap** — `applyDevBootstrap()` reads env vars and builds
  `window.__PINOOX__` for Vite dev runs (no-op in production).

---

## Why Luma

- **Opinionated, not rigid.** Sensible defaults so teams ship fast, and
  a clean customization layer so the design language never has to be
  rewritten.
- **Single source of truth.** Brand colors, navigation, page metadata,
  and visual tokens all flow through one `themeConfig` object — change
  it once, update everywhere.
- **Production-ready foundations.** Authentication, route guards, dark
  mode, responsive layouts, and toast notifications are wired in, not
  left to each app to implement.
- **Library-grade.** Semantic versioning, subpath exports, a stable
  public API, and a documented upgrade path.

---

## Install

Luma is published on npm as a standard package:

```sh
npm install @pinooxhq/luma
```

You'll also want PrimeVue 4 (Luma's UI layer), Pinia (state management),
Lucide (icons), and Sass (Luma's stylesheet is Sass):

```sh
npm install primevue @primeuix/themes pinia vue-router axios lucide-vue-next sass --save-dev
```

That's it — no manual plugin wiring, no symlinks, no path hacks. Standard
npm install just works. `sass` is only needed at build time, so it lives
in `devDependencies` of your app.

### Optional — Pinia auth helper

Luma's auth composables (`useAuthStore`, `configureAuth`) build on
`@pinooxhq/auth`. Install it alongside Luma if you'll use the bundled
auth flow:

```sh
npm install @pinooxhq/auth
```

If you skip this step, `createApp` still boots; pages that don't require
auth render normally, but `requiresAuth` routes will always redirect.

### Vite config

A minimal Vite config for a Luma app:

```js
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Add your app-internal aliases as needed.
    },
  },
});
```

No `optimizeDeps` tweaks, no `ssr.noExternal`, no `server.fs.allow`
workarounds. Luma is a normal npm package and resolves like one.

Import the stylesheet once from your app's main stylesheet:

```scss
@use '@pinooxhq/luma/styles';
```

---

## Quick start

A minimal Luma app is four small files.

```
your-app/
├── package.json
├── vite.config.js
├── theme.config.js         ← visual overrides (colors, fonts, layout)
└── src/
    ├── main.js             ← calls createApp(...)
    └── config/
        ├── theme.js        ← brand + nav + pageMeta
        └── routes.js       ← route map
```

The example below is for an e-commerce admin dashboard — it would be
just as natural for a CRM, an analytics console, or an internal tool.

### `theme.config.js`

Visual tokens. `createApp` writes these to `:root` as CSS variables, so
rebranding never requires a Sass rebuild.

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
};
```

### `src/config/theme.js`

Brand identity, navigation structure, and per-route page metadata.

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
        key: 'overview', label: 'Overview',
        items: [
          { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: 'shop.dashboard' },
          { key: 'reports',   label: 'Reports',   icon: 'line-chart',       route: 'shop.reports' },
        ],
      },
      {
        key: 'catalog', label: 'Catalog',
        items: [
          { key: 'products',   label: 'Products',   icon: 'package',     route: 'shop.products' },
          { key: 'categories', label: 'Categories', icon: 'folder-tree', route: 'shop.categories' },
          { key: 'inventory',  label: 'Inventory',  icon: 'warehouse',   route: 'shop.inventory' },
        ],
      },
      {
        key: 'sales', label: 'Sales',
        items: [
          { key: 'orders',    label: 'Orders',    icon: 'shopping-cart', route: 'shop.orders' },
          { key: 'customers', label: 'Customers', icon: 'users',         route: 'shop.customers' },
          { key: 'discounts', label: 'Discounts', icon: 'percent',       route: 'shop.discounts' },
        ],
      },
      {
        key: 'settings', label: 'Settings',
        items: [
          { key: 'settings', label: 'General', icon: 'settings', route: 'shop.settings' },
          { key: 'team',     label: 'Team',    icon: 'user-cog', route: 'shop.team' },
        ],
      },
    ],
  },
  pageMeta: {
    'shop.dashboard':  { title: 'Dashboard',  lead: 'Sales performance overview',     badge: 'Live' },
    'shop.reports':    { title: 'Reports',    lead: 'Revenue and profit trends',      badge: 'Analytics' },
    'shop.products':   { title: 'Products',   lead: 'Manage catalog items',           badge: 'Catalog' },
    'shop.categories': { title: 'Categories', lead: 'Product tree structure',         badge: 'Catalog' },
    'shop.inventory':  { title: 'Inventory',  lead: 'Stock levels and warehouses',    badge: 'Catalog' },
    'shop.orders':     { title: 'Orders',     lead: 'Open and completed orders',      badge: 'Sales' },
    'shop.customers':  { title: 'Customers',  lead: 'Customer base and purchase history', badge: 'Sales' },
    'shop.discounts':  { title: 'Discounts',  lead: 'Promo codes and campaigns',      badge: 'Sales' },
    'shop.settings':   { title: 'Settings',   lead: 'Store preferences',             badge: 'Settings' },
    'shop.team':       { title: 'Team',       lead: 'Members and permissions',       badge: 'Settings' },
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
        path: 'products',
        name: 'shop.products',
        component: () => import('@pages/products/page-products.vue'),
      },
      {
        path: 'orders',
        name: 'shop.orders',
        component: () => import('@pages/orders/page-orders.vue'),
      },
      // …
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
    brand:  { ...appThemeConfig.brand,  ...themeConfig.brand },
    font:   themeConfig.font,
    layout: themeConfig.layout,
  },
  routes,
  pinia,
});
```

Pages read the active page metadata with `usePage()`:

```js
import { usePage } from '@pinooxhq/luma';
const { pageTitle, pageLead, pageBadge } = usePage();
```

---

## Customization

Every layer of Luma is a customization point. The hooks below are listed
in the order you'll typically reach for them.

### Visual tokens — `theme.config.js`

`applyThemeConfig()` writes CSS custom properties to `:root`, so brand,
font, and layout changes don't require a Sass rebuild.

| Group  | Keys |
|--------|------|
| brand  | `primary`, `primaryHover`, `primaryActive`, `primarySoft`, `bgLight`, `bgDark` |
| font   | `sans`, `mono` |
| layout | `sidebarWidth`, `sidebarCollapsedWidth`, `topbarHeight`, `pageMaxWidth`, `radius` |

You rarely call this yourself — `createApp` does it from the config you
pass in.

### Sass overrides — `styles/app.scss`

For deeper changes (component internals, custom utilities):

```scss
@use '@pinooxhq/luma/styles';

:root {
  --px-primary-soft: rgba(14, 115, 253, 0.08);
}

[data-theme="dark"] {
  --px-bg: #0a0a14;
}
```

### Runtime app content — `themeConfig`

The shape `createApp` expects:

```ts
{
  brand:    { title, subtitle?, logo? },
  nav:      { sections: Array<{ key, label, items, collapsible?, defaultCollapsed? }> }, // label is a static heading; set collapsible:true to enable accordion
  pageMeta: Record<string, { title, lead?, badge? }>,
  user:     { roleLabel },
  font?:    { sans?, mono? },
  layout?:  { sidebarWidth?, sidebarCollapsedWidth?, topbarHeight?, pageMaxWidth?, radius? },
}
```

Any field you omit falls back to a Luma default.

### Components and layouts

`createApp()` does NOT default `AppRoot` — you must pass it explicitly.
The most common pattern is to use `RootShell` as the app-wide shell and
`PageLayout` as a per-route layout, but either can be replaced:

```js
import { RootShell } from '@pinooxhq/luma/layouts';

createApp({
  AppRoot: RootShell,  // required — the top-level Vue component
  themeConfig: …,
  routes: [
    { path: '/', component: PageLayout, meta: { requiresAuth: true }, children: […] },
  ],
  pinia: …,
  mount: '#app',       // default
});
```

Individual Luma components (`LSidebar`, `LTopbar`, `LMobileNav`,
`LCard`, …) can also be imported and composed into your own layouts
from their respective subpaths:

```js
import { LSidebar, LTopbar, LMobileNav } from '@pinooxhq/luma/ds';
import { LView, LHeader, LIcon } from '@pinooxhq/luma/ui';
```

### Runtime mutability

Theme and config can be changed at runtime — useful for white-labeling,
multi-tenant themes, and admin previews:

```js
import { useTheme, applyThemeConfig } from '@pinooxhq/luma';

const { toggleTheme, isDark } = useTheme();
toggleTheme();

applyThemeConfig({ brand: { primary: '#10b981' } });
```

---

## Authentication

Luma ships with sensible Pinoox-flavored defaults so apps don't need any
auth wiring to work. Override only what you need.

### How the default flow works

On the first navigation, Luma's `authGuard` runs and:

1. Auto-picks up a manager-issued JWT from `?__manager_token=…` if present
   (off by default — set `themeConfig.auth.autoLoginFromUrl: true` to opt in).
2. Calls `auth.me()` once to verify the token against the server. This
   uses `@pinooxhq/auth`'s `remote` strategy, which defaults to
   `/account/api/v1/auth/{login,logout,get}`.
3. Redirects to `/account/login` if `requiresAuth` routes can't be reached.

If your app uses a different backend or auth strategy, override the
defaults at the level that fits.

### Override the me/login/logout endpoints

Simplest path. Add `auth.endpoints` to your `themeConfig`:

```js
// theme.config.js
export default {
  // …visual tokens…
  auth: {
    endpoints: {
      me:     '/api/v1/auth/me',
      login:  '/api/v1/auth/login',
      logout: '/api/v1/auth/logout',
    },
  },
};
```

Luma passes these to `@pinooxhq/auth` before the first router guard runs.
No `configureAuth()` call needed.

### Replace the auth strategy entirely

For non-Pinoox backends (your own auth service, Auth0, Firebase, etc.),
call `configureAuth()` from your app's bootstrap before `createApp()`:

```js
// src/main.js
import { createApp, configureAuth } from '@pinooxhq/luma';
import { RootShell } from '@pinooxhq/luma/layouts';

configureAuth({
  endpoints: { me: '/api/auth/me', login: '/api/auth/login' },
  // any @pinooxhq/auth options — see its docs
});

createApp({ AppRoot: RootShell, themeConfig, routes, pinia });
```

`configureAuth()` replaces Luma's default auth singleton. It's safe to
call once before `createApp()`.

### Skip the cross-app `me()` round-trip

When the framework's default `me()` endpoint is broken, or your app
trusts a manager-issued JWT, set `auth.skipMe: true`:

```js
// theme.config.js
auth: { skipMe: true, autoLoginFromUrl: true },
```

With `skipMe: true`, Luma trusts the token's presence and skips the
`me()` HTTP call entirely. The dashboard renders immediately.

### Take full control with `verifyAuth`

For arbitrary session-validation logic, pass a `verifyAuth` hook to
`createApp()`. When supplied, Luma skips its built-in flow and lets your
hook decide:

```js
import { createApp } from '@pinooxhq/luma';
import { RootShell } from '@pinooxhq/luma/layouts';

createApp({
  AppRoot: RootShell,
  themeConfig,
  routes,
  pinia,
  verifyAuth: async ({ store, route, adoptedFromUrl }) => {
    // Hit your own /me, decode a JWT, check a cookie — anything.
    if (!store.token) return false;        // → redirect to login
    const profile = await fetchMyProfile();
    store.user = profile;                  // populate the store
    return profile.active === true;        // allow navigation
  },
});
```

| Hook return | Effect on `requiresAuth` route |
|-------------|-------------------------------|
| `true`      | Navigation allowed |
| `false`     | Redirected to login |
| throws      | Treated as `false` |

### Access the auth instance

For advanced use cases:

```js
import { auth, useAuthStore, http, configureAuth, getActiveAuth } from '@pinooxhq/luma';

// auth, http, useAuthStore — direct access (proxy reads from active instance)
// configureAuth(opts) — replace the active instance
// getActiveAuth() — read the current instance directly
```

`http` is an axios client with auth headers already wired in. Use it for
API calls instead of creating your own axios instance.

---

## Usage examples

Beyond the quick-start, here are common patterns you'll reach for.

### Table page with PrimeVue DataTable

PrimeVue 4 ships first-class data tables. Luma's theme tokens carry
through automatically. Full API reference:
[primevue.org/datatable](https://primevue.org/datatable/).

```vue
<!-- src/pages/orders/page-orders.vue -->
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

const { pageTitle, pageLead } = usePage();

const orders = ref([
  { id: 1001, customer: 'Alex Rivera', total: 1250, status: 'paid',     createdAt: '2026-05-10' },
  { id: 1002, customer: 'Sam Chen',    total:  890, status: 'pending',  createdAt: '2026-05-11' },
  { id: 1003, customer: 'Jordan Lee',  total: 2310, status: 'shipped',  createdAt: '2026-05-12' },
]);

const filters = ref({ global: '' });

const statusSeverity = {
  paid:    'success',
  pending: 'warn',
  shipped: 'info',
  canceled:'danger',
};
</script>

<template>
  <LView>
    <LHeader :title="pageTitle" :lead="pageLead">
      <Button label="New order" icon="plus" severity="primary" />
    </LHeader>

    <LCard>
      <div class="orders-toolbar">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.global" placeholder="Search…" />
        </IconField>
      </div>

      <DataTable
        :value="orders"
        v-model:filters="filters"
        :global-filter-fields="['customer', 'status']"
        paginator :rows="10"
        striped-rows
      >
        <Column field="id" header="ID" sortable />
        <Column field="customer" header="Customer" sortable />
        <Column field="total" header="Total" sortable>
          <template #body="{ data }">{{ data.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity[data.status]" />
          </template>
        </Column>
        <Column field="createdAt" header="Date" sortable />
      </DataTable>
    </LCard>
  </LView>
</template>
```

### Form page with PrimeVue forms

For validation-ready forms, PrimeVue's input components pair with
`@primeuix/forms` or any validation lib. Full list of components:
[primevue.org/forms](https://primevue.org/forms/).

```vue
<script setup>
import { reactive, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { http } from '@pinooxhq/luma';

const form = reactive({ name: '', sku: '', price: 0, category: null, description: '' });
const errors = ref({});
const submitting = ref(false);

const categories = [
  { label: 'پوشاک',  value: 'apparel' },
  { label: 'کفش',    value: 'shoes'   },
  { label: 'اکسسوری', value: 'accessories' },
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
    <LHeader title="محصول جدید" lead="یک محصول به کاتالوگ اضافه کنید" />

    <LCard>
      <form @submit.prevent="submit" class="product-form">
        <label>
          <span>نام محصول</span>
          <InputText v-model="form.name" :invalid="!!errors.name" />
          <Message v-if="errors.name" severity="error" size="small">
            {{ errors.name[0] }}
          </Message>
        </label>

        <label>
          <span>کد محصول (SKU)</span>
          <InputText v-model="form.sku" :invalid="!!errors.sku" />
        </label>

        <label>
          <span>دسته‌بندی</span>
          <Select v-model="form.category" :options="categories" option-label="label"
                  option-value="value" placeholder="انتخاب…" />
        </label>

        <label>
          <span>توضیحات</span>
          <Textarea v-model="form.description" rows="4" />
        </label>

        <div class="product-form__actions">
          <Button type="submit" label="ذخیره" :loading="submitting" />
        </div>
      </form>
    </LCard>
  </LView>
</template>

<style lang="scss" scoped>
.product-form {
  display: grid;
  gap: 1rem;
  max-width: 640px;

  label {
    display: grid;
    gap: 0.5rem;
    font-weight: 500;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>
```

### Toast / Dialog / Confirm

Global toasts come pre-wired in `RootShell`. Use PrimeVue's `useToast()`
anywhere. Full API: [primevue.org/toast](https://primevue.org/toast/).

```vue
<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const dialogOpen = ref(false);

function notify() {
  toast.add({
    severity: 'success',
    summary: 'ذخیره شد',
    detail: 'تغییرات با موفقیت ثبت شدند.',
    life: 3000,
  });
}
</script>

<template>
  <div>
    <Button label="اعلان" @click="notify" />
    <Button label="حذف" severity="danger" @click="dialogOpen = true" />

    <Dialog v-model:visible="dialogOpen" header="تأیید حذف" modal>
      <p>آیا از حذف این مورد مطمئن هستید؟</p>
      <template #footer>
        <Button label="انصراف" text @click="dialogOpen = false" />
        <Button label="حذف" severity="danger" @click="dialogOpen = false" />
      </template>
    </Dialog>
  </div>
</template>
```

### Dark mode toggle

`useTheme()` is reactive — drop a button anywhere.

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

### Custom layout (skip `PageLayout`)

Some apps want to keep the chrome from `RootShell` but design their own
page interior. Just wrap any component in a route:

```js
import { RootShell } from '@pinooxhq/luma/layouts';
import MarketingLayout from '@/layouts/marketing-layout.vue';

export const routes = [
  {
    path: '/',
    component: RootShell,
    children: [
      { path: 'dashboard', component: MarketingLayout, meta: { requiresAuth: true }, children: […] },
    ],
  },
];
```

`RootShell` only provides the outer wrapper, global `<Toast>`, and the
theme CSS variables. Everything inside is yours.

### Available PrimeVue components

Luma installs and registers **every PrimeVue 4 component**. You can
import any of them in your pages without additional setup:

| Component | Docs |
|-----------|------|
| `Button`, `IconButton` | [primevue.org/button](https://primevue.org/button/) |
| `InputText`, `Textarea`, `Password`, `InputMask`, `InputOtp` | [primevue.org/forms](https://primevue.org/forms/) |
| `Select`, `MultiSelect`, `AutoComplete`, `Listbox`, `TreeSelect`, `CascadedSelect` | [primevue.org/select](https://primevue.org/select/) |
| `Checkbox`, `RadioButton`, `ToggleSwitch`, `SelectButton`, `Slider`, `Rating`, `InputNumber` | [primevue.org/forms](https://primevue.org/forms/) |
| `Calendar`, `DatePicker`, `InputDate` | [primevue.org/datepicker](https://primevue.org/datepicker/) |
| `DataTable`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `Paginator` | [primevue.org/datatable](https://primevue.org/datatable/) |
| `Card`, `Panel`, `Accordion`, `TabView`, `Stepper` | [primevue.org/panels](https://primevue.org/panels/) |
| `Dialog`, `Drawer`, `Popover`, `OverlayPanel`, `Tooltip` | [primevue.org/overlay](https://primevue.org/overlay/) |
| `Toast` (global, auto-mounted), `Message`, `Tag`, `Badge`, `Chip` | [primevue.org/toast](https://primevue.org/toast/) |
| `Menu`, `Menubar`, `MegaMenu`, `PanelMenu`, `TieredMenu` | [primevue.org/menu](https://primevue.org/menu/) |
| `Avatar`, `AvatarGroup`, `Divider`, `Splitter`, `ScrollPanel` | [primevue.org/misc](https://primevue.org/misc/) |
| `FileUpload`, `ProgressBar`, `ProgressSpinner`, `Skeleton` | [primevue.org/fileupload](https://primevue.org/fileupload/) |
| `Chart` (wraps Chart.js) | [primevue.org/chart](https://primevue.org/chart/) |
| `Carousel`, `Galleria`, `Image`, `ImageCompare` | [primevue.org/media](https://primevue.org/media/) |
| `ConfirmDialog`, `ConfirmPopup` | [primevue.org/confirmdialog](https://primevue.org/confirmdialog/) |
| `Breadcrumb`, `MenuBar`, `Dock` | [primevue.org/menubar](https://primevue.org/menubar/) |
| `FullCalendar` (separate plugin) | [primevue.org/fullcalendar](https://primevue.org/fullcalendar/) |
| `Editor` (Quill wrapper) | [primevue.org/editor](https://primevue.org/editor/) |
| `Knob`, `SelectButton`, `ToggleButton` | [primevue.org/button](https://primevue.org/button/) |

Luma's preset already registers PrimeIcons and an Aura-derived theme with
your brand's primary color — no extra theme setup needed.

### Luma's own components

Beyond PrimeVue, Luma ships a small set of opinionated shell components:

| Component | Subpath | Purpose |
|-----------|---------|---------|
| `LView` | `@pinooxhq/luma/ui` | Page wrapper with consistent padding and max-width. |
| `LHeader` | `@pinooxhq/luma/ui` | Page header with `title`, `lead`, `badge`, and a slot for actions. |
| `LPageHeader` | `@pinooxhq/luma/ui` | Modern page header with eyebrow, title, lead, and icon. |
| `LPageToolbar` | `@pinooxhq/luma/ui` | Sticky toolbar for page-level actions (right-aligned slot). |
| `LPageContainer` | `@pinooxhq/luma/ui` | Constrains a page to the configured `pageMaxWidth` and handles gutters. |
| `LCard` | `@pinooxhq/luma/ui` | Themed card with header/body/footer slots. |
| `LEmptyPanel` | `@pinooxhq/luma/ui` | "No data" placeholder with icon, title, description, and CTA. |
| `LBadge` | `@pinooxhq/luma/ui` | Inline status badge with `variant` + `dot` props. |
| `LButton` | `@pinooxhq/luma/ui` | Themed button with `variant` / `severity` / `size` / `shape` props. |
| `LField` | `@pinooxhq/luma/ui` | Form field wrapper — label, hint, error, slot for any input. |
| `LSpinner` | `@pinooxhq/luma/ui` | Loading spinner with `size` and `center` props. |
| `LToast` | `@pinooxhq/luma/ui` | Per-page toast mount (global `<Toast>` is auto-mounted by `RootShell`). |
| `LToolbar` | `@pinooxhq/luma/ui` | Horizontal toolbar for filter/action rows. |
| `LIcon` | `@pinooxhq/luma/ui` | Lucide icon wrapper (e.g. `<LIcon name="shopping-cart" />`). |
| `LSidebar` | `@pinooxhq/luma/ds` | Sidebar (used by `PageLayout`, available standalone). |
| `LTopbar` | `@pinooxhq/luma/ds` | Topbar (used by `PageLayout`, available standalone). |
| `LMobileNav` | `@pinooxhq/luma/ds` | Mobile bottom nav. |
| `LThemeToggle` | `@pinooxhq/luma/ds` | Light/dark toggle. |
| `LEmptyState` | `@pinooxhq/luma/ds` | **Deprecated alias** for `LEmptyPanel`. Kept for one release; will be removed in 0.4.0. |

Import any of these alongside PrimeVue components in your pages:

```js
import { LView, LHeader, LButton, LField, LPageHeader } from '@pinooxhq/luma/ui';
import { LCard, LEmptyPanel } from '@pinooxhq/luma/ui';
import { LSidebar, LTopbar } from '@pinooxhq/luma/ds';
```

> **Full reference (every prop, slot, example):** see [`docs/README.md`](./docs/README.md).

---

## Subpath exports

Import from the package root for the full surface:

```js
import { createApp, usePage } from '@pinooxhq/luma';
import { PageLayout } from '@pinooxhq/luma/layouts';
```

Or pick a smaller surface:

| Path | What you get |
|------|--------------|
| `@pinooxhq/luma` | Full barrel (Node-safe, no `.vue` SFCs) |
| `@pinooxhq/luma/ds` | `LSidebar`, `LTopbar`, `LMobileNav`, `LThemeToggle`, `LCard`, `LBadge`, `LEmptyState` (legacy alias for `LEmptyPanel`) |
| `@pinooxhq/luma/ui` | `LButton`, `LBadge`, `LCard`, `LField`, `LHeader`, `LIcon`, `LPageContainer`, `LPageHeader`, `LPageToolbar`, `LSpinner`, `LToast`, `LToolbar`, `LView`, `LEmptyPanel` |
| `@pinooxhq/luma/layouts` | `RootShell`, `PageLayout` |
| `@pinooxhq/luma/composables` | `usePage` |
| `@pinooxhq/luma/router` | `createAppRouter`, `authGuard`, `redirectToLogin`, `buildAppPath`, `resolveHistoryBase` |
| `@pinooxhq/luma/core` | `auth`, `http`, `useAuthStore`, `configureAuth`, `env`, `isDev`, `isProd`, icon helpers, `formatDate`, `resolveMediaUrl` |
| `@pinooxhq/luma/plugins` | `setupPrimeVue`, `ConsolePreset` |
| `@pinooxhq/luma/styles` | Main SCSS bundle |
| `@pinooxhq/luma/tokens` | SCSS tokens |
| `@pinooxhq/luma/fonts` | Vazir font registration |
| `@pinooxhq/luma/theme-config` | `flattenNavItems`, `findNavItemByRoute`, `findPageMeta`, `resolveThemeConfig`, `setActiveThemeConfig` |
| `@pinooxhq/luma/createApp` | The `createApp` factory |
| `@pinooxhq/luma/applyThemeConfig` | `applyThemeConfig` |
| `@pinooxhq/luma/vite` | The Vite helper bundle |

> **Full component catalog (props, slots, examples):** see [`docs/README.md`](./docs/README.md).

---

## Upgrading

```sh
npm update @pinooxhq/luma
```

See [`CHANGELOG.md`](./CHANGELOG.md) for release notes. Luma follows
semantic versioning:

- **Patch** — internal refactors, no API change.
- **Minor** — new components, tokens, or composables; backwards
  compatible.
- **Major** — breaking changes, documented in the changelog.

Pin to `^0.1.0` (or stricter) for predictable upgrades.

---

## License

MIT © Pinoox
