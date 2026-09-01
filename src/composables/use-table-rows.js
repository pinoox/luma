import { computed, unref } from 'vue';
import {
    TABLE_SKEL_COUNT,
    TABLE_SKEL_KEY,
    createSkeletonRows,
    isSkelRow,
    isSkelRowSelectable,
} from '../core/table/skeleton.js';
import { useLocalLoading } from './use-local-loading.js';

export function useTableRows(items, loading, { count = TABLE_SKEL_COUNT, dataKey = 'id' } = {}) {
    useLocalLoading(loading);

    const skeletonRows = createSkeletonRows(count);

    const tableRows = computed(() => (
        unref(loading) ? skeletonRows : (unref(items) ?? [])
    ));

    const tableDataKey = computed(() => (
        unref(loading) ? TABLE_SKEL_KEY : dataKey
    ));

    return {
        tableRows,
        tableDataKey,
        isSkelRow,
        isRowSelectable: isSkelRowSelectable,
    };
}
