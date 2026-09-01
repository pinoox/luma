// @pinooxhq/luma — main barrel.
// Apps import from `@pinooxhq/luma` (which maps to this file via `exports`).
//
// NOTE: `.vue` SFC components (`PCard`, `PBadge`, `PEmptyState`,
// `PSidebar`, `PTopbar`, `PMobileNav`, `PThemeToggle`, `PView`,
// `PHeader`, `PIcon`) are NOT re-exported here because Node can't
// resolve `.vue` files without a bundler. Apps consume them through
// the `@pinooxhq/luma/ds` and `@pinooxhq/luma/ui` subpath exports,
// which Vite/Rolldown/Webpack resolve via their `.vue` loaders.

export {
    createAppRouter,
    authGuard,
    redirectToLogin,
    bindAuthRedirect,
    buildAppPath,
    resolveHistoryBase,
    resolveGuestExit,
    isAuthLocation,
    isAuthPath,
    loginRouterLocation,
    toBrowserPath,
    toRouterPath,
    normalizeAppBase,
    prefetchRoute,
    prefetchNavItemsOnIdle,
} from '../src/router/guards.js';

export {
    useAuthStore,
    useAuthRedirect,
    auth,
    http,
    configureAuth,
    getActiveAuth,
    isAuthConfigured,
} from '../src/core/auth/index.js';

export {
    configureHttpLoading,
    useHttpLoading,
    attachHttpLoading,
    beginLocalLoading,
    endLocalLoading,
} from '../src/core/http/loading.js';

export {
    TABLE_SKEL_FLAG,
    TABLE_SKEL_KEY,
    TABLE_SKEL_COUNT,
    createSkeletonRows,
    isSkelRow,
    isSkelRowSelectable,
} from '../src/core/table/skeleton.js';

export {
    LUMA_ROWS_PER_PAGE_OPTIONS,
    LUMA_PAGINATOR_TEMPLATE,
    LUMA_PAGINATOR_TEMPLATE_MINIMAL,
    LUMA_CURRENT_PAGE_REPORT_TEMPLATE,
    primePageReportFromI18n,
} from '../src/core/table/paginator.js';

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
export { useLocalLoading } from '../src/composables/use-local-loading.js';
export { useTableRows } from '../src/composables/use-table-rows.js';
export { useMediaQuery, useIsMobile } from '../src/composables/use-media-query.js';
export { useSwipeReveal } from '../src/composables/use-swipe-reveal.js';

export {
    registerSpotlightProvider,
    useSpotlightProvider,
    useSpotlight,
    openSpotlight,
    closeSpotlight,
    toggleSpotlight,
    bindSpotlightShortcut,
    unbindSpotlightShortcut,
    runSpotlightProviders,
    spotlightShortcutLabel,
} from '../src/composables/use-spotlight.js';

// Dev-mode bootstrap helpers (no-op in production).
export {
    applyDevBootstrap,
    resolveDevBootstrap,
    getBoot,
    getUrl,
    hasBoot,
} from '../src/core/boot.js';

// Pre-built layouts (`RootShell`, `PageLayout`) are SFC components and
// are NOT re-exported here for the same reason as the DS components
// above. Apps import them via `@pinooxhq/luma/layouts` or directly
// from `@pinooxhq/luma/layouts/RootShell.vue` / `PageLayout.vue` —
// both are resolved by Vite/Rolldown/Webpack's `.vue` loaders.

// `createApp` factory — wires PrimeVue, Pinia, router, theme config, dev
// bootstrap, and auth into a single Vue app. Apps import this from
// `@pinooxhq/luma` and call it from their `main.js` with a theme config
// and route definitions.
export { default as createApp } from '../src/createApp.js';

// Safe accessors for `import.meta.env`. Re-exported here so apps can
// read the same Vite variables in a Node-safe way without crashing.
export { env, isDev, isProd } from '../src/core/env.js';
export { resolveDirection, applyDocumentDirection } from '../src/core/direction.js';
export {
    toFinglish,
    toPinglish,
    slugify,
    sanitizeSlug,
    extendLoanwords,
} from '../src/core/slug.js';

export {
    FORM_VALIDATION_KEY,
    getByPath,
    isEmptyValue,
    normalizeFieldErrors,
    parseHttpError,
    useFormValidation,
    useFieldError,
    useEntityForm,
    defineEntity,
} from '../src/composables/index.js';
