<template>
  <Toolbar :class="['luma-toolbar', `luma-toolbar--${align}`]" :pt="toolbarPt">
    <template v-if="$slots.start" #start>
      <slot name="start" />
    </template>
    <template v-if="$slots.center" #center>
      <slot name="center" />
    </template>
    <template v-if="$slots.end" #end>
      <slot name="end" />
    </template>
  </Toolbar>
</template>

<script setup>
import Toolbar from 'primevue/toolbar';

/**
 * LToolbar — themed wrapper around PrimeVue Toolbar.
 *
 * Slots (PrimeVue):
 *   #start  — left content
 *   #center — center content
 *   #end    — right content
 *
 * See: https://primevue.org/toolbar/
 */
defineProps({
    /** 'start' | 'center' | 'between' | 'end' */
    align: { type: String, default: 'between' },
});

const toolbarPt = {
    root: { class: 'luma-toolbar__root' },
};
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-toolbar.l-toolbar {
    &__root {
        background: var(--px-surface);
        border: 1px solid var(--px-border);
        border-radius: var(--px-radius-lg);
        padding: var(--px-space-3) var(--px-space-4);
        gap: var(--px-space-3);
    }

    display: flex;
    align-items: center;
    gap: var(--px-space-3);
    padding: var(--px-space-3) var(--px-space-4);
    background: var(--px-surface);
    border: 1px solid var(--px-border);
    border-radius: var(--px-radius-lg);

    &--start  { justify-content: flex-start; }
    &--end    { justify-content: flex-end; }
    &--center { justify-content: center; }
    &--between { justify-content: space-between; }
}
</style>
