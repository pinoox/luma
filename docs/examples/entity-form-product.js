import { defineEntity } from '@pinooxhq/luma/composables';

/**
 * Product-style entity — nested seo + toForm/toPayload hooks.
 * See docs/guides/entity-form.md
 *
 * Keep heavy domain math in pure helpers (e.g. ./model/variants.js)
 * and call them only from these hooks — no mappers/ folder.
 */
export const productEntity = defineEntity({
    fields: {
        title: {
            default: '',
            label: 'productForm.field_title',
            rule: (yup, t) =>
                yup.string().trim().required(t('validation.required')).max(250, t('validation.max', { max: 250 })),
        },
        slug: {
            default: '',
            label: 'common.field_slug',
            rule: (yup, t) => yup.string().trim().max(250, t('validation.max', { max: 250 })),
        },
        sku: {
            default: '',
            label: 'productForm.field_sku',
            rule: (yup, t) => yup.string().trim().max(100, t('validation.max', { max: 100 })),
        },
        'seo.title': {
            default: '',
            label: 'productForm.seo_title',
            rule: (yup, t) => yup.string().trim().max(250, t('validation.max', { max: 250 })),
        },
        'seo.description': {
            default: '',
            label: 'productForm.seo_description',
            rule: (yup, t) => yup.string().trim().max(500, t('validation.max', { max: 500 })),
        },
        price: { default: 0 },
        status: { default: 'draft' },
        variants: { default: [] },
    },

    toForm(record, state) {
        if (!record) return state;
        state.title = record.title || '';
        state.slug = record.slug || '';
        state.sku = record.sku || '';
        state.price = Number(record.price) || 0;
        state.status = record.status || 'draft';
        state.seo = {
            title: record.seo?.title || '',
            description: record.seo?.description || '',
        };
        // e.g. state.variants = normalizeVariants(record.variants)
        state.variants = Array.isArray(record.variants) ? record.variants : [];
        return state;
    },

    toPayload(state, ctx = {}) {
        return {
            title: String(state.title || '').trim(),
            slug: String(state.slug || '').trim(),
            sku: String(state.sku || '').trim(),
            price: ctx.discountedPrice ?? (Number(state.price) || 0),
            status: ctx.status || state.status || 'draft',
            seo: {
                title: state.seo?.title || '',
                description: state.seo?.description || '',
            },
            variants: state.variants || [],
        };
    },
});
