# Luma page kit

Default admin page composition. Prefer these primitives over one-off page headers and custom panel CSS.

Full prop reference: [`ui-reference.md`](./ui-reference.md). Docs index: [`README.md`](./README.md). App boot / layouts / auth: [root README](../README.md).

## Canonical page

```vue
<template>
  <LPage icon="users" header-tone="gradient">
    <template #actions>
      <LButton variant="outline" shape="rounded" icon="plus">Add</LButton>
    </template>

    <template #toolbar-info>12 items</template>
    <template #toolbar>
      <LButton variant="outline" severity="neutral" size="sm" shape="rounded">
        Export
      </LButton>
    </template>

    <LPanel flush bare>
      <LDataTable
        :value="rows"
        :loading="loading"
        paginator
        :rows="20"
        data-key="id"
        empty-icon="inbox"
        empty-title="Nothing here yet"
        empty-message="Create the first item to get started."
        empty-action-label="Add"
        @empty-action="openCreate"
      >
        <Column field="name" header="Name">
          <template #body="{ data }">
            <LColumnBody :data="data" part="entity">
              {{ data.name }}
            </LColumnBody>
          </template>
        </Column>
      </LDataTable>
    </LPanel>
  </LPage>
</template>

<script setup>
import { LPage, LPanel, LButton, LDataTable, LColumnBody } from '@pinooxhq/luma/ui';
import Column from 'primevue/column';
</script>
```

## Table kit

| Component | Role |
|-----------|------|
| `LDataTable` | PrimeVue DataTable + soft/classic chrome (`variant`, default rows `20/50/100/500`). `:loading` shows skeleton rows and hides the global HTTP overlay |
| `LColumnBody` | Cell wrapper: `LTableSkel` while the row is a placeholder, slot otherwise |
| `LTableSkel` | Cell-level skeleton shapes (`part`: `entity`, `actions`, `chips`, …) |
| `LTableToolbar` | Glass strip: filter chips + count + search |
| `LFilterMenu` | Popup checklist for chips (`persist` for multi-select) |
| `LBulkBar` | Selection action bar (`count` / clear / `#default` actions) |
| `LStatusChip` | Status pill + Menu (`v-model` + `options`) |

```vue
<LTableToolbar v-model:search="q" :count-label="`${n} items`" :show-clear="dirty" @clear="reset">
  <template #filters>
    <button type="button" class="luma-filter-chip" :class="{ 'is-active': !!status }" @click="statusMenu?.toggle($event)">
      <span>Status</span>
      <LIcon name="chevron-down" :size="14" />
    </button>
    <LFilterMenu ref="statusMenu" :items="statusItems" persist />
  </template>
</LTableToolbar>

<LBulkBar :count="selected.length" :count-label="`${selected.length} selected`" clear-label="Clear" @clear="selected = []">
  <button type="button" class="luma-bulk-bar__btn">Export</button>
</LBulkBar>

<LPanel flush bare>
  <LDataTable
    v-model:selection="selected"
    :value="rows"
    paginator
    data-key="id"
    empty-icon="inbox"
    empty-title="No rows"
    empty-action-label="Add"
    @empty-action="openCreate"
  >
    <Column selection-mode="multiple" style="width: 3rem" />
    <Column field="name" header="Name" />
    <Column header="Status">
      <template #body="{ data }">
        <LStatusChip v-model="data.status" :label="data.statusLabel" :options="statusOptions" />
      </template>
    </Column>
  </LDataTable>
</LPanel>
```

## Pieces

| Component | Role |
|-----------|------|
| `LPage` | Shell: title / lead / badge from `themeConfig.pageMeta` via `usePage()` |
| `LPageHeader` | Manual header (`tone`: `default` \| `glass` \| `gradient`) |
| `LPageToolbar` | Filters and secondary actions |
| `LPageContainer` | Content column (used inside `LPage`) |
| `LPanel` | Content surface (`solid` \| `muted` \| `glass`; `flush` / `bare` for tables) |
| `LEmptyPanel` | Empty / loading block |
| `LStatCard` | KPI tiles above a panel |
| `LTabs` | Workspace tabs (`variant="pill"` soft chips; wrap in `.luma-tabs-shell` when needed) |
| `LButton` / `LBadge` / `LCard` | Actions, status, cards |

## CSS helpers

| Class | Role |
|-------|------|
| `.luma-table` / `--soft` / `--classic` | Native table + PrimeVue DataTable chrome |
| `.luma-filter-chip` / `.luma-filter-clear` | Toolbar filter triggers |
| `.luma-bulk-bar__btn` | Bulk action pills |
| `.luma-glass-card` / `.luma-glass-panel` | Glass surfaces |
| `.luma-actions` / `--end` / `--between` | Action rows |
| `.luma-panel` / `.luma-surface` / `--glass` / `--bare` | Surfaces without the SFC |

## Meta

Declare page copy once in `themeConfig.pageMeta`:

```js
pageMeta: {
  'app.users': { title: 'Users', lead: 'Manage accounts', badge: 'Admin' },
}
```

`LPage` reads it automatically. Override with `:title` / `:lead` / `:eyebrow` / `:icon` when a page needs dynamic copy. Hide the header with `:header="false"`.

## Patterns

**KPI row + table**

```vue
<LPage>
  <div class="luma-grid luma-grid--sm luma-grid--gap-3">
    <LStatCard label="Open" :value="open" icon="inbox" tone="primary" />
    <LStatCard label="Done" :value="done" icon="circle-check" tone="success" />
  </div>
  <LPanel flush>
    <DataTable class="luma-table" :value="rows" />
  </LPanel>
</LPage>
```

**Tabs + flush panel**

```vue
<LPage>
  <LTabs
    flush
    :items="[
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active', badge: activeCount },
    ]"
    v-model="tab"
  />
  <LPanel flush>
    <DataTable class="luma-table" :value="filtered" />
  </LPanel>
</LPage>
```
