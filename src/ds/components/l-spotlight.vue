<template>
    <Teleport to="body">
        <Transition name="px-spotlight">
            <div
                v-if="visible"
                class="px-spotlight"
                :dir="resolvedDir"
                role="dialog"
                aria-modal="true"
                :aria-label="placeholder"
                @keydown="onRootKeydown"
            >
                <div class="px-spotlight__backdrop" @click="close" />

                <div class="px-spotlight__panel" ref="panelRef">
                    <div class="px-spotlight__search">
                        <LIcon name="search" size="md" class="px-spotlight__search-icon" />
                        <input
                            ref="inputRef"
                            v-model="query"
                            type="search"
                            class="px-spotlight__input"
                            :placeholder="placeholder"
                            autocomplete="off"
                            spellcheck="false"
                            @keydown="onInputKeydown"
                        />
                        <kbd v-if="showShortcutHint" class="px-spotlight__kbd">esc</kbd>
                    </div>

                    <div class="px-spotlight__body" ref="listRef">
                        <div v-if="loading" class="px-spotlight__status">
                            <LSpinner size="sm" />
                            <span>{{ loadingText }}</span>
                        </div>

                        <div v-else-if="!flatItems.length" class="px-spotlight__status px-spotlight__status--empty">
                            <LIcon name="search-x" size="md" />
                            <span>{{ emptyText }}</span>
                        </div>

                        <template v-else>
                            <section
                                v-for="group in groupedItems"
                                :key="group.label"
                                class="px-spotlight__group"
                            >
                                <header v-if="group.label" class="px-spotlight__group-label">
                                    {{ group.label }}
                                </header>
                                <ul class="px-spotlight__list" role="listbox">
                                    <li
                                        v-for="item in group.items"
                                        :key="item.id"
                                        role="option"
                                        class="px-spotlight__item"
                                        :class="{ 'px-spotlight__item--active': item._index === activeIndex }"
                                        :aria-selected="item._index === activeIndex"
                                        @mouseenter="activeIndex = item._index"
                                        @click="selectItem(item)"
                                    >
                                        <span class="px-spotlight__item-icon">
                                            <LIcon :name="item.icon || 'corner-down-left'" size="sm" />
                                        </span>
                                        <span class="px-spotlight__item-text">
                                            <strong>{{ item.title }}</strong>
                                            <small v-if="item.subtitle">{{ item.subtitle }}</small>
                                        </span>
                                        <span v-if="item.hint" class="px-spotlight__item-hint">{{ item.hint }}</span>
                                    </li>
                                </ul>
                            </section>
                        </template>
                    </div>

                    <footer class="px-spotlight__footer">
                        <span><kbd>↑</kbd><kbd>↓</kbd> حرکت</span>
                        <span><kbd>↵</kbd> انتخاب</span>
                        <span><kbd>esc</kbd> بستن</span>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { LIcon, LSpinner } from '../../ui/index.js';
import { getBoot } from '../../core/boot.js';
import {
    closeSpotlight,
    runSpotlightProviders,
    useSpotlight,
} from '../../composables/use-spotlight.js';

const props = defineProps({
    /** Static / local items (e.g. navigation). Always merged with provider results. */
    items: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'جستجو...' },
    emptyText: { type: String, default: 'نتیجه‌ای پیدا نشد' },
    loadingText: { type: String, default: 'در حال جستجو...' },
    showShortcutHint: { type: Boolean, default: true },
    /** Minimum query length before calling async providers (local items still filter). */
    providerMinLength: { type: Number, default: 1 },
    debounceMs: { type: Number, default: 180 },
    /**
     * Text direction. Defaults like LToast:
     * prop → `__PINOOX__.direction` → `document.dir` → `ltr`.
     * Required because Teleport to <body> does not inherit PageLayout dir.
     */
    dir: { type: String, default: '', validator: (v) => !v || ['rtl', 'ltr'].includes(v) },
});

const emit = defineEmits(['select', 'query']);

const router = useRouter();
const { visible, query, loading } = useSpotlight();

const resolvedDir = computed(() => {
    if (props.dir) return props.dir;
    const bootDir = getBoot()?.direction;
    if (bootDir === 'rtl' || bootDir === 'ltr') return bootDir;
    if (typeof document !== 'undefined') {
        const htmlDir = document.documentElement?.getAttribute('dir');
        if (htmlDir === 'rtl' || htmlDir === 'ltr') return htmlDir;
        if (document.body?.dir === 'rtl' || document.body?.dir === 'ltr') {
            return document.body.dir;
        }
    }
    return 'ltr';
});

const inputRef = ref(null);
const panelRef = ref(null);
const listRef = ref(null);
const activeIndex = ref(0);
const providerItems = ref([]);
let debounceTimer = null;

const filterLocalItems = (list, q) => {
    const needle = (q || '').trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => {
        const hay = [item.title, item.subtitle, item.keywords, item.group]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return hay.includes(needle);
    });
};

const flatItems = computed(() => {
    const local = filterLocalItems(props.items ?? [], query.value).map((item, i) => ({
        ...item,
        id: item.id ?? `local-${i}-${item.title}`,
    }));
    const remote = (providerItems.value ?? []).map((item, i) => ({
        ...item,
        id: item.id ?? `remote-${i}-${item.title}`,
    }));

    // Prefer remote when ids collide; keep local first for empty query.
    const seen = new Set();
    const merged = [];
    for (const item of [...local, ...remote]) {
        const key = String(item.id);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({ ...item, _index: merged.length });
    }
    return merged;
});

const groupedItems = computed(() => {
    const map = new Map();
    for (const item of flatItems.value) {
        const label = item.group || '';
        if (!map.has(label)) map.set(label, []);
        map.get(label).push(item);
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }));
});

const close = () => closeSpotlight();

const selectItem = async (item) => {
    if (!item) return;
    emit('select', item);
    try {
        if (typeof item.action === 'function') {
            await item.action(item);
        } else if (item.to != null) {
            await router.push(item.to);
        } else if (item.route != null) {
            const target = typeof item.route === 'string'
                ? { name: item.route }
                : item.route;
            await router.push(target);
        }
    } finally {
        close();
    }
};

const moveActive = (delta) => {
    const total = flatItems.value.length;
    if (!total) {
        activeIndex.value = 0;
        return;
    }
    activeIndex.value = (activeIndex.value + delta + total) % total;
    nextTick(() => {
        const el = listRef.value?.querySelector('.px-spotlight__item--active');
        el?.scrollIntoView({ block: 'nearest' });
    });
};

const onInputKeydown = (event) => {
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveActive(1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveActive(-1);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        const item = flatItems.value[activeIndex.value];
        if (item) selectItem(item);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
    }
};

const onRootKeydown = (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        close();
    }
};

const refreshProviders = async () => {
    const q = (query.value || '').trim();
    emit('query', q);
    if (q.length < props.providerMinLength) {
        providerItems.value = [];
        return;
    }
    providerItems.value = await runSpotlightProviders(q);
};

watch(visible, async (isOpen) => {
    if (!isOpen) {
        providerItems.value = [];
        activeIndex.value = 0;
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        return;
    }
    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select?.();
    refreshProviders();
});

watch(query, () => {
    activeIndex.value = 0;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refreshProviders, props.debounceMs);
});

watch(flatItems, (items) => {
    if (activeIndex.value >= items.length) {
        activeIndex.value = Math.max(0, items.length - 1);
    }
});

onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style lang="scss">
@use '../../scss/tokens' as *;

.px-spotlight {
    position: fixed;
    inset: 0;
    z-index: var(--px-z-modal);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: min(18vh, 140px) var(--px-space-4) var(--px-space-4);
    font-family: var(--px-font-sans);
    // dir attr on this root (teleported to body) drives flex/text orientation.
    text-align: start;

    &__backdrop {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--px-text) 28%, transparent);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
    }

    &__panel {
        position: relative;
        width: min(560px, 100%);
        max-height: min(72vh, 560px);
        display: flex;
        flex-direction: column;
        background: var(--px-surface-strong);
        border: 1px solid var(--px-glass-border);
        border-radius: var(--px-radius-xl);
        box-shadow: var(--px-shadow-glass), 0 24px 64px -24px color-mix(in srgb, var(--px-text) 35%, transparent);
        overflow: hidden;
    }

    &__search {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        padding: var(--px-space-3) var(--px-space-4);
        border-bottom: 1px solid var(--px-border);
    }

    &__search-icon {
        color: var(--px-text-muted);
        flex-shrink: 0;
    }

    &__input {
        flex: 1;
        min-width: 0;
        appearance: none;
        border: 0;
        outline: none;
        background: transparent;
        color: var(--px-text);
        font: inherit;
        font-size: var(--px-text-md);
        font-weight: var(--px-weight-semibold);
        line-height: var(--px-leading-normal);
        text-align: start;

        &::placeholder {
            color: var(--px-text-muted);
            font-weight: var(--px-weight-medium);
            text-align: start;
        }

        &::-webkit-search-cancel-button {
            display: none;
        }
    }

    &__kbd {
        flex-shrink: 0;
        font-family: inherit;
        font-size: var(--px-text-2xs);
        font-weight: var(--px-weight-bold);
        color: var(--px-text-muted);
        background: var(--px-surface-muted);
        border: 1px solid var(--px-border);
        border-radius: var(--px-radius-sm);
        padding: 2px 6px;
        line-height: 1.4;
    }

    &__body {
        flex: 1;
        overflow: auto;
        padding: var(--px-space-2);
        min-height: 120px;
    }

    &__status {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--px-space-2);
        min-height: 140px;
        color: var(--px-text-muted);
        font-size: var(--px-text-sm);
        font-weight: var(--px-weight-semibold);
    }

    &__group {
        & + & {
            margin-top: var(--px-space-2);
        }
    }

    &__group-label {
        padding: var(--px-space-2) var(--px-space-3) var(--px-space-1);
        font-size: var(--px-text-2xs);
        font-weight: var(--px-weight-bold);
        letter-spacing: 0.02em;
        color: var(--px-text-muted);
        text-transform: none;
        text-align: start;
    }

    &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__item {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        padding: 10px var(--px-space-3);
        border-radius: var(--px-radius-md);
        cursor: pointer;
        color: var(--px-text);
        transition: background var(--px-duration-fast) var(--px-easing-standard);

        &--active,
        &:hover {
            background: var(--px-primary-soft);
            color: var(--px-primary);
        }

        &--active &-icon,
        &:hover &-icon {
            background: color-mix(in srgb, var(--px-primary) 18%, transparent);
            color: var(--px-primary);
        }
    }

    &__item-icon {
        width: 34px;
        height: 34px;
        border-radius: var(--px-radius-md);
        background: var(--px-surface-muted);
        color: var(--px-text-soft);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    &__item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        line-height: var(--px-leading-tight);
        text-align: start;

        strong {
            font-size: var(--px-text-sm);
            font-weight: var(--px-weight-bold);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        small {
            font-size: var(--px-text-2xs);
            font-weight: var(--px-weight-semibold);
            color: var(--px-text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    &__item--active &-text small,
    &__item:hover &-text small {
        color: color-mix(in srgb, var(--px-primary) 72%, var(--px-text-muted));
    }

    &__item-hint {
        flex-shrink: 0;
        font-size: var(--px-text-2xs);
        font-weight: var(--px-weight-semibold);
        color: var(--px-text-muted);
    }

    &__footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--px-space-3);
        padding: var(--px-space-2) var(--px-space-4);
        border-top: 1px solid var(--px-border);
        background: var(--px-surface-muted);
        color: var(--px-text-muted);
        font-size: var(--px-text-2xs);
        font-weight: var(--px-weight-semibold);
        justify-content: flex-start;

        kbd {
            font-family: inherit;
            font-size: inherit;
            font-weight: var(--px-weight-bold);
            background: var(--px-surface-strong);
            border: 1px solid var(--px-border);
            border-radius: 4px;
            padding: 0 4px;
            margin-inline-end: 2px;
        }
    }
}

.px-spotlight-enter-active,
.px-spotlight-leave-active {
    transition: opacity var(--px-duration-fast) var(--px-easing-standard);

    .px-spotlight__panel {
        transition: transform var(--px-duration-base) var(--px-easing-emphasized),
                    opacity var(--px-duration-fast) var(--px-easing-standard);
    }
}

.px-spotlight-enter-from,
.px-spotlight-leave-to {
    opacity: 0;

    .px-spotlight__panel {
        opacity: 0;
        transform: translateY(-12px) scale(0.98);
    }
}
</style>
