<template>
  <div class="luma-table-toolbar">
    <div class="luma-table-toolbar__filters">
      <slot name="filters" />
      <button
        v-if="showClear"
        type="button"
        class="luma-filter-clear"
        @click="$emit('clear')"
      >
        {{ clearLabel }}
      </button>
    </div>

    <span v-if="countLabel" class="luma-table-toolbar__count">
      {{ countLabel }}
    </span>

    <label class="luma-table-toolbar__search">
      <LIcon name="search" :size="16" class="luma-table-toolbar__search-icon" />
      <InputText
        :model-value="search"
        :placeholder="searchPlaceholder"
        class="luma-table-toolbar__search-input"
        @update:model-value="$emit('update:search', $event)"
      />
    </label>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext';
import LIcon from './l-icon.vue';

/**
 * LTableToolbar — glass filter strip with chips + search.
 *
 *     <LTableToolbar
 *       v-model:search="q"
 *       :count-label="`${n} items`"
 *       :show-clear="hasFilters"
 *       @clear="reset"
 *     >
 *       <template #filters>…</template>
 *     </LTableToolbar>
 */
defineProps({
    search: { type: String, default: '' },
    searchPlaceholder: { type: String, default: '' },
    countLabel: { type: String, default: '' },
    showClear: { type: Boolean, default: false },
    clearLabel: { type: String, default: '' },
});

defineEmits(['update:search', 'clear']);
</script>
