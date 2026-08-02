<template>
  <article
      class="luma-stat-card"
      :class="[
          `luma-stat-card--${tone}`,
          interactive && 'luma-stat-card--interactive',
      ]"
  >
    <div v-if="icon || $slots.icon" class="luma-stat-card__icon">
      <slot name="icon">
        <LIcon v-if="icon" :name="icon" :size="22" />
      </slot>
    </div>
    <div class="luma-stat-card__body">
      <div v-if="label || $slots.label" class="luma-stat-card__label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div class="luma-stat-card__value">
        <slot>{{ value }}</slot>
      </div>
      <div v-if="hint || $slots.hint" class="luma-stat-card__hint">
        <slot name="hint">{{ hint }}</slot>
      </div>
    </div>
  </article>
</template>

<script setup>
import LIcon from './l-icon.vue';

/**
 * LStatCard — KPI / metric card on Luma surface tokens.
 * Light/dark and applyThemeConfig brand colors apply automatically.
 */
defineProps({
    label: { type: String, default: '' },
    value: { type: [String, Number], default: '' },
    hint: { type: String, default: '' },
    /** Lucide icon name (via LIcon). */
    icon: { type: String, default: '' },
    tone: {
        type: String,
        default: 'primary',
        validator: (v) =>
            ['primary', 'success', 'warning', 'danger', 'info', 'violet', 'neutral'].includes(v),
    },
    interactive: { type: Boolean, default: false },
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-stat-card {
    --luma-stat-accent: var(--px-primary);
    --luma-stat-accent-fg: var(--px-primary-contrast);

    display: flex;
    gap: var(--px-space-3);
    align-items: flex-start;
    padding: var(--px-space-4) calc(var(--px-space-4) + 2px);
    border-radius: var(--px-radius-lg);
    background: var(--px-surface-strong);
    border: 1px solid var(--px-border);
    color: var(--px-text);
    transition:
        transform $px-duration-base $px-easing-standard,
        box-shadow $px-duration-base $px-easing-standard,
        border-color $px-duration-base $px-easing-standard,
        background $px-duration-base $px-easing-standard;

    &--interactive {
        cursor: pointer;

        &:hover {
            transform: translateY(-1px);
            border-color: var(--luma-stat-accent);
            box-shadow: var(--px-shadow-md);
        }
    }

    &--primary {
        --luma-stat-accent: var(--px-primary);
    }

    &--success {
        --luma-stat-accent: var(--px-success);
    }

    &--warning {
        --luma-stat-accent: var(--px-warning);
    }

    &--danger {
        --luma-stat-accent: var(--px-danger);
    }

    &--info {
        --luma-stat-accent: var(--px-info);
    }

    &--violet {
        --luma-stat-accent: #8b5cf6;
    }

    &--neutral {
        --luma-stat-accent: var(--px-text-soft);
        --luma-stat-accent-fg: var(--px-text);
    }

    &__icon {
        width: 42px;
        height: 42px;
        border-radius: var(--px-radius-md);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        background: var(--luma-stat-accent);
        color: var(--luma-stat-accent-fg);
    }

    &__body {
        min-width: 0;
        flex: 1;
    }

    &__label {
        font-size: var(--px-text-xs);
        color: var(--px-text-muted);
        margin-bottom: 2px;
        line-height: var(--px-leading-snug);
    }

    &__value {
        font-size: var(--px-text-2xl);
        font-weight: var(--px-weight-bold);
        line-height: var(--px-leading-tight);
        color: var(--px-text);
    }

    &__hint {
        font-size: var(--px-text-2xs);
        color: var(--px-text-muted);
        margin-top: 4px;
        line-height: var(--px-leading-snug);
    }
}

[data-theme='dark'] .luma-stat-card--violet {
    --luma-stat-accent: #a78bfa;
}
</style>
