<template>
  <Tag
      :class="['luma-badge', `luma-badge--${variant}`, dot && 'luma-badge--dot']"
      :severity="severityMap[variant]"
      :value="value"
      :icon="dot ? 'pi pi-circle-fill' : undefined"
      rounded
  >
    <slot />
  </Tag>
</template>

<script setup>
import Tag from 'primevue/tag';

/**
 * LBadge — themed wrapper around PrimeVue Tag.
 * Used for status pills, tags, and small indicators.
 *
 * See: https://primevue.org/tag/
 *
 * Variants:
 *   neutral | primary | success | warn | danger | info
 *
 * Props:
 *   variant — color variant
 *   dot     — show leading dot indicator
 *   value   — text (alternative to default slot)
 */
defineProps({
    variant: {
        type: String,
        default: 'neutral',
        validator: (v) => ['neutral', 'primary', 'success', 'warn', 'danger', 'info'].includes(v),
    },
    dot: { type: Boolean, default: false },
    value: { type: String, default: '' },
});

const severityMap = {
    neutral: 'secondary',
    primary: 'primary',
    success: 'success',
    warn: 'warn',
    danger: 'danger',
    info: 'info',
};
</script>

<style lang="scss">
@use '../scss/tokens' as *;

// LBadge — overrides PrimeVue Tag defaults to use Luma's
// softer translucent surface + theme tokens.
.luma-badge.l-tag {
    background: var(--_badge-bg);
    color: var(--_badge-fg);
    border: 1px solid var(--_badge-border, transparent);
    border-radius: $px-radius-pill;
    padding: 2px var(--px-space-2);
    font-size: var(--px-text-xs);
    font-weight: $px-weight-medium;
    line-height: 1.4;
    gap: var(--px-space-1);

    .l-tag-icon {
        margin: 0;
        font-size: 6px;
        width: 6px;
        height: 6px;
        min-width: 6px;
    }

    // Variants — theme-driven via --px-* tokens
    &--neutral {
        --_badge-bg: color-mix(in srgb, var(--px-text) 8%, transparent);
        --_badge-fg: var(--px-text-muted);
    }
    &--primary {
        --_badge-bg: color-mix(in srgb, var(--px-primary) 12%, transparent);
        --_badge-fg: var(--px-primary);
    }
    &--success {
        --_badge-bg: var(--px-success-soft, rgba(16, 185, 129, 0.15));
        --_badge-fg: var(--px-success-600, #059669);
    }
    &--warn {
        --_badge-bg: var(--px-warning-soft, rgba(245, 158, 11, 0.18));
        --_badge-fg: var(--px-warning-600, #D97706);
    }
    &--danger {
        --_badge-bg: var(--px-danger-soft, rgba(239, 68, 68, 0.12));
        --_badge-fg: var(--px-danger-600, #DC2626);
    }
    &--info {
        --_badge-bg: var(--px-info-soft, rgba(59, 130, 246, 0.12));
        --_badge-fg: var(--px-info-500, #3B82F6);
    }
}
</style>
