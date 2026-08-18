// UI primitives — barrel exports.
// Luma UI is powered by PrimeVue: most components wrap PrimeVue
// primitives (Card, Tag, Toolbar, Toast, FloatLabel, etc.) with
// thin Luma styling on top. See /docs for the full mapping.
//
// Canonical page kit:
//   LPage → (#actions / #toolbar) → LPanel / LEmptyPanel / LCard
//   Tables: <LPanel flush bare><LDataTable :value="rows">…</LDataTable></LPanel>
//   Filters: <LTableToolbar> + <LFilterMenu> + .luma-filter-chip
//   Tabs:   <LTabs variant="pill" :items="[…]" />
export { default as LIcon } from './l-icon.vue';
export { default as LView } from './l-view.vue';
export { default as LPage } from './l-page.vue';
export { default as LHeader } from './l-header.vue';
export { default as LPageHeader } from './l-page-header.vue';
export { default as LPageToolbar } from './l-page-toolbar.vue';
export { default as LPageContainer } from './l-page-container.vue';
export { default as LPanel } from './l-panel.vue';
export { default as LEmptyPanel } from './l-empty-panel.vue';

// PrimeVue-backed primitives
export { default as LCard } from './l-card.vue';          // wraps PrimeVue Card
export { default as LStatCard } from './l-stat-card.vue';  // theme-aware KPI card
export { default as LBadge } from './l-badge.vue';        // wraps PrimeVue Tag
export { default as LField } from './l-field.vue';        // wraps FloatLabel
export { default as LSlugField } from './l-slug-field.vue';
export { default as LToolbar } from './l-toolbar.vue';    // wraps PrimeVue Toolbar
export { default as LToast } from './l-toast.vue';        // wraps PrimeVue Toast
export { default as LSpinner } from './l-spinner.vue';    // wraps PrimeVue ProgressSpinner
export { default as LButton } from './l-button.vue';      // wraps PrimeVue Button
export { default as LDatePicker } from './l-date-picker.vue';
export { default as LRichEditor } from './l-rich-editor.vue';
export { default as LTabs } from './l-tabs.vue';
export { default as LConfirmDialog } from './l-confirm-dialog.vue';
export { default as LDropzone } from './l-dropzone.vue';

// Table kit — soft DataTable, filters, bulk, status
export { default as LDataTable } from './l-data-table.vue';
export { default as LTableToolbar } from './l-table-toolbar.vue';
export { default as LFilterMenu } from './l-filter-menu.vue';
export { default as LBulkBar } from './l-bulk-bar.vue';
export { default as LStatusChip } from './l-status-chip.vue';

