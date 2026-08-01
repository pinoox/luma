<template>
    <div class="px-sidebar" :class="{ 'px-sidebar--collapsed': collapsed }">
        <div class="px-sidebar__brand">
            <slot name="brand">
                <div class="px-sidebar__brand-default">
                    <div class="px-sidebar__brand-mark">
                        <slot name="px-sidebar__brand-markbrand-logo">
                            <img v-if="brandLogo" :src="brandLogo" :alt="brandTitle" />
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
                    v-show="!isCollapsible(section) || !collapsedSections[section.key]"
                    class="px-sidebar__section-items"
                >
                    <component
                        :is="resolveLink(item)"
                        v-for="item in section.items"
                        :key="item.key"
                        :to="item.disabled || !item.to ? undefined : { name: item.to }"
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
                            <LIcon :name="item.icon" size="md" />
                        </span>
                        <span v-if="!collapsed" class="px-sidebar__link-text">{{ item.label }}</span>
                        <span v-if="!collapsed && item.badge" class="px-sidebar__link-badge">
                            {{ item.badge }}
                        </span>
                    </component>
                </div>
            </section>
        </nav>

        <div v-if="$slots.footer" class="px-sidebar__footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
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

props.sections.forEach((section) => {
    if (section.defaultCollapsed && section.key) {
        collapsedSections[section.key] = true;
    }
});

const brandInitials = computed(() => {
    const source = (props.brandTitle || '').replace(/[^a-zA-Z0-9آ-ی]/g, '');
    return (source || 'PX').slice(0, 2);
});

const isCollapsible = (section) => section.collapsible !== false && Boolean(section.label);

const toggleSection = (key) => {
    collapsedSections[key] = !collapsedSections[key];
};

const isActive = (item) => {
    if (item.to) return route.name === item.to;
    if (item.match) return item.match(route);
    return false;
};

const resolveLink = (item) => {
    if (item.disabled) return 'span';
    if (item.to || item.match) return RouterLink;
    return 'a';
};
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-sidebar {
    width: var(--px-sidebar-width);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--px-space-2);
    padding: var(--px-space-4) var(--px-space-3);
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
    }

    &__brand-default {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
    }

    &__brand-mark {
        width: 48px;
        height: 48px;
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

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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
        gap: var(--px-space-2);
        min-height: 0;
    }

    &__section {
        display: flex;
        flex-direction: column;
        gap: 6px;

        &--collapsed &__section-items {
            display: none;
        }
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
        gap: 2px;
    }

    &__link {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        padding: 12px 14px;
        border-radius: var(--px-radius-md);
        color: var(--px-text-soft);
        font-family: var(--px-font-sans);
        font-size: var(--px-text-md);
        font-weight: var(--px-weight-semibold);
        text-decoration: none;
        cursor: pointer;
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
}
</style>