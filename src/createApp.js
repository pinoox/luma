/**
 * Luma — `createApp` factory.
 *
 * Wires the entire app shell in one call. Apps just supply `themeConfig`,
 * `routes`, and (optionally) a custom `AppRoot` and `pinia` instance.
 *
 *     import { createApp } from '@pinooxhq/luma';
 *     import themeConfig from '../theme.config.js';
 *     import { routes } from './config/routes.js';
 *
 *     createApp({ themeConfig, routes });
 *
 * `createApp` performs the following steps:
 *   1. Apply runtime theme CSS variables (`applyThemeConfig`).
 *   2. Populate `window.__PINOOX__` in dev mode (`applyDevBootstrap`).
 *   3. Create the Vue app with the root shell layout (`RootShell` or user override).
 *   4. Install PrimeVue, Pinia (active pinia set explicitly), and the router.
 *   5. Wire the `useTheme()` composable globally.
 *   6. Subscribe to `auth.on('unauthorized', ...)`.
 *   7. Mount `#app`.
 *
 * Auth customization options (all optional):
 *   - `themeConfig.auth`        — config block: `endpoints`, `skipMe`,
 *                                  `autoLoginFromUrl`.
 *   - `auth`                    — pinoox-auth options (passed straight to
 *                                  `configureAuth()`). Overrides the defaults
 *                                  read from `__PINOOX__`.
 *   - `verifyAuth({ store, route })` — async hook called by the auth guard.
 *                                  Return `true` to allow, `false` to redirect
 *                                  to login. When provided, Luma skips its
 *                                  built-in `me()` flow entirely.
 */
import { createApp as createVueApp } from 'vue';
import { setActivePinia } from 'pinia';

import { setActiveThemeConfig, resolveThemeConfig } from './ds/theme-config.js';
import { applyThemeConfig } from './customization/applyThemeConfig.js';
import { applyDevBootstrap } from './core/boot.js';
import { applyDocumentDirection, resolveDirection } from './core/direction.js';
import setupPrimeVue from './plugins/primevue.js';
import { useTheme, initThemeEarly } from './ds/composables/use-theme.js';
import {
    auth,
    useAuthStore,
    configureAuth,
    getActiveAuth,
} from './core/auth/index.js';
import { createAppRouter, redirectToLogin } from './router/guards.js';

// `RootShell` is intentionally NOT imported here. It's a Vue SFC, and
// importing it from this module would force Node-side consumers of the
// root barrel (`@pinooxhq/luma`) to resolve `.vue` files. Apps that want
// the default shell can either:
//   1. Import it explicitly from `@pinooxhq/luma/layouts` (resolved by
//      a bundler's `.vue` loader), OR
//   2. Pass their own `AppRoot` component to `createApp()`.
// The default below is `null`, so apps must pass `AppRoot` explicitly.
const DEFAULT_MOUNT = '#app';

let unauthorizedRedirectPending = false;

function wireAuthRedirect() {
    auth.on('unauthorized', async () => {
        if (unauthorizedRedirectPending) return;
        unauthorizedRedirectPending = true;
        try {
            const store = useAuthStore();
            const valid = await store.canUserAccess(true);
            if (!valid && !store.isAuth) {
                redirectToLogin();
            }
        } finally {
            unauthorizedRedirectPending = false;
        }
    });
}

/**
 * Merge `themeConfig.auth.endpoints` into `authOptions.endpoints`. Apps that
 * set `themeConfig.auth.endpoints` get them wired into pinoox-auth at boot.
 * Apps that pass `auth` directly bypass the theme config so explicit options win.
 */
const resolveAuthBootOptions = (themeConfig, authOptions) => {
    if (authOptions && Object.keys(authOptions).length > 0) {
        return authOptions;
    }
    const endpoints = themeConfig?.auth?.endpoints;
    if (endpoints && Object.keys(endpoints).length > 0) {
        return { endpoints };
    }
    return {};
};

/**
 * @param {{
 *   themeConfig?: object,
 *   routes?: Array<object>,
 *   pinia?: object,
 *   mount?: string,
 *   AppRoot?: object,
 *   auth?: object,
 *   verifyAuth?: (ctx: { store, route, adoptedFromUrl }) => Promise<boolean>,
 *   IconComponent?: object,
 *   license?: string,
 * }} options
 *
 * Apps must supply `AppRoot` — usually the `RootShell` component
 * imported from `@pinooxhq/luma/layouts`. There's no default here
 * because that would force a `.vue` import into this module's graph,
 * which breaks Node-side tooling (e.g. `npm run test:smoke`).
 *
 * `license` is the PrimeUI key required by PrimeVue v5+ (community or
 * commercial). Falls back to `__PINOOX__.primevueLicense` or
 * `PRIMEUI_LICENSE` / `VITE_PRIMEUI_LICENSE` when omitted.
 */
export async function createApp(options = {}) {
    const {
        themeConfig: userConfig,
        routes = [],
        pinia,
        mount = DEFAULT_MOUNT,
        AppRoot,
        auth: authOptions,
        verifyAuth,
        IconComponent,
        license,
    } = options;

    if (!AppRoot) {
        throw new Error(
            'createApp() requires an `AppRoot` component. ' +
            'Import the default shell from `@pinooxhq/luma/layouts` ' +
            'and pass it as the third option, or supply your own root ' +
            'component.'
        );
    }

    // 0. Resolve theme config first so auth defaults can read `themeConfig.auth`.
    const config = setActiveThemeConfig(userConfig);

    // 0a. Apply auth overrides (must happen before the first router guard).
    const authBoot = resolveAuthBootOptions(config, authOptions);
    if (Object.keys(authBoot).length > 0) {
        configureAuth(authBoot);
        // The `wireAuthRedirect` listener was attached to the old instance.
        // Re-attach on the new active instance.
        wireAuthRedirect();
    }

    // 0b. Install the verifyAuth hook (read by the router guard).
    if (typeof verifyAuth === 'function') {
        globalThis.__LUMA_VERIFY_AUTH__ = verifyAuth;
    }

    // 1. Dev bootstrap & runtime theme.
    applyDevBootstrap();
    applyThemeConfig({
        brand:  config.brand,
        font:   config.font,
        layout: config.layout,
    });

    // Detect + sync direction so teleported UI (Select, Toast, Confirm) inherits RTL/LTR.
    // Priority: themeConfig.direction → <html dir> → __PINOOX__.direction → ltr
    const direction = resolveDirection(config.direction);
    config.direction = direction;
    applyDocumentDirection(direction);

    // 2. Prime the theme before mounting to avoid flash.
    initThemeEarly();

    // 3. Wire auth-redirect listener (also called after configureAuth above).
    wireAuthRedirect();

    // 4. Build the Vue app.
    const app = createVueApp(AppRoot);

    setupPrimeVue(app, {
        ...(IconComponent ? { IconComponent } : {}),
        ...(license ? { license } : {}),
        rtl: direction === 'rtl',
    });

    // 5. Pinia — install + make active so router guards can use stores.
    if (pinia) {
        app.use(pinia);
        setActivePinia(pinia);
    }

    // 6. Theme composable wired globally.
    const theme = useTheme();
    app.provide('theme', theme);
    app.config.globalProperties.$theme = theme;

    // 7. Router — created asynchronously (lazy-loads vue-router).
    const router = await createAppRouter(routes);
    app.use(router);

    // 8. Mount.
    app.mount(mount);

    return { app, router, config, auth: getActiveAuth() };
}

export default createApp;