<template>
  <section class="ppage-toolbar" :class="`ppage-toolbar--${tone}`">
    <div v-if="$slots.info" class="ppage-toolbar__info">
      <slot name="info" />
    </div>

    <div v-if="$slots.default" class="ppage-toolbar__actions">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
    tone: {
        type: String,
        default: 'glass',
        validator: (value) => ['glass', 'flat', 'solid'].includes(value),
    },
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.ppage-toolbar {
    --ppage-toolbar-padding-x: var(--px-space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--px-space-4);
    padding: var(--px-space-3) var(--ppage-toolbar-padding-x);
    border-radius: var(--px-radius-lg);
    border: 1px solid var(--px-border);
    flex-wrap: wrap;

    &--glass {
        background: var(--px-surface-strong);
        backdrop-filter: var(--px-blur-md);
        -webkit-backdrop-filter: var(--px-blur-md);
    }

    &--flat {
        background: transparent;
        border-color: transparent;
        padding-inline: 0;
    }

    &--solid {
        background: var(--px-surface);
    }

    &__info {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        flex-wrap: wrap;
        min-width: 0;
        color: var(--px-text-muted);
        font-size: var(--px-text-sm);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex-wrap: wrap;
        justify-content: flex-end;
    }
}
</style>
