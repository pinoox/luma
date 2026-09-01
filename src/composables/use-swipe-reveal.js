import { computed, onMounted, onUnmounted, ref, toValue, watch } from 'vue';
import { useDrag } from '@vueuse/gesture';
import { resolveDirection } from '../core/direction.js';
import {
    clampRevealAmount,
    computeOffset,
    dragRevealDelta,
    snapRevealAmount,
} from './swipe-reveal-math.js';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Swipe-to-reveal row actions (RTL-aware) via @vueuse/gesture useDrag.
 *
 * @param {{
 *   surfaceRef: import('vue').Ref<HTMLElement | null>,
 *   disabled?: import('vue').MaybeRefOrGetter<boolean>,
 *   direction?: import('vue').MaybeRefOrGetter<'rtl' | 'ltr'>,
 *   threshold?: number,
 * }} options
 */
export function useSwipeReveal(options = {}) {
    const threshold = options.threshold ?? 40;
    const direction = computed(() => toValue(options.direction) ?? resolveDirection());
    const disabled = computed(() => Boolean(toValue(options.disabled)));
    const surfaceRef = options.surfaceRef;

    const revealAmount = ref(0);
    const maxReveal = ref(0);
    const isDragging = ref(false);
    const isOpen = computed(() => revealAmount.value >= maxReveal.value && maxReveal.value > 0);
    const offset = computed(() => computeOffset(revealAmount.value, direction.value));
    const reducedMotion = ref(false);

    let startReveal = 0;
    let mql = null;

    const dragEnabled = computed(() => (
        !disabled.value
        && !reducedMotion.value
        && maxReveal.value > 0
    ));

    useDrag(
        ({ movement: [mx], dragging, first, last }) => {
            if (!dragEnabled.value) return;

            if (first) {
                startReveal = revealAmount.value;
            }

            if (dragging) {
                isDragging.value = true;
                const delta = dragRevealDelta(mx, direction.value);
                revealAmount.value = clampRevealAmount(startReveal + delta, maxReveal.value);
            }

            if (last) {
                isDragging.value = false;
                revealAmount.value = snapRevealAmount(revealAmount.value, threshold, maxReveal.value);
            }
        },
        {
            domTarget: surfaceRef,
            axis: 'x',
            useTouch: true,
            filterTaps: true,
            lockDirection: true,
            threshold: [8, 9999],
            eventOptions: { passive: false },
        },
    );

    const onReducedMotionChange = () => {
        reducedMotion.value = !!mql?.matches;
    };

    onMounted(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        mql = window.matchMedia(REDUCED_MOTION_QUERY);
        onReducedMotionChange();
        mql.addEventListener('change', onReducedMotionChange);
    });

    onUnmounted(() => {
        mql?.removeEventListener('change', onReducedMotionChange);
    });

    watch(disabled, (value) => {
        if (value) revealAmount.value = 0;
    });

    function setMaxReveal(width) {
        maxReveal.value = Math.max(0, width);
        if (revealAmount.value > maxReveal.value) {
            revealAmount.value = maxReveal.value;
        }
    }

    function close() {
        revealAmount.value = 0;
    }

    function open() {
        if (disabled.value || maxReveal.value <= 0) return;
        revealAmount.value = maxReveal.value;
    }

    function toggle() {
        if (isOpen.value) close();
        else open();
    }

    function onEscape(event) {
        if (event.key === 'Escape' && isOpen.value) {
            close();
        }
    }

    return {
        revealAmount,
        maxReveal,
        isOpen,
        isDragging,
        offset,
        reducedMotion,
        setMaxReveal,
        close,
        open,
        toggle,
        onEscape,
    };
}
