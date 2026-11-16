import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateVisiblePagePills,
    normalizeDigits,
    toPersianDigits,
} from '../src/core/table/paginator.js';

test('calculateVisiblePagePills generates correct pills with ellipsis', () => {
    // 1 page
    assert.deepEqual(calculateVisiblePagePills(1, 1), [1]);

    // Small total (<= 7)
    assert.deepEqual(calculateVisiblePagePills(3, 5), [1, 2, 3, 4, 5]);

    // Near start
    assert.deepEqual(calculateVisiblePagePills(1, 14), [1, 2, 3, 4, 5, 'ellipsis', 14]);
    assert.deepEqual(calculateVisiblePagePills(4, 14), [1, 2, 3, 4, 5, 'ellipsis', 14]);

    // Middle
    assert.deepEqual(calculateVisiblePagePills(7, 14), [1, 'ellipsis', 6, 7, 8, 'ellipsis', 14]);

    // Near end
    assert.deepEqual(calculateVisiblePagePills(11, 14), [1, 'ellipsis', 10, 11, 12, 13, 14]);
    assert.deepEqual(calculateVisiblePagePills(14, 14), [1, 'ellipsis', 10, 11, 12, 13, 14]);
});

test('toPersianDigits converts digits to Persian', () => {
    assert.equal(toPersianDigits(1234567890), '۱۲۳۴۵۶۷۸۹۰');
    assert.equal(toPersianDigits('278 کاربر'), '۲۷۸ کاربر');
    assert.equal(toPersianDigits(null), '');
});

test('normalizeDigits converts Persian and Arabic digits to ASCII', () => {
    assert.equal(normalizeDigits('۱۲۳'), '123');
    assert.equal(normalizeDigits('٤٥٦'), '456');
    assert.equal(normalizeDigits('  ۷۸  '), '  78  ');
});
