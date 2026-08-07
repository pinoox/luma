<template>
    <header class="px-topbar">
        <button
            type="button"
            class="px-topbar__menu-btn"
            aria-label="Menu"
            @click="$emit('menu')"
        >
            <slot name="menu-button">
                <LIcon name="menu" size="md" />
            </slot>
        </button>

        <div class="px-topbar__primary">
            <slot name="leading" />

            <button
                v-if="spotlight"
                type="button"
                class="px-topbar__spotlight"
                :aria-label="spotlightPlaceholder"
                @click="$emit('spotlight')"
            >
                <LIcon name="search" size="sm" class="px-topbar__spotlight-icon" />
                <span class="px-topbar__spotlight-text">{{ spotlightPlaceholder }}</span>
                <kbd v-if="spotlightShortcut" class="px-topbar__spotlight-kbd">{{ spotlightShortcut }}</kbd>
            </button>

            <div v-else class="px-topbar__title">
                <strong>{{ title }}</strong>
                <span v-if="subtitle">{{ subtitle }}</span>
            </div>

            <div v-if="searchable && !spotlight" class="px-topbar__search">
                <IconField>
                    <InputIcon>
                        <LIcon name="search" size="sm" />
                    </InputIcon>
                    <InputText
                        :model-value="internalSearch"
                        :placeholder="searchPlaceholder"
                        class="px-topbar__search-input"
                        @input="onSearchInput"
                    />
                </IconField>
            </div>
        </div>

        <div class="px-topbar__actions">
            <slot name="actions" />

            <LThemeToggle />

            <button
                v-if="user"
                type="button"
                class="px-topbar__user"
                @click="$emit('user-click', $event, user)"
            >
                <Avatar :label="userInitials" shape="circle" />
                <div class="px-topbar__user-meta">
                    <strong>{{ user.name }}</strong>
                    <span>{{ user.role || '' }}</span>
                </div>
            </button>
        </div>
    </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Avatar from 'primevue/avatar';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { LIcon } from '../../ui/index.js';
import LThemeToggle from './l-theme-toggle.vue';

const props = defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: 'Search...' },
    searchValue: { type: String, default: '' },
    user: { type: Object, default: null },
    /** Replace page title with Spotlight trigger (⌘K). */
    spotlight: { type: Boolean, default: false },
    spotlightPlaceholder: { type: String, default: 'Search...' },
    spotlightShortcut: { type: String, default: '' },
});

const emit = defineEmits(['menu', 'user-click', 'update:searchValue', 'spotlight']);

const internalSearch = ref(props.searchValue ?? '');
watch(() => props.searchValue, (value) => {
    if (value !== internalSearch.value) {
        internalSearch.value = value ?? '';
    }
});

const onSearchInput = (event) => {
    internalSearch.value = event.target.value;
    emit('update:searchValue', event.target.value);
};

const userInitials = computed(() => {
    if (!props.user) return '';
    return (props.user.name || '').trim().charAt(0) || 'U';
});
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-topbar {
    display: flex;
    align-items: center;
    gap: var(--px-space-3);
    padding: var(--px-space-3) var(--px-space-4);
    height: var(--px-topbar-height);
    background: var(--px-glass-bg);
    backdrop-filter: var(--px-blur-lg);
    -webkit-backdrop-filter: var(--px-blur-lg);
    border: 1px solid var(--px-glass-border);
    border-radius: var(--px-radius-lg);
    box-shadow: var(--px-shadow-glass);
    position: sticky;
    top: 0;
    z-index: var(--px-z-sticky);

    &__menu-btn {
        appearance: none;
        border: 0;
        background: transparent;
        width: 40px;
        height: 40px;
        border-radius: var(--px-radius-md);
        color: var(--px-text-soft);
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            background: var(--px-primary-soft);
            color: var(--px-primary);
        }
    }

    &__primary {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex: 1;
        min-width: 0;
    }

    &__title {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
        font-family: var(--px-font-sans);

        strong {
            font-size: var(--px-text-md);
            font-weight: var(--px-weight-bold);
            color: var(--px-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        span {
            font-size: var(--px-text-xs);
            font-weight: var(--px-weight-semibold);
            color: var(--px-text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    &__spotlight {
        appearance: none;
        flex: 1;
        max-width: 420px;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: var(--px-space-2);
        height: 40px;
        padding-block: 0;
        padding-inline: 12px 10px;
        border-radius: var(--px-radius-pill);
        border: 1px solid var(--px-border);
        background: var(--px-surface-muted);
        color: var(--px-text-muted);
        cursor: pointer;
        font-family: var(--px-font-sans);
        text-align: start;
        transition: border-color var(--px-duration-fast) var(--px-easing-standard),
            background var(--px-duration-fast) var(--px-easing-standard),
            box-shadow var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            background: var(--px-surface-strong);
            border-color: color-mix(in srgb, var(--px-primary) 35%, var(--px-border));
            color: var(--px-text-soft);
        }

        &:focus-visible {
            outline: none;
            border-color: var(--px-primary);
            box-shadow: var(--px-shadow-focus);
        }
    }

    &__spotlight-icon {
        flex-shrink: 0;
        color: var(--px-text-muted);
    }

    &__spotlight-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--px-text-sm);
        font-weight: var(--px-weight-semibold);
    }

    &__spotlight-kbd {
        flex-shrink: 0;
        font-family: var(--px-font-mono, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        padding: 0.15rem 0.4rem;
        border-radius: 6px;
        border: 1px solid color-mix(in srgb, var(--px-border) 85%, transparent);
        background: color-mix(in srgb, var(--px-surface-strong) 80%, transparent);
        color: var(--px-text-muted);
        line-height: 1.2;
    }

    &__search {
        flex: 2;
        max-width: 480px;

        .l-inputtext {
            background: var(--px-surface-muted);
            border: 1px solid var(--px-border);
            border-radius: var(--px-radius-pill);
            padding: 8px 14px 8px 38px;
            width: 100%;
            transition: border-color var(--px-duration-fast) var(--px-easing-standard),
                        background var(--px-duration-fast) var(--px-easing-standard);

            &:focus {
                background: var(--px-surface-strong);
                border-color: var(--px-primary);
                box-shadow: var(--px-shadow-focus);
            }
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex-shrink: 0;
        margin-inline-start: auto;
    }

    &__user {
        appearance: none;
        border: 0;
        background: transparent;
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        padding: 4px var(--px-space-2) 4px 4px;
        border-radius: var(--px-radius-pill);
        cursor: pointer;
        transition: background var(--px-duration-fast) var(--px-easing-standard);

        &:hover {
            background: var(--px-primary-soft);
        }
    }

    &__user-meta {
        display: flex;
        flex-direction: column;
        text-align: start;
        line-height: var(--px-leading-tight);
        font-family: var(--px-font-sans);

        strong {
            font-size: var(--px-text-sm);
            font-weight: var(--px-weight-bold);
            color: var(--px-text);
        }

        span {
            font-size: var(--px-text-2xs);
            font-weight: var(--px-weight-semibold);
            color: var(--px-text-muted);
        }
    }

    @media (max-width: 768px) {
        &__menu-btn {
            display: inline-flex;
        }

        &__search {
            display: none;
        }

        &__spotlight {
            max-width: none;
        }

        &__spotlight-kbd {
            display: none;
        }

        &__user-meta {
            display: none;
        }
    }
}
</style>
