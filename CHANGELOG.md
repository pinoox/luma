# Changelog

All notable changes to `@pinooxhq/luma` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **`LSidebar` section labels** — section `label` is a static heading by default (matches the “نمای کلی” grouping style). Accordion behaviour is opt-in via `collapsible: true` (with optional `defaultCollapsed`).
- **`.px-layout__content`** — removed `max-width` / auto side margins so page body aligns with the full-width topbar. Narrow pages can still use `LPageContainer` + `pageMaxWidth`.
- **`LSidebar` density** — tighter link padding, smaller item font, and reduced gaps between nav items/sections.
- **`ConsolePreset` dark surfaces** — restore Aura’s higher-is-darker scale so PrimeVue Cards/Panels use dark `surface.900` in dark mode (the inverted scale made content backgrounds nearly white).
- **`LPageHeader`** — default `--ppage-header-padding-x`; hide icon tile when `icon` is empty.

## [0.3.0] — 2026-08-01

### Added
- **`LButton`** — themed button with `variant` (`solid` | `gradient` | `soft` | `outline` | `ghost` | `glass`), `severity` (`primary` | `neutral` | `success` | `warn` | `danger` | `info`), `size` (`xs` | `sm` | `md` | `lg` | `xl`), `shape` (`pill` | `square` | `rounded` | `circle`), and `icon-only` / `loading` / `spin-on-hover` modifiers. Pairs with PrimeVue's Button but with the Luma variant/severity/size system. Available from `@pinooxhq/luma/ui`.
- **`LField`** — form-field wrapper with `label`, `hint`, `error`, and a default slot that accepts any input (PrimeVue or custom). Replaces the previous ad-hoc `<label>` + `<InputText>` pattern. Available from `@pinooxhq/luma/ui`.
- **`LPageHeader`** — modern page header with `eyebrow`, `title`, `lead`, and `icon` props. Replaces the older `LHeader` for new pages. Available from `@pinooxhq/luma/ui`.
- **`LPageToolbar`** — sticky toolbar for page-level actions. Right-aligned slot for buttons. Available from `@pinooxhq/luma/ui`.
- **`LPageContainer`** — wraps a page in the configured `pageMaxWidth` token and handles gutters. Available from `@pinooxhq/luma/ui`.
- **`LSpinner`** — loading spinner with `size` and `center` props, plus a `Loading states — composed` recipe for spinner+text+fullscreen variants. Available from `@pinooxhq/luma/ui`.
- **`LToast`** — per-page toast mount. The global `<Toast>` is still auto-mounted by `RootShell`; `LToast` is for in-page toasts. Available from `@pinooxhq/luma/ui`.
- **`LToolbar`** — horizontal toolbar for filter/action rows. Slots for leading/trailing content. Available from `@pinooxhq/luma/ui`.
- **`LEmptyPanel`** — "no data" placeholder with icon, title, description, and CTA slot. Available from `@pinooxhq/luma/ui`. **Replaces `LEmptyState`.**
- **New SCSS partials** — `src/scss/components/_buttons.scss` and `src/scss/components/_utilities.scss` extracted from the monolithic styles bundle. Luma's `.luma-btn--*` class system is now in its own file; utilities (`.luma-cluster`, `.luma-stack`, `.luma-section`, …) live alongside.
- **`docs/README.md`** — full component catalog (983 lines) with per-component props, slots, examples, and "when to use what" decision tables. Linked from the root `README.md`.

### Changed
- **Breaking rename:** every `src/ui/*.vue` component gained the `l-` prefix. `src/ui/header.vue` → `src/ui/l-header.vue`, `src/ui/icon.vue` → `src/ui/l-icon.vue`, `src/ui/view.vue` → `src/ui/l-view.vue`. The `src/ds/components/*.vue` files mirror this with the same prefix (`badge.vue` → `l-badge.vue`, `card.vue` → `l-card.vue`, etc.). Apps that import by path (`@pinooxhq/luma/ui/header`) must update to `@pinooxhq/luma/ui/l-header`.
- **Breaking rename:** `LEmptyState` → `LEmptyPanel`. The `LEmptyState` import from `@pinooxhq/luma/ds` continues to work as a deprecated alias for one release and will be removed in `0.4.0`. New code should import `LEmptyPanel` from `@pinooxhq/luma/ui`.
- **Breaking rename:** `src/ds/components/empty-state.vue` → `src/ds/components/l-empty-state.vue`. Same deprecated-alias behaviour for the file path.
- **`src/ds/index.js` and `src/ds/theme-config.js`** updated for the new component naming and the new `LEmptyPanel` export.
- **README.md** — components table expanded to all 14 Luma components, subpath exports table updated, install command now includes `lucide-vue-next` and `sass --save-dev`. Added a pointer to `docs/README.md` for the full reference.
- **Install hint** — `sass` is no longer a runtime dependency of Luma; apps must install it under `devDependencies` to compile `@pinooxhq/luma/styles`. The README install command reflects this.

### Migration (from 0.2.0)

```diff
- import { LEmptyState } from '@pinooxhq/luma/ds';
+ import { LEmptyPanel } from '@pinooxhq/luma/ui';
```

```diff
- import LHeader from '@pinooxhq/luma/ui/header.vue';
+ import { LHeader } from '@pinooxhq/luma/ui';   // barrel now exports it
```

```jsonc
// package.json — your app
{
  "devDependencies": {
+   "sass": "^1.100.0"
  }
}
```

## [0.2.0] — 2026-07-30

### Added
- `package.json` `scripts.pack:check` and `scripts.test:smoke` for offline tarball validation in Node.
- `.github/workflows/ci.yml` — Runs on every push to `main`/`master` and on every PR. Verifies the published tarball contents with `npm run pack:check` and runs a smoke test that installs the tarball into a scratch project and imports every public API.
- `.github/workflows/publish.yml` — Trusted-publisher release workflow. Triggers on `v*` tag pushes, validates tag matches `package.json` version, and publishes with `--provenance --access public` using npm's OIDC trusted publisher flow (no long-lived `NPM_TOKEN` required once the trusted publisher is configured on the npm package page).
- `src/core/env.js` — Node-safe accessors (`env(key, fallback)`, `isDev()`, `isProd()`) for `import.meta.env.*`. Re-exported from the root barrel and from `@pinooxhq/luma/core`.
- Re-exported `env`, `isDev`, `isProd` from `@pinooxhq/luma` and `@pinooxhq/luma/core`.

### Changed
- **Breaking:** `createApp({ AppRoot })` now REQUIRES `AppRoot` (no default `RootShell`). Apps should pass `RootShell` explicitly:
  ```js
  import { createApp } from '@pinooxhq/luma';
  import { RootShell } from '@pinooxhq/luma/layouts';
  createApp({ AppRoot: RootShell, themeConfig, routes });
  ```
  Reason: importing `RootShell.vue` inside `createApp.js` forced every Node-side consumer of `@pinooxhq/luma` (smoke tests, non-Vite bundlers) to resolve `.vue` files at module load. Decoupling makes the root barrel Node-safe.
- **Breaking:** The root barrel (`@pinooxhq/luma`) no longer re-exports `.vue` SFC components (`PCard`, `PBadge`, `PEmptyState`, `PSidebar`, `PTopbar`, `PMobileNav`, `PThemeToggle`, `PIcon`, `PView`, `PHeader`, `RootShell`, `PageLayout`). Apps must import them through subpath exports (`@pinooxhq/luma/ds`, `@pinooxhq/luma/ui`, `@pinooxhq/luma/layouts`) which Vite/Rolldown/Webpack resolve via their `.vue` loaders.
- `setupPrimeVue(app, { IconComponent })` now accepts an optional `IconComponent` instead of importing `PIcon` internally. Apps that want the global `<PIcon>` component should import it from `@pinooxhq/luma/ui` and pass it in:
  ```js
  import { PIcon } from '@pinooxhq/luma/ui';
  setupPrimeVue(app, { IconComponent: PIcon });
  ```
- Replaced direct `import.meta.env.*` reads with `env()` / `isDev()` / `isProd()` helpers across `core/boot.js`, `core/auth/index.js`, and `router/guards.js`. The package now imports cleanly under Node, jsdom, and non-Vite loaders.

### Notes
- Apps that consumed `RootShell`/`PageLayout` or any SFC component from the root barrel must switch to the matching subpath import (`@pinooxhq/luma/layouts`, `@pinooxhq/luma/ui`, `@pinooxhq/luma/ds`). The trade-off is documented in each export entry.
- The `npm` trusted publisher must be configured on https://www.npmjs.com/package/@pinooxhq/luma → Settings → Trusted Publishers before the publish workflow can succeed.

## [0.1.1] — 2026-07-30

### Added
- `package.json` `repository`, `bugs`, and `homepage` fields so npmjs.com displays the GitHub repository link.

## [0.1.0] — 2026-07-29

### Added
- `src/fonts/vazir/` directory with `.eot`, `.woff`, and `.woff2` files for the five bundled weights (Thin, Light, Regular, Medium, Bold).
- `src/scss/_vazir.scss` with `@font-face` declarations and a side-effect import (`@pinooxhq/luma/fonts`) for tree-shaken font bundling.

### Changed
- The default Persian / Arabic web font is now **Vazir**. The typography token stack leads with `'Vazir'` instead of the previous family. Vazir's family name is `Vazir`; weights 100/300/400/500/700 are bundled. Browsers requesting 600 will fall back to the closest available weight (700).
- `package.json#exports` `./fonts` entry now points to `./src/fonts/vazir.js`. The `sideEffects` array lists `./src/fonts/vazir.js` so Vite/Rolldown keep the side-effect import in the bundle.

### Notes
- Apps that previously overrode `themeConfig.font.sans` with a leading custom family should keep that override; nothing else needs to change. The default stack is now `'Vazir', 'Vazirmatn', 'Inter', system-ui, …`.

## [0.1.0] — 2026-07-29

### Added
- Initial release of `@pinooxhq/luma`.
- Design tokens: colors, typography, spacing, radius, shadow, motion, z-index — exposed as both Sass variables (`$px-*`) and CSS custom properties (`--px-*`) on `:root` with `[data-theme="dark"]` overrides.
- Vue 3 design-system components: `PSidebar`, `PTopbar`, `PMobileNav`, `PThemeToggle`, `PCard`, `PBadge`, `PEmptyState`.
- Vue 3 UI primitives: `PIcon` (Lucide wrapper), `PView` (page wrapper), `PHeader` (page header with title, lead, badge).
- `useTheme()` composable plus `initThemeEarly()` and `getActiveTheme()` for light/dark mode with `localStorage` persistence and `prefers-color-scheme` fallback.
- `applyThemeConfig(themeConfig)` and `applyDarkThemeConfig(themeConfig)` for runtime brand/font/layout token overrides via `:root` CSS variables.
- `createApp({ routes, mount, themeConfig, pinia, AppRoot, auth, verifyAuth })` factory that wires Vue, Pinia, vue-router, PrimeVue, theme config, dev bootstrap, and auth (`unauthorized`) redirect handling in a single call.
- `createAppRouter(routes)` router factory plus `authGuard`, `redirectToLogin`, `buildAppPath`, and `resolveHistoryBase` helpers.
- **Auth customization layer.** Five opt-in mechanisms let apps replace Luma's default auth flow without forking the package:
  - `themeConfig.auth.endpoints` — override individual `me` / `login` / `logout` URLs without any code changes.
  - `themeConfig.auth.skipMe` — trust a manager-issued token and skip the cross-app `me()` round-trip.
  - `themeConfig.auth.autoLoginFromUrl` — auto-pickup `?__manager_token=…` JWTs from the manager app.
  - `configureAuth(options)` — replace Luma's default `@pinooxhq/auth` instance entirely (use for non-Pinoox backends: Auth0, Firebase, custom APIs).
  - `createApp({ verifyAuth })` — async hook that fully replaces Luma's built-in session verification. Receives `{ store, route, adoptedFromUrl }` and returns `true` to allow, `false` to redirect.
- New auth exports: `configureAuth`, `getActiveAuth`, `isAuthConfigured`.
- `auth` is now a proxy that always reads from the active instance, so `auth.setToken()`, `auth.me()` and friends work correctly after `configureAuth()` is called.
- `authGuard` reads the active theme config (`auth` block) and the `verifyAuth` hook before falling back to the default `canUserAccess(true)` flow.
- Theme-config helpers exported: `flattenNavItems`, `findNavItemByRoute`, `findPageMeta`, `resolveUserDisplayName`, `buildUserInfo`, `resolveThemeConfig`, `DEFAULT_THEME_CONFIG`.
- `usePage()` composable that reads brand/nav/pageMeta from a per-app config provided through `createApp({ themeConfig })`.
- `PageLayout` and `RootShell` layouts shipped from Luma so themes don't need to re-implement the sidebar/topbar/mobile-nav drawer shell.
- Dev bootstrap helpers (`applyDevBootstrap`, `resolveDevBootstrap`, `getBoot`, `getUrl`, `hasBoot`) moved into Luma core so themes can drop their own `boot.js`.
- New subpath exports: `./composables/*` and `./layouts/*`.
- PrimeVue 4 plugin (`setupPrimeVue`) with the Luma preset (derived from Aura) — primary `#0E73FD`, soft sky alias chain, full light/dark surface palette, ripple on, RTL on.
- SCSS bundles: `tokens`, `base` (reset, scrollbar, focus), `vazir` font-face, `layouts/_layout` (`.px-layout` grid shell), `components/_prime-overrides`, `components/_lucide-icon`.
- `vite.js` preset exporting `lumaAliases` for consumers that still prefer Vite alias-based resolution.
- `package.json#exports` map with `sass`/`style`/`import` conditions so Vite, Sass, and Node all resolve subpaths identically.

### Changed
- Every Sass variable in tokens, layout, and component files is declared `!default` so apps can override via `@use '@pinooxhq/luma/styles' with (...)` or `@use '@pinooxhq/luma/tokens' with (...)`.
- All internal imports use relative paths so the package has no implicit dependency on consumer-side aliases.
- `createApp()` now accepts `auth` and `verifyAuth` options. When `auth` is supplied, `configureAuth()` runs before the first router guard. When `verifyAuth` is supplied, Luma's default session-validation is bypassed entirely.

### Notes
- Apps consume Luma through three customization hooks — `theme.config.js` (runtime CSS variables), `styles/app.scss` (Sass overrides), and `useTheme()` (live mutation) — none of which require editing package source.
- Upgrades are a single `npm update @pinooxhq/luma`; consuming apps never touch the package internals.
