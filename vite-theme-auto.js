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
        warmup: [`./${normalizedEntry}`],
        alias: resolveLucideAlias(fsRoot),
        extraChunkGroups: resolveAutoChunkGroups(fsRoot),
    };
}
