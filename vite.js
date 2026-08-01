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
// Every option below is optional; the plugin is fully usable with
// `luma()`. Pass an object to override defaults.
//
//     luma({
//       dedupe: ['primevue', 'pinia'],  // add to the default list
//       excludeFromOptimize: ['some/peer'],
//       fsAllow: ['/custom/luma/path'],  // extra dirs to allow in dev
//       watchPolling: { usePolling: true, interval: 300 },
//     })

import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';

// Treat THIS package's location as the default `fs.allow` anchor.
// Consumers usually link Luma via `file:`/`link:`, so its absolute path
// can be found by looking at this file's own location.
const here = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);

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
 * Resolve a package's location from the consumer's `node_modules`. Returns
 * `null` if the package isn't installed in the consumer's tree (Luma
 * preserves that gracefully — Vite will then fall back to its own
 * resolution chain).
 */
function resolvePackage(name, consumerRoot) {
    try {
        const resolved = require.resolve(`${name}/package.json`, {
            paths: [consumerRoot],
        });
        return resolved.replace(/\/package\.json$/, '');
    } catch (_) {
        return null;
    }
}

/**
 * The plugin factory. The returned object also exposes
 * `luma.dedupePackages` so consumers (or testing scripts) can introspect
 * what got resolved.
 *
 * @param {{
 *   dedupe?: string[],
 *   excludeFromOptimize?: string[],
 *   fsAllow?: string[],
 *   watchPolling?: { usePolling?: boolean, interval?: number, ignored?: string[] },
 * }} [options]
 */
export default function luma(options = {}) {
    const cfg = {
        dedupe: [...DEFAULT_DEDUPE, ...(options.dedupe ?? [])],
        excludeFromOptimize: [
            ...DEFAULT_EXCLUDE_FROM_OPTIMIZE,
            ...(options.excludeFromOptimize ?? []),
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
            consumerRoot = config.root ?? process.cwd();

            const aliases = Object.fromEntries(
                cfg.dedupe
                    .map((name) => [name, resolvePackage(name, consumerRoot)])
                    .filter(([, path]) => path !== null),
            );
            dedupeAliases = aliases;

            return {
                resolve: {
                    dedupe: cfg.dedupe,
                    alias: aliases,
                },
                optimizeDeps: {
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
                            // Allow the consumer's root so symlinks resolve.
                            fileURLToPath(
                                new URL(
                                    consumerRoot.startsWith('/')
                                        ? `file://${consumerRoot}`
                                        : consumerRoot,
                                    'file:///',
                                ),
                            ),
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
            resolvePackage: (name) =>
                consumerRoot ? resolvePackage(name, consumerRoot) : null,
        },
    };
}

// Named export so consumers can grab helpers without invoking the plugin.
export { resolvePackage };
