[English](./slug.md) | **فارسی**

# اسلاگ — URL فینگلیش

لوما [`@pinooxhq/slug`](https://github.com/pinoox/slug) را دوباره صادر می‌کند: فارسی → فینگلیش (بر اساس هجا، نه فهرست واژه)، سپس اسلاگ امن برای URL.

```js
import { slugify, sanitizeSlug, toFinglish } from '@pinooxhq/luma'
import { useSlugField } from '@pinooxhq/luma/composables'
import { LSlugField } from '@pinooxhq/luma/ui'

slugify('سلام دنیا')        // 'salam-donya'
toFinglish('کتابخانه')      // 'ketabkhane'
sanitizeSlug('Lap--Top!')   // 'laptop'
```

## `useSlugField`

تا وقتی کاربر اسلاگ را دستی ویرایش نکرده، `form.slug` را با عنوان همگام نگه می‌دارد.

```js
import { reactive } from 'vue'
import { useSlugField } from '@pinooxhq/luma/composables'

const form = reactive({ title: '', slug: '', slugManual: false })
const { onTitleInput, onSlugInput, resolveSlug } = useSlugField(form)
```

## `LSlugField`

جفت عنوان + اسلاگ روی `LField`. تغییر عنوان اسلاگ را دوباره می‌سازد؛ تایپ در اسلاگ آن را پاکسازی می‌کند.

```vue
<LSlugField
  v-model:title="form.title"
  v-model:slug="form.slug"
  title-label="عنوان"
  slug-label="اسلاگ"
/>
```

| پراپ | نوع | توضیح |
| --- | --- | --- |
| `title` / `slug` | `string` | `v-model:title` / `v-model:slug` |
| `titleLabel` / `slugLabel` | `string` | برچسب فیلدها |
| `titleId` / `slugId` | `string` | شناسه اختیاری اینپوت |

API کامل (`extendLoanwords` و آداپتورهای Vue/React/Svelte): [`@pinooxhq/slug`](https://github.com/pinoox/slug#readme).
