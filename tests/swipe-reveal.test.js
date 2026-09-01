import test from 'node:test';
import assert from 'node:assert/strict';
import {
    clampRevealAmount,
    computeOffset,
    dragRevealDelta,
    getRevealSign,
    isHorizontalDrag,
    snapRevealAmount,
} from '../src/composables/swipe-reveal-math.js';

test('getRevealSign flips for rtl', () => {
    assert.equal(getRevealSign('ltr'), -1);
    assert.equal(getRevealSign('rtl'), 1);
});

test('computeOffset applies direction sign', () => {
    assert.equal(computeOffset(80, 'ltr'), -80);
    assert.equal(computeOffset(80, 'rtl'), 80);
});

test('clampRevealAmount bounds reveal', () => {
    assert.equal(clampRevealAmount(-10, 120), 0);
    assert.equal(clampRevealAmount(50, 120), 50);
    assert.equal(clampRevealAmount(200, 120), 120);
});

test('snapRevealAmount uses threshold', () => {
    assert.equal(snapRevealAmount(30, 40, 120), 0);
    assert.equal(snapRevealAmount(40, 40, 120), 120);
    assert.equal(snapRevealAmount(100, 40, 120), 120);
});

test('dragRevealDelta is rtl-aware', () => {
    assert.equal(dragRevealDelta(-50, 'ltr'), 50);
    assert.equal(dragRevealDelta(50, 'rtl'), 50);
});

test('isHorizontalDrag ignores vertical drags', () => {
    assert.equal(isHorizontalDrag(10, 2), true);
    assert.equal(isHorizontalDrag(2, 10), false);
});
