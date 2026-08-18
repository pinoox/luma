import test from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, ref } from 'vue';
import { useFilePicker } from '../src/composables/use-file-picker.js';
import { moveItem, useSortable } from '../src/composables/use-sortable.js';

test('moveItem returns a reordered copy', () => {
    const source = ['a', 'b', 'c'];
    assert.deepEqual(moveItem(source, 0, 2), ['b', 'c', 'a']);
    assert.deepEqual(source, ['a', 'b', 'c']);
});

test('useSortable updates a reactive list', () => {
    const rows = ref(['a', 'b', 'c']);
    const sortable = useSortable(rows);
    sortable.start(2);
    sortable.drop(0);
    assert.deepEqual(rows.value, ['c', 'a', 'b']);
});

test('useFilePicker filters type, size, and single mode', async () => {
    const scope = effectScope();
    const picker = scope.run(() =>
        useFilePicker({
            accept: 'image/*',
            multiple: false,
            maxSize: 100,
        }),
    );

    const files = await picker.select([
        { name: 'notes.txt', type: 'text/plain', size: 10 },
        { name: 'large.png', type: 'image/png', size: 200 },
        { name: 'cover.png', type: 'image/png', size: 50 },
        { name: 'extra.jpg', type: 'image/jpeg', size: 50 },
    ]);

    assert.deepEqual(files.map((file) => file.name), ['cover.png']);
    assert.deepEqual(picker.errors.value.map((error) => error.code), ['type', 'size']);
    scope.stop();
});

test('slugify turns Persian titles into Finglish slugs', async () => {
    const { slugify, sanitizeSlug, toFinglish } = await import('../src/core/slug.js');
    assert.equal(toFinglish('سلام دنیا'), 'salam donya');
    assert.equal(slugify('سلام دنیا'), 'salam-donya');
    assert.equal(slugify('لپتاپ'), 'laptop');
    assert.equal(sanitizeSlug('lap--top'), 'lap-top');
});
