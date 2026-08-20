import test from 'node:test';
import assert from 'node:assert/strict';
import { defineEntity } from '../src/composables/form/define-entity.js';

const t = (key, params) => {
    if (key === 'validation.max') return `max:${params.max}`;
    if (key === 'validation.required') return 'required';
    return key;
};

test('createState builds nested defaults from dot paths', () => {
    const entity = defineEntity({
        fields: {
            title: { default: '' },
            'seo.title': { default: '' },
            'seo.description': { default: 'x' },
            stock: { default: 0 },
            tagIds: { default: [] },
        },
    });

    assert.deepEqual(entity.createState(), {
        title: '',
        seo: { title: '', description: 'x' },
        stock: 0,
        tagIds: [],
    });
});

test('createSchema nests Yup rules and validates', async () => {
    const entity = defineEntity({
        fields: {
            title: {
                default: '',
                label: 'brand.field_title',
                rule: (yup, translate) => yup.string().trim().required(translate('validation.required')).max(10, translate('validation.max', { max: 10 })),
            },
            'seo.title': {
                default: '',
                rule: (yup, translate) => yup.string().trim().max(5, translate('validation.max', { max: 5 })),
            },
            stock: { default: 0 },
        },
    });

    const schema = entity.createSchema(t);
    await assert.rejects(() => schema.validate({ title: '', seo: { title: '' } }));
    await assert.rejects(() => schema.validate({ title: 'ok', seo: { title: 'too-long' } }));
    const value = await schema.validate({ title: 'Phone', seo: { title: 'ab' }, stock: 1 });
    assert.equal(value.title, 'Phone');
});

test('createLabels resolves i18n keys', () => {
    const entity = defineEntity({
        fields: {
            title: { default: '', label: 'brand.field_title' },
            'seo.title': { default: '', label: 'brand.seo_title' },
        },
    });
    assert.deepEqual(entity.createLabels(t), {
        title: 'brand.field_title',
        'seo.title': 'brand.seo_title',
    });
});

test('toForm applies field.from then entity.toForm', () => {
    const entity = defineEntity({
        fields: {
            title: {
                default: '',
                from: (value) => String(value || '').toUpperCase(),
            },
            price: { default: 0 },
        },
        toForm(record, state) {
            state.price = Number(record.amount) || 0;
            return state;
        },
    });

    assert.deepEqual(entity.toForm({ title: 'hello', amount: 42 }), {
        title: 'HELLO',
        price: 42,
    });
});

test('toPayload applies field.to then entity.toPayload', () => {
    const entity = defineEntity({
        fields: {
            title: {
                default: '',
                to: (value) => String(value || '').trim(),
            },
            stock: { default: 0 },
        },
        toPayload(state, ctx, payload) {
            return {
                ...payload,
                status: ctx.status || 'draft',
                stock: Number(state.stock) || 0,
            };
        },
    });

    assert.deepEqual(
        entity.toPayload({ title: '  Soft  ', stock: 3 }, { status: 'published' }),
        { title: 'Soft', stock: 3, status: 'published' },
    );
});
