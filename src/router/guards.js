import {
    auth,
    useAuthStore,
} from '../core/auth/index.js';
import { getActiveThemeConfig, composeMetaTitle } from '../ds/theme-config.js';
import { isDev } from '../core/env.js';

let isFirstSession = false;

/**
 * Resolve the current app path from the Pinoox bootstrap.
 * App routes live under <url.BASE>; if missing, fall back to '/'.
 */
const getBase = () => {
    if (typeof globalThis === 'undefined') return '/';
    const boot = globalThis.__PINOOX__;
    const base = boot?.url?.BASE;
    if (typeof base !== 'string' || base.trim() === '') {
        return '/';
    }
    const trimmed = base.replace(/\/$/, '');
    return trimmed === '' ? '/' : trimmed;
};

/**
 * Convert a route path into the full app-mounted URL. Routes inside
 * `<base>/...` are returned as-is; other routes get the base prepended.
 */
export const buildAppPath = (routePath) => {
    const base = getBase();

    if (typeof routePath === 'string' && routePath !== '' && routePath !== '/') {
        if (base !== '/' && routePath.startsWith(base)) return routePath;
        if (base === '/') {
            return routePath.startsWith('/') ? routePath : `/${routePath}`;
        }
        return `${base}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
    }

    const current = `${window.location.pathname}${window.location.search}`;
    if (base === '/') {
        return current.startsWith('/') ? current : `/${current}`;
    }
    return current.startsWith(base) ? current : `${base}/`;
};

export const redirectToLogin = (returnPath) => {
    auth.redirectToLogin(buildAppPath(returnPath));
};

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
 * Derive the history base from `window.location.pathname` when the
 * bootstrap didn't supply one. Strips the trailing route segment so the
 * router knows where the app is mounted.
 */
const deriveBaseFromLocation = () => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    if (!path || path === '/') return '/';
    // Strip the last segment to keep the route visible inside `<base>/<route>`.
    const idx = path.lastIndexOf('/');
    const candidate = idx > 0 ? path.slice(0, idx) : '/';
    return candidate || '/';
};

export const resolveHistoryBase = () => {
    const base = getBase();
    if (typeof base === 'string' && base !== '') {
        return base;
    }
    const derived = deriveBaseFromLocation();
    if (isDev() && derived !== '/') {
        console.warn(`[luma/router] Missing __PINOOX__.url.BASE; using "${derived}" derived from location`);
    }
    return derived;
};

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
        if (path === '/login' || path === 'login') return true;
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
