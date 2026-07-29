/**
 * Luma — dev-mode bootstrap helper.
 *
 * Production: PHP `pinoox_bootstrap()` writes `window.__PINOOX__` directly
 * into the HTML. In dev mode (Vite only) the runtime needs the same shape
 * for the router to resolve the history base.
 *
 * Reads every value from `import.meta.env.*`:
 *   VITE_SERVER_URL   — PHP origin (e.g. http://127.0.0.1:8000)
 *   VITE_PROJECT_PATH — project mount path under server
 *   VITE_APP_PATH     — app route segment (e.g. "/sms")
 *   VITE_API_PATH     — explicit API base (overrides derived `<app>/api/`)
 *   VITE_LOCALE       — fallback locale (e.g. "fa")
 *   VITE_DIRECTION    — "rtl" | "ltr"
 *   VITE_TITLE        — fallback document title
 */

function trimSlashes(value, { leading = true, trailing = false } = {}) {
    let result = String(value ?? '');
    if (leading)  result = result.replace(/^\/+/, '');
    if (trailing) result = result.replace(/\/+$/, '');
    return result;
}

function joinPath(...segments) {
    return `/${segments.map((part) => trimSlashes(part)).filter(Boolean).join('/')}`.replace(/\/+/g, '/');
}

function joinOrigin(origin, path) {
    const base = String(origin ?? '').replace(/\/+$/, '');
    if (!base) return path.startsWith('/') ? path : `/${path}`;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`.replace(/([^:]\/)\/+/g, '$1');
}

function ensureTrailingSlash(path) {
    return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Build the runtime bootstrap object (matches PinooxScriptHelper::bootstrap()).
 * Falls back to neutral defaults when env vars are unset.
 */
export function resolveDevBootstrap() {
    const server       = String(import.meta.env.VITE_SERVER_URL ?? '').replace(/\/+$/, '');
    const projectPath  = trimSlashes(import.meta.env.VITE_PROJECT_PATH ?? '', { trailing: true });
    const appSegment   = trimSlashes(import.meta.env.VITE_APP_PATH     ?? '', { trailing: true });
    const appPath      = joinPath(projectPath, appSegment);
    const appPathSlash = ensureTrailingSlash(appPath);
    const apiPath = import.meta.env.VITE_API_PATH
        ? (import.meta.env.VITE_API_PATH.startsWith('/') ? import.meta.env.VITE_API_PATH : `/${import.meta.env.VITE_API_PATH}`)
        : joinPath(appPath, 'api/');

    const site = server || (typeof window !== 'undefined' ? window.location.origin : '/');
    const app  = server ? joinOrigin(server, appPath) : appPath;
    const api  = server ? joinOrigin(server, apiPath) : apiPath;

    return {
        locale: import.meta.env.VITE_LOCALE ?? 'en',
        direction: import.meta.env.VITE_DIRECTION ?? 'ltr',
        title: import.meta.env.VITE_TITLE ?? '',
        url: {
            APP: app,
            BASE: appPathSlash,
            API: ensureTrailingSlash(api),
            SITE: site,
        },
    };
}

/**
 * Populate `window.__PINOOX__` for Vite-only dev runs.
 * No-op in production (PHP sets it via `pinoox_bootstrap()`) and when the
 * page already has a bootstrap injected.
 */
export function applyDevBootstrap() {
    if (import.meta.env.PROD) return;
    if (typeof globalThis === 'undefined') return;
    if (globalThis.__PINOOX__ != null) return;
    globalThis.__PINOOX__ = resolveDevBootstrap();
}

export function getBoot() {
    return (typeof globalThis !== 'undefined' ? globalThis.__PINOOX__ : null) ?? {};
}

export function getUrl() {
    return getBoot().url ?? {};
}

export function hasBoot() {
    return typeof globalThis !== 'undefined' && globalThis.__PINOOX__ != null;
}

export default applyDevBootstrap;