<template>
    <button
        type="button"
        class="px-theme-toggle"
        :class="`px-theme-toggle--${theme}`"
        :aria-label="label"
        :title="label"
        @click="onClick"
    >
        <span class="px-theme-toggle__track">
            <span class="px-theme-toggle__thumb">
                <LIcon :name="isDark ? 'moon' : 'sun'" size="sm" />
            </span>
        </span>
    </button>
</template>

<script setup>
import { computed, inject } from 'vue';
import { LIcon } from '../../ui/index.js';

const theme = inject('theme', null);

const isDark = computed(() => theme?.theme?.value === 'dark');

const label = computed(() => (isDark.value ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'));

const onClick = () => {
    if (theme) {
        theme.toggleTheme();
    }
};
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-theme-toggle {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &__track {
        width: 56px;
        height: 30px;
        border-radius: var(--px-radius-pill);
        background: var(--px-surface-strong);
        border: 1px solid var(--px-border);
        box-shadow: var(--px-shadow-xs);
        position: relative;
        transition: background var(--px-duration-base) var(--px-easing-standard),
                    border-color var(--px-duration-base) var(--px-easing-standard);
    }

    &__thumb {
        position: absolute;
        top: 2px;
        inset-inline-start: 2px;
        width: 24px;
        height: 24px;
        border-radius: var(--px-radius-pill);
        background: var(--px-primary);
        color: var(--px-primary-contrast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform var(--px-duration-base) var(--px-easing-emphasized),
                    background var(--px-duration-base) var(--px-easing-standard);
    }

    &--dark &__thumb {
        transform: translateX(26px);
        background: var(--px-warning);
        color: var(--px-bg);
    }

    &:hover &__track {
        border-color: var(--px-primary);
    }
}
</style>