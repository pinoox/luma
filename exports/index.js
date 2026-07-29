// @pinooxhq/luma — main barrel.
// Apps import from `@pinooxhq/luma` (which maps to this file via `exports`).

export * from '../src/ds/index.js';
export * from '../src/ui/index.js';
export {
    createAppRouter,
    authGuard,
    redirectToLogin,
    buildAppPath,
    resolveHistoryBase,
} from '../src/router/guards.js';
export { useAuthStore, auth, http, configureAuth, getActiveAuth, isAuthConfigured } from '../src/core/auth/index.js';
export { default as setupPrimeVue } from '../src/plugins/primevue.js';
export {
    applyThemeConfig,
    applyDarkThemeConfig,
} from '../src/customization/applyThemeConfig.js';
export {
    useTheme,
    initThemeEarly,
    getActiveTheme,
} from '../src/ds/composables/use-theme.js';
export { default as ConsolePreset } from '../src/plugins/preset.js';

// Theme-config helpers + `usePage` composable (read brand/nav/pageMeta
// from a per-app themeConfig injected by `createApp`).
export {
    flattenNavItems,
    findNavItemByRoute,
    findPageMeta,
    resolveUserDisplayName,
    buildUserInfo,
    resolveThemeConfig,
    setActiveThemeConfig,
    getActiveThemeConfig,
    DEFAULT_THEME_CONFIG,
} from '../src/ds/theme-config.js';
export { usePage } from '../src/composables/use-page.js';

// Dev-mode bootstrap helpers (no-op in production).
export {
    applyDevBootstrap,
    resolveDevBootstrap,
    getBoot,
    getUrl,
    hasBoot,
} from '../src/core/boot.js';

// Pre-built layouts.
export { RootShell, PageLayout } from '../src/layouts/index.js';

// `createApp` factory — wires PrimeVue, Pinia, router, theme config, dev
// bootstrap, and auth into a single Vue app. Apps import this from
// `@pinooxhq/luma` and call it from their `main.js` with a theme config
// and route definitions.
export { default as createApp } from '../src/createApp.js';
