import { computed, inject, unref } from 'vue';
import { FORM_VALIDATION_KEY } from './form-validation.js';

export function useFieldError(name, fallback = '') {
    const form = inject(FORM_VALIDATION_KEY, null);

    return computed(() => {
        const explicit = unref(fallback);
        if (explicit) return explicit;
        const key = unref(name);
        if (!key || !form) return '';
        return form.error(key) || '';
    });
}
