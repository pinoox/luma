<template>
  <div
    v-if="visible"
    class="luma-bulk-bar"
    role="region"
    :aria-label="ariaLabel"
  >
    <div class="luma-bulk-bar__info">
      <span v-if="countLabel" class="luma-bulk-bar__count">{{ countLabel }}</span>
      <button
        v-if="clearLabel"
        type="button"
        class="luma-bulk-bar__clear"
        @click="$emit('clear')"
      >
        {{ clearLabel }}
      </button>
    </div>
    <div class="luma-bulk-bar__actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * LBulkBar — bulk selection action strip above a table.
 *
 *     <LBulkBar
 *       :count="selected.length"
 *       :count-label="`${n} selected`"
 *       clear-label="Clear"
 *       @clear="selected = []"
 *     >
 *       <button class="luma-bulk-bar__btn">Status</button>
 *     </LBulkBar>
 */
const props = defineProps({
    count: { type: Number, default: 0 },
    countLabel: { type: String, default: '' },
    clearLabel: { type: String, default: '' },
    ariaLabel: { type: String, default: 'Bulk actions' },
    /** Force show even when count is 0. */
    force: { type: Boolean, default: false },
});

defineEmits(['clear']);

const visible = computed(() => props.force || props.count > 0);
</script>
