/**
 * Resolve text direction for the shell, document, and PrimeVue.
 *
 * Priority:
 *   1. Explicit themeConfig.direction (`rtl` | `ltr`)
 *   2. `<html dir>` / `document.body.dir` (PHP / Twig usually sets this)
 *   3. `window.__PINOOX__.direction` (PHP bootstrap or Vite env)
 *   4. `ltr`
 *
 * @param {unknown} [explicit]
 * @returns {'rtl' | 'ltr'}
 */
export function resolveDirection(explicit) {
    if (explicit === 'rtl' || explicit === 'ltr') {
        return explicit;
    }

    if (typeof document !== 'undefined') {
        const htmlDir = document.documentElement?.getAttribute('dir');
        if (htmlDir === 'rtl' || htmlDir === 'ltr') {
            return htmlDir;
        }
        const bodyDir = document.body?.getAttribute?.('dir') || document.body?.dir;
        if (bodyDir === 'rtl' || bodyDir === 'ltr') {
            return bodyDir;
        }
    }

    const boot = typeof globalThis !== 'undefined' ? globalThis.__PINOOX__ : null;
    const bootDir = boot?.direction;
    if (bootDir === 'rtl' || bootDir === 'ltr') {
        return bootDir;
    }

    return 'ltr';
}

/**
 * Apply direction to `<html>` and bootstrap so teleported UI inherits it.
 *
 * @param {'rtl' | 'ltr'} direction
 */
export function applyDocumentDirection(direction) {
    if (typeof document === 'undefined') return;
    if (direction !== 'rtl' && direction !== 'ltr') return;

    document.documentElement.setAttribute('dir', direction);
    if (globalThis.__PINOOX__) {
        globalThis.__PINOOX__.direction = direction;
    }
}

export default resolveDirection;
