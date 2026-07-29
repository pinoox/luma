<template>
    <div class="px-empty-state">
        <div v-if="icon || $slots.icon" class="px-empty-state__icon">
            <slot name="icon">
                <PIcon v-if="icon" :name="icon" size="lg" />
            </slot>
        </div>
        <h3 v-if="title" class="px-empty-state__title">{{ title }}</h3>
        <p v-if="description" class="px-empty-state__description">{{ description }}</p>
        <div v-if="$slots.action" class="px-empty-state__action">
            <slot name="action" />
        </div>
    </div>
</template>

<script setup>
import { PIcon } from '../../ui/index.js';

defineProps({
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
});
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--px-space-3);
    padding: var(--px-space-8) var(--px-space-4);

    &__icon {
        width: 64px;
        height: 64px;
        border-radius: var(--px-radius-pill);
        background: var(--px-primary-soft);
        color: var(--px-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    &__title {
        margin: 0;
        font-size: var(--px-text-lg);
        font-weight: var(--px-weight-semibold);
        color: var(--px-text);
    }

    &__description {
        margin: 0;
        max-width: 360px;
        font-size: var(--px-text-sm);
        color: var(--px-text-muted);
        line-height: var(--px-leading-relaxed);
    }

    &__action {
        margin-top: var(--px-space-2);
    }
}
</style>