import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    readFrontendConfigEntry,
    resolveAutoThemeDefaults,
    resolveThemeEntry,
} from '../vite-theme-auto.js';

const lumaRoot = path.dirname(fileURLToPath(new URL('../vite.js', import.meta.url)));
const fixtureRoot = path.join(lumaRoot, 'tests', 'fixtures', 'theme');

describe('vite theme auto', () => {
    it('reads entry from frontend.config.php', () => {
        assert.equal(readFrontendConfigEntry(fixtureRoot), 'src/main.js');
    });

    it('resolveThemeEntry prefers frontend.config.php', () => {
        assert.equal(resolveThemeEntry(fixtureRoot), 'src/main.js');
    });

    it('resolveAutoThemeDefaults sets entry and warmup', () => {
        const defaults = resolveAutoThemeDefaults(fixtureRoot);
        assert.equal(defaults.entry, 'src/main.js');
        assert.deepEqual(defaults.warmup, ['./src/main.js']);
        assert.ok(Array.isArray(defaults.extraChunkGroups));
        assert.equal(defaults.fsAllow, undefined);
    });
});
