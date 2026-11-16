<template>
    <!-- Classic PrimeVue layout fallback when explicitly requested -->
    <div v-if="usePrimePaginator" class="luma-paginator luma-paginator--prime" dir="rtl" :class="rootClass">
        <Paginator
            :rows="resolvedPerPage"
            :first="resolvedFirst"
            :total-records="resolvedTotal"
            :rows-per-page-options="resolvedRowsPerPageOptions"
            :template="resolvedTemplate"
            :current-page-report-template="resolvedPageReportTemplate"
            :page-link-size="pageLinkSize"
            @page="onPrimePage"
        />
    </div>

    <!-- Modern, high-ergonomics, brand-consistent Luma Paginator -->
    <nav
        v-else
        class="luma-paginator"
        :class="rootClass"
        dir="rtl"
        aria-label="صفحه‌بندی جدول"
    >
        <!-- Start section: Summary & Rows-per-page -->
        <div class="luma-paginator__start">
            <span v-if="showSummary" class="luma-paginator__summary">
                <template v-if="resolvedTotal > 0">
                    نمایش
                    <strong class="luma-paginator__num">{{ formatNumber(rangeFrom) }}</strong>
                    تا
                    <strong class="luma-paginator__num">{{ formatNumber(rangeTo) }}</strong>
                    از
                    <strong class="luma-paginator__num">{{ formatNumber(resolvedTotal) }}</strong>
                    {{ itemLabel }}
                </template>
                <template v-else>
                    هیچ {{ itemLabel }}ی یافت نشد
                </template>
            </span>

            <div v-if="showRowsPerPage && resolvedRowsPerPageOptions && resolvedRowsPerPageOptions.length" class="luma-paginator__rpp">
                <label :for="rppSelectId" class="luma-paginator__rpp-label">تعداد در صفحه:</label>
                <div class="luma-paginator__select-wrap">
                    <select
                        :id="rppSelectId"
                        :value="resolvedPerPage"
                        class="luma-paginator__select"
                        :disabled="disabled"
                        @change="onRowsPerPageChange"
                    >
                        <option v-for="opt in resolvedRowsPerPageOptions" :key="opt" :value="opt">
                            {{ formatNumber(opt) }} سطر
                        </option>
                    </select>
                    <LIcon name="chevron-down" :size="12" class="luma-paginator__select-arrow" />
                </div>
            </div>
        </div>

        <!-- Center section: Page navigation & Pills -->
        <div v-if="totalPages > 1 || !compact" class="luma-paginator__center">
            <!-- First Page (RTL: chevrons-right) -->
            <button
                v-if="showFirstLast"
                type="button"
                class="luma-paginator__btn luma-paginator__btn--first"
                :disabled="disabled || currentPage <= 1"
                title="صفحه اول"
                aria-label="صفحه اول"
                @click="goToPage(1)"
            >
                <LIcon name="chevrons-right" :size="15" />
            </button>

            <!-- Prev Page (RTL: chevron-right) -->
            <button
                type="button"
                class="luma-paginator__btn luma-paginator__btn--prev"
                :disabled="disabled || currentPage <= 1"
                title="صفحه قبل"
                aria-label="صفحه قبل"
                @click="goToPage(currentPage - 1)"
            >
                <LIcon name="chevron-right" :size="15" />
                <span v-if="showNavLabels" class="luma-paginator__btn-label">قبلی</span>
            </button>

            <!-- Page Pills with Smart Ellipsis -->
            <div v-if="showPagePills && layout !== 'minimal'" class="luma-paginator__pills">
                <template v-for="(p, idx) in visiblePills" :key="idx">
                    <button
                        v-if="typeof p === 'number'"
                        type="button"
                        class="luma-paginator__pill"
                        :class="{ 'is-active': p === currentPage }"
                        :aria-current="p === currentPage ? 'page' : undefined"
                        :disabled="disabled"
                        @click="goToPage(p)"
                    >
                        {{ formatNumber(p) }}
                    </button>
                    <span v-else class="luma-paginator__ellipsis" aria-hidden="true">…</span>
                </template>
            </div>

            <!-- Page indicator for minimal layout -->
            <span v-else class="luma-paginator__page-info">
                صفحه {{ formatNumber(currentPage) }} از {{ formatNumber(totalPages) }}
            </span>

            <!-- Next Page (RTL: chevron-left) -->
            <button
                type="button"
                class="luma-paginator__btn luma-paginator__btn--next"
                :disabled="disabled || currentPage >= totalPages"
                title="صفحه بعد"
                aria-label="صفحه بعد"
                @click="goToPage(currentPage + 1)"
            >
                <span v-if="showNavLabels" class="luma-paginator__btn-label">بعدی</span>
                <LIcon name="chevron-left" :size="15" />
            </button>

            <!-- Last Page (RTL: chevrons-left) -->
            <button
                v-if="showFirstLast"
                type="button"
                class="luma-paginator__btn luma-paginator__btn--last"
                :disabled="disabled || currentPage >= totalPages"
                title="صفحه آخر"
                aria-label="صفحه آخر"
                @click="goToPage(totalPages)"
            >
                <LIcon name="chevrons-left" :size="15" />
            </button>
        </div>

        <!-- End section: Direct Jump to Page -->
        <div v-if="showJump && totalPages > 1" class="luma-paginator__end">
            <form class="luma-paginator__jump" @submit.prevent="executeJump">
                <label :for="jumpInputId" class="luma-paginator__jump-label">برو به صفحه:</label>
                <input
                    :id="jumpInputId"
                    v-model="jumpInput"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="luma-paginator__jump-input"
                    :placeholder="formatNumber(currentPage)"
                    :disabled="disabled"
                    @keydown.enter.prevent="executeJump"
                />
                <button
                    type="submit"
                    class="luma-paginator__jump-btn"
                    :disabled="disabled || !canJump"
                    title="پرش به صفحه"
                >
                    برو
                </button>
            </form>
        </div>
    </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Paginator from 'primevue/paginator';
import LIcon from './l-icon.vue';
const LUMA_ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const LUMA_PAGINATOR_TEMPLATE =
    'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown JumpToPageInput';
const LUMA_PAGINATOR_TEMPLATE_MINIMAL = 'CurrentPageReport PrevPageLink NextPageLink';
const LUMA_CURRENT_PAGE_REPORT_TEMPLATE = 'صفحه {currentPage} از {totalPages}';

function calculateVisiblePagePills(current, total, maxPills = 7) {
    if (total <= 1) return [1];
    if (total <= maxPills) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
        return [1, 2, 3, 4, 5, 'ellipsis', total];
    }
    if (current >= total - 3) {
        return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

function toPersianDigits(value) {
    if (value === undefined || value === null) return '';
    const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(value).replace(/\d/g, (d) => digits[d]);
}

function normalizeDigits(value) {
    if (!value) return '';
    return String(value)
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

const props = defineProps({
    page: { type: Number, default: undefined },
    first: { type: Number, default: undefined },
    rows: { type: Number, default: 20 },
    perPage: { type: Number, default: undefined },
    total: { type: Number, default: undefined },
    totalRecords: { type: Number, default: undefined },
    rowsPerPageOptions: { type: Array, default: null },
    template: { type: String, default: undefined },
    currentPageReportTemplate: { type: String, default: undefined },
    pageLinkSize: { type: Number, default: 5 },
    layout: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'minimal', 'compact', 'prime'].includes(v),
    },
    showRowsPerPage: { type: Boolean, default: true },
    showJump: { type: Boolean, default: true },
    showPagePills: { type: Boolean, default: true },
    showSummary: { type: Boolean, default: true },
    showFirstLast: { type: Boolean, default: true },
    showNavLabels: { type: Boolean, default: false },
    itemLabel: { type: String, default: 'مورد' },
    formatNumbers: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits([
    'page',
    'update:first',
    'update:page',
    'update:perPage',
    'update:rows',
    'change',
]);

const rppSelectId = `rpp-select-${Math.random().toString(36).substring(2, 9)}`;
const jumpInputId = `jump-input-${Math.random().toString(36).substring(2, 9)}`;

const internalPage = ref(1);
const jumpInput = ref('');

const resolvedPerPage = computed(() => Number(props.perPage ?? props.rows ?? 20));
const resolvedTotal = computed(() => Number(props.total ?? props.totalRecords ?? 0));
const resolvedRowsPerPageOptions = computed(
    () => props.rowsPerPageOptions ?? LUMA_ROWS_PER_PAGE_OPTIONS,
);

const totalPages = computed(() => {
    if (resolvedTotal.value <= 0 || resolvedPerPage.value <= 0) return 1;
    return Math.max(1, Math.ceil(resolvedTotal.value / resolvedPerPage.value));
});

const currentPage = computed(() => {
    if (props.page !== undefined) {
        return Math.max(1, Math.min(totalPages.value, Number(props.page)));
    }
    if (props.first !== undefined) {
        const p = Math.floor(Number(props.first) / resolvedPerPage.value) + 1;
        return Math.max(1, Math.min(totalPages.value, p));
    }
    return Math.max(1, Math.min(totalPages.value, internalPage.value));
});

const resolvedFirst = computed(() => (currentPage.value - 1) * resolvedPerPage.value);
const rangeFrom = computed(() => (resolvedTotal.value <= 0 ? 0 : resolvedFirst.value + 1));
const rangeTo = computed(() => Math.min(resolvedTotal.value, resolvedFirst.value + resolvedPerPage.value));

const compact = computed(() => props.layout === 'compact');

const rootClass = computed(() => ({
    'luma-paginator--minimal': props.layout === 'minimal',
    'luma-paginator--compact': props.layout === 'compact',
    'luma-paginator--disabled': props.disabled,
}));

const usePrimePaginator = computed(() => {
    return props.layout === 'prime' || (props.template !== undefined && props.template !== '');
});

const resolvedTemplate = computed(() => {
    if (props.template) return props.template;
    if (props.layout === 'minimal') return LUMA_PAGINATOR_TEMPLATE_MINIMAL;
    return LUMA_PAGINATOR_TEMPLATE;
});

const resolvedPageReportTemplate = computed(
    () => props.currentPageReportTemplate ?? LUMA_CURRENT_PAGE_REPORT_TEMPLATE,
);

const visiblePills = computed(() => {
    return calculateVisiblePagePills(currentPage.value, totalPages.value, props.pageLinkSize + 2);
});

const canJump = computed(() => {
    const raw = normalizeDigits(jumpInput.value).trim();
    if (!raw) return false;
    const n = parseInt(raw, 10);
    return !isNaN(n) && n >= 1 && n <= totalPages.value && n !== currentPage.value;
});

function formatNumber(val) {
    if (val === undefined || val === null) return '';
    return props.formatNumbers ? toPersianDigits(val) : String(val);
}

function goToPage(target) {
    if (props.disabled) return;
    const clamped = Math.max(1, Math.min(totalPages.value, target));
    if (clamped === currentPage.value && target !== 1 && target !== totalPages.value) return;

    internalPage.value = clamped;
    const nextFirst = (clamped - 1) * resolvedPerPage.value;

    emit('update:page', clamped);
    emit('update:first', nextFirst);
    emit('change', {
        page: clamped,
        perPage: resolvedPerPage.value,
        first: nextFirst,
        rows: resolvedPerPage.value,
        total: resolvedTotal.value,
    });
    emit('page', {
        page: clamped - 1,
        first: nextFirst,
        rows: resolvedPerPage.value,
        pageCount: totalPages.value,
    });
}

function onRowsPerPageChange(event) {
    const newRows = Number(event.target.value);
    emit('update:perPage', newRows);
    emit('update:rows', newRows);

    internalPage.value = 1;
    emit('update:page', 1);
    emit('update:first', 0);
    emit('change', {
        page: 1,
        perPage: newRows,
        first: 0,
        rows: newRows,
        total: resolvedTotal.value,
    });
    emit('page', {
        page: 0,
        first: 0,
        rows: newRows,
        pageCount: Math.max(1, Math.ceil(resolvedTotal.value / newRows)),
    });
}

function executeJump() {
    if (props.disabled) return;
    const raw = normalizeDigits(jumpInput.value).trim();
    if (!raw) return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
        goToPage(parsed);
    }
    jumpInput.value = '';
}

function onPrimePage(event) {
    emit('page', event);
    emit('update:first', event.first);
    emit('update:page', (event.page ?? 0) + 1);
    emit('update:rows', event.rows);
    emit('update:perPage', event.rows);
    emit('change', {
        page: (event.page ?? 0) + 1,
        perPage: event.rows,
        first: event.first,
        rows: event.rows,
        total: resolvedTotal.value,
    });
}
</script>

<style scoped lang="scss">
.luma-paginator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    padding: 0.75rem 1rem;
    margin-top: 0.85rem;
    border-radius: 12px;
    background: var(--px-surface-strong, #ffffff);
    border: 1px solid color-mix(in srgb, var(--px-border, #e2e8f0) 65%, transparent);
    color: var(--px-text-soft, #64748b);
    font-size: 0.82rem;
    line-height: 1.4;
    direction: rtl;
    user-select: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.luma-paginator--disabled {
    opacity: 0.55;
    pointer-events: none;
}

.luma-paginator__start {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
}

.luma-paginator__summary {
    color: var(--px-text-soft, #64748b);
    font-size: 0.8rem;
    white-space: nowrap;
}

.luma-paginator__num {
    color: var(--px-text, #0f172a);
    font-weight: 750;
    font-variant-numeric: tabular-nums;
    margin: 0 1px;
}

.luma-paginator__rpp {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
}

.luma-paginator__rpp-label {
    font-size: 0.76rem;
    color: var(--px-text-muted, #94a3b8);
    white-space: nowrap;
}

.luma-paginator__select-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.luma-paginator__select {
    appearance: none;
    -webkit-appearance: none;
    background: color-mix(in srgb, var(--px-surface-muted, #f8fafc) 80%, var(--px-surface-strong, #ffffff));
    border: 1px solid color-mix(in srgb, var(--px-border, #e2e8f0) 80%, transparent);
    border-radius: 8px;
    padding: 0.28rem 1.65rem 0.28rem 0.65rem;
    font-size: 0.78rem;
    font-weight: 650;
    color: var(--px-text, #0f172a);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        border-color: var(--px-border, #cbd5e1);
        background: var(--px-surface-muted, #f1f5f9);
    }

    &:focus {
        outline: none;
        border-color: var(--px-primary, #7c3aed);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--px-primary, #7c3aed) 20%, transparent);
    }
}

.luma-paginator__select-arrow {
    position: absolute;
    right: 0.45rem;
    pointer-events: none;
    color: var(--px-text-muted, #94a3b8);
}

.luma-paginator__center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.35rem;
}

.luma-paginator__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-width: 2.15rem;
    height: 2.15rem;
    padding: 0 0.5rem;
    border-radius: 9px;
    background: var(--px-surface-strong, #ffffff);
    border: 1px solid color-mix(in srgb, var(--px-border, #e2e8f0) 65%, transparent);
    color: var(--px-text-soft, #64748b);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.14s ease;

    &:hover:not(:disabled) {
        background: color-mix(in srgb, var(--px-surface-muted, #f8fafc) 90%, var(--px-surface-strong, #ffffff));
        border-color: var(--px-border, #cbd5e1);
        color: var(--px-text, #0f172a);
    }

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &:disabled {
        opacity: 0.32;
        cursor: not-allowed;
    }
}

.luma-paginator__btn-label {
    font-size: 0.76rem;
    font-weight: 650;
}

.luma-paginator__pills {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.luma-paginator__pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.15rem;
    height: 2.15rem;
    padding: 0 0.45rem;
    border-radius: 9px;
    background: var(--px-surface-strong, #ffffff);
    border: 1px solid color-mix(in srgb, var(--px-border, #e2e8f0) 60%, transparent);
    color: var(--px-text-soft, #64748b);
    font-size: 0.8rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled):not(.is-active) {
        background: var(--px-surface-muted, #f1f5f9);
        border-color: var(--px-border, #cbd5e1);
        color: var(--px-text, #0f172a);
    }

    &.is-active {
        background: var(--px-primary, #7c3aed) !important;
        border-color: var(--px-primary, #7c3aed) !important;
        color: #ffffff !important;
        font-weight: 800 !important;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--px-primary, #7c3aed) 32%, transparent);
        cursor: default;
    }

    &:active:not(:disabled):not(.is-active) {
        transform: translateY(1px);
    }
}

.luma-paginator__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 2.15rem;
    color: var(--px-text-muted, #94a3b8);
    font-size: 0.95rem;
    user-select: none;
}

.luma-paginator__page-info {
    font-size: 0.8rem;
    font-weight: 650;
    color: var(--px-text, #0f172a);
    padding: 0 0.5rem;
    white-space: nowrap;
}

.luma-paginator__end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.luma-paginator__jump {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.luma-paginator__jump-label {
    font-size: 0.76rem;
    color: var(--px-text-muted, #94a3b8);
    white-space: nowrap;
}

.luma-paginator__jump-input {
    width: 3.25rem;
    height: 2.15rem;
    padding: 0 0.4rem;
    text-align: center;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--px-border, #e2e8f0) 80%, transparent);
    background: color-mix(in srgb, var(--px-surface-muted, #f8fafc) 80%, var(--px-surface-strong, #ffffff));
    color: var(--px-text, #0f172a);
    font-size: 0.8rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        border-color: var(--px-border, #cbd5e1);
    }

    &:focus {
        outline: none;
        border-color: var(--px-primary, #7c3aed);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--px-primary, #7c3aed) 20%, transparent);
    }
}

.luma-paginator__jump-btn {
    height: 2.15rem;
    padding: 0 0.75rem;
    border-radius: 8px;
    background: color-mix(in srgb, var(--px-primary, #7c3aed) 12%, var(--px-surface-strong, #ffffff));
    border: 1px solid color-mix(in srgb, var(--px-primary, #7c3aed) 35%, transparent);
    color: var(--px-primary, #7c3aed);
    font-size: 0.76rem;
    font-weight: 750;
    cursor: pointer;
    transition: all 0.14s ease;

    &:hover:not(:disabled) {
        background: var(--px-primary, #7c3aed);
        color: #ffffff;
    }

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &:disabled {
        opacity: 0.38;
        cursor: not-allowed;
    }
}

@media (max-width: 960px) {
    .luma-paginator {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }

    .luma-paginator__start,
    .luma-paginator__center,
    .luma-paginator__end {
        justify-content: center;
        width: 100%;
    }
}

:global(.dark) .luma-paginator,
:global([data-theme='dark']) .luma-paginator {
    background: var(--px-surface-strong);
    border-color: var(--px-border);
    color: var(--px-text-soft);

    .luma-paginator__num,
    .luma-paginator__select,
    .luma-paginator__jump-input,
    .luma-paginator__btn:hover:not(:disabled),
    .luma-paginator__pill:hover:not(:disabled):not(.is-active) {
        color: var(--px-text);
    }

    .luma-paginator__btn,
    .luma-paginator__pill {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);

        &:hover:not(:disabled):not(.is-active) {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.16);
        }
    }

    .luma-paginator__select,
    .luma-paginator__jump-input {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
    }
}
</style>
