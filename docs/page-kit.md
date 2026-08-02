# Luma page kit

Canonical admin page composition — use these instead of per-page header/CSS.

```vue
<template>
  <LPage icon="users" header-tone="gradient">
    <template #actions>
      <LButton icon="plus">افزودن</LButton>
    </template>

    <template #toolbar-info>۱۲ مورد</template>
    <template #toolbar>
      <LButton variant="outline" severity="neutral" size="sm">خروجی</LButton>
    </template>

    <LEmptyPanel v-if="loading" loading />
    <LEmptyPanel
      v-else-if="!rows.length"
      icon="inbox"
      title="موردی نیست"
      message="هنوز داده‌ای ثبت نشده."
    />
    <LPanel v-else flush tone="glass">
      <DataTable :value="rows" class="luma-table" />
    </LPanel>
  </LPage>
</template>

<script setup>
import { LPage, LPanel, LEmptyPanel, LButton } from '@pinooxhq/luma/ui';
import DataTable from 'primevue/datatable';
</script>
```

## Pieces

| Component | Role |
|-----------|------|
| `LPage` | Shell: auto title/lead/badge from `themeConfig.pageMeta` + `usePage()` |
| `LPageHeader` | Manual header (`tone`: `default` \| `glass` \| `gradient`) |
| `LPageToolbar` | Filters / secondary actions |
| `LPageContainer` | Content column (used inside `LPage`) |
| `LPanel` | Content surface (`solid` \| `muted` \| `glass`, `flush` for tables) |
| `LEmptyPanel` | Empty / loading block |
| `LButton` / `LBadge` / `LStatCard` / `LCard` | Actions, status, KPIs |

## CSS helpers

- `.luma-table` — native table + PrimeVue DataTable chrome
- `.luma-actions` / `.luma-actions--end` / `--between` — button rows
- `.luma-panel` / `.luma-surface[--glass]` — surfaces without the SFC

## Meta

Set once in `themeConfig.pageMeta`:

```js
pageMeta: {
  'app.users': { title: 'کاربران', lead: '…', badge: 'ادمین' },
}
```

`LPage` reads it automatically; override with `:title` / `:lead` / `:eyebrow` when needed.
