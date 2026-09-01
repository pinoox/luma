<template>
    <div
        class="luma-mobile-table"
        :class="{
            'luma-mobile-table--loading': loading,
        }"
    >
        <div v-if="showEmpty" class="luma-mobile-table__empty">
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
        </div>

        <ul v-else class="luma-mobile-table__list" role="list">
            <li
                v-for="(row, index) in pageRows"
                :key="rowKey(row, index)"
                class="luma-mobile-table__item"
                role="listitem"
            >
                <div class="luma-mobile-table__row">
                    <div v-if="slots['mobile-leading']" class="luma-mobile-table__leading">
                        <LTableSkel v-if="isSkelRow(row)" part="check" />
                        <slot
                            v-else
                            name="mobile-leading"
                            :data="row"
                            :index="index"
                        />
                    </div>

                    <LSwipeReveal
                        class="luma-mobile-table__swipe"
                        :actions="resolvedActions(row)"
                        :disabled="isSkelRow(row) || !hasSwipeActions(row)"
                    >
                        <template v-if="slots['swipe-actions']" #actions>
                            <slot name="swipe-actions" :data="row" :index="index" />
                        </template>

                        <div v-if="isSkelRow(row)" class="luma-mobile-table__skel">
                            <LTableSkel part="product" composite />
                        </div>
                        <slot
                            v-else-if="slots['mobile-item']"
                            name="mobile-item"
                            :data="row"
                            :index="index"
                        />
                    </LSwipeReveal>
                </div>
            </li>
        </ul>

        <LPaginator
            v-if="showPaginator"
            class="luma-mobile-table__paginator"
            :rows="rows"
            :first="first"
            :total-records="totalRecords"
            :rows-per-page-options="resolvedRowsPerPageOptions"
            :template="paginatorTemplate"
            :current-page-report-template="currentPageReportTemplate"
            @page="onPage"
            @update:first="first = $event"
        />
    </div>
</template>

<script setup>
import { computed, ref, useSlots, watch } from 'vue';
import LPaginator from './l-paginator.vue';
import LEmptyPanel from './l-empty-panel.vue';
import LSwipeReveal from './l-swipe-reveal.vue';
import LTableSkel from './l-table-skel.vue';
import {
    TABLE_SKEL_COUNT,
    TABLE_SKEL_KEY,
    createSkeletonRows,
    isSkelRow,
} from '../core/table/skeleton.js';

const MOBILE_SLOT_NAMES = ['mobile-item', 'swipe-actions', 'mobile-leading'];

const props = defineProps({
    value: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    skeletonRows: { type: Number, default: TABLE_SKEL_COUNT },
    dataKey: { type: String, default: 'id' },
    paginator: { type: Boolean, default: false },
    rows: { type: Number, default: 20 },
    rowsPerPageOptions: { type: Array, default: null },
    paginatorTemplate: { type: String, default: undefined },
    currentPageReportTemplate: { type: String, default: undefined },
    swipeActions: { type: [Array, Function], default: null },
    emptyIcon: { type: String, default: '' },
    emptyTitle: { type: String, default: '' },
    emptyMessage: { type: String, default: '' },
    emptyActionLabel: { type: String, default: '' },
    emptyActionIcon: { type: String, default: 'plus' },
});

const emit = defineEmits(['emptyAction', 'update:first']);
const slots = useSlots();

const DEFAULT_ROWS_OPTIONS = [20, 50, 100, 500];

const first = ref(0);

const skeletonPlaceholderRows = computed(() => createSkeletonRows(props.skeletonRows));

const displayRows = computed(() => (
    props.loading ? skeletonPlaceholderRows.value : (props.value ?? [])
));

const totalRecords = computed(() => displayRows.value.length);

const pageRows = computed(() => {
    if (!props.paginator || props.loading) return displayRows.value;
    return displayRows.value.slice(first.value, first.value + props.rows);
});

const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? DEFAULT_ROWS_OPTIONS,
);

const showPaginator = computed(() => props.paginator && !props.loading && totalRecords.value > 0);

const showEmpty = computed(() => (
    !props.loading
    && totalRecords.value === 0
    && (props.emptyTitle || props.emptyMessage || props.emptyActionLabel || props.emptyIcon)
));

watch(() => props.value, () => {
    if (first.value >= totalRecords.value) first.value = 0;
});

function rowKey(row, index) {
    if (isSkelRow(row)) return row[TABLE_SKEL_KEY] ?? `skel-${index}`;
    const key = props.dataKey;
    return row?.[key] ?? index;
}

function resolvedActions(row) {
    if (slots['swipe-actions']) return [];
    const src = props.swipeActions;
    if (!src) return [];
    if (typeof src === 'function') return src(row) ?? [];
    return src;
}

function hasSwipeActions(row) {
    if (slots['swipe-actions']) return true;
    return resolvedActions(row).length > 0;
}

function onPage(event) {
    first.value = event.first;
    emit('update:first', event.first);
}
</script>
