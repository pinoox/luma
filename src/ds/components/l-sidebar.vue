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
import { computed, reactive, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { LIcon } from '../../ui/index.js';

const props = defineProps({
    brandTitle: { type: String, default: 'اپلیکیشن' },
    brandSubtitle: { type: String, default: '' },
    brandLogo: { type: String, default: '' },
    sections: { type: Array, default: () => [] },
    collapsed: { type: Boolean, default: false },
});

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
    backdrop-filter: var(--px-blur-lg);
    -webkit-backdrop-filter: var(--px-blur-lg);
    border: 1px solid var(--px-glass-border);
    border-radius: var(--px-radius-lg);
    box-shadow: var(--px-shadow-glass);
    transition: width var(--px-duration-base) var(--px-easing-emphasized);
    overflow-y: auto;
    overflow-x: hidden;

    &--collapsed {
        width: 76px;
    }

    &__brand {
        padding: var(--px-space-2);
        padding-bottom: var(--px-space-3);
        margin-bottom: var(--px-space-1);
        border-bottom: 1px solid color-mix(in srgb, var(--px-border) 70%, transparent);
        flex-shrink: 0;
    }

    &__brand-default {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
    }

    &__brand-mark {
        width: 48px;
        height: 48px;
        min-width: 48px;
        min-height: 48px;
        max-width: 48px;
        max-height: 48px;
        border-radius: var(--px-radius-md);
        background: transparent;
        color: var(--px-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--px-weight-bold);
        font-size: var(--px-text-lg);
        flex-shrink: 0;
        overflow: hidden;
        box-sizing: border-box;
        line-height: 0;

        img,
        .px-sidebar__brand-img {
            width: 48px !important;
            height: 48px !important;
            max-width: 48px !important;
            max-height: 48px !important;
            object-fit: contain !important;
            display: block !important;
        }
    }

    &__brand-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: var(--px-leading-snug);

        strong {
            font-size: var(--px-text-lg);
            font-weight: var(--px-weight-bold);
            color: var(--px-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        span {
            font-size: var(--px-text-sm);
            color: var(--px-text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    &__nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-height: 0;
    }

    &__section {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }

    &__section-heading {
        padding: 8px 12px 2px;
        color: var(--px-text-muted);
        font-family: var(--px-font-sans);
        font-size: var(--px-text-xs);
        font-weight: var(--px-weight-bold);
        line-height: var(--px-leading-snug);
        user-select: none;
    }

    &__section-toggle {
        appearance: none;
        background: transparent;
        border: 0;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--px-space-2);
        color: var(--px-text-muted);
        font-family: var(--px-font-sans);
        font-size: var(--px-text-xs);
        font-weight: var(--px-weight-bold);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-radius: var(--px-radius-sm);
        cursor: pointer;
        transition: color var(--px-duration-fast) var(--px-easing-standard);
        width: 100%;

        &:hover {
            color: var(--px-text);
        }
    }

    &__chevron {
        transition: transform var(--px-duration-fast) var(--px-easing-standard);

        &--collapsed {
            transform: rotate(-90deg);
        }
    }

    &__section-label {
        font-family: var(--px-font-sans);
        font-weight: var(--px-weight-bold);
        font-size: var(--px-text-xs);
        letter-spacing: 0.04em;
    }

    &__section-items {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    &__link {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        padding: 0.58rem 0.8rem;
        border-radius: var(--px-radius-md);
        color: var(--px-text-soft);
        font-family: var(--px-font-sans);
        font-size: 0.9rem;
        font-weight: var(--px-weight-semibold);
        line-height: var(--px-leading-snug);
        text-decoration: none;
        cursor: pointer;
        transition: background var(--px-duration-fast) var(--px-easing-standard),
                    color var(--px-duration-fast) var(--px-easing-standard),
                    transform var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            background: var(--px-primary-soft);
            color: var(--px-primary);
        }

        &--active {
            background: var(--px-primary-soft);
            color: var(--px-primary);
            font-weight: var(--px-weight-bold);
        }

        &--menu {
            width: 100%;
            border: 0;
            background: transparent;
            text-align: inherit;

            .px-sidebar__chevron {
                margin-inline-start: auto;
                flex-shrink: 0;
                opacity: 0.7;
            }
        }

        &--sub {
            font-weight: 550;
            font-size: 0.86rem;
            padding-block: 0.48rem;
        }

        &--disabled {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
            color: var(--px-text-muted);

            &:hover {
                background: transparent;
                color: var(--px-text-muted);
            }

            .px-sidebar__link-badge {
                background: var(--px-surface-muted);
                color: var(--px-text-muted);
            }
        }

        &-icon {
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        &-text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        &-badge {
            font-size: var(--px-text-2xs);
            font-weight: var(--px-weight-bold);
            background: var(--px-danger);
            color: white;
            padding: 1px 7px;
            border-radius: var(--px-radius-pill);
            line-height: 1.4;
        }
    }

    &__footer {
        padding-top: var(--px-space-3);
        border-top: 1px solid var(--px-border-soft);
    }

    &__fold {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--px-duration-base) var(--px-easing-emphasized);

        &.is-open {
            grid-template-rows: 1fr;
        }
    }

    &__fold-inner {
        min-height: 0;
        overflow: hidden;
    }

    &__submenu {
        display: flex;
        flex-direction: column;
    }

    &__submenu-items {
        display: flex;
        flex-direction: column;
        gap: 0.08rem;
        padding-inline-start: 0.7rem;
        padding-block: 0.12rem 0.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .px-sidebar__fold,
    .px-sidebar__chevron {
        transition: none;
    }
}
</style>
