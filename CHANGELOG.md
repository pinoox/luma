# Changelog

All notable changes to `@pinooxhq/luma` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] — 2026-07-30

### Changed
- `.github/workflows/publish.yml` — Removed `environment: npm` and `id-token: write` so the workflow runs against repo-level secrets only. The previous version required creating an `npm` environment in repo settings before any job could run, which surfaced as a confusing "deployment failed" error. Provenance can be re-enabled later via npm trusted publishers.

## [0.1.2] — 2026-07-30

### Added
- `.github/workflows/publish.yml` — Tag-based GitHub Actions workflow that builds, validates, and publishes to npm whenever a `v*.*.*` tag is pushed. Includes npm provenance, a `latest` dist-tag, and an automated GitHub Release. (Replaced in v0.1.3.)

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
