const DEFAULT_LOCALE = 'fa-IR';

/**
 * @param {string|number|Date|null|undefined} value
 * @param {Intl.DateTimeFormatOptions & { locale?: string, fallback?: string }} [options]
 */
export function formatDate(value, options = {}) {
    const {
        locale = DEFAULT_LOCALE,
        fallback = '—',
        ...formatOptions
    } = options;

    if (value == null || value === '') {
        return fallback;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        ...formatOptions,
    }).format(date);
}
