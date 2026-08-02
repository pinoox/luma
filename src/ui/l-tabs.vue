<template>
  <nav class="luma-tabs" :class="[`luma-tabs--${variant}`, { 'luma-tabs--flush': flush }]">
    <div class="luma-tabs__list" role="tablist">
      <component
        :is="item.to ? 'router-link' : 'button'"
        v-for="(item, idx) in items"
        :key="itemKey(item, idx)"
        v-bind="itemBindings(item)"
        class="luma-tabs__tab"
        :class="{ 'is-active': isActive(item) }"
        role="tab"
        :aria-selected="isActive(item)"
        @click="onClick(item, $event)"
      >
        <LIcon v-if="item.icon" :name="item.icon" size="sm" class="luma-tabs__icon" />
        <span class="luma-tabs__label">{{ item.label }}</span>
        <span v-if="item.badge != null && item.badge !== ''" class="luma-tabs__badge">{{ item.badge }}</span>
      </component>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LIcon from './l-icon.vue';

/**
 * LTabs — table-chrome tab strip for page / workspace navigation.
 *
 * Table variant mirrors `.luma-table` thead cells (shared border, muted
 * header band, column separators). Pill variant is a softer segmented control.
 *
 *     <LTabs :items="[
 *       { label: 'Board', icon: 'columns-3', to: { name: 'board' } },
 *       { label: 'Table', icon: 'table', to: { name: 'table' } },
 *     ]" />
 */
const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    /** Controlled value when items use `value` instead of `to`. */
    modelValue: { type: [String, Number], default: null },
    variant: {
        type: String,
        default: 'table',
        validator: (v) => ['table', 'pill'].includes(v),
    },
    /** Drop outer radius/border when nested inside LPanel. */
    flush: { type: Boolean, default: false },
    exact: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'select']);

const route = useRoute();

const activeValue = computed(() => props.modelValue);

const itemKey = (item, idx) => item.value ?? item.name ?? item.label ?? idx;

const itemBindings = (item) => {
    if (item.to) {
        return {
            to: item.to,
            type: undefined,
        };
    }
    return {
        type: 'button',
    };
};

const routeMatches = (to, exact = false) => {
    if (!to) return false;
    const resolved = typeof to === 'string'
        ? { name: null, path: to }
        : to;
    const useExact = exact || props.exact;
    if (resolved.name) {
        if (useExact) return route.name === resolved.name;
        return route.name === resolved.name
            || (typeof route.name === 'string' && typeof resolved.name === 'string'
                && route.name.startsWith(`${resolved.name}.`));
    }
    if (resolved.path) {
        return useExact
            ? route.path === resolved.path
            : route.path === resolved.path || route.path.startsWith(`${resolved.path}/`);
    }
    return false;
};

const isActive = (item) => {
    if (item.to) return routeMatches(item.to, !!item.exact);
    if (item.value != null) return activeValue.value === item.value;
    return false;
};

const onClick = (item, event) => {
    if (item.to) {
        emit('select', item);
        return;
    }
    event?.preventDefault?.();
    if (item.value != null) emit('update:modelValue', item.value);
    emit('select', item);
};
</script>

<style lang="scss">
.luma-tabs {
    --luma-tabs-bg: var(--px-surface-strong, var(--px-surface));
    --luma-tabs-border: var(--px-border);
    --luma-tabs-muted: var(--px-surface-muted);
    background: var(--luma-tabs-bg);
    border: 1px solid var(--luma-tabs-border);
    border-radius: var(--px-radius-lg, 14px);
    overflow: hidden;

    &--flush {
        border: 0;
        border-radius: 0;
        border-bottom: 1px solid var(--luma-tabs-border);
    }

    &__list {
        display: flex;
        align-items: stretch;
        overflow-x: auto;
        scrollbar-width: thin;
    }

    &__tab {
        appearance: none;
        border: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.75rem 1.1rem;
        margin: 0;
        font: inherit;
        font-size: var(--px-text-sm, 0.85rem);
        font-weight: 700;
        color: var(--px-text-muted);
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;

        &:hover {
            color: var(--px-text);
            background: color-mix(in srgb, var(--px-primary) 5%, transparent);
        }
    }

    &__icon {
        flex-shrink: 0;
        opacity: 0.85;
    }

    &__badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.4rem;
        border-radius: 999px;
        background: var(--px-surface-muted);
        color: var(--px-text-soft, var(--px-text-muted));
    }

    // Table-like: shared thead band + column separators
    &--table {
        .luma-tabs__list {
            background: var(--luma-tabs-muted);
        }

        .luma-tabs__tab {
            flex: 1 1 auto;
            min-width: max-content;
            border-inline-end: 1px solid var(--luma-tabs-border);
            border-bottom: 2px solid transparent;

            &:last-child {
                border-inline-end: 0;
            }

            &.is-active {
                color: var(--px-text);
                background: var(--luma-tabs-bg);
                border-bottom-color: var(--px-primary);
                box-shadow: inset 0 1px 0 color-mix(in srgb, var(--px-primary) 18%, transparent);
            }

            &.is-active .luma-tabs__badge {
                background: color-mix(in srgb, var(--px-primary) 14%, transparent);
                color: var(--px-primary);
            }
        }
    }

    &--pill {
        padding: 0.3rem;

        .luma-tabs__list {
            gap: 0.25rem;
            background: transparent;
        }

        .luma-tabs__tab {
            border-radius: var(--px-radius-md, 10px);
            font-weight: 650;

            &.is-active {
                background: var(--px-primary);
                color: #fff;
            }
        }
    }
}

[data-theme='dark'] .luma-tabs--table .luma-tabs__tab.is-active {
    background: color-mix(in srgb, var(--px-surface) 88%, var(--px-primary));
}
</style>
