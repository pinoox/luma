<template>
    <div v-if="center" class="luma-spinner-center">
        <ProgressSpinner
            :class="['luma-spinner', `luma-spinner--${severity}`, `luma-spinner--${size}`]"
        />
    </div>
    <ProgressSpinner
        v-else
        :class="['luma-spinner', `luma-spinner--${severity}`, `luma-spinner--${size}`]"
    />
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner';

/**
 * LSpinner — themed wrapper around PrimeVue ProgressSpinner.
 *
 * Sensible defaults: 36px (`md`) and brand-colored (`primary`).
 *
 *     <LSpinner />                          <!-- inline, brand color, 36px -->
 *     <LSpinner size="sm" />                <!-- 24px, brand color -->
 *     <LSpinner severity="success" />       <!-- success channel -->
 *     <LSpinner center />                   <!-- centered in its parent -->
 *
 * The `center` prop wraps the spinner in a flex block that fills its
 * container and centers itself both ways. Useful for full-page or
 * full-card loading states without writing one-off CSS.
 *
 * For absolute control, drop the wrapper and use PrimeVue's raw
 * `<ProgressSpinner class="luma-spinner luma-spinner--md luma-spinner--primary" />`
 * — same theming, full escape hatch.
 */
defineProps({
    /**
     * Color channel:
     *   primary | neutral | success | warn | danger | info
     */
    severity: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'neutral', 'success', 'warn', 'danger', 'info'].includes(v),
    },
    /**
     * Size scale:
     *   xs (16px) | sm (24px) | md (36px, default) | lg (56px) | xl (80px)
     */
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
    },
    /**
     * When true, the spinner is wrapped in a flex block that fills its
     * parent and centers itself both vertically and horizontally. Useful
     * for full-page or section loading states without one-off CSS.
     */
    center: { type: Boolean, default: false },
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-spinner-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    min-height: 240px;
    padding: var(--px-space-6);
}
</style>