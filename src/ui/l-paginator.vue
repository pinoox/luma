<template>
    <div class="luma-paginator" dir="rtl" :class="rootClass">
        <Paginator
            :rows="rows"
            :first="first"
            :total-records="totalRecords"
            :rows-per-page-options="resolvedRowsPerPageOptions"
            :template="resolvedTemplate"
            :current-page-report-template="resolvedPageReportTemplate"
            :page-link-size="pageLinkSize"
            @page="onPage"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Paginator from 'primevue/paginator';
import {
    LUMA_CURRENT_PAGE_REPORT_TEMPLATE,
    LUMA_PAGINATOR_TEMPLATE,
    LUMA_PAGINATOR_TEMPLATE_MINIMAL,
    LUMA_ROWS_PER_PAGE_OPTIONS,
} from '../core/table/paginator.js';

const props = defineProps({
    rows: { type: Number, required: true },
    first: { type: Number, default: 0 },
    totalRecords: { type: Number, default: 0 },
    rowsPerPageOptions: { type: Array, default: null },
    template: { type: String, default: undefined },
    currentPageReportTemplate: { type: String, default: undefined },
    pageLinkSize: { type: Number, default: 5 },
    layout: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'minimal'].includes(v),
    },
});

const emit = defineEmits(['page', 'update:first']);

const rootClass = computed(() => ({
    'luma-paginator--minimal': props.layout === 'minimal',
}));

const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? LUMA_ROWS_PER_PAGE_OPTIONS,
);

const resolvedTemplate = computed(() => {
    if (props.template) return props.template;
    if (props.layout === 'minimal') return LUMA_PAGINATOR_TEMPLATE_MINIMAL;
    return LUMA_PAGINATOR_TEMPLATE;
});

const resolvedPageReportTemplate = computed(
    () => props.currentPageReportTemplate ?? LUMA_CURRENT_PAGE_REPORT_TEMPLATE,
);

function onPage(event) {
    emit('page', event);
    emit('update:first', event.first);
}
</script>
