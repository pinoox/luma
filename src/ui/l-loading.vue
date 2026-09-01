<template>
    <Teleport to="body">
        <Transition name="luma-loading">
            <div
                v-if="shown"
                class="luma-loading"
                role="status"
                aria-live="polite"
                :aria-label="caption"
            >
                <span class="luma-loading__cube" aria-hidden="true" />
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { getActiveThemeConfig } from '../ds/theme-config.js';
import { useHttpLoading } from '../core/http/loading.js';

const props = defineProps({
    active: { type: Boolean, default: undefined },
    label: { type: String, default: '' },
});

const { visible } = useHttpLoading();

const shown = computed(() => (
    props.active === undefined ? visible.value : props.active
));

const caption = computed(() => {
    if (props.label) return props.label;
    const fromConfig = getActiveThemeConfig()?.loading?.label;
    return fromConfig || 'Loading';
});
</script>

<style lang="scss">
.luma-loading {
    --luma-loading-size: 1px;
    --luma-loading-cube: var(--px-primary, #0e73fd);
    --luma-loading-face: var(--px-surface-strong, #fff);
    --luma-loading-sheen: color-mix(in srgb, var(--px-surface-strong, #fff) 70%, transparent);
    --luma-loading-veil: color-mix(in srgb, var(--px-surface-muted, #eef2f7) 62%, transparent);

    position: fixed;
    inset: 0;
    z-index: var(--px-z-overlay, 900);
    display: grid;
    place-items: center;
    background: var(--luma-loading-veil);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

html[data-theme='dark'] .luma-loading {
    --luma-loading-face: color-mix(in srgb, var(--px-surface-strong, #1a2336) 45%, #fff);
    --luma-loading-sheen: color-mix(in srgb, #fff 34%, transparent);
    --luma-loading-veil: color-mix(in srgb, var(--px-bg, #070b14) 72%, transparent);
}

.luma-loading__cube {
    position: relative;
    width: calc(48 * var(--luma-loading-size));
    height: calc(48 * var(--luma-loading-size));
    background: var(--luma-loading-cube);
    color: var(--luma-loading-face);
    transform: perspective(calc(200 * var(--luma-loading-size))) rotateX(65deg) rotate(45deg);
    animation: luma-loading-layers 1s linear infinite alternate;
}

.luma-loading__cube::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--luma-loading-sheen);
    animation: luma-loading-shift 1s linear infinite alternate;
}

.luma-loading-enter-active,
.luma-loading-leave-active {
    transition: opacity 0.18s ease;
}

.luma-loading-enter-from,
.luma-loading-leave-to {
    opacity: 0;
}

@keyframes luma-loading-layers {
    0% {
        box-shadow: 0 0 0 0;
    }

    90%,
    100% {
        box-shadow: calc(20 * var(--luma-loading-size)) calc(20 * var(--luma-loading-size)) 0 calc(-4 * var(--luma-loading-size));
    }
}

@keyframes luma-loading-shift {
    0% {
        transform: translate(0, 0) scale(1);
    }

    100% {
        transform: translate(calc(-25 * var(--luma-loading-size)), calc(-25 * var(--luma-loading-size))) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .luma-loading__cube,
    .luma-loading__cube::after {
        animation: none;
    }

    .luma-loading-enter-active,
    .luma-loading-leave-active {
        transition: none;
    }
}
</style>
