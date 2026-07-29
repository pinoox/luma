<template>
    <nav class="px-mobile-nav">
        <component
            :is="resolveLink(item)"
            v-for="item in items"
            :key="item.key"
            :to="item.to ? { name: item.to } : undefined"
            :href="item.href"
            :class="['px-mobile-nav__item', { 'px-mobile-nav__item--active': isActive(item) }]"
        >
            <span class="px-mobile-nav__icon">
                <PIcon :name="item.icon" size="sm" />
            </span>
            <span class="px-mobile-nav__label">{{ item.label }}</span>
        </component>
    </nav>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router';
import { PIcon } from '../../ui/index.js';

defineProps({
    items: { type: Array, default: () => [] },
});

const route = useRoute();

const isActive = (item) => {
    if (item.to) return route.name === item.to;
    if (item.match) return item.match(route);
    return false;
};

const resolveLink = (item) => {
    if (item.to || item.match) return RouterLink;
    return 'a';
};
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-mobile-nav {
    display: none;
    gap: var(--px-space-2);
    padding: var(--px-space-2);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    background: var(--px-glass-bg);
    backdrop-filter: var(--px-blur-md);
    -webkit-backdrop-filter: var(--px-blur-md);
    border: 1px solid var(--px-glass-border);
    border-radius: var(--px-radius-lg);

    &::-webkit-scrollbar {
        display: none;
    }

    &__item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 16px;
        min-width: 88px;
        border-radius: var(--px-radius-md);
        color: var(--px-text-soft);
        text-decoration: none;
        font-weight: var(--px-weight-semibold);
        cursor: pointer;
        scroll-snap-align: start;
        flex-shrink: 0;
        transition: background var(--px-duration-fast) var(--px-easing-standard),
                    color var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            background: var(--px-primary-soft);
            color: var(--px-primary);
        }

        &--active {
            background: var(--px-primary-soft);
            color: var(--px-primary);
            font-weight: var(--px-weight-bold);
        }
    }

    &__icon {
        display: inline-flex;
    }

    &__label {
        font-size: var(--px-text-xs);
        white-space: nowrap;
    }

    @media (max-width: 768px) {
        display: flex;
    }
}
</style>