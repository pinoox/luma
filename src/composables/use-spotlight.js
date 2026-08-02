/**
 * Luma Spotlight — shared open state, providers, and ⌘K / Ctrl+K binding.
 *
 * Apps register search providers that return Spotlight items:
 *   { id, title, subtitle?, icon?, group?, keywords?, to?, route?, action? }
 *
 * PageLayout mounts <LSpotlight> and binds the global shortcut once.
 */

import { computed, onUnmounted, ref, shallowRef } from 'vue';

const visible = ref(false);
const query = ref('');
const loading = ref(false);
const providers = shallowRef([]);

let shortcutBound = false;
let shortcutHandler = null;
let providerSeq = 0;

const isMacPlatform = () => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
};

export const spotlightShortcutLabel = () => (isMacPlatform() ? '⌘K' : 'Ctrl+K');

/**
 * @param {(query: string) => (Array|Promise<Array>)} provider
 * @returns {() => void} unregister
 */
export function registerSpotlightProvider(provider) {
    if (typeof provider !== 'function') return () => {};
    const entry = { id: ++providerSeq, provider };
    providers.value = [...providers.value, entry];
    return () => {
        providers.value = providers.value.filter((p) => p.id !== entry.id);
    };
}

/**
 * Register a provider for the lifetime of the calling component.
 * @param {(query: string) => (Array|Promise<Array>)} provider
 */
export function useSpotlightProvider(provider) {
    const unregister = registerSpotlightProvider(provider);
    onUnmounted(unregister);
    return unregister;
}

export async function runSpotlightProviders(q) {
    const list = providers.value;
    if (!list.length) return [];

    loading.value = true;
    try {
        const chunks = await Promise.all(
            list.map(async ({ provider }) => {
                try {
                    const result = await provider(q ?? '');
                    return Array.isArray(result) ? result : [];
                } catch {
                    return [];
                }
            }),
        );
        return chunks.flat();
    } finally {
        loading.value = false;
    }
}

function onGlobalKeydown(event) {
    const key = (event.key || '').toLowerCase();
    if (key !== 'k' || !(event.metaKey || event.ctrlKey)) return;
    // Don't steal the shortcut from editable fields unless Spotlight is open
    // (then Ctrl/Cmd+K still toggles — macOS Spotlight style).
    event.preventDefault();
    toggleSpotlight();
}

export function bindSpotlightShortcut() {
    if (shortcutBound || typeof window === 'undefined') return () => {};
    shortcutHandler = onGlobalKeydown;
    window.addEventListener('keydown', shortcutHandler);
    shortcutBound = true;
    return unbindSpotlightShortcut;
}

export function unbindSpotlightShortcut() {
    if (!shortcutBound || typeof window === 'undefined') return;
    if (shortcutHandler) {
        window.removeEventListener('keydown', shortcutHandler);
    }
    shortcutHandler = null;
    shortcutBound = false;
}

export function openSpotlight(initialQuery = '') {
    query.value = initialQuery ?? '';
    visible.value = true;
}

export function closeSpotlight() {
    visible.value = false;
    query.value = '';
}

export function toggleSpotlight() {
    if (visible.value) closeSpotlight();
    else openSpotlight();
}

/**
 * Primary composable for Spotlight UI + app wiring.
 */
export function useSpotlight() {
    return {
        visible: computed(() => visible.value),
        query,
        loading: computed(() => loading.value),
        shortcutLabel: spotlightShortcutLabel(),
        open: openSpotlight,
        close: closeSpotlight,
        toggle: toggleSpotlight,
        bindShortcut: bindSpotlightShortcut,
        unbindShortcut: unbindSpotlightShortcut,
        registerProvider: registerSpotlightProvider,
        runProviders: runSpotlightProviders,
    };
}
