<template>
  <Menu
    ref="menu"
    :model="menuModel"
    popup
    :pt="{
      root: { class: 'luma-filter-menu' },
      list: { class: 'luma-filter-menu__list' },
    }"
  >
    <template #item="{ item }">
      <div
        v-if="item.heading"
        class="luma-filter-heading"
        role="presentation"
      >
        {{ item.label }}
      </div>
      <a
        v-else
        href="#"
        class="luma-filter-item"
        :class="{ 'is-on': !!item.active, 'is-off': !item.active }"
        role="menuitemcheckbox"
        :aria-checked="!!item.active"
        @click.prevent.stop="onPick(item)"
        @mousedown.prevent.stop
      >
        <span class="luma-filter-item__label">{{ item.label }}</span>
        <span class="luma-filter-item__icon" aria-hidden="true">
          <LIcon :name="item.active ? 'circle-check' : 'circle'" :size="16" />
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
 * LFilterMenu — popup checklist menu for table filter chips.
 *
 *     <button class="luma-filter-chip" @click="menu?.toggle($event)">…</button>
 *     <LFilterMenu ref="menu" :items="items" persist />
 *
 * items: [{ label, active, command, heading? }]
 */
const props = defineProps({
    items: { type: Array, default: () => [] },
    /** Keep menu open after pick (multi-select filters). */
    persist: { type: Boolean, default: false },
});

const menu = ref(null);

const menuModel = computed(() =>
    (props.items || []).map((item) => ({
        label: item.label,
        active: !!item.active,
        heading: !!item.heading,
        _command: item.command,
    })),
);

const onPick = (item) => {
    if (item?.heading || item?.item?.heading) return;
    const command = item?._command || item?.item?._command || item?.command;
    command?.();
    if (!props.persist) {
        menu.value?.hide?.();
    }
};

const toggle = (event) => menu.value?.toggle(event);
const hide = () => menu.value?.hide?.();

defineExpose({ toggle, hide, menu });
</script>
