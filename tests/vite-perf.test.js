import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    LUMA_CHUNK_GROUPS,
    LUMA_OPTIMIZE_DEPS,
    buildChunkConfig,
    devPerfConfig,
    lumaPerfConfig,
    mergeChunkGroups,
} from '../vite-perf.js';

describe('luma vite perf', () => {
    it('defines luma vendor chunk groups', () => {
        const names = LUMA_CHUNK_GROUPS.map((group) => group.name);
        assert.ok(names.includes('vendor-vue'));
        assert.ok(names.includes('vendor-luma'));
        assert.ok(names.includes('vendor-prime'));
    });

    it('merges extra chunk groups after luma defaults', () => {
        const merged = mergeChunkGroups([
            { name: 'vendor-charts', test: /chart\.js/ },
        ]);
        assert.equal(merged.length, LUMA_CHUNK_GROUPS.length + 1);
        assert.equal(merged.at(-1).name, 'vendor-charts');
    });

    it('skips pre-bundling @pinooxhq/luma for local checkout', () => {
        const patch = devPerfConfig({ includeLumaPackage: false });
        assert.equal(patch.optimizeDeps.include.includes('@pinooxhq/luma'), false);
    });

    it('applies build + dev patches from lumaPerfConfig', () => {
        const patch = lumaPerfConfig({
            build: true,
            dev: true,
            warmup: ['./src/main.js'],
            extraChunkGroups: [{ name: 'vendor-charts', test: /chart\.js/ }],
        });

        assert.ok(patch.build?.rolldownOptions?.output?.codeSplitting?.groups?.length);
        assert.ok(patch.optimizeDeps?.include?.length);
        assert.equal(patch.optimizeDeps?.holdUntilCrawlEnd, false);
        assert.deepEqual(patch.server?.warmup?.clientFiles, ['./src/main.js']);
        assert.equal(patch.build?.reportCompressedSize, false);
    });

    it('skips build patch during dev-only perf', () => {
        const patch = lumaPerfConfig({ build: false, dev: true });
        assert.equal(patch.build, undefined);
        assert.ok(patch.optimizeDeps?.include?.length);
    });

    it('buildChunkConfig keeps rolldown codeSplitting groups', () => {
        const patch = buildChunkConfig();
        assert.ok(patch.rolldownOptions.output.codeSplitting.groups.length >= LUMA_CHUNK_GROUPS.length);
        assert.ok(LUMA_OPTIMIZE_DEPS.includes('vue'));
    });
});
