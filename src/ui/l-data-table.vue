<template>
  <LMobileTable
    v-if="showMobileLayout"
    class="luma-table luma-mobile-table-host"
    :class="mobileRootClass"
    :value="mobileValue"
    :loading="loading"
    :skeleton-rows="skeletonRows"
    :data-key="resolvedDataKey"
    :paginator="resolvedPaginator"
    :rows="mobileRows"
    :rows-per-page-options="resolvedRowsPerPageOptions"
    :paginator-template="resolvedPaginatorTemplate"
    :current-page-report-template="resolvedPageReportTemplate"
    :swipe-actions="swipeActions"
    :empty-icon="emptyIcon"
    :empty-title="emptyTitle"
    :empty-message="emptyMessage"
    :empty-action-label="emptyActionLabel"
    :empty-action-icon="emptyActionIcon"
    @empty-action="emit('emptyAction')"
  >
    <template v-if="slots['mobile-item']" #mobile-item="slotData">
      <slot name="mobile-item" v-bind="slotData" />
    </template>
    <template v-if="slots['swipe-actions']" #swipe-actions="slotData">
      <slot name="swipe-actions" v-bind="slotData" />
    </template>
    <template v-if="slots['mobile-leading']" #mobile-leading="slotData">
      <slot name="mobile-leading" v-bind="slotData" />
    </template>
  </LMobileTable>

  <DataTable
    v-else
    v-bind="forwarded"
    :class="rootClass"
    :value="tableValue"
    :data-key="resolvedDataKey"
    :paginator="resolvedPaginator"
    :rows="rows"
    :paginator-template="resolvedPaginatorTemplate"
    :current-page-report-template="resolvedPageReportTemplate"
    :is-data-selectable="resolvedSelectable"
    :rows-per-page-options="resolvedRowsPerPageOptions"
  >
    <slot />
    <template v-for="name in desktopSlotNames" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
    <template v-if="useBuiltInEmpty" #empty>
      <LEmptyPanel
        size="sm"
        tone="plain"
        :icon="emptyIcon || 'inbox'"
        :title="emptyTitle"
        :message="emptyMessage"
        :action-label="emptyActionLabel"
        :action-icon="emptyActionIcon"
        @action="emit('emptyAction')"
      />
    </template>
  </DataTable>
</template>

<script setup>
import { computed, onMounted, ref, toRef, useAttrs, useSlots } from 'vue';
import DataTable from 'primevue/datatable';
import LEmptyPanel from './l-empty-panel.vue';
import LMobileTable from './l-mobile-table.vue';
import {
    TABLE_SKEL_COUNT,
    TABLE_SKEL_KEY,
    createSkeletonRows,
    isSkelRowSelectable,
} from '../core/table/skeleton.js';
import {
    LUMA_CURRENT_PAGE_REPORT_TEMPLATE,
    LUMA_PAGINATOR_TEMPLATE,
} from '../core/table/paginator.js';
import { useLocalLoading } from '../composables/use-local-loading.js';
import { useIsMobile } from '../composables/use-media-query.js';

defineOptions({ inheritAttrs: false });

/**
 * LDataTable — PrimeVue DataTable with Luma table chrome.
 *
 * Variants:
 *   soft (default) — floating rows / minimal paginator
 *   classic        — bordered grid from `.luma-table`
 *
 * Loading:
 *   :loading injects skeleton rows, hides the paginator, and suppresses
 *   the global HTTP overlay. Wrap cell bodies with LColumnBody.
 *
 * Mobile:
 *   `mobile` switches to LMobileTable with swipe row actions below
 *   mobileBreakpoint (default 768px). Supply #mobile-item and swipeActions.
 *
 * Empty state (no #empty slot needed):
 *   <LDataTable
 *     :value="rows"
 *     empty-icon="package"
 *     empty-title="No products"
 *     empty-message="Create the first product."
 *     empty-action-label="Add product"
 *     @empty-action="openCreate"
 *   />
 */
const props = defineProps({
    /** 'soft' | 'classic' | 'plain' (no variant modifier — shop tables) */
    variant: {
        type: String,
        default: 'soft',
        validator: (v) => ['soft', 'classic', 'plain'].includes(v),
    },
    value: { type: Array, default: () => [] },
    rows: { type: Number, default: 20 },
    rowsPerPageOptions: {
        type: Array,
        default: null,
    },
    loading: { type: Boolean, default: false },
    skeletonRows: { type: Number, default: TABLE_SKEL_COUNT },
    dataKey: { type: String, default: '' },
    paginator: { type: Boolean, default: false },
    emptyIcon: { type: String, default: '' },
    emptyTitle: { type: String, default: '' },
    emptyMessage: { type: String, default: '' },
    emptyActionLabel: { type: String, default: '' },
    emptyActionIcon: { type: String, default: 'plus' },
    /** Card list + swipe actions below mobileBreakpoint when true. */
    mobile: { type: Boolean, default: false },
    mobileBreakpoint: { type: Number, default: 768 },
    swipeActions: { type: [Array, Function], default: null },
    paginatorTemplate: { type: String, default: undefined },
    currentPageReportTemplate: { type: String, default: undefined },
});

const emit = defineEmits(['emptyAction']);
const attrs = useAttrs();
const slots = useSlots();

/** Slot names reserved for mobile layout (not forwarded to desktop DataTable). */
const MOBILE_SLOT_NAMES = ['mobile-item', 'swipe-actions', 'mobile-leading'];

useLocalLoading(toRef(props, 'loading'));

const isMobile = useIsMobile(props.mobileBreakpoint);
const layoutReady = ref(false);

onMounted(() => {
    layoutReady.value = true;
});

function variantModifier(value) {
    if (value === 'soft') return 'luma-table--soft';
    if (value === 'classic') return 'luma-table--classic';
    return '';
}

const DEFAULT_ROWS_OPTIONS = [20, 50, 100, 500];

const skeletonPlaceholderRows = computed(() => createSkeletonRows(props.skeletonRows));

const tableValue = computed(() => (
    props.loading ? skeletonPlaceholderRows.value : props.value
));

const mobileValue = computed(() => (
    props.loading ? skeletonPlaceholderRows.value : props.value
));

const resolvedDataKey = computed(() => (
    props.loading ? TABLE_SKEL_KEY : (props.dataKey || undefined)
));

const resolvedPaginator = computed(() => (
    props.loading ? false : props.paginator
));

const resolvedSelectable = computed(() => {
    if (props.loading) return isSkelRowSelectable;
    return attrs.isDataSelectable ?? attrs['is-data-selectable'] ?? (() => true);
});

const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? DEFAULT_ROWS_OPTIONS,
);

const resolvedPaginatorTemplate = computed(() => (
    props.paginatorTemplate
    ?? attrs['paginator-template']
    ?? LUMA_PAGINATOR_TEMPLATE
));

const resolvedPageReportTemplate = computed(() => (
    props.currentPageReportTemplate
    ?? attrs['current-page-report-template']
    ?? LUMA_CURRENT_PAGE_REPORT_TEMPLATE
));

const mobileRows = computed(() => props.rows);

const useBuiltInEmpty = computed(() => (
    !slots.empty
    && !!(props.emptyTitle || props.emptyMessage || props.emptyActionLabel || props.emptyIcon)
));

const desktopSlotNames = computed(() => (
    Object.keys(slots).filter((name) => (
        name !== 'default' && !MOBILE_SLOT_NAMES.includes(name)
    ))
));

const showMobileLayout = computed(() => (
    layoutReady.value && props.mobile && isMobile.value
));

const rootClass = computed(() => [
    'luma-table',
    variantModifier(props.variant),
    props.loading ? 'luma-table--loading' : '',
    attrs.class,
]);

const mobileRootClass = computed(() => [
    variantModifier(props.variant),
    props.loading ? 'luma-table--loading' : '',
    attrs.class,
]);

const forwarded = computed(() => {
    const {
        class: _class,
        value: _value,
        isDataSelectable: _isDataSelectable,
        rows: _rows,
        paginatorTemplate: _paginatorTemplate,
        ...rest
    } = attrs;
    return rest;
});
</script>
