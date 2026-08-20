# Luma documentation

Index for `@pinooxhq/luma` guides, UI reference, and copy-paste examples.

App boot, Vite, auth, and layouts: [root README](../README.md) · Releases: [CHANGELOG](../CHANGELOG.md)

---

## Guides

| Guide | What it covers |
|-------|----------------|
| [Page kit](./page-kit.md) | `LPage` / `LPanel` / table kit composition |
| [Entity Form](./guides/entity-form.md) | `defineEntity`, Yup validation, `toForm` / `toPayload`, `LField` errors |

---

## Reference

| Doc | What it covers |
|-----|----------------|
| [UI reference](./ui-reference.md) | Component catalog, tokens, theming, peers |

---

## Examples

| Example | Description |
|---------|-------------|
| [`examples/entity-form-brand.js`](./examples/entity-form-brand.js) | Minimal brand entity (title / slug / status) |
| [`examples/entity-form-product.js`](./examples/entity-form-product.js) | Nested `seo.*` + `toForm` / `toPayload` hooks |

---

## Quick start — Entity Form

```js
import {
  defineEntity,
  useEntityForm,
  useFormValidation,
} from '@pinooxhq/luma/composables'
import { LField } from '@pinooxhq/luma/ui'
```

`yup` and `@primevue/forms` are bundled with Luma — no separate install.

Full walkthrough: **[Entity Form](./guides/entity-form.md)**.
