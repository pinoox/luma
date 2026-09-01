<template>
    <div
        class="luma-swipe-reveal"
        :class="{
            'luma-swipe-reveal--open': isOpen,
            'luma-swipe-reveal--dragging': isDragging,
            'luma-swipe-reveal--disabled': swipeDisabled,
            'luma-swipe-reveal--reduced': reducedMotion,
            'luma-swipe-reveal--rtl': direction === 'rtl',
            'luma-swipe-reveal--ltr': direction === 'ltr',
        }"
        @keydown.escape="onEscape"
    >
        <div
            ref="actionsRef"
            class="luma-swipe-reveal__actions"
            :aria-hidden="!isOpen"
        >
            <slot name="actions">
                <button
                    v-for="action in actions"
                    :key="action.key"
                    type="button"
                    class="luma-swipe-reveal__action"
                    :class="{
                        'luma-swipe-reveal__action--danger': action.variant === 'danger',
                    }"
                    :disabled="action.disabled"
                    :aria-label="action.label || action.key"
                    @click.stop="onActionClick(action)"
                >
                    <LIcon v-if="action.icon" :name="action.icon" :size="18" />
                    <span v-if="action.label" class="luma-swipe-reveal__action-label">{{ action.label }}</span>
                </button>
            </slot>
        </div>

        <div
            ref="surfaceRef"
            class="luma-swipe-reveal__surface"
            :style="surfaceStyle"
        >
            <button
                v-if="reducedMotion && hasActions && !swipeDisabled"
                type="button"
                class="luma-swipe-reveal__toggle"
                :aria-expanded="isOpen"
                :aria-label="toggleLabel"
                @click.stop="toggle"
            >
                <LIcon :name="isOpen ? 'chevron-right' : 'chevron-left'" :size="16" />
            </button>
            <div class="luma-swipe-reveal__content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useSlots, watch } from 'vue';
import LIcon from './l-icon.vue';
import { resolveDirection } from '../core/direction.js';
import { useSwipeReveal } from '../composables/use-swipe-reveal.js';

const props = defineProps({
    actions: {
        type: Array,
        default: () => [],
    },
    disabled: { type: Boolean, default: false },
    toggleLabel: { type: String, default: 'Actions' },
});

const slots = useSlots();
const surfaceRef = ref(null);
const actionsRef = ref(null);

const hasActions = computed(() => props.actions.length > 0 || Boolean(slots.actions));
const direction = computed(() => resolveDirection());

const swipeDisabled = computed(() => props.disabled || !hasActions.value);

const {
    isOpen,
    isDragging,
    offset,
    reducedMotion,
    setMaxReveal,
    close,
    toggle,
    onEscape,
} = useSwipeReveal({
    disabled: swipeDisabled,
    direction,
    surfaceRef,
});

const surfaceStyle = computed(() => {
    if (swipeDisabled.value) return undefined;
    const transform = offset.value !== 0 ? `translateX(${offset.value}px)` : undefined;
    return transform ? { transform } : undefined;
});

function measureActions() {
    nextTick(() => {
        requestAnimationFrame(() => {
            const el = actionsRef.value;
            const measured = el?.getBoundingClientRect().width ?? el?.offsetWidth ?? 0;
            const fallback = Math.max(props.actions.length * 2.75, 0) * 16;
            setMaxReveal(measured > 0 ? measured : fallback);
        });
    });
}

function onActionClick(action) {
    if (action.disabled) return;
    action.onClick?.();
    close();
}

watch(() => props.actions, measureActions, { deep: true });

onMounted(() => {
    measureActions();
    if (typeof ResizeObserver !== 'undefined' && actionsRef.value) {
        const ro = new ResizeObserver(measureActions);
        ro.observe(actionsRef.value);
        onUnmounted(() => ro.disconnect());
    }
    document.addEventListener('keydown', onEscape);
});

onUnmounted(() => {
    document.removeEventListener('keydown', onEscape);
});
</script>
