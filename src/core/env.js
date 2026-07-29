/**
 * Safe accessor for `import.meta.env`.
 *
 * Vite/Rolldown expose build-time variables (VITE_SERVER_URL,
 * VITE_APP_PATH, ...) on `import.meta.env`. When this package is
 * consumed in non-Vite environments (Node smoke tests, Node-side
 * tooling, plain ESM loaders), `import.meta.env` is undefined and
 * every property access throws.
 *
 * Use `env('VITE_FOO')` (or `env('VITE_FOO', defaultValue)`) instead
 * of `import.meta.env.VITE_FOO` directly. Falls back to the second
 * argument when the variable is missing.
 */
export const env = (key, fallback = '') => {
    try {
        const value = import.meta?.env?.[key];
        return value === undefined || value === null ? fallback : value;
    } catch (_) {
        return fallback;
    }
};

export const isDev = () => {
    try {
        return import.meta?.env?.DEV === true;
    } catch (_) {
        return false;
    }
};

export const isProd = () => {
    try {
        return import.meta?.env?.PROD === true;
    } catch (_) {
        return true;
    }
};
