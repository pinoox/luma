/** Default rows-per-page choices for Luma tables. */
export const LUMA_ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

/**
 * Classic paginator: page summary, jump + arrows, page pills, rows-per-page.
 */
export const LUMA_PAGINATOR_TEMPLATE =
    'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown JumpToPageInput';

/** Prev / next / report only (no page pills or jump). */
export const LUMA_PAGINATOR_TEMPLATE_MINIMAL =
    'CurrentPageReport PrevPageLink NextPageLink';

/** Default page summary for PrimeVue CurrentPageReport. */
export const LUMA_CURRENT_PAGE_REPORT_TEMPLATE = 'صفحه {currentPage} از {totalPages}';

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

/**
 * Smart visible page pill generator with ellipsis.
 * @param {number} current Current page (1-based)
 * @param {number} total Total pages
 * @param {number} [maxPills=7] Maximum page pills to show
 * @returns {Array<number|'ellipsis'>}
 */
export function calculateVisiblePagePills(current, total, maxPills = 7) {
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

/**
 * Converts English digits to Persian digits.
 * @param {string|number} value
 * @returns {string}
 */
export function toPersianDigits(value) {
    if (value === undefined || value === null) return '';
    const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(value).replace(/\d/g, (d) => digits[d]);
}

/**
 * Normalizes Persian and Arabic numerals to ASCII digits.
 * @param {string} value
 * @returns {string}
 */
export function normalizeDigits(value) {
    if (!value) return '';
    return String(value)
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}
