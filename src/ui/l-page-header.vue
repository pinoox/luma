<template>
  <header class="ppage-header">
    <div class="ppage-header__icon" :style="iconStyle">
      <LIcon :name="icon" size="lg" />
    </div>

    <div class="ppage-header__text">
      <span v-if="eyebrow" class="ppage-header__eyebrow">{{ eyebrow }}</span>
      <h1 class="ppage-header__title">{{ title }}</h1>
      <p v-if="lead" class="ppage-header__lead">{{ lead }}</p>
    </div>

    <div v-if="$slots.default" class="ppage-header__actions">
      <slot />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import LIcon from './l-icon.vue';

const props = defineProps({
    title: { type: String, required: true },
    lead: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    icon: { type: String, default: '' },
    iconColor: { type: String, default: '' },
});

const iconStyle = computed(() =>
    props.iconColor ? { '--ppage-header-icon-color': props.iconColor } : null,
);
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.ppage-header {
    --ppage-header-accent: var(--px-primary);

    display: flex;
    align-items: center;
    gap: var(--px-space-4);
    padding: var(--px-space-2) var(--ppage-header-padding-x) var(--px-space-4);
    margin: 0;
    font-family: var(--px-font-sans);

    &__icon {
        --ppage-header-icon-color: var(--ppage-header-accent);

        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        border-radius: var(--px-radius-md);
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--ppage-header-icon-color) 18%, transparent) 0%,
            color-mix(in srgb, var(--ppage-header-icon-color) 6%, transparent) 100%
        );
        color: var(--ppage-header-icon-color);
        box-shadow:
            0 6px 18px -10px color-mix(in srgb, var(--ppage-header-icon-color) 80%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        border: 1px solid color-mix(in srgb, var(--ppage-header-icon-color) 24%, transparent);
        transition: transform $px-duration-base $px-easing-standard,
                    box-shadow $px-duration-base $px-easing-standard;
    }

    &__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
    }

    &__eyebrow {
        font-size: var(--px-text-2xs);
        font-weight: $px-weight-semibold;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ppage-header-icon-color, var(--px-primary));
        line-height: 1;
        margin-bottom: 2px;
    }

    &__title {
        margin: 0;
        font-size: var(--px-text-xl);
        font-weight: $px-weight-bold;
        color: var(--px-text);
        line-height: 1.15;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__lead {
        margin: 0;
        font-size: var(--px-text-sm);
        font-weight: $px-weight-medium;
        color: var(--px-text-muted);
        line-height: 1.4;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
}

// Button placeholder inside the actions slot — pulls from the
// Luma button system. Consumers compose visual treatment + severity
// + modifiers (e.g. `luma-btn--gradient luma-btn--primary
// luma-btn--spin-on-hover`) to fit their use case without forking
// this component.
</style>
