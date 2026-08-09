/**
 * Cross-platform path safety for @pinooxhq/luma/vite.
 *
 * Run: node --test tests/vite-plugin-paths.test.js
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';

import luma, { resolvePackage, toAllowPath, toFsPath } from '../vite.js';

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

    it('accepts Windows drive consumerRoot without throwing', () => {
        assert.doesNotThrow(() =>
            resolvePackage('vue', 'C:\\projects\\com_pinoox_orbit\\theme\\orbit'),
        );
    });
});
