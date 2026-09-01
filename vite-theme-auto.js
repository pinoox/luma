import fs from 'node:fs';
import path from 'node:path';
import { resolvePackage, toFsPath } from './vite.js';

/** Optional deps → prod chunk groups (added only when installed). */
const OPTIONAL_VENDOR_CHUNKS = [
    { dep: 'chart.js', name: 'vendor-charts', test: /node_modules\/chart\.js/ },
];

/**
 * @param {string} root
 * @returns {string | null}
 */
export function readFrontendConfigEntry(root) {
    const file = path.join(toFsPath(root), 'frontend.config.php');
    if (!fs.existsSync(file)) return null;

    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/['"]entry['"]\s*=>\s*['"]([^'"]+)['"]/);
    return match?.[1]?.trim() || null;
}

/**
 * @param {string} root
 * @returns {string | null}
 */
export function readIndexHtmlEntry(root) {
    const fsRoot = toFsPath(root);

    for (const name of ['index.html', 'index.htm']) {
        const file = path.join(fsRoot, name);
        if (!fs.existsSync(file)) continue;

        const html = fs.readFileSync(file, 'utf8');
        const match = html.match(
            /<script[^>]*type\s*=\s*["']module["'][^>]*src\s*=\s*["']([^"']+)["']/i,
        ) ?? html.match(
            /<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*type\s*=\s*["']module["']/i,
        );

        if (match?.[1]) {
            return match[1].replace(/^\//, '');
        }
    }

    return null;
}

/**
 * @param {string} root
 * @returns {string | null}
 */
export function probeEntryFile(root) {
    const fsRoot = toFsPath(root);

    for (const candidate of ['src/main.js', 'src/main.ts', 'main.js', 'main.ts']) {
        if (fs.existsSync(path.join(fsRoot, candidate))) {
            return candidate;
        }
    }

    return null;
}

/**
 * @param {string} root
 * @returns {string}
 */
export function resolveThemeEntry(root) {
    return readFrontendConfigEntry(root)
        ?? readIndexHtmlEntry(root)
        ?? probeEntryFile(root)
        ?? 'src/main.js';
}

/**
 * Map lucide-vue-next → @lucide/vue when the npm alias package is absent.
 *
 * @param {string} root
 * @returns {Record<string, string>}
 */
export function resolveLucideAlias(root) {
    const fsRoot = toFsPath(root);

    if (resolvePackage('lucide-vue-next', fsRoot)) {
        return {};
    }

    const lucideVue = resolvePackage('@lucide/vue', fsRoot);
    if (!lucideVue) {
        return {};
    }

    return { 'lucide-vue-next': lucideVue };
}

/**
 * @param {string} root
 * @returns {Array<{ name: string, test: RegExp }>}
 */
export function resolveAutoChunkGroups(root) {
    const pkgFile = path.join(toFsPath(root), 'package.json');
    if (!fs.existsSync(pkgFile)) return [];

    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
    };

    return OPTIONAL_VENDOR_CHUNKS
        .filter(({ dep }) => deps[dep])
        .map(({ name, test }) => ({ name, test }));
}

/**
 * Auto-discover entry and common layout/view components for server warmup.
 *
 * @param {string} root
 * @returns {string[]}
 */
export function findAutoWarmupFiles(root) {
    const fsRoot = toFsPath(root);
    const files = new Set();
    const entry = resolveThemeEntry(fsRoot);
    if (entry) files.add(`./${entry.replace(/^\.\//, '')}`);

    const commonLayouts = [
        'src/layouts/AppLayout.vue',
        'src/layouts/PageLayout.vue',
        'src/layouts/AuthLayout.vue',
    ];
    for (const layout of commonLayouts) {
        if (fs.existsSync(path.join(fsRoot, layout))) {
            files.add(`./${layout}`);
        }
    }

    const viewsDir = path.join(fsRoot, 'src', 'views');
    if (fs.existsSync(viewsDir)) {
        try {
            const scan = (dir, depth = 0) => {
                if (depth > 2 || files.size >= 16) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const e of entries) {
                    if (files.size >= 16) break;
                    if (e.isDirectory() && !['node_modules', 'components', 'styles', 'composables', 'model'].includes(e.name)) {
                        scan(path.join(dir, e.name), depth + 1);
                    } else if (e.isFile() && e.name.endsWith('.vue') && (e.name.startsWith('Page') || depth === 0)) {
                        const rel = path.relative(fsRoot, path.join(dir, e.name)).replace(/\\/g, '/');
                        files.add(`./${rel}`);
                    }
                }
            };
            scan(viewsDir);
        } catch (_) {}
    }

    return [...files];
}

/**
 * Zero-config defaults for Pinoox Luma themes.
 *
 * @param {string} root
 */
export function resolveAutoThemeDefaults(root) {
    const fsRoot = toFsPath(root);
    const entry = resolveThemeEntry(fsRoot);
    const normalizedEntry = entry.replace(/^\.\//, '');

    return {
        entry: normalizedEntry,
        warmup: findAutoWarmupFiles(fsRoot),
        alias: resolveLucideAlias(fsRoot),
        extraChunkGroups: resolveAutoChunkGroups(fsRoot),
    };
}
