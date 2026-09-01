// @pinooxhq/luma — Vite plugin.
//
// Drop-in for `vite.config.js` — either style works:
//
//     import { defineConfig } from 'vite';
//     import luma from '@pinooxhq/luma/vite';
//     export default defineConfig({ plugins: [vue(), luma()] });
//
//     import { createLumaViteConfig } from '@pinooxhq/luma/vite';
//     export default createLumaViteConfig({ plugins: [vue()] });
//
// Optional app overrides live in `luma.config.js` (warmup, extraChunkGroups, …).
// Local Luma checkout: set LUMA_LOCAL in `.env.local`.
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
import {
    LUMA_OPTIMIZE_DEPS,
    lumaPerfConfig,
} from './vite-perf.js';
import { resolveLumaContext } from './vite-config.js';

// Treat THIS package's location as the default `fs.allow` anchor.
// Consumers usually link Luma via `file:`/`link:`, so its absolute path
// can be found by looking at this file's own location.
const here = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);

/** Packages never deduped / not installed in consumer. */
const DEDUPE_SKIP = new Set(['@pinooxhq/luma', 'sass']);

/** Always include with primevue. */
const DEDUPE_EXTRA = ['@primevue/core'];

/**
 * Peer + direct deps from this package.json — keeps LUMA_LOCAL builds working.
 *
 * @param {string[]} [extra]
 * @returns {string[]}
 */
export function collectDedupePackages(extra = []) {
    const pkg = JSON.parse(fs.readFileSync(path.join(here, 'package.json'), 'utf8'));
    const names = [
        ...Object.keys(pkg.peerDependencies ?? {}),
        ...Object.keys(pkg.dependencies ?? {}),
        ...DEDUPE_EXTRA,
        ...extra,
    ].filter((name) => name && !DEDUPE_SKIP.has(name));

    return [...new Set(names)].sort();
}

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

function isInsideDir(file, dir) {
    if (!file || !dir) return false;
    const resolvedFile = path.resolve(file);
    const resolvedDir = path.resolve(dir);
    return resolvedFile === resolvedDir || resolvedFile.startsWith(`${resolvedDir}${path.sep}`);
}

/**
 * Packages Luma needs shared with its consumer to avoid duplicated
 * module instances and broken dependency injection.
 */
const DEFAULT_DEDUPE = collectDedupePackages();

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
    ...LUMA_OPTIMIZE_DEPS,
];

/**
 * Resolve a package's location from the consumer's `node_modules`. Returns
 * `null` if the package isn't installed in the consumer's tree (Luma
 * preserves that gracefully — Vite will then fall back to its own
 * resolution chain).
 *
 * Prefer a real `node_modules/<name>/package.json` path. `require.resolve`
 * of `./package.json` fails when the package `exports` map omits that
 * subpath (`@pinooxhq/auth`).
 */
function resolvePackage(name, consumerRoot) {
    const root = toFsPath(consumerRoot);
    const direct = path.join(root, 'node_modules', name, 'package.json');
    if (fs.existsSync(direct)) {
        return path.dirname(direct);
    }

    try {
        const resolved = require.resolve(`${name}/package.json`, {
            paths: [root],
        });
        return path.dirname(resolved);
    } catch (_) {
        try {
            const entry = require.resolve(name, { paths: [root] });
            return findPackageRoot(entry, name);
        } catch {
            return null;
        }
    }
}

function findPackageRoot(fromFile, name) {
    let dir = path.dirname(fromFile);
    while (true) {
        const pkgFile = path.join(dir, 'package.json');
        if (fs.existsSync(pkgFile)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
                if (pkg.name === name) return dir;
            } catch {
                // keep walking
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ESM `import` target from a package.json `exports` entry.
 */
function resolveExportTarget(value) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return null;

    const pick = (node) => {
        if (typeof node === 'string') return node;
        if (!node || typeof node !== 'object') return null;
        if (typeof node.default === 'string') return node.default;
        if (typeof node.import === 'string') return node.import;
        return null;
    };

    if (value.import) {
        const fromImport = pick(value.import);
        if (fromImport) return fromImport;
    }
    if (typeof value.default === 'string') return value.default;
    if (value.default && typeof value.default === 'object') {
        const fromDefault = pick(value.default);
        if (fromDefault) return fromDefault;
    }
    return null;
}

function exportKeyExistsOnDisk(pkgDir, exportKey) {
    const relative = exportKey.replace(/^\.\//, '');
    const naive = path.join(pkgDir, relative);
    return (
        fs.existsSync(naive)
        || fs.existsSync(`${naive}.js`)
        || fs.existsSync(`${naive}.mjs`)
        || fs.existsSync(`${naive}.cjs`)
    );
}

function exactIdAlias(id, replacement) {
    return {
        find: new RegExp(`^${escapeRegExp(id)}$`),
        replacement,
    };
}

/**
 * True when a wildcard export is already on disk at the import path
 * (PrimeVue menu/style). A file alias for the parent would prefix-match
 * nested subpaths and yield index.mjs/style. Use a directory alias instead.
 */
export function isOnDiskWildcard(exportKey, target) {
    if (!exportKey.endsWith('/*') || typeof target !== 'string') return false;
    const rel = target.replace(/^\.\//, '');
    const prefix = exportKey.slice(2, -2);
    const starPath = prefix ? `${prefix}/*` : '*';
    return rel === starPath
        || rel === `${starPath}/index.mjs`
        || rel === `${starPath}/index.js`
        || rel === `${starPath}/index.cjs`;
}

/**
 * Turn a remapped exports wildcard ("./*" -> "./dist/<name>/index.mjs")
 * into a Vite regex alias. Capture group 1 is the subpath ("aura").
 *
 * @param {string} name
 * @param {string} pkgDir
 * @param {string} exportKey
 * @param {string} target
 * @returns {{ find: RegExp, replacement: string } | null}
 */
export function wildcardExportAlias(name, pkgDir, exportKey, target) {
    if (!exportKey.endsWith('/*') || !target.includes('*')) return null;
    if (isOnDiskWildcard(exportKey, target)) return null;

    const prefixKey = exportKey.slice(0, -2);
    const importBase = prefixKey === '.' ? name : `${name}${prefixKey.slice(1)}`;
    const replacement = path.join(
        pkgDir,
        ...target.replace(/^\.\//, '').split('/').map((part) => (part === '*' ? '$1' : part)),
    );

    return {
        find: new RegExp(`^${escapeRegExp(importBase)}/(.+)$`),
        replacement,
    };
}

/**
 * Expand a remapped "./*" onto concrete exact aliases by listing the
 * folder that the star stands for (`dist/aura` → `@primeuix/themes/aura`).
 * Finds are exact regex so they cannot prefix-match nested subpaths.
 *
 * @param {string} name
 * @param {string} pkgDir
 * @param {string} exportKey
 * @param {string} target
 * @returns {Array<{ find: RegExp, replacement: string }>}
 */
export function expandWildcardStringAliases(name, pkgDir, exportKey, target) {
    if (!exportKey.endsWith('/*') || !target.includes('*')) return [];
    if (isOnDiskWildcard(exportKey, target)) return [];

    const prefixKey = exportKey.slice(0, -2);
    const importBase = prefixKey === '.' ? name : `${name}${prefixKey.slice(1)}`;
    const parts = target.replace(/^\.\//, '').split('/');
    const starAt = parts.indexOf('*');
    if (starAt < 0) return [];

    const parent = path.join(pkgDir, ...parts.slice(0, starAt));
    if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) return [];

    const aliases = [];
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const filePath = path.join(
            pkgDir,
            ...parts.map((part) => (part === '*' ? entry.name : part)),
        );
        if (!fs.existsSync(filePath)) continue;
        aliases.push(exactIdAlias(`${importBase}/${entry.name}`, filePath));
    }
    return aliases;
}

/**
 * Resolve a bare specifier from a consumer's node_modules using Node exports.
 *
 * @param {string} id
 * @param {Array<string | null | undefined>} roots
 * @returns {string | null}
 */
export function resolveDedupeSpecifier(id, roots) {
    const name = id.startsWith('@')
        ? id.split('/').slice(0, 2).join('/')
        : id.split('/')[0];

    const seen = new Set();
    for (const root of roots) {
        if (root == null || root === '') continue;
        const abs = toFsPath(root);
        if (seen.has(abs)) continue;
        seen.add(abs);

        const pkgDir = resolvePackage(name, abs);
        if (!pkgDir) continue;

        const aliases = dedupePackageAliases(name, pkgDir);
        const exact = aliases.find((entry) => entry.find === id);
        if (exact) return exact.replacement;

        const regex = aliases.find(
            (entry) => entry.find instanceof RegExp && entry.find.test(id),
        );
        if (regex) return id.replace(regex.find, regex.replacement);
    }
    return null;
}

/**
 * Vite aliases for a deduped package that keep Node `exports` subpaths
 * working. A string alias `{ find: '@pinooxhq/auth', replacement: pkgDir }`
 * is a prefix match, so `@pinooxhq/auth/vue` becomes `{pkgDir}/vue` and
 * skips `exports` (`./vue` → `./dist/vue/index.js`). The same bug hits
 * `@primeuix/themes/aura` when the wildcard maps into `dist/<name>/index.mjs`.
 *
 * Packages whose subpath keys already exist on disk and have no wildcard
 * remaps keep the directory alias (vue, pinia). Remapped / wildcard
 * exports get file aliases plus an exact package-name match so the
 * prefix does not swallow `/vue` or `/aura`.
 *
 * @param {string} name
 * @param {string} pkgDir
 * @returns {Array<{ find: string | RegExp, replacement: string }>}
 */
export function dedupePackageAliases(name, pkgDir) {
    let pkg = {};
    try {
        pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    } catch {
        return [{ find: name, replacement: pkgDir }];
    }

    const exportsField = pkg.exports;
    if (!exportsField || typeof exportsField !== 'object' || Array.isArray(exportsField)) {
        return [{ find: name, replacement: pkgDir }];
    }

    const explicit = [];
    const wildcards = [];
    const wildcardStrings = [];
    for (const [key, val] of Object.entries(exportsField)) {
        if (key === '.' || key === './package.json' || !key.startsWith('./')) {
            continue;
        }
        const target = resolveExportTarget(val);
        if (!target) continue;

        if (key.includes('*')) {
            const alias = wildcardExportAlias(name, pkgDir, key, target);
            if (alias) wildcards.push(alias);
            wildcardStrings.push(...expandWildcardStringAliases(name, pkgDir, key, target));
            continue;
        }

        explicit.push({
            id: `${name}${key.slice(1)}`,
            replacement: path.join(pkgDir, target.replace(/^\.\//, '')),
            existsOnDisk: exportKeyExistsOnDisk(pkgDir, key),
        });
    }

    const remapped = explicit.filter((entry) => !entry.existsOnDisk);
    if (wildcards.length === 0 && wildcardStrings.length === 0 && remapped.length === 0) {
        return [{ find: name, replacement: pkgDir }];
    }

    const main = resolveExportTarget(exportsField['.']);
    const explicitAliases = (wildcards.length > 0 || wildcardStrings.length > 0 ? explicit : remapped).map(
        ({ id, replacement }) => exactIdAlias(id, replacement),
    );

    return [
        ...explicitAliases,
        ...wildcardStrings,
        ...wildcards,
        {
            find: new RegExp(`^${escapeRegExp(name)}$`),
            replacement: main ? path.join(pkgDir, main.replace(/^\.\//, '')) : pkgDir,
        },
    ];
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
 * Polling is only needed for LUMA_LOCAL / symlinked installs (chokidar misses them).
 *
 * @param {string} consumerRoot
 * @param {string | null} localRoot
 */
export function needsWatchPolling(consumerRoot, localRoot) {
    if (localRoot) return true;

    const lumaPkg = resolvePackage('@pinooxhq/luma', consumerRoot);
    if (!lumaPkg) return false;

    try {
        return fs.lstatSync(lumaPkg).isSymbolicLink();
    } catch {
        return false;
    }
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
        exactIdAlias('@pinooxhq/luma/styles/_main', join('src/scss/main.scss')),
        exactIdAlias('@pinooxhq/luma/styles.scss', join('exports/styles.scss')),
        exactIdAlias('@pinooxhq/luma/styles', join('src/scss/_styles.scss')),
        exactIdAlias('@pinooxhq/luma/tokens.scss', join('exports/tokens.scss')),
        exactIdAlias('@pinooxhq/luma/tokens/_index', join('src/scss/tokens/_index.scss')),
        exactIdAlias('@pinooxhq/luma/tokens', join('src/scss/tokens/_index.scss')),
        exactIdAlias('@pinooxhq/luma/fonts', join('src/fonts/vazir.js')),
        exactIdAlias('@pinooxhq/luma/vite', join('vite.js')),
        exactIdAlias('@pinooxhq/luma/preset', join('exports/preset.js')),
        exactIdAlias('@pinooxhq/luma/createApp', join('src/createApp.js')),
        exactIdAlias('@pinooxhq/luma/applyThemeConfig', join('exports/applyThemeConfig.js')),
        exactIdAlias('@pinooxhq/luma/theme-config', join('src/ds/theme-config.js')),
        exactIdAlias('@pinooxhq/luma/core', join('src/core/index.js')),
        exactIdAlias('@pinooxhq/luma/layouts', join('src/layouts/index.js')),
        exactIdAlias('@pinooxhq/luma/ui', join('src/ui/index.js')),
        exactIdAlias('@pinooxhq/luma/ds', join('src/ds/index.js')),
        exactIdAlias('@pinooxhq/luma/composables', join('src/composables/index.js')),
        exactIdAlias('@pinooxhq/luma/plugins', join('src/plugins/preset.js')),
        exactIdAlias('@pinooxhq/luma/router', join('src/router/guards.js')),
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
 *   includeInOptimize?: string[],
 *   fsAllow?: string[],
 *   watchPolling?: { usePolling?: boolean, interval?: number, ignored?: string[] },
 *   perf?: boolean,
 *   entry?: string,
 *   warmup?: string[],
 *   extraOptimizeDeps?: string[],
 *   extraChunkGroups?: Array<{ name: string, test: RegExp }>,
 *   chunkSizeWarningLimit?: number,
 *   configFile?: string,
 *   appConfig?: boolean,
 *   doctor?: boolean,
 *   alias?: Record<string, string>,
 *   vite?: import('vite').UserConfig,
 *   server?: import('vite').UserConfig['server'],
 *   resolve?: import('vite').UserConfig['resolve'],
 * }} [options]
 */
export default function luma(options = {}) {
    const perfEnabled = options.perf !== false;
    let localRoot = resolveLocalRoot(options);
    let cfg = {
        dedupe: [...DEFAULT_DEDUPE, ...(options.dedupe ?? [])],
        excludeFromOptimize: [
            ...DEFAULT_EXCLUDE_FROM_OPTIMIZE,
            ...(options.excludeFromOptimize ?? []),
        ],
        includeInOptimize: [
            ...DEFAULT_INCLUDE_IN_OPTIMIZE,
            ...(options.includeInOptimize ?? []),
        ],
        fsAllow: (options.fsAllow ?? []).map((item) => (
            path.isAbsolute(item) ? toAllowPath(item) : item
        )),
        watchPolling: options.watchPolling,
    };

    let consumerRoot = null;
    let dedupeAliases = {};

    return {
        name: 'pinooxhq-luma',
        enforce: 'pre',

        async config(config, env) {
            // Vite passes the consumer's resolved root here. Fall back to
            // process.cwd() if it's not set (SSR-only contexts).
            consumerRoot = toFsPath(config.root ?? options.root ?? process.cwd());

            const ctx = await resolveLumaContext(
                consumerRoot,
                env.mode ?? 'development',
                options,
                { command: env.command },
            );
            localRoot = ctx.localRoot;

            const usePolling = needsWatchPolling(consumerRoot, localRoot);
            const watchPolling = ctx.watchPolling
                ?? options.watchPolling
                ?? (usePolling ? { usePolling: true, interval: 300 } : { usePolling: false });

            cfg = {
                dedupe: [...DEFAULT_DEDUPE, ...ctx.dedupe],
                excludeFromOptimize: [
                    ...DEFAULT_EXCLUDE_FROM_OPTIMIZE,
                    ...(ctx.excludeFromOptimize ?? []),
                    ...(options.excludeFromOptimize ?? []),
                ],
                includeInOptimize: [
                    ...DEFAULT_INCLUDE_IN_OPTIMIZE,
                    ...(ctx.includeInOptimize ?? []),
                    ...(options.includeInOptimize ?? []),
                ],
                fsAllow: ctx.fsAllow,
                watchPolling,
            };

            const perfOn = ctx.perf !== false && perfEnabled;
            const lumaOpts = { ...ctx.lumaNested, ...options };

            const pkgDirs = {};
            const aliases = [];
            for (const name of cfg.dedupe) {
                const pkgPath = resolvePackage(name, consumerRoot);
                if (!pkgPath) continue;
                pkgDirs[name] = pkgPath;
                aliases.push(...dedupePackageAliases(name, pkgPath));
            }
            dedupeAliases = pkgDirs;

            const localAliases = localRoot ? localLumaAliases(localRoot) : [];
            if (localRoot && env?.mode !== 'test') {
                console.info(`[luma] local → ${localRoot}`);
            }

            const perfPatch = perfOn
                ? lumaPerfConfig({
                    entry: ctx.entry,
                    warmup: ctx.warmup,
                    extraOptimizeDeps: [
                        ...ctx.extraOptimizeDeps,
                        ...(lumaOpts.includeInOptimize ?? []),
                    ],
                    extraChunkGroups: ctx.extraChunkGroups,
                    chunkSizeWarningLimit: ctx.chunkSizeWarningLimit,
                    includeLumaPackage: !localRoot,
                    build: env.command === 'build',
                    dev: env.command === 'serve',
                })
                : {};

            const perfOptimize = perfPatch.optimizeDeps ?? {};
            delete perfPatch.optimizeDeps;
            const perfServer = perfPatch.server ?? {};
            delete perfPatch.server;

            const optimizeInclude = [
                ...new Set([
                    ...cfg.includeInOptimize,
                    ...(perfOptimize.include ?? []),
                ]),
            ];

            const serverFs = {
                ...((ctx.serverPatch ?? {}).fs ?? {}),
                allow: [
                    here,
                    ...(localRoot ? [toAllowPath(localRoot)] : []),
                    toAllowPath(consumerRoot),
                    ...Object.values(pkgDirs).map((pkgPath) => toAllowPath(pkgPath)),
                    ...cfg.fsAllow,
                    ...ctx.extraServerFsAllow,
                ],
            };

            return {
                ...ctx.vitePatch,
                ...perfPatch,
                resolve: {
                    ...ctx.resolvePatch,
                    dedupe: cfg.dedupe,
                    alias: [
                        ...localAliases,
                        ...aliases,
                        ...ctx.appAliases,
                        ...ctx.extraResolveAlias,
                    ],
                },
                optimizeDeps: {
                    entries: perfOptimize.entries,
                    include: optimizeInclude,
                    exclude: cfg.excludeFromOptimize,
                    holdUntilCrawlEnd: perfOptimize.holdUntilCrawlEnd ?? false,
                },
                ssr: {
                    noExternal: ['@pinooxhq/luma'],
                },
                server: {
                    ...ctx.serverPatch,
                    ...perfServer,
                    fs: serverFs,
                    watch: cfg.watchPolling,
                },
            };
        },

        configResolved(resolved) {
            consumerRoot = toFsPath(resolved.root);
        },

        resolveId(id, importer) {
            if (!id || id.startsWith('\0') || id.startsWith('.') || path.isAbsolute(id)) {
                return null;
            }
            const bare = id.replace(/\?.*$/, '');
            const hit = cfg.dedupe.some((name) => bare === name || bare.startsWith(`${name}/`));
            if (!hit) return null;

            // Luma's own files (published package, file: link, or LUMA_LOCAL)
            // sit outside the app graph. Resolve peers from Vite's root so
            // luma() stays zero-config for any consumer.
            const lumaTrees = [here, localRoot].filter(Boolean);
            if (!importer || !lumaTrees.some((dir) => isInsideDir(importer, dir))) {
                return null;
            }

            return resolveDedupeSpecifier(bare, [consumerRoot, process.cwd()]);
        },

        /**
         * Expose the resolved aliases for debugging or testing scripts.
         */
        luma: {
            here,
            get localRoot() {
                return localRoot;
            },
            resolvePackage: (name) =>
                consumerRoot ? resolvePackage(name, consumerRoot) : null,
        },
    };
}

// Named export so consumers can grab helpers without invoking the plugin.
export { resolvePackage };
export {
    createLumaViteConfig,
    createAppAliases,
    loadAppConfig,
    loadThemeEnv,
    lumaDoctor,
    resolveLumaContext,
    syncLumaEnv,
} from './vite-config.js';
export {
    readFrontendConfigEntry,
    resolveAutoThemeDefaults,
    resolveLucideAlias,
    resolveThemeEntry,
} from './vite-theme-auto.js';
export {
    LUMA_CHUNK_GROUPS,
    LUMA_OPTIMIZE_DEPS,
    buildChunkConfig,
    devPerfConfig,
    lumaPerfConfig,
    mergeChunkGroups,
} from './vite-perf.js';
