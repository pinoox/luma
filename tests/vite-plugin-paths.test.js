/**
 * Cross-platform path safety for @pinooxhq/luma/vite.
 *
 * Run: node --test tests/vite-plugin-paths.test.js
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';

import luma, {
    resolvePackage,
    dedupePackageAliases,
    wildcardExportAlias,
    expandWildcardStringAliases,
    toAllowPath,
    toFsPath,
} from '../vite.js';

const isWindows = process.platform === 'win32';
const require = createRequire(import.meta.url);
const lumaDir = fileURLToPath(new URL('..', import.meta.url));

/** Pre-0.4.1 logic that broke on Windows drive paths. */
function legacyAllowPath(consumerRoot) {
    return fileURLToPath(
        new URL(
            consumerRoot.startsWith('/')
                ? `file://${consumerRoot}`
                : consumerRoot,
            'file:///',
        ),
    );
}

function exactAlias(aliases, id) {
    return aliases.find((entry) => {
        if (entry.find === id) return true;
        if (!(entry.find instanceof RegExp)) return false;
        return entry.find.test(id) && !entry.find.test(`${id}/x`);
    });
}

function invokeConfig(root, options = {}) {
    const plugin = luma(options);
    return plugin.config({ root }, { mode: 'development', command: 'serve' });
}

describe('toFsPath', () => {
    it('falls back to cwd for null / undefined / empty', () => {
        assert.equal(toFsPath(null), process.cwd());
        assert.equal(toFsPath(undefined), process.cwd());
        assert.equal(toFsPath(''), process.cwd());
    });

    it('resolves relative paths against cwd', () => {
        const got = toFsPath('.');
        assert.equal(got, path.resolve('.'));
        assert.ok(path.isAbsolute(got));
    });

    it('accepts absolute POSIX-style paths without throwing', () => {
        assert.doesNotThrow(() => toFsPath('/var/www/app'));
        assert.ok(path.isAbsolute(toFsPath('/var/www/app')));
    });

    it('accepts Windows drive paths with backslashes without throwing', () => {
        assert.doesNotThrow(() => toFsPath('C:\\projects\\app'));
        assert.doesNotThrow(() => toFsPath('D:\\Work\\Orbit Theme'));
    });

    it('accepts Windows drive paths with forward slashes without throwing', () => {
        assert.doesNotThrow(() => toFsPath('C:/projects/app'));
        assert.ok(path.isAbsolute(toFsPath(isWindows ? 'C:/projects/app' : '/projects/app')));
    });

    it('decodes file: URLs to filesystem paths', () => {
        const sample = isWindows
            ? path.win32.join('C:\\', 'projects', 'luma')
            : '/home/user/luma';
        const url = pathToFileURL(sample).href;
        const got = toFsPath(url);
        assert.equal(got, fileURLToPath(url));
        assert.ok(path.isAbsolute(got));
    });

    it('handles file: URLs with spaces', () => {
        const sample = isWindows
            ? 'C:\\My Projects\\orbit app'
            : '/home/user/My Projects/orbit app';
        const url = pathToFileURL(sample).href;
        assert.match(url, /%/); // space encoded
        assert.equal(toFsPath(url), fileURLToPath(url));
    });
});

describe('toAllowPath', () => {
    it('never throws for native absolute roots on this OS', () => {
        assert.doesNotThrow(() => toAllowPath(process.cwd()));
        assert.doesNotThrow(() => toAllowPath(lumaDir));
        assert.doesNotThrow(() => toAllowPath(os.tmpdir()));
    });

    it('round-trips to an absolute path Vite can use in fs.allow', () => {
        const allowed = toAllowPath(process.cwd());
        assert.ok(path.isAbsolute(allowed));
        assert.equal(path.normalize(allowed), path.normalize(process.cwd()));
    });

    it('accepts Windows-style drive strings without ERR_INVALID_URL_SCHEME', () => {
        for (const root of [
            'C:\\projects\\com_pinoox_orbit\\theme\\orbit',
            'C:/projects/com_pinoox_orbit/theme/orbit',
            'D:\\Apps\\My App\\theme',
        ]) {
            assert.doesNotThrow(() => toAllowPath(root), root);
        }
    });

    it('accepts UNC-style strings without throwing when run on Windows', function () {
        if (!isWindows) this.skip();
        assert.doesNotThrow(() => toAllowPath('\\\\server\\share\\app'));
    });
});

describe('legacy regression (why 0.4.1 exists)', () => {
    it('old new URL(windowsDrive) throws; new helpers do not', () => {
        const winRoot = 'C:\\projects\\com_pinoox_orbit\\theme\\orbit';
        assert.throws(
            () => legacyAllowPath(winRoot),
            (err) =>
                err?.code === 'ERR_INVALID_URL_SCHEME'
                || /Invalid URL|URL must be of scheme file/i.test(String(err)),
        );
        assert.doesNotThrow(() => toAllowPath(winRoot));
        assert.doesNotThrow(() => toFsPath(winRoot));
    });

    it('old logic worked for POSIX absolute paths on POSIX; new works everywhere', () => {
        const posixRoot = '/var/www/orbit';
        if (!isWindows) {
            assert.doesNotThrow(() => legacyAllowPath(posixRoot));
        }
        assert.doesNotThrow(() => toAllowPath(posixRoot));
        assert.ok(path.isAbsolute(toAllowPath(posixRoot)));
    });
});

describe('luma() plugin config hook', () => {
    it('returns fs.allow entries that are absolute and include Luma + consumer root', () => {
        const root = process.cwd();
        const conf = invokeConfig(root);
        const allow = conf.server.fs.allow;
        assert.ok(Array.isArray(allow));
        assert.ok(allow.length >= 2);
        for (const entry of allow) {
            assert.equal(typeof entry, 'string');
            assert.ok(path.isAbsolute(entry), `expected absolute: ${entry}`);
        }
        assert.equal(path.normalize(allow[1]), path.normalize(toAllowPath(root)));
    });

    it('does not throw when Vite root is a Windows drive path string', () => {
        assert.doesNotThrow(() =>
            invokeConfig('C:\\projects\\com_pinoox_orbit\\theme\\orbit'),
        );
        assert.doesNotThrow(() =>
            invokeConfig('C:/projects/com_pinoox_orbit/theme/orbit'),
        );
    });

    it('does not throw when Vite root is a file: URL for this OS', () => {
        const url = pathToFileURL(process.cwd()).href;
        assert.doesNotThrow(() => invokeConfig(url));
        const conf = invokeConfig(url);
        assert.ok(path.isAbsolute(conf.server.fs.allow[1]));
    });

    it('merges custom fsAllow paths', () => {
        const extra = path.join(os.tmpdir(), 'luma-extra-allow');
        const conf = invokeConfig(process.cwd(), { fsAllow: [extra] });
        assert.ok(conf.server.fs.allow.includes(extra));
    });

    it('falls back to cwd when root is omitted', () => {
        const plugin = luma();
        const conf = plugin.config({}, { mode: 'production', command: 'build' });
        assert.equal(
            path.normalize(conf.server.fs.allow[1]),
            path.normalize(toAllowPath(process.cwd())),
        );
    });

    it('resolve.dedupe stays populated', () => {
        const conf = invokeConfig(process.cwd());
        assert.ok(conf.resolve.dedupe.includes('vue'));
        assert.ok(conf.resolve.dedupe.includes('primevue'));
        assert.ok(conf.optimizeDeps.exclude.includes('@pinooxhq/luma'));
    });

    it('aliases @primeuix/themes/aura through wildcard exports when themes is installed', () => {
        const themesDir = resolvePackage('@primeuix/themes', lumaDir);
        if (themesDir == null) return;
        const aliases = dedupePackageAliases('@primeuix/themes', themesDir);
        const wildcard = aliases.find(
            (entry) => entry.find instanceof RegExp && entry.find.test('@primeuix/themes/aura'),
        );
        assert.ok(wildcard);
        assert.equal(
            '@primeuix/themes/aura'.replace(wildcard.find, wildcard.replacement),
            path.join(themesDir, 'dist/aura/index.mjs'),
        );
        const main = aliases.find(
            (entry) => entry.find instanceof RegExp && entry.find.test('@primeuix/themes'),
        );
        assert.ok(main);
        assert.equal(main.find.test('@primeuix/themes/aura'), false);
    });

    it('aliases @pinooxhq/auth/vue through package exports when auth is installed', () => {
        const authDir = resolvePackage('@pinooxhq/auth', lumaDir);
        if (authDir == null) return;
        const conf = invokeConfig(lumaDir);
        const vue = exactAlias(conf.resolve.alias, '@pinooxhq/auth/vue');
        const dirAlias = conf.resolve.alias.find((entry) => entry.find === '@pinooxhq/auth');
        assert.ok(vue || dirAlias);
        if (vue) {
            assert.equal(vue.replacement, path.join(authDir, 'dist/vue/index.js'));
            const main = exactAlias(conf.resolve.alias, '@pinooxhq/auth');
            assert.ok(main);
            assert.equal(main.find.test('@pinooxhq/auth/vue'), false);
        }
    });
});

describe('dedupePackageAliases', () => {
    it('maps package.json subpath exports that are not files at the export key', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-auth-exports-'));
        try {
            fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
                name: '@pinooxhq/auth',
                exports: {
                    '.': { import: './dist/index.js' },
                    './vue': { import: './dist/vue/index.js' },
                },
            }));
            const aliases = dedupePackageAliases('@pinooxhq/auth', dir);
            const vue = exactAlias(aliases, '@pinooxhq/auth/vue');
            assert.ok(vue);
            assert.equal(vue.replacement, path.join(dir, 'dist/vue/index.js'));
            const main = exactAlias(aliases, '@pinooxhq/auth');
            assert.ok(main);
            assert.equal(main.find.test('@pinooxhq/auth/vue'), false);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('keeps a directory alias when subpaths exist on disk', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-dir-alias-'));
        try {
            fs.mkdirSync(path.join(dir, 'vue'));
            fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
                name: 'example',
                exports: {
                    '.': './index.js',
                    './vue': './vue/index.js',
                },
            }));
            const aliases = dedupePackageAliases('example', dir);
            assert.equal(aliases.length, 1);
            assert.equal(aliases[0].find, 'example');
            assert.equal(aliases[0].replacement, dir);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('keeps a directory alias for on-disk ./* wildcards (primevue-style)', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-ondisk-wild-'));
        try {
            fs.mkdirSync(path.join(dir, 'menu', 'style'), { recursive: true });
            fs.writeFileSync(path.join(dir, 'menu', 'index.mjs'), 'export default {}\n');
            fs.writeFileSync(path.join(dir, 'menu', 'style', 'index.mjs'), 'export default {}\n');
            fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
                name: 'primevue',
                exports: {
                    '.': { import: './index.mjs' },
                    './*': { import: './*/index.mjs' },
                },
            }));
            const aliases = dedupePackageAliases('primevue', dir);
            assert.equal(aliases.length, 1);
            assert.equal(aliases[0].find, 'primevue');
            assert.equal(aliases[0].replacement, dir);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('maps wildcard ./* exports so @primeuix/themes/aura hits dist/aura', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-themes-exports-'));
        try {
            fs.mkdirSync(path.join(dir, 'tokens'));
            fs.mkdirSync(path.join(dir, 'dist', 'aura'), { recursive: true });
            fs.writeFileSync(path.join(dir, 'dist', 'aura', 'index.mjs'), 'export default {}\n');
            fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
                name: '@primeuix/themes',
                exports: {
                    '.': { import: './dist/index.mjs' },
                    './tokens': { import: './tokens/index.mjs' },
                    './*': { import: './dist/*/index.mjs' },
                },
            }));
            const aliases = dedupePackageAliases('@primeuix/themes', dir);
            const tokens = exactAlias(aliases, '@primeuix/themes/tokens');
            assert.ok(tokens);
            assert.equal(tokens.replacement, path.join(dir, 'tokens/index.mjs'));

            const aura = exactAlias(aliases, '@primeuix/themes/aura');
            assert.ok(aura);
            assert.equal(aura.replacement, path.join(dir, 'dist/aura/index.mjs'));

            const wildcard = aliases.find(
                (entry) => entry.find instanceof RegExp && entry.find.test('@primeuix/themes/aura'),
            );
            assert.ok(wildcard);
            assert.equal(
                '@primeuix/themes/aura'.replace(wildcard.find, wildcard.replacement),
                path.join(dir, 'dist/aura/index.mjs'),
            );
            assert.equal(wildcard.find.test('@primeuix/themes'), false);

            const main = aliases.find(
                (entry) => entry.find instanceof RegExp && entry.find.test('@primeuix/themes'),
            );
            assert.ok(main);
            assert.equal(main.find.test('@primeuix/themes/aura'), false);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('wildcardExportAlias', () => {
    it('builds a capture-group replacement for ./* → dist/*', () => {
        const alias = wildcardExportAlias(
            '@primeuix/themes',
            '/pkg',
            './*',
            './dist/*/index.mjs',
        );
        assert.ok(alias);
        assert.equal(alias.find.test('@primeuix/themes/aura'), true);
        assert.equal(
            '@primeuix/themes/aura'.replace(alias.find, alias.replacement),
            path.join('/pkg', 'dist/aura/index.mjs'),
        );
    });
});

describe('expandWildcardStringAliases', () => {
    it('lists dist/<name> folders as string aliases', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-wildcard-strings-'));
        try {
            fs.mkdirSync(path.join(dir, 'dist', 'aura'), { recursive: true });
            fs.writeFileSync(path.join(dir, 'dist', 'aura', 'index.mjs'), 'export default {}\n');
            const aliases = expandWildcardStringAliases(
                '@primeuix/themes',
                dir,
                './*',
                './dist/*/index.mjs',
            );
            assert.equal(aliases.length, 1);
            assert.ok(aliases[0].find instanceof RegExp);
            assert.equal(aliases[0].find.test('@primeuix/themes/aura'), true);
            assert.equal(aliases[0].find.test('@primeuix/themes/aura/x'), false);
            assert.equal(aliases[0].replacement, path.join(dir, 'dist/aura/index.mjs'));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('resolveId dedupe', () => {
    it('resolves @primeuix/themes/aura from the consumer node_modules', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-resolveid-'));
        try {
            fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app' }));
            fs.writeFileSync(path.join(dir, 'vite.js'), 'export default function luma() { return {}; }\n');
            const pkg = path.join(dir, 'node_modules', '@primeuix', 'themes');
            fs.mkdirSync(path.join(pkg, 'dist', 'aura'), { recursive: true });
            fs.writeFileSync(path.join(pkg, 'dist', 'aura', 'index.mjs'), 'export default {}\n');
            fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({
                name: '@primeuix/themes',
                exports: {
                    '.': { import: './dist/index.mjs' },
                    './*': { import: './dist/*/index.mjs' },
                },
            }));

            const plugin = luma({ local: dir });
            plugin.config({ root: dir }, { mode: 'test', command: 'serve' });
            const importer = path.join(dir, 'src', 'plugins', 'preset.js');
            fs.mkdirSync(path.dirname(importer), { recursive: true });
            const resolved = plugin.resolveId('@primeuix/themes/aura', importer);
            assert.equal(resolved, path.join(pkg, 'dist/aura/index.mjs'));
            assert.equal(
                plugin.resolveId('@primeuix/themes/aura', path.join(os.tmpdir(), 'other-app', 'main.js')),
                null,
            );
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('resolvePackage', () => {
    it('returns a directory path for an installed package (or null)', () => {
        // Resolve something that definitely exists relative to this package.
        const pkg = resolvePackage('vue', lumaDir);
        if (pkg == null) {
            // Peers may be absent in a bare checkout; null is a valid graceful result.
            assert.equal(pkg, null);
            return;
        }
        assert.ok(path.isAbsolute(pkg));
        assert.doesNotThrow(() => require.resolve('vue/package.json', { paths: [pkg] }));
        assert.equal(path.basename(path.dirname(pkg)) === 'node_modules' || pkg.includes('node_modules'), true);
    });

    it('returns null for a missing package without throwing', () => {
        assert.equal(resolvePackage('definitely-not-a-real-pkg-xyz', lumaDir), null);
    });

    it('resolves packages whose exports omit ./package.json', () => {
        const pkg = resolvePackage('@pinooxhq/auth', lumaDir);
        if (pkg == null) return;
        assert.ok(path.isAbsolute(pkg));
        assert.equal(
            JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8')).name,
            '@pinooxhq/auth',
        );
    });

    it('accepts Windows drive consumerRoot without throwing', () => {
        assert.doesNotThrow(() =>
            resolvePackage('vue', 'C:\\projects\\com_pinoox_orbit\\theme\\orbit'),
        );
    });
});
