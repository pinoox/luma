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

/**
 * Pinoox File dispatcher URL (`{app}/file/{hash}`).
 * @param {number|string|null|undefined} fileIdOrHash
 * @param {{ download?: boolean, token?: string }} [options]
 * @returns {string|null}
 */
export function fileServeUrl(fileIdOrHash, options = {}) {
    if (fileIdOrHash == null || fileIdOrHash === '') return null;
    const raw = String(fileIdOrHash).trim();
    if (!raw || raw === '0') return null;

    let base = '';
    let path = '';
    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            path = parsed.pathname;
            base = parsed.origin;
        } catch {
            return raw;
        }
    } else {
        const boot = (typeof globalThis !== 'undefined' && globalThis.__PINOOX__) ? globalThis.__PINOOX__ : {};
        base = String(boot.url?.BASE || boot.url?.APP || '').replace(/\/$/, '');
        path = `/file/${encodeURIComponent(raw)}`;
    }

    let url = `${base}${path}`;
    const params = new URLSearchParams();

    if (raw.includes('?')) {
        const queryStr = raw.split('?')[1];
        new URLSearchParams(queryStr).forEach((val, k) => params.set(k, val));
        url = url.split('?')[0];
    }

    if (options.download) {
        params.set('download', '1');
    }

    if (options.token && typeof options.token === 'string') {
        params.set('token', options.token);
    }

    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

/**
 * Direct file download URL (`/file/{hash}?download=1`).
 * @param {number|string|null|undefined} fileIdOrHash
 * @param {{ token?: string }} [options]
 * @returns {string|null}
 */
export function fileDownloadUrl(fileIdOrHash, options = {}) {
    return fileServeUrl(fileIdOrHash, { ...options, download: true });
}