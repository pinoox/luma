**English** | [فارسی](./slug.fa.md)

# Slug — Finglish URLs

Luma re-exports [`@pinooxhq/slug`](https://github.com/pinoox/slug): Persian → Finglish (heja syllables, not a word list), then a URL-safe slug.

```js
import { slugify, sanitizeSlug, toFinglish } from '@pinooxhq/luma'
import { useSlugField } from '@pinooxhq/luma/composables'
import { LSlugField } from '@pinooxhq/luma/ui'

slugify('سلام دنیا')        // 'salam-donya'
toFinglish('کتابخانه')      // 'ketabkhane'
sanitizeSlug('Lap--Top!')   // 'laptop'
```

## `useSlugField`

Keeps `form.slug` in sync with the title until the user edits the slug by hand.

```js
import { reactive } from 'vue'
import { useSlugField } from '@pinooxhq/luma/composables'

const form = reactive({ title: '', slug: '', slugManual: false })
const { onTitleInput, onSlugInput, resolveSlug } = useSlugField(form)
```

## `LSlugField`

Title + slug pair on `LField`. Changing the title regenerates the slug; typing in the slug sanitizes it.

```vue
<LSlugField
  v-model:title="form.title"
  v-model:slug="form.slug"
  title-label="Title"
  slug-label="Slug"
/>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `title` / `slug` | `string` | `v-model:title` / `v-model:slug` |
| `titleLabel` / `slugLabel` | `string` | Field labels |
| `titleId` / `slugId` | `string` | Optional input ids |

Full API (`extendLoanwords`, Vue/React/Svelte adapters): see [`@pinooxhq/slug`](https://github.com/pinoox/slug#readme).
