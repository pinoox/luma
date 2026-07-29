/**
 * Resolve API-relative media paths for img/src in the console panel.
 * @param {string|null|undefined} url
 */
export function resolveMediaUrl(url) {
    const value = String(url || '').trim();

    if (!value) {
        return '';
    }

    if (/^(https?:|blob:|data:)/i.test(value)) {
        return value;
    }

    if (typeof window === 'undefined') {
        return value;
    }

    const path = value.startsWith('/') ? value : `/${value}`;

    return `${window.location.origin}${path}`;
}
