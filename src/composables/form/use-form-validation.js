import { provide, reactive, toRaw, watch } from 'vue';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import {
    FORM_VALIDATION_KEY,
    parseHttpError,
} from './form-validation.js';

const firstResolverMessage = (value) => {
    if (value == null) return '';
    if (Array.isArray(value)) {
        const item = value[0];
        if (item == null) return '';
        return item.message || String(item);
    }
    if (typeof value === 'object') return value.message || '';
    return String(value);
};

/**
 * Yup-backed form validation for Luma (PrimeVue Forms yupResolver).
 * Provides FORM_VALIDATION_KEY so LField can show field errors.
 *
 * @see https://primevue.dev/forms/
 */
export function useFormValidation({
    schema,
    labels = {},
    values = null,
    t = (key) => key,
} = {}) {
    if (!schema) {
        throw new Error('useFormValidation requires a Yup schema');
    }

    const errors = reactive({});
    let boundValues = values;
    const resolver = yupResolver(schema);

    const labelOf = (name) => {
        if (typeof labels === 'function') return labels(name) || name;
        return labels?.[name] || name;
    };

    const error = (name) => errors[name] || '';
    const has = (name) => !!errors[name];
    const firstName = () => Object.keys(errors).find((key) => errors[key]) || '';
    const first = () => {
        const name = firstName();
        if (!name) return '';
        const message = errors[name];
        const label = labelOf(name);
        if (!label || label === name) return message;
        return t('validation.field_error', { field: label, message });
    };

    const setError = (name, message) => {
        if (!name) return;
        if (message) errors[name] = message;
        else delete errors[name];
    };

    const clear = (name) => {
        if (name) {
            delete errors[name];
            return;
        }
        Object.keys(errors).forEach((key) => delete errors[key]);
    };

    const applyResolverErrors = (resolverErrors = {}) => {
        Object.entries(resolverErrors).forEach(([path, value]) => {
            const message = firstResolverMessage(value);
            if (message) errors[path] = message;
        });
    };

    const validateField = async (name, allValues = boundValues) => {
        if (!name || !allValues) return '';
        try {
            await schema.validateAt(name, toRaw(allValues));
            return '';
        } catch (cause) {
            return cause?.message || t('validation.invalid');
        }
    };

    const validate = async (allValues = boundValues) => {
        clear();
        if (!allValues) return false;

        const result = await resolver({ values: toRaw(allValues) });
        applyResolverErrors(result?.errors);
        return !Object.keys(errors).length;
    };

    const applyError = (cause) => {
        if (cause?.validation) {
            return { message: first() || cause.message || '', fields: { ...errors } };
        }

        const parsed = parseHttpError(cause);
        clear();
        Object.entries(parsed.fields).forEach(([name, message]) => {
            errors[name] = message;
        });

        return {
            message: first() || parsed.message || '',
            fields: { ...errors },
            code: parsed.code,
        };
    };

    const notify = (toast, message) => {
        const summary = message || first() || t('common.save_failed');
        toast?.add({
            severity: 'error',
            summary,
            life: 3500,
        });
        return summary;
    };

    const check = async (toast) => {
        if (await validate()) return true;
        notify(toast, first() || t('common.required'));
        return false;
    };

    const fail = (cause, toast) => {
        const parsed = applyError(cause);
        notify(toast, parsed.message || t('common.save_failed'));
        return parsed;
    };

    const bind = (source) => {
        if (!source) return;
        boundValues = source;
        watch(source, async () => {
            const names = Object.keys(errors);
            for (const name of names) {
                const message = await validateField(name, source);
                if (message) errors[name] = message;
                else delete errors[name];
            }
        }, { deep: true });
    };

    if (values) bind(values);

    const api = {
        errors,
        schema,
        labels,
        error,
        has,
        first,
        firstName,
        labelOf,
        setError,
        clear,
        validate,
        validateField,
        applyError,
        notify,
        check,
        fail,
        bind,
        resolver,
    };

    provide(FORM_VALIDATION_KEY, api);
    return api;
}
