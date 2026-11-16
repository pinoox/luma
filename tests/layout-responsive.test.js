import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lumaRoot = path.resolve(__dirname, '..');

describe('Layout responsiveness and nav drawer styles', () => {
    it('aligns breakpoint between layout and topbar at 1024px', () => {
        const topbarContent = fs.readFileSync(path.resolve(lumaRoot, 'src/ds/components/l-topbar.vue'), 'utf8');
        assert.ok(topbarContent.includes('@media (max-width: 1024px)'), 'topbar menu button must appear when sidebar collapses at 1024px');
    });

    it('provides global px-nav-drawer styles for PrimeVue Drawer', () => {
        const layoutScss = fs.readFileSync(path.resolve(lumaRoot, 'src/scss/layouts/_layout.scss'), 'utf8');
        assert.ok(layoutScss.includes('.px-nav-drawer'), 'layout scss must define responsive .px-nav-drawer');
        assert.ok(layoutScss.includes('.p-drawer-mask'), 'must style .p-drawer-mask backdrop');
    });
});

