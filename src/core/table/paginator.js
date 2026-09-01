/** Default rows-per-page choices for Luma tables. */
export const LUMA_ROWS_PER_PAGE_OPTIONS = [20, 50, 100, 500];

/**
 * Classic paginator: page summary, jump + arrows, page pills, rows-per-page.
 */
export const LUMA_PAGINATOR_TEMPLATE =
    'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown';

/** Prev / next / report only (no page pills or jump). */
export const LUMA_PAGINATOR_TEMPLATE_MINIMAL =
    'CurrentPageReport PrevPageLink NextPageLink';

/** Default page summary for PrimeVue CurrentPageReport. */
export const LUMA_CURRENT_PAGE_REPORT_TEMPLATE = 'Page {currentPage} of {totalPages}';

/**
 * vue-i18n eats `{name}` placeholders — pass PrimeVue tokens through t().
 * @param {Function} t vue-i18n translate
 * @param {string} key message key
 */
export function primePageReportFromI18n(t, key) {
    return t(key, {
        currentPage: '{currentPage}',
        totalPages: '{totalPages}',
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
    });
}
