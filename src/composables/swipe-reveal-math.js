/**
 * Pure swipe-reveal math (RTL-aware). Used by useSwipeReveal and unit tests.
 */

export function getRevealSign(direction) {
    return direction === 'rtl' ? 1 : -1;
}

export function computeOffset(revealAmount, direction) {
    const sign = getRevealSign(direction);
    return sign * revealAmount;
}

export function clampRevealAmount(amount, maxReveal) {
    if (!Number.isFinite(maxReveal) || maxReveal <= 0) return 0;
    return Math.max(0, Math.min(maxReveal, amount));
}

export function snapRevealAmount(amount, threshold, maxReveal) {
    const clamped = clampRevealAmount(amount, maxReveal);
    if (clamped >= threshold) return maxReveal;
    return 0;
}

export function dragRevealDelta(deltaX, direction) {
    return direction === 'rtl' ? deltaX : -deltaX;
}

export function isHorizontalDrag(deltaX, deltaY, minDelta = 5) {
    return Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= minDelta;
}
