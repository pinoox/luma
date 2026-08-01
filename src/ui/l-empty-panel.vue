<template>
  <div class="empty-panel" :class="[`empty-panel--${tone}`, loading && 'empty-panel--loading']">
    <div v-if="loading" class="empty-panel__loader">
      <LSpinner />
    </div>

    <template v-else>
      <div v-if="icon || $slots.icon" class="empty-panel__icon">
        <slot name="icon">
          <LIcon :name="icon" size="lg" />
        </slot>
      </div>

      <div v-if="title || $slots.title" class="empty-panel__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <div v-if="$slots.default || message" class="empty-panel__message">
        <slot>
          {{ message }}
        </slot>
      </div>

      <div v-if="$slots.actions" class="empty-panel__actions">
        <slot name="actions" />
      </div>
    </template>
  </div>
</template>

<script setup>
import LIcon from './l-icon.vue';
import LSpinner from './l-spinner.vue';

/**
 * LEmptyPanel — placeholder block for empty states and skeleton
 * loaders. The `loading` flag swaps the icon/title/message for a
 * centered spinner so the same panel can stand in for "fetching"
 * and "no results" without changing the layout.
 *
 * Tones:
 *   dashed | solid | plain
 */
defineProps({
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: {
        type: String,
        default: 'dashed',
        validator: (value) => ['dashed', 'solid', 'plain'].includes(value),
    },
    /**
     * When true, replace the icon/title/message with a centered
     * `<LSpinner />`. The panel keeps its border/padding/min-height
     * so layout is stable between loading and empty.
     */
    loading: { type: Boolean, default: false },
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--px-space-2);
    padding: var(--px-space-8) var(--px-space-5);
    border-radius: var(--px-radius-lg);
    background: var(--px-surface-strong);
    color: var(--px-text-muted);
    font-size: var(--px-text-sm);
    flex: 1;
    min-height: 240px;

    &--dashed {
        border: 1px dashed var(--px-border);
    }

    &--solid {
        border: 1px solid var(--px-border);
    }

    &--plain {
        border: 0;
        background: transparent;
        padding-block: var(--px-space-6);
    }

    // Loading state replaces icon/title/message with a centered spinner.
    &__loader {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--px-space-2);
    }

    &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--px-radius-md);
        background: var(--px-primary-soft);
        color: var(--px-primary);
    }

    &__title {
        font-size: var(--px-text-base);
        font-weight: $px-weight-semibold;
        color: var(--px-text);
    }

    &__message {
        max-width: 52ch;
        line-height: var(--px-leading-relaxed);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        margin-top: var(--px-space-2);
    }
}
</style>