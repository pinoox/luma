import test from 'node:test';
import assert from 'node:assert/strict';
import {
    TABLE_SKEL_COUNT,
    TABLE_SKEL_FLAG,
    TABLE_SKEL_KEY,
    createSkeletonRows,
    isSkelRow,
    isSkelRowSelectable,
} from '../src/core/table/skeleton.js';

test('createSkeletonRows marks placeholder rows', () => {
    const rows = createSkeletonRows();
    assert.equal(rows.length, TABLE_SKEL_COUNT);
    assert.equal(rows[0][TABLE_SKEL_FLAG], true);
    assert.equal(rows[0][TABLE_SKEL_KEY], 'skel-0');
    assert.equal(isSkelRow(rows[0]), true);
    assert.equal(isSkelRow({ id: 1 }), false);
    assert.equal(isSkelRowSelectable({ data: rows[0] }), false);
    assert.equal(isSkelRowSelectable({ data: { id: 1 } }), true);
});

test('createSkeletonRows respects count', () => {
    assert.equal(createSkeletonRows(3).length, 3);
});
