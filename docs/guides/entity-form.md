# Entity Form

Lightweight entity forms for Luma apps: one field map drives **defaults**, **Yup schema**, **labels**, and **API bridging** (`toForm` / `toPayload`). No separate mappers folder.

Docs index: [`../README.md`](../README.md) · Examples: [`../examples/`](../examples/)

## Contents

1. [Setup](#setup)
2. [Minimal brand entity](#minimal-brand-entity)
3. [Product-style entity](#product-style-entity-nested--domain-helpers)
4. [API reference](#api-reference)
5. [Create vs edit](#create-vs-edit)
6. [Validation UX](#validation-ux)

---

## Setup

Pairs with:

- [`useEntityForm`](../../src/composables/form/use-entity-form.js) — create / edit lifecycle
- [`useFormValidation`](../../src/composables/form/use-form-validation.js) — Yup + [PrimeVue Forms](https://primevue.dev/forms/) `yupResolver`
- [`LField`](../../src/ui/l-field.vue) — red border + message when `name` matches a field key

**Bundled with Luma:** `yup` and `@primevue/forms` ship as Luma dependencies — no extra install for Entity Form.

```js
import {
  defineEntity,
  useEntityForm,
  useFormValidation,
} from '@pinooxhq/luma/composables'
import { LField } from '@pinooxhq/luma/ui'
```

---

## Minimal brand entity

```js
// brand.entity.js
import { defineEntity } from '@pinooxhq/luma/composables'

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
      title: state.title.trim(),
      slug: state.slug.trim(),
      status: state.status,
    }
  },
})
```

```js
// in setup()
const { t } = useI18n()
const validation = useFormValidation({
  schema: brandEntity.createSchema(t),
  labels: brandEntity.createLabels(t),
  t,
})
const { form, load, submit, reset } = useEntityForm({
  createForm: () => brandEntity.createState(),
  toForm: (record) => brandEntity.toForm(record),
  toPayload: (state, ctx) => brandEntity.toPayload(state, ctx),
  load: fetchBrand,
  create: createBrand,
  update: updateBrand,
  validation,
})
validation.bind(form)

// create
reset()
await submit({ isEdit: false })

// edit
await load(id)
await submit({ isEdit: true })
```

```vue
<LField name="title" :label="t('brands.field_title')" required>
  <InputText v-model="form.title" />
</LField>
```

`LField` reads errors from `FORM_VALIDATION_KEY` (`Symbol.for('luma.formValidation')`).

---

## Product-style entity (nested + domain helpers)

Keep heavy logic as **pure helpers** (variants, pricing). Call them only from `toForm` / `toPayload` — do not add a `mappers/` folder.

```js
import { defineEntity } from '@pinooxhq/luma/composables'
import { syncVariants } from './model/variants.js'

export const productEntity = defineEntity({
  fields: {
    title: {
      default: '',
      label: 'productForm.field_title',
      rule: (yup, t) =>
        yup.string().trim().required(t('validation.required')).max(250),
    },
    'seo.title': {
      default: '',
      label: 'productForm.seo_title',
      rule: (yup, t) => yup.string().trim().max(250),
    },
    'seo.description': {
      default: '',
      label: 'productForm.seo_description',
      rule: (yup, t) => yup.string().trim().max(500),
    },
    price: { default: 0 },
    variants: { default: [] },
  },

  toForm(record, state, options) {
    state.variants = syncVariants(record.variants, record.options)
    // …overlay the rest of the API record onto state
    return state
  },

  toPayload(state, ctx) {
    return {
      title: state.title.trim(),
      seo: { ...state.seo },
      price: ctx.discountedPrice ?? state.price,
      variants: state.variants,
      status: ctx.status || state.status,
    }
  },
})
```

Optional per-field transforms:

```js
title: {
  default: '',
  from: (value) => String(value || ''),
  to: (value) => String(value || '').trim(),
}
```

Order:

1. `toForm(record)` → `createState()` → each `field.from` → `entity.toForm`
2. `toPayload(state, ctx)` → each `field.to` into a draft → `entity.toPayload(state, ctx, draft)`

---

## API reference

| Method | Purpose |
|--------|---------|
| `createState(seed?)` | Deep defaults from field `default` values; merges optional seed |
| `createSchema(t)` | Yup object for fields that define `rule` |
| `createLabels(t)` | `{ path: t(label) }` for toasts / summaries |
| `toForm(record, options?)` | API record → form state |
| `toPayload(state, ctx?)` | Form state → API payload |

Dot paths (`seo.title`) build nested objects for state and schema.

---

## Create vs edit

Same entity, same fields:

| Mode | Flow |
|------|------|
| Create | `reset()` / `createState()` → edit UI → `submit({ isEdit: false })` → `toPayload` |
| Edit | `load(id)` → `toForm(record)` → edit UI → `submit({ isEdit: true })` → `toPayload` |

---

## Validation UX

1. Put Yup rules on fields (`rule`).
2. Pass `createSchema(t)` + `createLabels(t)` into `useFormValidation`.
3. Bind the reactive form: `validation.bind(form)`.
4. Set `name` on `LField` (or your app `FormField`) to the field path.
5. On submit failure, `validation.first()` returns `"Label: message"` when `validation.field_error` exists in i18n.

Optional: copy [`../examples/entity-form-brand.js`](../examples/entity-form-brand.js) or [`../examples/entity-form-product.js`](../examples/entity-form-product.js) into your app and wire `useEntityForm` + `LField` as above.
