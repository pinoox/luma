import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import luma, {
    collectDedupePackages,
    createAppAliases,
    createLumaViteConfig,
    lumaDoctor,
} from '../vite.js';

const lumaRoot = path.dirname(fileURLToPath(new URL('../vite.js', import.meta.url)));

describe('luma vite config', () => {
    it('collectDedupePackages includes yup and primevue peers', () => {
        const names = collectDedupePackages();
        assert.ok(names.includes('yup'));
        assert.ok(names.includes('@primevue/forms'));
        assert.ok(names.includes('vue'));
        assert.ok(!names.includes('@pinooxhq/luma'));
    });

    it('createAppAliases maps @views to src/views', () => {
        const root = path.join(lumaRoot, 'tests', 'fixtures', 'theme');
        const aliases = createAppAliases(root);
        const views = aliases.find((entry) => entry.find === '@views');
        assert.ok(views);
        assert.match(views.replacement, /src[\\/]views$/);
    });

    it('luma() loads luma.config.js and app aliases', async () => {
        const root = path.join(lumaRoot, 'tests', 'fixtures', 'theme');
        const plugin = luma({ doctor: false });
        const config = await plugin.config({ root }, { mode: 'test', command: 'serve' });
        const views = config.resolve.alias.find((entry) => entry.find === '@views');
        assert.ok(views);
    });

    it('luma() applies auto defaults without luma.config overrides', async () => {
        const root = path.join(lumaRoot, 'tests', 'fixtures', 'theme');
        const plugin = luma({ doctor: false, configFile: 'missing-luma.config.js' });
        const config = await plugin.config({ root }, { mode: 'test', command: 'serve' });
        assert.equal(config.optimizeDeps?.entries?.[0], 'src/main.js');
        assert.deepEqual(config.server?.warmup?.clientFiles, ['./src/main.js']);
    });

    it('createLumaViteConfig returns luma plugin first', async () => {
        const root = path.join(lumaRoot, 'tests', 'fixtures', 'theme');
        const config = await createLumaViteConfig({
            root,
            doctor: false,
            plugins: [{ name: 'stub-app-plugin' }],
        })({ mode: 'test' });

        assert.equal(config.plugins[0].name, 'pinooxhq-luma');
        assert.equal(config.plugins[1].name, 'stub-app-plugin');
        const lumaConfig = await config.plugins[0].config({ root }, { mode: 'test', command: 'serve' });
        assert.ok(Array.isArray(lumaConfig.resolve.alias));
    });

    it('lumaDoctor reports structure', () => {
        const root = path.join(lumaRoot, 'tests', 'fixtures', 'theme');
        const result = lumaDoctor(root, { dedupe: ['vue'] });
        assert.equal(typeof result.ok, 'boolean');
        assert.ok(Array.isArray(result.missing));
    });
});
