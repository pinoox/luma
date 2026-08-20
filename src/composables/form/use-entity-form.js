import { reactive, ref, toRaw } from 'vue';

const replaceReactive = (target, source) => {
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, source);
};

/**
 * Entity form lifecycle: create/edit load, reset, validate, submit.
 *
 * Works with `defineEntity` via `createForm` / `toForm` / `toPayload`,
 * and optional `useFormValidation`.
 */
export function useEntityForm(options) {
    const createForm = options.createForm;
    const form = reactive(createForm());
    const entity = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);

    const reset = (seed) => {
        const defaults = createForm();
        replaceReactive(form, seed ? { ...defaults, ...seed } : defaults);
        entity.value = null;
        error.value = null;
        options.validation?.clear();
    };

    const load = async (id) => {
        if (id == null || id === '') {
            reset();
            return null;
        }

        loading.value = true;
        error.value = null;
        try {
            const record = await options.load(id);
            if (!record) throw new Error(options.notFoundMessage || 'Entity not found');
            entity.value = record;
            replaceReactive(form, options.toForm(record));
            return record;
        } catch (cause) {
            error.value = cause;
            options.onError?.(cause, 'load');
            return null;
        } finally {
            loading.value = false;
        }
    };

    const submit = async (context = {}) => {
        if (saving.value) return null;
        saving.value = true;
        error.value = null;
        try {
            if (options.validation) {
                const valid = await options.validation.validate();
                if (!valid) {
                    const cause = new Error(options.validation.first() || 'Validation failed');
                    cause.validation = true;
                    error.value = cause;
                    options.onError?.(cause, 'validate');
                    return null;
                }
            }
            const payload = options.toPayload(toRaw(form), context);
            const result = context.isEdit
                ? await options.update(entity.value, payload, context)
                : await options.create(payload, context);
            entity.value = result || entity.value;
            await options.onSaved?.(entity.value, context);
            options.validation?.clear();
            return entity.value;
        } catch (cause) {
            error.value = cause;
            options.onError?.(cause, 'save');
            return null;
        } finally {
            saving.value = false;
        }
    };

    return { form, entity, loading, saving, error, reset, load, submit };
}
