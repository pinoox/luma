import {
    auth,
    useAuthStore,
} from '../core/auth/index.js';
import { getActiveThemeConfig, composeMetaTitle } from '../ds/theme-config.js';
import {
    isAuthPath,
    readBootBase,
    readLoginUrl,
    resolveHistoryBase,
    toBrowserPath,
    toRouterPath,
} from './base.js';

export {
    isAuthPath,
    normalizeAppBase,
    readBootBase,
    readLoginUrl,
    resolveGuestExit,
    resolveHistoryBase,
    toBrowserPath,
    toRouterPath,
} from './base.js';

let isFirstSession = false;
let unauthorizedRedirectPending = false;

const authPathOptions = () => ({
    base: readBootBase() ?? resolveHistoryBase(),
    loginUrl: auth.config?.loginUrl ?? readLoginUrl(),
});

export const isAuthLocation = (pathname) => isAuthPath(pathname, authPathOptions());

export const loginRouterLocation = () => {
    const loginUrl = (auth.config?.loginUrl ?? readLoginUrl()).split('?')[0] || '/login';
    return { path: toRouterPath(loginUrl, authPathOptions().base) };
};

/**
 * Convert a route path into the full app-mounted URL. Routes inside
 * `<base>/...` are returned as-is; other routes get the base prepended.
 */
export const buildAppPath = (routePath) => {
    const base = resolveHistoryBase();

    if (typeof routePath === 'string' && routePath !== '' && routePath !== '/') {
        return toBrowserPath(routePath, base);
    }

    if (typeof window === 'undefined') {
        return base === '/' ? '/' : `${base}/`;
    }

    const current = `${window.location.pathname}${window.location.search}`;
    return toBrowserPath(current.split('?')[0] || '/', base) + (current.includes('?') ? `?${current.split('?')[1]}` : '');
};

export const redirectToLogin = (returnPath) => {
    auth.redirectToLogin(buildAppPath(returnPath));
};

/**
 * Subscribe once. Apps that boot their own Vue app (not `createApp()`)
 * pass the router so 401s stay in the SPA under the panel BASE.
 */
export function bindAuthRedirect(routerOrGetter) {
    const getRouter = typeof routerOrGetter === 'function'
        ? routerOrGetter
        : () => routerOrGetter;

    auth.on('unauthorized', async () => {
        if (unauthorizedRedirectPending) return;
        if (typeof window !== 'undefined' && isAuthLocation(window.location.pathname)) {
            return;
        }

        unauthorizedRedirectPending = true;
        try {
            const store = useAuthStore();
            try {
                auth.clearToken?.();
                store.token = null;
                store.user = null;
            } catch {
                // best-effort — still bounce to login
            }

            const router = getRouter?.();
            if (router?.replace) {
                const loc = loginRouterLocation();
                const current = router.currentRoute?.value?.path;
                if (current !== loc.path) {
                    await router.replace(loc);
                }
                return;
            }

            redirectToLogin();
        } finally {
            unauthorizedRedirectPending = false;
        }
    });
}

/**
 * If the manager app passed a JWT via `?__manager_token=...`, persist it as
 * the local auth token (so the next `me()` request carries an
 * `Authorization: Bearer ...` header) and strip the param from the URL.
 *
 * Only runs when `themeConfig.auth.autoLoginFromUrl === true`. Apps that
 * don't want this behavior can leave the flag off; otherwise the JWT is
 * auto-picked-up on first navigation.
 */
const adoptManagerTokenFromUrl = () => {
    if (typeof window === 'undefined') return false;
    try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('__manager_token');
        if (!token) return false;
        try {
            auth.setToken(token);
        } catch (_) {
            // best-effort
        }
      
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Read Luma's auth config block from the active theme config.
 * Apps set this via `createApp({ themeConfig: { auth: {...} } })`.
 */
const readAuthConfig = () => {
    try {
        return getActiveThemeConfig()?.auth ?? {};
    } catch (_) {
        return {};
    }
};

/**
 * Read the optional `verifyAuth` hook installed by `createApp`. Apps supply
 * it via `createApp({ verifyAuth: async ({ store, route }) => true | false })`.
 *
 *   - Return `true`  → allow navigation (no me() call needed).
 *   - Return `false` → abort and let the auth guard's `requiresAuth` check
 *                     decide whether to redirect to login.
 *   - Throw          → treat as failure (same as returning `false`).
 */
const readVerifyAuthHook = () => {
    if (typeof globalThis === 'undefined') return null;
    return typeof globalThis.__LUMA_VERIFY_AUTH__ === 'function'
        ? globalThis.__LUMA_VERIFY_AUTH__
        : null;
};

/**
 * Default session verification for local JWT / cookie apps.
 *
 * Always hydrates the user profile via `me()` (auth/get) so abilities and
 * group_key are available after a refresh. A stored JWT alone is not enough —
 * without the profile, permission-gated nav stays hidden.
 *
 * Opt out with `themeConfig.auth.skipMe: true` (manager-proxied tokens).
 */
const defaultVerifySession = async (store) => {
    await store.canUserAccess(true);
    return !!store.isAuth;
};

/**
 * Navigation guard. Returns `false` to abort, `undefined` to allow,
 * or a string path to redirect.
 */
export async function authGuard(to) {
    const store = useAuthStore();
    const authConfig = readAuthConfig();
    const verifyAuth = readVerifyAuthHook();

    // Adopt manager JWT on the very first guard run (URL query → auth store).
    const adoptedFromUrl = !isFirstSession
        && authConfig.autoLoginFromUrl === true
        && adoptManagerTokenFromUrl();

    store.syncTokenFromStorage();

    if (!isFirstSession) {
        isFirstSession = true;

        // 1. If a verifyAuth hook is provided, let the app decide.
        if (typeof verifyAuth === 'function') {
            try {
                const ok = await verifyAuth({ store, route: to, adoptedFromUrl });
                if (ok !== true && to.meta.requiresAuth) {
                    redirectToLogin(to.fullPath);
                    return false;
                }
                return;
            } catch (_) {
                if (to.meta.requiresAuth) {
                    redirectToLogin(to.fullPath);
                    return false;
                }
                return;
            }
        }

        // 2. Default flow. Honor `auth.skipMe` to skip the cross-app me()
        //    round-trip (useful when the framework's default me() endpoint
        //    is broken or the app just trusts the manager-issued token).
        if (authConfig.skipMe === true) {
            if (store.token) {
                try {
                    store.login(store.token, store.user ?? { manager_proxied: true });
                } catch (_) {
                    // best-effort
                }
            }
        } else {
            await defaultVerifySession(store);
        }
    }

    if (to.meta.requiresAuth && !store.isAuth) {
        redirectToLogin(to.fullPath);
        return false;
    }
}

/**
 * Resolve the `<title>` tag value for the current route.
 * Reads from the active `themeConfig.pageMeta[routeName]` and falls back to brand.
 * Returns the full composed title: "{page} · {brand}".
 */
const resolveDocumentTitle = (to) => {
    try {
        const config = getActiveThemeConfig();
        const name = String(to?.name ?? '');
        const meta = config?.pageMeta?.[name] ?? {};
        const pagePart = meta.metaTitle ?? meta.title ?? '';
        const brandPart = config?.brand?.title ?? '';
        return composeMetaTitle(pagePart, brandPart);
    } catch (_) {
        return '';
    }
};

const routeDefinesLogin = (list = []) =>
    list.some((route) => {
        const path = String(route?.path ?? '');
        const name = String(route?.name ?? '');
        if (name === 'login' || name === 'auth.login') return true;
        if (path === '/login' || path === 'login' || path === '/auth/login' || path === 'auth/login') {
            return true;
        }
        if (Array.isArray(route?.children) && routeDefinesLogin(route.children)) return true;
        return false;
    });

export const createAppRouter = async (routes = []) => {
    const { createRouter, createWebHistory } = await import('vue-router');
    const base = resolveHistoryBase();

    // Remote-auth apps without their own /login get a bounce stub.
    // Local-auth apps that define a `/login` route keep ownership of that path —
    // registering the stub first would abort navigation and break login.
    const resolvedRoutes = routeDefinesLogin(routes)
        ? [...routes]
        : [
            {
                path: '/login',
                beforeEnter: () => {
                    redirectToLogin();
                    return false;
                },
            },
            ...routes,
        ];

    const router = createRouter({
        history: createWebHistory(base),
        routes: resolvedRoutes,
        scrollBehavior() {
            return { top: 0 };
        },
    });

    router.beforeEach(authGuard);

    // Auto-sync `document.title` from the route's pageMeta.
    // Apps that want a custom title for a specific page can set
    // `meta: { title: '...' }` on the route definition.
    router.afterEach((to) => {
        if (typeof document === 'undefined') return;
        // Per-route override takes precedence (e.g. dynamic pages that
        // set `meta: { title: '...' }` via `setPageTitle`).
        const routeOverride = to?.meta?.title;
        const resolved = typeof routeOverride === 'string' && routeOverride.trim() !== ''
            ? routeOverride
            : resolveDocumentTitle(to);
        if (resolved) {
            document.title = resolved;
        }
    });

    return router;
};

export default createAppRouter;
