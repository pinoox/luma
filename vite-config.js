import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    collectDedupePackages,
    resolveLocalRoot,
    resolvePackage,
    toAllowPath,
    toFsPath,
} from './vite.js';
import { resolveAutoThemeDefaults } from './vite-theme-auto.js';

/** @type {Map<string, Record<string, string>>} */
const themeEnvCache = new Map();

/** @type {Map<string, Record<string, unknown>>} */
const appConfigCache = new Map();

/**
 * Minimal .env loader (avoids hard dependency on vite in this module).
 *
 * @param {string} mode
 * @param {string} root
 * @param {{ reload?: boolean }} [opts]
 * @returns {Record<string, string>}
 */
export function loadThemeEnv(mode, root, opts = {}) {
    const fsRoot = toFsPath(root);
    const cacheKey = `${fsRoot}\0${mode}`;
    if (!opts.reload && themeEnvCache.has(cacheKey)) {
        return themeEnvCache.get(cacheKey);
    }

    /** @type {Record<string, string>} */
    const env = { ...process.env };

    for (const file of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
        const target = path.join(fsRoot, file);
        if (!fs.existsSync(target)) continue;

        for (const line of fs.readFileSync(target, 'utf8').split(/\r?\n/)) {
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            let value = trimmed.slice(idx + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"'))
                || (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    }

    themeEnvCache.set(cacheKey, env);
    return env;
}

/**
 * @param {Record<string, string>} env
 */
export function syncLumaEnv(env) {
    const local = String(env.LUMA_LOCAL || process.env.LUMA_LOCAL || '').trim();
    if (local) process.env.LUMA_LOCAL = local;
}

/**
 * Standard `@/` + `@api` … aliases for Pinoox panel themes.
 *
 * @param {string} rootDir
 * @param {Record<string, string>} [extra]  e.g. { 'lucide-vue-next': '@lucide/vue' }
 */
export function createAppAliases(rootDir, extra = {}) {
    const src = path.join(toFsPath(rootDir), 'src');
    const join = (...parts) => path.join(src, ...parts);

    const defaults = [
        { find: /^@\//, replacement: `${src}/` },
        { find: '@api', replacement: join('api') },
        { find: '@assets', replacement: join('assets') },
        { find: '@views', replacement: join('views') },
        { find: '@pages', replacement: join('views') },
        { find: '@stores', replacement: join('stores') },
        { find: '@layouts', replacement: join('layouts') },
        { find: '@components', replacement: join('components') },
        { find: '@composables', replacement: join('composables') },
        { find: '@config', replacement: join('config') },
        { find: '@utils', replacement: join('utils') },
    ];

    const extras = Object.entries(extra).map(([find, replacement]) => ({
        find,
        replacement: replacement.startsWith('@') || path.isAbsolute(replacement)
            ? replacement
            : path.join(toFsPath(rootDir), replacement),
    }));

    return [...extras, ...defaults];
}

/**
 * @param {string} root
 * @param {string} [configFile]
 * @param {{ reload?: boolean }} [opts]
 */
export async function loadAppConfig(root, configFile = 'luma.config.js', opts = {}) {
    const fsRoot = toFsPath(root);
    const key = `${fsRoot}\0${configFile}`;
    if (!opts.reload && appConfigCache.has(key)) {
        return appConfigCache.get(key);
    }

    const target = path.join(fsRoot, configFile);
    if (!fs.existsSync(target)) {
        appConfigCache.set(key, {});
        return {};
    }

    const mod = await import(`${pathToFileURL(target).href}?t=${Date.now()}`);
    const config = mod.default ?? mod;
    const resolved = typeof config === 'function' ? await config() : config;

    appConfigCache.set(key, resolved);
    return resolved;
}

/**
 * Warn when consumer node_modules is missing Luma deps (common LUMA_LOCAL pitfall).
 *
 * @param {string} consumerRoot
 * @param {Partial<{ dedupe: string[], local: string }>} [options]
 */
export function lumaDoctor(consumerRoot, options = {}) {
    const root = toFsPath(consumerRoot);
    const dedupe = collectDedupePackages(options.dedupe ?? []);
    /** @type {string[]} */
    const missing = [];

    for (const name of dedupe) {
        if (!resolvePackage(name, root)) missing.push(name);
    }

    const localRaw = String(process.env.LUMA_LOCAL ?? options.local ?? '').trim();
    const local = resolveLocalRoot({ local: localRaw || undefined });

    if (localRaw && !local) {
        console.warn(`[luma] LUMA_LOCAL is set but checkout is invalid: ${localRaw}`);
    }

    if (missing.length > 0) {
        console.warn(`[luma] missing in consumer node_modules: ${missing.join(', ')}`);
        console.warn(`[luma] fix: npm install ${missing.join(' ')}`);
    }

    return { ok: missing.length === 0 && (!localRaw || !!local), missing, localRoot: local };
}

/**
 * Merge `luma.config.js`, `.env`, and explicit `luma()` options.
 *
 * @param {string} consumerRoot
 * @param {string} mode
 * @param {Partial<{
 *   configFile: string,
 *   appConfig: boolean,
 *   doctor: boolean,
 *   local: string,
 *   dedupe: string[],
 *   entry: string,
 *   warmup: string[],
 *   extraOptimizeDeps: string[],
 *   extraChunkGroups: Array<{ name: string, test: RegExp }>,
 *   alias: Record<string, string>,
 *   fsAllow: string[],
 *   luma: Record<string, unknown>,
 *   server: import('vite').UserConfig['server'],
 *   resolve: import('vite').UserConfig['resolve'],
 *   vite: import('vite').UserConfig,
 *   excludeFromOptimize: string[],
 *   includeInOptimize: string[],
 *   watchPolling: { usePolling?: boolean, interval?: number, ignored?: string[] },
 *   perf: boolean,
 *   chunkSizeWarningLimit: number,
 * }>} [options]
 * @param {{ command?: string }} [meta]
 */
export async function resolveLumaContext(consumerRoot, mode, options = {}, meta = {}) {
    const root = toFsPath(consumerRoot);
    const command = meta.command ?? 'serve';
    const env = loadThemeEnv(mode, root);
    syncLumaEnv(env);

    const configFile = options.configFile ?? 'luma.config.js';
    const appConfig = options.appConfig === false
        ? {}
        : await loadAppConfig(root, configFile);

    const dedupe = [...new Set([
        ...(options.dedupe ?? []),
        ...(appConfig.dedupe ?? []),
    ])];

    if (
        options.doctor !== false
        && appConfig.doctor !== false
        && command === 'serve'
        && mode !== 'test'
    ) {
        lumaDoctor(root, { dedupe, local: env.LUMA_LOCAL });
    }

    const localRoot = resolveLocalRoot({
        local: options.local ?? env.LUMA_LOCAL,
    });

    const auto = options.auto !== false && appConfig.auto !== false
        ? resolveAutoThemeDefaults(root)
        : {
            entry: 'src/main.js',
            warmup: [],
            alias: {},
            extraChunkGroups: [],
        };

    const entry = options.entry ?? appConfig.entry ?? auto.entry;
    const warmup = options.warmup ?? appConfig.warmup ?? auto.warmup;

    const fsAllowRaw = [...new Set([
        ...(options.fsAllow ?? []),
        ...(appConfig.fsAllow ?? []),
        ...(localRoot ? [localRoot] : []),
    ].map((item) => toAllowPath(path.isAbsolute(item) ? item : path.join(root, item))))];

    const aliasExtra = {
        ...(auto.alias ?? {}),
        ...(appConfig.alias ?? {}),
        ...(options.alias ?? {}),
    };

    const extraChunkGroups = [
        ...(auto.extraChunkGroups ?? []),
        ...(options.extraChunkGroups ?? []),
        ...(appConfig.extraChunkGroups ?? []),
    ];

    return {
        env,
        localRoot,
        appConfig,
        auto,
        entry,
        dedupe,
        warmup,
        extraOptimizeDeps: options.extraOptimizeDeps ?? appConfig.extraOptimizeDeps ?? [],
        extraChunkGroups,
        excludeFromOptimize: options.excludeFromOptimize ?? appConfig.excludeFromOptimize,
        includeInOptimize: options.includeInOptimize ?? appConfig.includeInOptimize,
        watchPolling: options.watchPolling ?? appConfig.watchPolling,
        perf: options.perf ?? appConfig.perf,
        chunkSizeWarningLimit: options.chunkSizeWarningLimit ?? appConfig.chunkSizeWarningLimit,
        fsAllow: fsAllowRaw,
        appAliases: createAppAliases(root, aliasExtra),
        lumaNested: { ...(appConfig.luma ?? {}), ...(options.luma ?? {}) },
        vitePatch: { ...(appConfig.vite ?? {}), ...(options.vite ?? {}) },
        serverPatch: {
            ...(appConfig.server ?? {}),
            ...(options.server ?? {}),
        },
        resolvePatch: {
            ...(appConfig.resolve ?? {}),
            ...(options.resolve ?? {}),
        },
        extraResolveAlias: [
            ...((options.resolve ?? {}).alias ?? []),
            ...((appConfig.resolve ?? {}).alias ?? []),
        ],
        extraServerFsAllow: [
            ...(((options.server ?? {}).fs ?? {}).allow ?? []),
            ...(((appConfig.server ?? {}).fs ?? {}).allow ?? []),
        ],
    };
}

/**
 * @param {Partial<{
 *   root: string,
 *   entry: string,
 *   configFile: string,
 *   doctor: boolean,
 *   dedupe: string[],
 *   warmup: string[],
 *   extraOptimizeDeps: string[],
 *   extraChunkGroups: Array<{ name: string, test: RegExp }>,
 *   alias: Record<string, string>,
 *   plugins: import('vite').PluginOption[] | (() => import('vite').PluginOption[] | Promise<import('vite').PluginOption[]>),
 *   fsAllow: string[],
 *   luma: Record<string, unknown>,
 *   server: import('vite').UserConfig['server'],
 *   resolve: import('vite').UserConfig['resolve'],
 *   vite: import('vite').UserConfig,
 * }>} [options]
 */
export function createLumaViteConfig(options = {}) {
    return async ({ mode = 'development' } = {}) => {
        const root = toFsPath(options.root ?? process.cwd());
        const plugins = options.plugins ?? [];
        const resolvedPlugins = typeof plugins === 'function' ? await plugins() : plugins;

        const { default: luma } = await import('./vite.js');

        return {
            plugins: [
                luma({ ...options, root }),
                ...resolvedPlugins,
            ],
        };
    };
}
