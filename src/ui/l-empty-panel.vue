<template>
  <div
    class="empty-panel"
    :class="[
      `empty-panel--${tone}`,
      `empty-panel--${size}`,
      loading && 'empty-panel--loading',
    ]"
  >
    <div v-if="loading" class="empty-panel__loader">
      <LSpinner />
    </div>

    <template v-else>
      <div v-if="icon || $slots.icon" class="empty-panel__icon">
        <slot name="icon">
          <LIcon :name="icon" :size="iconSize" />
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

      <div v-if="$slots.actions || actionLabel" class="empty-panel__actions">
        <slot name="actions">
          <LButton
            :variant="actionVariant"
            :size="actionSize"
            shape="rounded"
            :icon="actionIcon"
            @click="emit('action')"
          >
            {{ actionLabel }}
          </LButton>
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LIcon from './l-icon.vue';
import LSpinner from './l-spinner.vue';
import LButton from './l-button.vue';

/**
 * LEmptyPanel — empty / loading placeholder.
 *
 *     <LEmptyPanel icon="inbox" title="No items" message="Create the first one." />
 *
 *     <LEmptyPanel
 *       icon="package"
 *       title="No products"
 *       action-label="Add product"
 *       @action="openCreate"
 *     />
 *
 * Tones: dashed | solid | plain
 * Sizes: sm (tables) | md | lg
 */
const props = defineProps({
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: {
        type: String,
        default: 'dashed',
        validator: (value) => ['dashed', 'solid', 'plain'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    loading: { type: Boolean, default: false },
    actionLabel: { type: String, default: '' },
    actionIcon: { type: String, default: 'plus' },
    actionVariant: {
        type: String,
        default: 'outline',
    },
});

const emit = defineEmits(['action']);

const iconSize = computed(() => {
    if (props.size === 'sm') return 22;
    if (props.size === 'lg') return 32;
    return 26;
});

const actionSize = computed(() => (props.size === 'lg' ? 'md' : 'sm'));
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.empty-panel {
    --_empty-pad-y: var(--px-space-8);
    --_empty-pad-x: var(--px-space-5);
    --_empty-min-h: 15rem;
    --_empty-icon: 3.5rem;
    --_empty-ring: 0.55rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--px-space-2);
    padding: var(--_empty-pad-y) var(--_empty-pad-x);
    border-radius: var(--px-radius-lg);
    background: var(--px-surface-strong);
    color: var(--px-text-muted);
    font-size: var(--px-text-sm);
    flex: 1;
    min-height: var(--_empty-min-h);

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

    &--sm {
        --_empty-pad-y: var(--px-space-6);
        --_empty-pad-x: var(--px-space-4);
        --_empty-min-h: 12rem;
        --_empty-icon: 2.85rem;
        --_empty-ring: 0.4rem;
        gap: var(--px-space-1);
    }

    &--lg {
        --_empty-pad-y: var(--px-space-10, 3rem);
        --_empty-min-h: 18rem;
        --_empty-icon: 4.25rem;
        --_empty-ring: 0.7rem;
        gap: var(--px-space-3);
    }

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
        width: var(--_empty-icon);
        height: var(--_empty-icon);
        margin-bottom: var(--px-space-1);
        border-radius: 999px;
        background: color-mix(in srgb, var(--px-primary) 12%, var(--px-surface-strong, #fff));
        color: var(--px-primary);
        box-shadow: 0 0 0 var(--_empty-ring) color-mix(in srgb, var(--px-primary) 8%, transparent);
    }

    &__title {
        font-size: var(--px-text-base);
        font-weight: $px-weight-semibold;
        color: var(--px-text);
        line-height: 1.35;
    }

    &--lg &__title {
        font-size: var(--px-text-lg, 1.125rem);
    }

    &--sm &__title {
        font-size: var(--px-text-sm);
        font-weight: $px-weight-semibold;
    }

    &__message {
        max-width: 36rem;
        line-height: var(--px-leading-relaxed);
    }

    &__actions {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: var(--px-space-2);
        margin-top: var(--px-space-2);
    }
}
</style>
