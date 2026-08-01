<template>
    <article
        :class="['px-card', `px-card--${variant}`, { 'px-card--interactive': interactive }]"
        :role="interactive ? 'button' : null"
        :tabindex="interactive ? 0 : null"
    >
        <header v-if="$slots.header || title" class="px-card__header">
            <div v-if="icon || $slots.icon" class="px-card__icon">
                <slot name="icon">
                    <LIcon v-if="icon" :name="icon" size="md" />
                </slot>
            </div>
            <div class="px-card__heading">
                <h3 v-if="title" class="px-card__title">{{ title }}</h3>
                <p v-if="subtitle" class="px-card__subtitle">{{ subtitle }}</p>
                <slot name="header" />
            </div>
            <div v-if="$slots.actions" class="px-card__actions">
                <slot name="actions" />
            </div>
        </header>

        <div class="px-card__body">
            <slot />
        </div>

        <footer v-if="$slots.footer" class="px-card__footer">
            <slot name="footer" />
        </footer>
    </article>
</template>

<script setup>
import { LIcon } from '../../ui/index.js';

defineProps({
    variant: {
        type: String,
        default: 'glass',
        validator: (v) => ['glass', 'solid', 'outline'].includes(v),
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    interactive: { type: Boolean, default: false },
});
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-card {
    --px-card-bg: var(--px-glass-bg);
    --px-card-border: var(--px-glass-border);
    --px-card-shadow: var(--px-shadow-glass);

    display: flex;
    flex-direction: column;
    gap: var(--px-space-4);
    padding: var(--px-space-5);
    border-radius: var(--px-radius-lg);
    background: var(--px-card-bg);
    backdrop-filter: var(--px-blur-md);
    -webkit-backdrop-filter: var(--px-blur-md);
    border: 1px solid var(--px-card-border);
    box-shadow: var(--px-card-shadow);
    transition: transform var(--px-duration-base) var(--px-easing-standard),
                box-shadow var(--px-duration-base) var(--px-easing-standard),
                border-color var(--px-duration-base) var(--px-easing-standard);

    &--solid {
        --px-card-bg: var(--px-surface-strong);
        --px-card-border: var(--px-border);
        --px-card-shadow: var(--px-shadow-sm);
        backdrop-filter: none;
    }

    &--outline {
        --px-card-bg: transparent;
        --px-card-border: var(--px-border);
        --px-card-shadow: none;
        backdrop-filter: none;
    }

    &--interactive {
        cursor: pointer;

        &:hover {
            transform: translateY(-2px);
            border-color: var(--px-primary);
            box-shadow: var(--px-shadow-floating);
        }

        &:active {
            transform: translateY(0);
        }
    }

    &__header {
        display: flex;
        align-items: flex-start;
        gap: var(--px-space-3);
    }

    &__icon {
        width: 40px;
        height: 40px;
        border-radius: var(--px-radius-md);
        background: var(--px-primary-soft);
        color: var(--px-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    &__heading {
        flex: 1;
        min-width: 0;
    }

    &__title {
        margin: 0;
        font-size: var(--px-text-md);
        font-weight: var(--px-weight-bold);
        color: var(--px-text);
        line-height: var(--px-leading-tight);
    }

    &__subtitle {
        margin: 2px 0 0;
        font-size: var(--px-text-xs);
        color: var(--px-text-muted);
        line-height: var(--px-leading-snug);
    }

    &__actions {
        flex-shrink: 0;
    }

    &__body {
        flex: 1;
        min-width: 0;
    }

    &__footer {
        padding-top: var(--px-space-3);
        border-top: 1px solid var(--px-border-soft);
    }
}
</style>