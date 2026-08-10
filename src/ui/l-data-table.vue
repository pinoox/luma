<template>
  <DataTable
    v-bind="forwarded"
    :class="rootClass"
    :rows-per-page-options="resolvedRowsPerPageOptions"
  >
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </DataTable>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import DataTable from 'primevue/datatable';

defineOptions({ inheritAttrs: false });

/**
 * LDataTable — PrimeVue DataTable with Luma table chrome.
 *
 * Variants:
 *   soft (default) — floating rows / minimal paginator
 *   classic        — bordered grid from `.luma-table`
 *
 *     <LPanel flush tone="glass" bare>
 *       <LDataTable :value="rows" paginator :rows="20">
 *         <Column field="name" header="Name" />
 *       </LDataTable>
 *     </LPanel>
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
});

const attrs = useAttrs();

const DEFAULT_ROWS_OPTIONS = [20, 50, 100, 500];

const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? DEFAULT_ROWS_OPTIONS,
);

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
