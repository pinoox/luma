import { defineEntity } from '@pinooxhq/luma/composables';

/** Minimal brand entity — see docs/guides/entity-form.md */
export const brandEntity = defineEntity({
    fields: {
        title: {
            default: '',
            label: 'brands.field_title',
            rule: (yup, t) =>
                yup.string().trim().required(t('validation.required')).max(250, t('validation.max', { max: 250 })),
        },
        slug: {
            default: '',
            label: 'common.field_slug',
            rule: (yup, t) => yup.string().trim().max(250, t('validation.max', { max: 250 })),
        },
        status: { default: 'active' },
    },
    toPayload(state) {
        return {
            title: String(state.title || '').trim(),
            slug: String(state.slug || '').trim(),
            status: state.status || 'active',
        };
    },
});
