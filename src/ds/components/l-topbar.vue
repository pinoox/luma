<template>
    <header class="px-topbar">
        <button
            v-if="$slots['menu-button']"
            type="button"
            class="px-topbar__menu-btn"
            @click="$emit('menu')"
        >
            <slot name="menu-button">
                <LIcon name="menu" size="md" />
            </slot>
        </button>

        <div class="px-topbar__title">
            <strong>{{ title }}</strong>
            <span v-if="subtitle">{{ subtitle }}</span>
        </div>

        <div v-if="searchable" class="px-topbar__search">
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

        <div class="px-topbar__actions">
            <slot name="actions" />

            <LThemeToggle />

            <button
                v-if="user"
                type="button"
                class="px-topbar__user"
                @click="$emit('user-click', user)"
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
    searchPlaceholder: { type: String, default: 'جستجو...' },
    searchValue: { type: String, default: '' },
    user: { type: Object, default: null },
});

const emit = defineEmits(['menu', 'user-click', 'update:searchValue']);

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

        &__user-meta {
            display: none;
        }
    }
}
</style>