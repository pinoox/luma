<template>
  <button
    type="button"
    class="luma-status-chip"
    :class="{ 'is-open': open }"
    :data-state="resolvedState"
    :title="title"
    :aria-haspopup="true"
    :aria-expanded="open"
    @click.stop="onToggle"
  >
    <span class="luma-status-chip__dot" aria-hidden="true" />
    <span class="luma-status-chip__label">{{ label }}</span>
    <LIcon name="chevron-down" :size="12" class="luma-status-chip__caret" />
  </button>

  <Menu
    ref="menu"
    :model="menuModel"
    popup
    :pt="{
      root: { class: 'luma-status-menu' },
      list: { class: 'luma-status-menu__list' },
    }"
    @hide="open = false"
  >
    <template #item="{ item }">
      <a
        href="#"
        class="luma-status-menu__item"
        :class="{ 'is-on': !!item.active }"
        :data-state="item.state || item.value"
        role="menuitemradio"
        :aria-checked="!!item.active"
        @click.prevent.stop="onPick(item)"
        @mousedown.prevent.stop
      >
        <span class="luma-status-menu__dot" aria-hidden="true" />
        <span class="luma-status-menu__label">{{ item.label }}</span>
        <span class="luma-status-menu__check" aria-hidden="true">
          <LIcon :name="item.active ? 'circle-check' : 'circle'" :size="15" />
        </span>
      </a>
    </template>
  </Menu>
</template>

<script setup>
import { computed, ref } from 'vue';
import Menu from 'primevue/menu';
import LIcon from './l-icon.vue';

/**
 * LStatusChip — pill trigger + PrimeVue Menu for state selection.
 *
 *     <LStatusChip
 *       :model-value="row.status"
 *       :label="row.statusLabel"
 *       :options="[
 *         { label: 'Active', value: 'active' },
 *         { label: 'Draft', value: 'draft' },
 *       ]"
 *       @update:model-value="setStatus"
 *     />
 *
 * options: [{ label, value, state?, active? }]
 * `state` drives chip/menu color; defaults to `value`.
 */
const props = defineProps({
    modelValue: { type: [String, Number], default: null },
    label: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    /** Override chip tone; defaults to modelValue. */
    state: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue', 'select']);

const menu = ref(null);
const open = ref(false);

const resolvedState = computed(() => props.state ?? props.modelValue ?? 'neutral');

const menuModel = computed(() =>
    (props.options || []).map((opt) => ({
        label: opt.label,
        value: opt.value,
        state: opt.state ?? opt.value,
        active: opt.active ?? opt.value === props.modelValue,
    })),
);

const onToggle = (event) => {
    open.value = true;
    menu.value?.toggle(event);
};

const onPick = (item) => {
    const raw = item?.item && typeof item.item === 'object' ? item.item : item;
    const value = raw?.value;
    if (value != null) {
        emit('update:modelValue', value);
        emit('select', raw);
    }
    menu.value?.hide?.();
};

defineExpose({ toggle: onToggle, hide: () => menu.value?.hide?.(), menu });
</script>
