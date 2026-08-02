# Luma page kit

Default admin page composition. Prefer these primitives over one-off page headers and custom panel CSS.

```vue
<template>
  <LPage icon="users" header-tone="gradient">
    <template #actions>
      <LButton variant="outline" shape="rounded" icon="plus">Add</LButton>
    </template>

    <template #toolbar-info>12 items</template>
    <template #toolbar>
      <LButton variant="outline" severity="neutral" size="sm" shape="rounded">Export</LButton>
    </template>

    <LEmptyPanel v-if="loading" loading />
    <LEmptyPanel
      v-else-if="!rows.length"
      icon="inbox"
      title="Nothing here yet"
      message="Create the first item to get started."
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
| `LPage` | Shell: title / lead / badge from `themeConfig.pageMeta` via `usePage()` |
| `LPageHeader` | Manual header (`tone`: `default` \| `glass` \| `gradient`) |
| `LPageToolbar` | Filters and secondary actions |
| `LPageContainer` | Content column (used inside `LPage`) |
| `LPanel` | Content surface (`solid` \| `muted` \| `glass`; `flush` for tables) |
| `LEmptyPanel` | Empty / loading block |
| `LButton` / `LBadge` / `LStatCard` / `LCard` | Actions, status, KPIs |

## CSS helpers

- `.luma-table` — native table + PrimeVue DataTable chrome
- `.luma-actions` / `.luma-actions--end` / `.luma-actions--between` — action rows
- `.luma-panel` / `.luma-surface[--glass]` — surfaces without the SFC

## Meta

Declare page copy once in `themeConfig.pageMeta`:

```js
pageMeta: {
  'app.users': { title: 'Users', lead: 'Manage accounts', badge: 'Admin' },
}
```

`LPage` reads it automatically. Override with `:title` / `:lead` / `:eyebrow` when a page needs dynamic copy.
