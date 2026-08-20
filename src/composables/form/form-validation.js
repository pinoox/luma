export const FORM_VALIDATION_KEY = Symbol.for('luma.formValidation');

export function getByPath(source, path) {
    if (!path) return source;
    return String(path).split('.').reduce((value, key) => (
        value == null ? undefined : value[key]
    ), source);
}

export function isEmptyValue(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

const toCamel = (key) => String(key).replace(/_([a-z])/g, (_, char) => char.toUpperCase());

const firstMessage = (value) => {
    if (value == null || value === '') return '';
    if (Array.isArray(value)) return firstMessage(value[0]);
    if (typeof value === 'object') return firstMessage(Object.values(value)[0]);
    return String(value);
};

export function normalizeFieldErrors(details) {
    const fields = {};
    const source = details?.fields && typeof details.fields === 'object'
        ? details.fields
        : (details && typeof details === 'object' && !Array.isArray(details) ? details : {});

    Object.entries(source).forEach(([key, value]) => {
        const message = firstMessage(value);
        if (!message) return;
        fields[key] = message;
        const camel = toCamel(key);
        if (camel !== key) fields[camel] = message;
    });

    return fields;
}

export function parseHttpError(error) {
    const body = error?.response?.data
        || error?.details?.body
        || error?.body
        || {};
    const payload = body.error
        || (body.success === false ? body : null)
        || {};
    const details = payload.details || body.errors || error?.details || {};
    const fields = normalizeFieldErrors(details);
    const message = payload.message
        || body.message
        || (typeof error?.message === 'string' ? error.message : '');

    return {
        code: payload.code || '',
        message,
        fields,
    };
}
