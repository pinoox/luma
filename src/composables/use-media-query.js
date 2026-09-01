import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Reactive match for a CSS media query (e.g. '(max-width: 768px)').
 */
export function useMediaQuery(query) {
    const getMatch = () => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia(query).matches;
    };

    const matches = ref(getMatch());
    let mql = null;

    const onChange = () => {
        matches.value = !!mql?.matches;
    };

    onMounted(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        mql = window.matchMedia(query);
        onChange();
        mql.addEventListener('change', onChange);
    });

    onUnmounted(() => {
        mql?.removeEventListener('change', onChange);
    });

    return matches;
}

/** Default admin mobile breakpoint (aligned with modal drawer / layout). */
export function useIsMobile(maxWidth = 768) {
    return useMediaQuery(`(max-width: ${maxWidth}px)`);
}
