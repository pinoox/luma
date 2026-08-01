<template>
  <Card
      :class="[
          'luma-card',
          interactive && 'luma-card--interactive',
          active && 'luma-card--active',
          featured && 'luma-card--featured',
          busy && 'luma-card--busy',
          loading && 'luma-card--loading',
      ]"
      :pt="cardPt"
  >
    <template v-if="$slots.header && !loading" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.title && !loading" #title>
      <slot name="title" />
    </template>
    <template v-if="$slots.subtitle && !loading" #subtitle>
      <slot name="subtitle" />
    </template>
    <template v-if="!loading" #content>
      <slot name="content" />
      <slot />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <!--
      Loading state: header/footer are kept (so context is preserved),
      but body content is replaced with a centered spinner.
    -->
    <div v-if="loading" class="luma-card__loader">
      <LSpinner />
    </div>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';
import LSpinner from './l-spinner.vue';

/**
 * LCard — themed wrapper around PrimeVue Card.
 *
 * Slots (PrimeVue + convenience):
 *   #header, #title, #subtitle, #content, #footer (PrimeVue)
 *   default             — free-form body content
 *
 * Modifiers:
 *   interactive  — hover lift + cursor pointer (clickable cards)
 *   active       — primary border + glow (selected state)
 *   featured     — subtle gradient background (highlight)
 *   busy         — reduced opacity, no pointer events (loading)
 *   loading      — replace body content with a centered spinner;
 *                  header/footer are kept so context is preserved
 *
 * See: https://primevue.org/card/
 */
defineProps({
    interactive: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
});

// PrimeVue Card pass-through — strip its default border/shadow
// so Luma's .luma-card styling wins cleanly.
const cardPt = {
    root: { class: 'luma-card__root' },
    body: { class: 'luma-card__body' },
    content: { class: 'luma-card__content' },
};
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-card {
    // PrimeVue Card's root becomes transparent so our surface shows through.
    // No `!important` — these are pass-through classes added to the same
    // element as `.luma-card`, so they have higher effective specificity
    // (`0,0,2,0` vs `0,0,1,0`) and win the cascade without forcing it.
    &__root {
        background: transparent;
        border: 0;
        box-shadow: none;
        padding: 0;
    }

    &__body {
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    &__content {
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--px-space-3);
        // Let the content flex item shrink so the body can give room
        // to the next sibling (footer). The footer's `margin-top: auto`
        // pushes it to the bottom of the card body.
        flex: 1 1 auto;
        min-height: 0;
    }

    // Loading state: body collapses to a centered spinner.
    // Header/footer (rendered outside #content in PrimeVue Card) stay visible.
    &__loader {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 160px;
        padding: var(--px-space-6);
    }

    // Footer wrapper (PrimeVue Card renders it as a sibling of
    // `#content` inside the body). Behave as a flex column and
    // auto-margin toward the bottom of the body so a footer with
    // a `margin-top: auto` child pins cleanly to the bottom of
    // the card.
    &__body > .l-card-footer {
        display: flex;
        flex-direction: column;
        margin-top: auto;
    }

    // ---- The actual visual card (slot + body wrapper) ----
    display: flex;
    flex-direction: column;
    gap: var(--px-space-3);
    padding: var(--px-space-5);
    border-radius: var(--px-radius-lg);
    background: var(--px-surface);
    border: 1px solid var(--px-border);
    transition:
        border-color $px-duration-base $px-easing-standard,
        box-shadow $px-duration-base $px-easing-standard,
        transform $px-duration-base $px-easing-standard,
        background $px-duration-base $px-easing-standard;

    &--active {
        border-color: var(--px-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--px-primary) 10%, transparent);
    }

    &--featured {
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--px-primary) 6%, transparent) 0%,
            transparent 100%
        );
    }

    &--busy {
        opacity: 0.7;
        pointer-events: none;
    }

    &--loading {
        pointer-events: none;
    }

    &--interactive {
        cursor: pointer;

        &:hover {
            border-color: var(--px-primary);
            transform: translateY(-2px);
            box-shadow: var(--px-shadow-lg);
        }

        &:active {
            transform: translateY(0);
        }
    }
}
</style>