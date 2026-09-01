<template>
    <div class="px-sidebar" :class="{ 'px-sidebar--collapsed': collapsed }">
        <div class="px-sidebar__brand">
            <slot name="brand">
                <div class="px-sidebar__brand-default">
                    <div class="px-sidebar__brand-mark">
                        <slot name="brand-logo">
                            <img
                                v-if="brandLogo"
                                class="px-sidebar__brand-img"
                                :src="brandLogo"
                                :alt="brandTitle"
                                width="48"
                                height="48"
                            />
                            <span v-else>{{ brandInitials }}</span>
                        </slot>
                    </div>
                    <div v-if="!collapsed" class="px-sidebar__brand-meta">
                        <strong>{{ brandTitle }}</strong>
                        <span>{{ brandSubtitle }}</span>
                    </div>
                </div>
            </slot>
        </div>

        <nav class="px-sidebar__nav">
            <section
                v-for="section in sections"
                :key="section.key || section.label"
                class="px-sidebar__section"
                :class="{
                    'px-sidebar__section--grouped': isCollapsible(section),
                    'px-sidebar__section--collapsed': isCollapsible(section) && collapsedSections[section.key],
                }"
            >
                <button
                    v-if="isCollapsible(section)"
                    type="button"
                    class="px-sidebar__section-toggle"
                    :aria-expanded="!collapsedSections[section.key]"
                    @click="toggleSection(section.key)"
                >
                    <span class="px-sidebar__section-label">
                        {{ collapsed ? '' : section.label }}
                    </span>
                    <LIcon
                        name="chevron-down"
                        size="xs"
                        class="px-sidebar__chevron"
                        :class="{ 'px-sidebar__chevron--collapsed': collapsedSections[section.key] }"
                    />
                </button>

                <div
                    v-else-if="hasHeading(section)"
                    class="px-sidebar__section-heading"
                >
                    {{ section.label }}
                </div>

                <div
                    class="px-sidebar__fold"
                    :class="{ 'is-open': !isCollapsible(section) || !collapsedSections[section.key] }"
                >
                    <div class="px-sidebar__fold-inner">
                        <div class="px-sidebar__section-items">
                            <template v-for="item in section.items" :key="item.key">
                                <div v-if="hasChildren(item)" class="px-sidebar__submenu">
                                    <button
                                        type="button"
                                        class="px-sidebar__link px-sidebar__link--menu"
                                        :class="{ 'px-sidebar__link--active': isGroupActive(item) }"
                                        :aria-expanded="isGroupOpen(item)"
                                        @click="toggleGroup(item.key)"
                                    >
                                        <span class="px-sidebar__link-icon">
                                            <LIcon :name="item.icon" size="lg" />
                                        </span>
                                        <span v-if="!collapsed" class="px-sidebar__link-text">{{ item.label }}</span>
                                        <LIcon
                                            v-if="!collapsed"
                                            name="chevron-down"
                                            size="xs"
                                            class="px-sidebar__chevron"
                                            :class="{ 'px-sidebar__chevron--collapsed': !isGroupOpen(item) }"
                                        />
                                    </button>
                                    <div
                                        v-if="!collapsed"
                                        class="px-sidebar__fold"
                                        :class="{ 'is-open': isGroupOpen(item) }"
                                    >
                                        <div class="px-sidebar__fold-inner">
                                            <div class="px-sidebar__submenu-items">
                                                <component
                                                    :is="resolveLink(child)"
                                                    v-for="child in item.children"
                                                    :key="child.key"
                                                    :to="linkTo(child)"
                                                    :href="child.disabled ? undefined : child.href"
                                                    class="px-sidebar__link px-sidebar__link--sub"
                                                    :class="{
                                                        'px-sidebar__link--active': isActive(child),
                                                        'px-sidebar__link--disabled': child.disabled,
                                                    }"
                                                    @pointerenter="onHoverItem(child)"
                                                    @focus="onHoverItem(child)"
                                                >
                                                    <span class="px-sidebar__link-icon">
                                                        <LIcon :name="child.icon" size="lg" />
                                                    </span>
                                                    <span class="px-sidebar__link-text">{{ child.label }}</span>
                                                </component>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <component
                                    :is="resolveLink(item)"
                                    v-else
                                    :to="linkTo(item)"
                                    :href="item.disabled ? undefined : item.href"
                                    :aria-disabled="item.disabled ? 'true' : undefined"
                                    :tabindex="item.disabled ? -1 : undefined"
                                    :class="[
                                        'px-sidebar__link',
                                        {
                                            'px-sidebar__link--active': !item.disabled && isActive(item),
                                            'px-sidebar__link--disabled': item.disabled,
                                        },
                                    ]"
                                    @click="item.disabled ? $event.preventDefault() : undefined"
                                    @pointerenter="onHoverItem(item)"
                                    @focus="onHoverItem(item)"
                                >
                                    <span class="px-sidebar__link-icon">
                                        <LIcon :name="item.icon" size="lg" />
                                    </span>
                                    <span v-if="!collapsed" class="px-sidebar__link-text">{{ item.label }}</span>
                                    <span v-if="!collapsed && item.badge" class="px-sidebar__link-badge">
                                        {{ item.badge }}
                                    </span>
                                </component>
                            </template>
                        </div>
                    </div>
                </div>
            </section>
        </nav>

        <div v-if="$slots.footer" class="px-sidebar__footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { prefetchRoute, prefetchNavItemsOnIdle } from '../../router/prefetch.js';
import { LIcon } from '../../ui/index.js';

const props = defineProps({
    brandTitle: { type: String, default: 'اپلیکیشن' },
    brandSubtitle: { type: String, default: '' },
    brandLogo: { type: String, default: '' },
    sections: { type: Array, default: () => [] },
    collapsed: { type: Boolean, default: false },
});

let router = null;
try {
    router = useRouter();
} catch (_) {}

const route = useRoute();
const collapsedSections = reactive({});
const openGroups = reactive({});

props.sections.forEach((section) => {
    if (section.collapsible === true && section.defaultCollapsed && section.key) {
        collapsedSections[section.key] = true;
    }
});

const brandInitials = computed(() => {
    const source = (props.brandTitle || '').replace(/[^a-zA-Z0-9آ-ی]/g, '');
    return (source || 'PX').slice(0, 2);
});

/** Opt-in: only collapse when `collapsible: true`. Otherwise the label is a static heading. */
const isCollapsible = (section) => section.collapsible === true && Boolean(section.label);

const hasHeading = (section) => Boolean(section.label) && !isCollapsible(section) && !props.collapsed;

const toggleSection = (key) => {
    collapsedSections[key] = !collapsedSections[key];
};

const isActive = (item) => {
    const name = routeName(item);
    if (name) return route.name === name;
    if (item.match) return item.match(route);
    return false;
};

/** Apps may use `route` (theme config) or `to` (RouterLink-style). */
const routeName = (item) => item?.route || item?.to || null;

const linkTo = (item) => {
    if (item.disabled) return undefined;
    const name = routeName(item);
    return name ? { name } : undefined;
};

const resolveLink = (item) => {
    if (item.disabled) return 'span';
    if (routeName(item) || item.match) return RouterLink;
    return 'a';
};

const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0;

const isGroupActive = (item) => (item.children || []).some((child) => isActive(child));

const isGroupOpen = (item) => !!(item?.key && openGroups[item.key]);

const toggleGroup = (key) => {
    if (!key) return;
    openGroups[key] = !openGroups[key];
};

const onHoverItem = (item) => {
    if (!router || item?.disabled) return;
    const target = linkTo(item);
    if (target) {
        prefetchRoute(router, target);
    }
};

onMounted(() => {
    if (router && props.sections?.length) {
        prefetchNavItemsOnIdle(router, props.sections);
    }
});

watch(
    () => route.name,
    () => {
        for (const section of props.sections || []) {
            for (const item of section.items || []) {
                if (item.key && hasChildren(item) && isGroupActive(item)) {
                    openGroups[item.key] = true;
                }
            }
        }
    },
    { immediate: true },
);
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-sidebar {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--px-space-2);
    padding: var(--px-space-4) var(--px-space-3);
    // Floating panel — same glass treatment as LTopbar.
    background: var(--px-glass-bg);
    backdrop-filter: var(--px-blur-md);
    -webkit-backdrop-filter: var(--px-blur-md);
    border: 1px solid var(--px-glass-border);
    border-radius: var(--px-radius-lg);
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    user-select: none;
    transition: width var(--px-duration-base) var(--px-easing-standard),
                padding var(--px-duration-base) var(--px-easing-standard);

    &--collapsed {
        padding-inline: var(--px-space-2);

        .px-sidebar__brand {
            justify-content: center;
        }

        .px-sidebar__link {
            justify-content: center;
            padding-inline: 0;
        }

        .px-sidebar__section-heading {
            display: none;
        }
    }

    &__brand {
        display: flex;
        align-items: center;
        padding-inline: var(--px-space-2);
        padding-block: var(--px-space-2);
        flex-shrink: 0;
    }

    &__brand-default {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        min-width: 0;
    }

    &__brand-mark {
        width: 36px;
        height: 36px;
        border-radius: var(--px-radius-md);
        background: var(--px-primary-soft);
        color: var(--px-primary);
        font-weight: var(--px-weight-bold);
        font-size: var(--px-text-sm);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
    }

    &__brand-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__brand-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;

        strong {
            font-size: var(--px-text-sm);
            font-weight: var(--px-weight-bold);
            color: var(--px-text);
            line-height: var(--px-leading-tight);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        span {
            font-size: var(--px-text-xs);
            color: var(--px-text-muted);
            line-height: var(--px-leading-tight);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    &__nav {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--px-space-3);
        padding-inline: 0;
        margin-inline: 0;

        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background: var(--px-border);
            border-radius: var(--px-radius-full);
        }
    }

    &__section {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__section-heading {
        font-size: 11px;
        font-weight: var(--px-weight-bold);
        color: var(--px-text-muted);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: var(--px-space-1) var(--px-space-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__section-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: var(--px-space-1) var(--px-space-2);
        font-family: inherit;
        text-align: inherit;
        color: var(--px-text-muted);
        border-radius: var(--px-radius-sm);
        transition: color var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            color: var(--px-text);
        }
    }

    &__section-label {
        font-size: 11px;
        font-weight: var(--px-weight-bold);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__section-items {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__fold {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--px-duration-base) var(--px-easing-standard);

        &.is-open {
            grid-template-rows: 1fr;
        }
    }

    &__fold-inner {
        overflow: hidden;
    }

    &__submenu {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__submenu-items {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-inline-start: var(--px-space-4);
        margin-top: 2px;
    }

    &__link {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        padding: 7px var(--px-space-2);
        border-radius: var(--px-radius-md);
        color: var(--px-text-soft);
        text-decoration: none;
        font-size: var(--px-text-sm);
        font-weight: var(--px-weight-medium);
        background: transparent;
        border: 0;
        width: 100%;
        text-align: inherit;
        font-family: inherit;
        cursor: pointer;
        transition: background var(--px-duration-fast) var(--px-easing-standard),
                    color var(--px-duration-fast) var(--px-easing-standard);

        &:hover:not(&--disabled) {
            background: var(--px-surface-hover, rgba(0, 0, 0, 0.04));
            color: var(--px-text);
        }

        &--active {
            background: var(--px-primary-soft) !important;
            color: var(--px-primary) !important;
            font-weight: var(--px-weight-semibold);
        }

        &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &--sub {
            font-size: var(--px-text-xs);
            padding-block: 5px;
        }

        &--menu {
            justify-content: space-between;
        }
    }

    &__link-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
    }

    &__link-text {
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__link-badge {
        font-size: 10px;
        font-weight: var(--px-weight-semibold);
        padding: 1px 6px;
        border-radius: var(--px-radius-full);
        background: var(--px-primary-soft);
        color: var(--px-primary);
        flex-shrink: 0;
    }

    &__chevron {
        flex-shrink: 0;
        transition: transform var(--px-duration-fast) var(--px-easing-standard);

        &--collapsed {
            transform: rotate(-90deg);
        }
    }

    &__footer {
        flex-shrink: 0;
        padding-top: var(--px-space-2);
        border-top: 1px solid var(--px-border);
    }
}
</style>
