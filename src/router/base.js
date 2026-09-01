/**
 * App mount path + login URL helpers.
 *
 * Pinoox theme-contexts set `__PINOOX__.url.BASE` (`/` or `/panel`) and
 * `auth.loginUrl` as the **browser** path (`/auth/login` or `/panel/auth/login`).
 * Vue Router history uses BASE; route records stay unprefixed (`/auth/login`).
 * These helpers convert between the two without apps mutating bootstrap.
 */

function pathnameOnly(value = '') {
    const raw = String(value ?? '');
    const noQuery = raw.split('?')[0] || '';
    return noQuery.startsWith('/') ? noQuery : (noQuery === '' ? '' : `/${noQuery}`);
}

/**
 * Normalize a bootstrap BASE. `null` means “not provided”.
 * `'/'` and `'/panel/'` become `'/'` and `'/panel'`.
 */
export function normalizeAppBase(raw) {
    if (raw == null) return null;
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const noTrail = trimmed.replace(/\/+$/, '');
    if (noTrail === '') return '/';
    return noTrail.startsWith('/') ? noTrail : `/${noTrail}`;
}

export function readBootBase() {
    if (typeof globalThis === 'undefined') return null;
    return normalizeAppBase(globalThis.__PINOOX__?.url?.BASE);
}

export function readLoginUrl() {
    if (typeof globalThis === 'undefined') return '/login';
    const fromBoot = globalThis.__PINOOX__?.auth?.loginUrl;
    if (typeof fromBoot === 'string' && fromBoot.trim() !== '') {
        return pathnameOnly(fromBoot) || '/login';
    }
    return '/login';
}

/**
 * Vue Router `createWebHistory()` base.
 * An explicit `'/'` is root — never infer `/auth` from the current URL.
 */
export function resolveHistoryBase() {
    return readBootBase() ?? '/';
}

function hasBasePrefix(path, base) {
    if (!base || base === '/') return false;
    return path === base || path.startsWith(`${base}/`);
}

/**
 * Browser path (includes BASE when the app is mounted under `/panel`).
 * `/auth/login` + `/panel` → `/panel/auth/login`
 * `/panel/auth/login` + `/panel` → `/panel/auth/login` (no double prefix)
 */
export function toBrowserPath(path, base = readBootBase() ?? '/') {
    const appBase = normalizeAppBase(base) ?? '/';
    const route = pathnameOnly(path) || '/';
    if (appBase === '/') {
        return route.startsWith('/') ? route : `/${route}`;
    }
    if (hasBasePrefix(route, appBase)) return route;
    return `${appBase}${route.startsWith('/') ? route : `/${route}`}`;
}

/**
 * Vue Router path (BASE stripped).
 * `/panel/auth/login` + `/panel` → `/auth/login`
 */
export function toRouterPath(path, base = readBootBase() ?? '/') {
    const appBase = normalizeAppBase(base) ?? '/';
    const href = pathnameOnly(path) || '/';
    if (appBase === '/') return href;
    if (href === appBase) return '/';
    if (hasBasePrefix(href, appBase)) {
        const stripped = href.slice(appBase.length) || '/';
        return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }
    return href;
}

function pathMatches(path, prefix) {
    if (!prefix) return false;
    return path === prefix || path.startsWith(`${prefix}/`);
}

function guestPrefixes(appBase, loginHref) {
    const prefixes = new Set([
        toBrowserPath('/auth', appBase),
        toBrowserPath('/login', appBase),
        '/auth',
        '/login',
    ]);
    const parent = loginHref.replace(/\/[^/]+$/, '');
    if (parent && parent !== '/' && parent !== appBase) {
        prefixes.add(parent);
    }
    return prefixes;
}

/**
 * True when `pathname` is a login / guest-auth URL (with or without BASE).
 */
export function isAuthPath(pathname, options = {}) {
    const path = pathnameOnly(pathname);
    if (!path) return false;
    const appBase = normalizeAppBase(options.base ?? readBootBase() ?? '/') ?? '/';
    const loginUrl = pathnameOnly(options.loginUrl ?? readLoginUrl()) || '/login';
    const loginHref = toBrowserPath(loginUrl, appBase);
    const loginRoute = toRouterPath(loginUrl, appBase);

    if (pathMatches(path, loginHref) || pathMatches(path, loginRoute)) {
        return true;
    }

    for (const prefix of guestPrefixes(appBase, loginHref)) {
        if (pathMatches(path, prefix)) return true;
    }
    return false;
}

/**
 * Safe post-login vue-router path from `?redirect=`.
 * Returns `null` when the redirect is missing, off-site, or an auth URL.
 */
export function resolveGuestExit(redirect, options = {}) {
    if (typeof redirect !== 'string') return null;
    if (!redirect.startsWith('/') || redirect.startsWith('//')) return null;
    if (isAuthPath(redirect, options)) return null;
    return toRouterPath(redirect, options.base ?? readBootBase() ?? '/');
}

export default {
    normalizeAppBase,
    readBootBase,
    readLoginUrl,
    resolveHistoryBase,
    toBrowserPath,
    toRouterPath,
    isAuthPath,
    resolveGuestExit,
};
