import { onUnmounted, unref, watch } from 'vue';
import { beginLocalLoading, endLocalLoading } from '../core/http/loading.js';

/**
 * Registers a local loading surface (table skeleton, page spinner, …).
 * While any surface is active, the global HTTP overlay stays hidden.
 */
export function useLocalLoading(active) {
    let held = false;

    const sync = (on) => {
        if (on && !held) {
            beginLocalLoading();
            held = true;
            return;
        }
        if (!on && held) {
            endLocalLoading();
            held = false;
        }
    };

    watch(() => !!unref(active), sync, { immediate: true });
    onUnmounted(() => sync(false));
}
