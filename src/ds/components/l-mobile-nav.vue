<template>
    <nav class="px-mobile-nav">
        <component
            :is="resolveLink(item)"
            v-for="item in items"
            :key="item.key"
            :to="linkTo(item)"
            :href="item.disabled ? undefined : item.href"
            :aria-disabled="item.disabled ? 'true' : undefined"
            :tabindex="item.disabled ? -1 : undefined"
            :class="[
                'px-mobile-nav__item',
                {
                    'px-mobile-nav__item--active': !item.disabled && isActive(item),
                    'px-mobile-nav__item--disabled': item.disabled,
                },
            ]"
            @pointerenter="onHoverItem(item)"
            @focus="onHoverItem(item)"
        >
            <span class="px-mobile-nav__icon">
                <LIcon :name="item.icon" size="md" />
            </span>
            <span class="px-mobile-nav__label">{{ item.label }}</span>
            <span v-if="item.badge" class="px-mobile-nav__badge">{{ item.badge }}</span>
        </component>
    </nav>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { prefetchRoute, prefetchNavItemsOnIdle } from '../../router/prefetch.js';
import { LIcon } from '../../ui/index.js';

const props = defineProps({
    items: { type: Array, default: () => [] },
});

let router = null;
try {
    router = useRouter();
} catch (_) {}

const route = useRoute();

const routeName = (item) => item?.route || item?.to || null;

const linkTo = (item) => {
    if (item.disabled) return undefined;
    const name = routeName(item);
    return name ? { name } : undefined;
};

const isActive = (item) => {
    const name = routeName(item);
    if (name) return route.name === name;
    if (item.match) return item.match(route);
    return false;
};

const resolveLink = (item) => {
    if (item.disabled) return 'span';
    if (routeName(item) || item.match) return RouterLink;
    return 'a';
};

const onHoverItem = (item) => {
    if (!router || item?.disabled) return;
    const target = linkTo(item);
    if (target) {
        prefetchRoute(router, target);
    }
};

onMounted(() => {
    if (router && props.items?.length) {
        prefetchNavItemsOnIdle(router, props.items);
    }
});
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

        &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
    }

    &__icon {
        display: inline-flex;
    }

    &__label {
        font-size: var(--px-text-xs);
        white-space: nowrap;
    }

    &__badge {
        font-size: 9px;
        font-weight: var(--px-weight-bold);
        color: var(--px-text-muted);
        line-height: 1.2;
    }

    @media (max-width: 768px) {
        display: flex;
    }
}
</style>
