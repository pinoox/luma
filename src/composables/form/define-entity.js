import * as yup from 'yup';

const clone = (value) => {
    if (value == null || typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
};

const setByPath = (target, path, value) => {
    const keys = String(path).split('.');
    let cursor = target;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        if (cursor[key] == null || typeof cursor[key] !== 'object') {
            cursor[key] = {};
        }
        cursor = cursor[key];
    }
    cursor[keys[keys.length - 1]] = value;
    return target;
};

const getByPath = (source, path) => {
    if (!path) return source;
    return String(path).split('.').reduce((value, key) => (
        value == null ? undefined : value[key]
    ), source);
};

/**
 * Define a form entity: defaults, Yup schema, labels, and API bridging.
 *
 * @param {{
 *   fields?: Record<string, {
 *     default?: unknown,
 *     label?: string,
 *     rule?: (yup: typeof import('yup'), t: Function) => any,
 *     from?: (value: unknown, record: object, options?: object) => unknown,
 *     to?: (value: unknown, state: object, ctx?: object) => unknown,
 *   }>,
 *   toForm?: (record: object, state: object, options?: object) => object,
 *   toPayload?: (state: object, ctx?: object) => object,
 * }} definition
 */
export function defineEntity(definition = {}) {
    const fields = definition.fields || {};
    const fieldEntries = Object.entries(fields);

    const createState = (seed = null) => {
        const state = {};
        for (const [path, field] of fieldEntries) {
            setByPath(state, path, clone(field?.default));
        }
        if (seed && typeof seed === 'object') {
            return deepMerge(state, seed);
        }
        return state;
    };

    const createSchema = (t = (key) => key) => {
        const shape = {};
        for (const [path, field] of fieldEntries) {
            if (typeof field?.rule !== 'function') continue;
            const rule = field.rule(yup, t);
            if (!rule) continue;
            setByPath(shape, path, rule);
        }
        return buildYupObject(shape);
    };

    const createLabels = (t = (key) => key) => {
        const labels = {};
        for (const [path, field] of fieldEntries) {
            if (!field?.label) continue;
            labels[path] = typeof field.label === 'function'
                ? field.label(t)
                : t(field.label);
        }
        return labels;
    };

    const toForm = (record, options = {}) => {
        const state = createState(options.seed);
        if (!record || typeof record !== 'object') {
            return definition.toForm?.(record, state, options) ?? state;
        }

        for (const [path, field] of fieldEntries) {
            const raw = getByPath(record, path);
            if (raw === undefined && typeof field?.from !== 'function') continue;
            const next = typeof field?.from === 'function'
                ? field.from(raw, record, options)
                : raw;
            if (next !== undefined) setByPath(state, path, next);
        }

        const result = definition.toForm?.(record, state, options);
        return result ?? state;
    };

    const toPayload = (state, ctx = {}) => {
        const source = state && typeof state === 'object' ? state : {};
        const payload = {};

        for (const [path, field] of fieldEntries) {
            const raw = getByPath(source, path);
            const next = typeof field?.to === 'function'
                ? field.to(raw, source, ctx)
                : raw;
            if (next !== undefined) setByPath(payload, path, next);
        }

        const result = definition.toPayload?.(source, ctx, payload);
        return result ?? payload;
    };

    return {
        fields,
        createState,
        createSchema,
        createLabels,
        toForm,
        toPayload,
    };
}

const isPlainObject = (value) => (
    value != null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const deepMerge = (base, overlay) => {
    const result = clone(base);
    Object.entries(overlay).forEach(([key, value]) => {
        if (isPlainObject(value) && isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], value);
        } else {
            result[key] = clone(value);
        }
    });
    return result;
};

const buildYupObject = (shape) => {
    const yupShape = {};
    Object.entries(shape).forEach(([key, value]) => {
        if (isPlainObject(value) && typeof value.validate !== 'function') {
            yupShape[key] = buildYupObject(value);
        } else {
            yupShape[key] = value;
        }
    });
    return yup.object(yupShape);
};
