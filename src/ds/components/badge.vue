<template>
    <span :class="['px-badge', `px-badge--${tone}`, { 'px-badge--dot': dot, 'px-badge--pill': pill }]">
        <span v-if="dot" class="px-badge__dot" />
        <slot />
    </span>
</template>

<script setup>
defineProps({
    tone: {
        type: String,
        default: 'neutral',
        validator: (v) => ['primary', 'success', 'warning', 'danger', 'info', 'neutral'].includes(v),
    },
    dot: { type: Boolean, default: false },
    pill: { type: Boolean, default: true },
});
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    font-size: var(--px-text-xs);
    font-weight: var(--px-weight-semibold);
    line-height: 1.4;
    color: var(--px-text-soft);
    background: var(--px-surface-muted);
    border: 1px solid var(--px-border-soft);
    border-radius: var(--px-radius-md);

    &--pill {
        border-radius: var(--px-radius-pill);
    }

    &__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }

    &--primary {
        color: var(--px-primary);
        background: var(--px-primary-soft);
        border-color: transparent;
    }

    &--success {
        color: var(--px-success);
        background: var(--px-success-soft);
        border-color: transparent;
    }

    &--warning {
        color: var(--px-warning);
        background: var(--px-warning-soft);
        border-color: transparent;
    }

    &--danger {
        color: var(--px-danger);
        background: var(--px-danger-soft);
        border-color: transparent;
    }

    &--info {
        color: var(--px-info);
        background: var(--px-info-soft);
        border-color: transparent;
    }
}
</style>