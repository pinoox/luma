<template>
  <DataTable
    v-bind="forwarded"
    :class="rootClass"
    :rows-per-page-options="resolvedRowsPerPageOptions"
  >
    <template v-for="name in slotNames" :key="name" #[name]="slotData">
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
import { computed, useAttrs, useSlots } from 'vue';
import DataTable from 'primevue/datatable';
import LEmptyPanel from './l-empty-panel.vue';

defineOptions({ inheritAttrs: false });

/**
 * LDataTable — PrimeVue DataTable with Luma table chrome.
 *
 * Variants:
 *   soft (default) — floating rows / minimal paginator
 *   classic        — bordered grid from `.luma-table`
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
    /** 'soft' | 'classic' */
    variant: {
        type: String,
        default: 'soft',
        validator: (v) => ['soft', 'classic'].includes(v),
    },
    rowsPerPageOptions: {
        type: Array,
        default: null,
    },
    emptyIcon: { type: String, default: '' },
    emptyTitle: { type: String, default: '' },
    emptyMessage: { type: String, default: '' },
    emptyActionLabel: { type: String, default: '' },
    emptyActionIcon: { type: String, default: 'plus' },
});

const emit = defineEmits(['emptyAction']);
const attrs = useAttrs();
const slots = useSlots();

const DEFAULT_ROWS_OPTIONS = [20, 50, 100, 500];

const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? DEFAULT_ROWS_OPTIONS,
);

const useBuiltInEmpty = computed(() => (
    !slots.empty
    && !!(props.emptyTitle || props.emptyMessage || props.emptyActionLabel || props.emptyIcon)
));

const slotNames = computed(() => Object.keys(slots));

const rootClass = computed(() => [
    'luma-table',
    props.variant === 'soft' ? 'luma-table--soft' : 'luma-table--classic',
    attrs.class,
]);

const forwarded = computed(() => {
    const { class: _class, ...rest } = attrs;
    return rest;
});
</script>
