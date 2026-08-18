// @pinooxhq/luma — Vite plugin.
//
// Drop-in for `vite.config.js`:
//
//     import { defineConfig } from 'vite';
//     import vue from '@vitejs/plugin-vue';
//     import luma from '@pinooxhq/luma/vite';
//
//     export default defineConfig({
//       plugins: [luma(), vue()],
//     });
//
// What it does (zero config):
//   1. Resolves every package Luma uses (primevue, pinia, vue-router, …)
//      once, against the consumer's `node_modules`. Without this, a
//      `file:`-linked Luma in development keeps its own nested copy of
//      each peer and you end up with two module instances — and two
//      `PrimeVueToastSymbol` identities, so `useToast()` throws
//      "No PrimeVue Toast provided!".
//
//   2. Auto-allows the Luma source directory through `server.fs.allow`
//      and enables polling so HMR fires inside `file:` symlinks (chokidar
//      misses them by default on macOS).
//
//   3. Excludes Luma from `optimizeDeps` pre-bundling so source edits
//      hot-reload without nuking `.vite/deps/`. Forces Luma through SSR
//      `noExternal` so dev-server and build stay consistent.
//
//   4. Optional local checkout — set `LUMA_LOCAL=/path/to/luma-ui` (or pass
//      `luma({ local: '/path/to/luma-ui' })`). Aliases every `@pinooxhq/luma`
//      entry (JS + styles + fonts) to that tree so Sass/Vazir resolve the
//      same as npm. Leave unset to use the published package.
//
// Every option below is optional; the plugin is fully usable with
// `luma()`. Pass an object to override defaults.
//
//     luma({
//       local: '/abs/path/to/luma-ui', // or rely on LUMA_LOCAL
//       dedupe: ['primevue', 'pinia'],
//       excludeFromOptimize: ['some/peer'],
//       fsAllow: ['/extra/path'],
//       watchPolling: { usePolling: true, interval: 300 },
//     })

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Treat THIS package's location as the default `fs.allow` anchor.
// Consumers usually link Luma via `file:`/`link:`, so its absolute path
// can be found by looking at this file's own location.
const here = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Normalize Vite `root` (absolute/relative FS path or file: URL) to an
 * absolute filesystem path. Avoids `new URL(windowsPath)` which treats
 * `C:` as a URL scheme and throws ERR_INVALID_URL_SCHEME.
 *
 * @param {string | null | undefined} root
 * @returns {string}
 */
export function toFsPath(root) {
    if (root == null || root === '') return process.cwd();
    if (typeof root !== 'string') return path.resolve(String(root));
    if (root.startsWith('file:')) {
        return fileURLToPath(root);
    }
    return path.resolve(root);
}

/**
 * Absolute FS path suitable for Vite `server.fs.allow` on any OS.
 * Round-trips through pathToFileURL so drive letters / UNC stay valid.
 *
 * @param {string} fsPath
 * @returns {string}
 */
export function toAllowPath(fsPath) {
    return fileURLToPath(pathToFileURL(toFsPath(fsPath)));
}

/**
 * Packages Luma needs shared with its consumer to avoid duplicated
 * module instances and broken dependency injection.
 */
const DEFAULT_DEDUPE = [
    'vue',
    'pinia',
    'vue-router',
    'axios',
    'primevue',
    '@primevue/core',
    '@primeuix/themes',
    'lucide-vue-next',
    '@pinooxhq/auth',
    '@pinooxhq/slug',
];

/**
 * Packages Luma imports directly. We exclude these from pre-bundling so
 * edits inside a `file:`-linked Luma source dir are picked up by HMR
 * instead of being cached in `.vite/deps/`.
 */
const DEFAULT_EXCLUDE_FROM_OPTIMIZE = [
    '@pinooxhq/luma',
];

/**
 * CJS deps that must be pre-bundled. Without this, Vite may serve
 * `moment-jalaali/index.js` raw and browsers throw:
 * "does not provide an export named 'default'".
 */
const DEFAULT_INCLUDE_IN_OPTIMIZE = [
    'moment-jalaali',
    'moment',
    'jalaali-js',
];

/**
 * Resolve a package's location from the consumer's `node_modules`. Returns
 * `null` if the package isn't installed in the consumer's tree (Luma
 * preserves that gracefully — Vite will then fall back to its own
 * resolution chain).
 */
function resolvePackage(name, consumerRoot) {
    try {
        const resolved = require.resolve(`${name}/package.json`, {
            paths: [toFsPath(consumerRoot)],
        });
        return path.dirname(resolved);
    } catch (_) {
        return null;
    }
}

/**
 * Resolve optional local Luma checkout.
 * Accepts `options.local` / `options.root`, else `LUMA_LOCAL` env.
 *
 * @param {{ local?: string, root?: string }} options
 * @returns {string | null}
 */
export function resolveLocalRoot(options = {}) {
    const raw = String(options.local ?? options.root ?? process.env.LUMA_LOCAL ?? '').trim();
    if (!raw) return null;
    const resolved = toFsPath(raw);
    if (!fs.existsSync(path.join(resolved, 'vite.js'))) {
        console.warn(`[luma] LUMA_LOCAL set but vite.js missing: ${resolved}`);
        return null;
    }
    if (!fs.existsSync(path.join(resolved, 'src', 'fonts', 'vazir'))) {
        console.warn(`[luma] local checkout missing Vazir fonts: ${resolved}`);
    }
    return resolved;
}

/**
 * Full alias map so local JS, Sass, and Vazir font URLs resolve like npm.
 * Longer / more-specific entries must come first (array form).
 *
 * @param {string} lumaRoot
 * @returns {Array<{ find: string | RegExp, replacement: string }>}
 */
export function localLumaAliases(lumaRoot) {
    const root = toFsPath(lumaRoot);
    const join = (...parts) => path.join(root, ...parts);

    return [
        { find: '@pinooxhq/luma/styles/_main', replacement: join('src/scss/main.scss') },
        { find: '@pinooxhq/luma/styles.scss', replacement: join('exports/styles.scss') },
        { find: '@pinooxhq/luma/styles', replacement: join('src/scss/_styles.scss') },
        { find: '@pinooxhq/luma/tokens.scss', replacement: join('exports/tokens.scss') },
        { find: '@pinooxhq/luma/tokens/_index', replacement: join('src/scss/tokens/_index.scss') },
        { find: '@pinooxhq/luma/tokens', replacement: join('src/scss/tokens/_index.scss') },
        { find: '@pinooxhq/luma/fonts', replacement: join('src/fonts/vazir.js') },
        { find: '@pinooxhq/luma/vite', replacement: join('vite.js') },
        { find: '@pinooxhq/luma/preset', replacement: join('exports/preset.js') },
        { find: '@pinooxhq/luma/createApp', replacement: join('src/createApp.js') },
        { find: '@pinooxhq/luma/applyThemeConfig', replacement: join('exports/applyThemeConfig.js') },
        { find: '@pinooxhq/luma/theme-config', replacement: join('src/ds/theme-config.js') },
        { find: '@pinooxhq/luma/core', replacement: join('src/core/index.js') },
        { find: '@pinooxhq/luma/layouts', replacement: join('src/layouts/index.js') },
        { find: '@pinooxhq/luma/ui', replacement: join('src/ui/index.js') },
        { find: '@pinooxhq/luma/ds', replacement: join('src/ds/index.js') },
        { find: '@pinooxhq/luma/composables', replacement: join('src/composables/index.js') },
        { find: '@pinooxhq/luma/plugins', replacement: join('src/plugins/preset.js') },
        { find: '@pinooxhq/luma/router', replacement: join('src/router/guards.js') },
        { find: /^@pinooxhq\/luma\/fonts\/(.*)$/, replacement: join('src/fonts/$1') },
        { find: /^@pinooxhq\/luma\/ui\/(.*)$/, replacement: join('src/ui/$1') },
        { find: /^@pinooxhq\/luma\/ds\/(.*)$/, replacement: join('src/ds/$1') },
        { find: /^@pinooxhq\/luma\/core\/(.*)$/, replacement: join('src/core/$1') },
        { find: /^@pinooxhq\/luma\/layouts\/(.*)$/, replacement: join('src/layouts/$1') },
        { find: /^@pinooxhq\/luma\/composables\/(.*)$/, replacement: join('src/composables/$1') },
        { find: /^@pinooxhq\/luma\/plugins\/(.*)$/, replacement: join('src/plugins/$1') },
        { find: /^@pinooxhq\/luma\/router\/(.*)$/, replacement: join('src/router/$1') },
        { find: /^@pinooxhq\/luma\/styles\/(.*)$/, replacement: join('src/scss/$1') },
        { find: /^@pinooxhq\/luma\/tokens\/(.*)$/, replacement: join('src/scss/tokens/$1') },
        // Exact package root only — never prefix-match `/styles` etc.
        { find: /^@pinooxhq\/luma$/, replacement: join('exports/index.js') },
    ];
}

/**
 * The plugin factory. The returned object also exposes
 * `luma.dedupePackages` so consumers (or testing scripts) can introspect
 * what got resolved.
 *
 * @param {{
 *   local?: string,
 *   root?: string,
 *   dedupe?: string[],
 *   excludeFromOptimize?: string[],
 *   fsAllow?: string[],
 *   watchPolling?: { usePolling?: boolean, interval?: number, ignored?: string[] },
 * }} [options]
 */
export default function luma(options = {}) {
    const localRoot = resolveLocalRoot(options);
    const cfg = {
        dedupe: [...DEFAULT_DEDUPE, ...(options.dedupe ?? [])],
        excludeFromOptimize: [
            ...DEFAULT_EXCLUDE_FROM_OPTIMIZE,
            ...(options.excludeFromOptimize ?? []),
        ],
        includeInOptimize: [
            ...DEFAULT_INCLUDE_IN_OPTIMIZE,
            ...(options.includeInOptimize ?? []),
        ],
        fsAllow: options.fsAllow ?? [],
        watchPolling: options.watchPolling ?? { usePolling: true, interval: 300 },
    };

    let consumerRoot = null;
    let dedupeAliases = {};

    return {
        name: 'pinooxhq-luma',
        enforce: 'pre',

        config(config, env) {
            // Vite passes the consumer's resolved root here. Fall back to
            // process.cwd() if it's not set (SSR-only contexts).
            consumerRoot = toFsPath(config.root ?? process.cwd());

            const aliases = Object.fromEntries(
                cfg.dedupe
                    .map((name) => [name, resolvePackage(name, consumerRoot)])
                    .filter(([, pkgPath]) => pkgPath !== null),
            );
            dedupeAliases = aliases;

            const localAliases = localRoot ? localLumaAliases(localRoot) : [];
            if (localRoot && env?.mode !== 'test') {
                console.info(`[luma] local → ${localRoot}`);
            }

            return {
                resolve: {
                    dedupe: cfg.dedupe,
                    // Array form keeps specific `@pinooxhq/luma/*` entries
                    // ahead of the exact `@pinooxhq/luma` match.
                    alias: [
                        ...localAliases,
                        ...Object.entries(aliases).map(([find, replacement]) => ({
                            find,
                            replacement,
                        })),
                    ],
                },
                optimizeDeps: {
                    include: cfg.includeInOptimize,
                    exclude: cfg.excludeFromOptimize,
                },
                ssr: {
                    noExternal: ['@pinooxhq/luma'],
                },
                server: {
                    fs: {
                        allow: [
                            // Always allow Luma's own source directory.
                            here,
                            ...(localRoot ? [toAllowPath(localRoot)] : []),
                            // Allow the consumer's root so symlinks resolve.
                            // pathToFileURL + fileURLToPath normalizes across
                            // Windows drive letters, UNC, and POSIX paths.
                            toAllowPath(consumerRoot),
                            ...Object.values(aliases).map((pkgPath) => toAllowPath(pkgPath)),
                            ...cfg.fsAllow,
                        ],
                    },
                    watch: cfg.watchPolling,
                },
            };
        },

        /**
         * Expose the resolved aliases for debugging or testing scripts.
         */
        luma: {
            here,
            localRoot,
            resolvePackage: (name) =>
                consumerRoot ? resolvePackage(name, consumerRoot) : null,
        },
    };
}

// Named export so consumers can grab helpers without invoking the plugin.
export { resolvePackage };
