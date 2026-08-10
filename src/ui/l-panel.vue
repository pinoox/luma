<template>
  <section class="luma-panel" :class="panelClass">
    <header v-if="title || $slots.header || $slots.actions" class="luma-panel__head">
      <div class="luma-panel__head-text">
        <slot name="header">
          <h3 v-if="title" class="luma-panel__title">{{ title }}</h3>
          <p v-if="lead" class="luma-panel__lead">{{ lead }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="luma-panel__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="luma-panel__body" :class="{ 'luma-panel__body--flush': flush }">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="luma-panel__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue';

/**
 * LPanel — default content surface for lists, forms, and tables.
 *
 *     <LPanel flush bare title="Items">
 *       <LDataTable :value="rows">…</LDataTable>
 *     </LPanel>
 */
const props = defineProps({
    title: { type: String, default: '' },
    lead: { type: String, default: '' },
    tone: {
        type: String,
        default: 'solid',
        validator: (v) => ['solid', 'muted', 'glass'].includes(v),
    },
    /** Remove body padding (useful for full-bleed tables). */
    flush: { type: Boolean, default: false },
    /** Drop panel chrome — transparent host for soft tables. */
    bare: { type: Boolean, default: false },
});

const panelClass = computed(() => [
    props.tone !== 'solid' ? `luma-panel--${props.tone}` : null,
    props.bare ? 'luma-panel--bare' : null,
]);
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-panel {
    background: var(--luma-panel-bg, var(--px-surface-strong));
    border: 1px solid var(--luma-panel-border, var(--px-border));
    color: var(--luma-panel-fg, var(--px-text));
    border-radius: var(--px-radius-lg);
    overflow: hidden;

    &--muted {
        background: var(--px-surface-muted);
    }

    &--glass {
        background: var(--px-glass-bg);
        border-color: var(--px-glass-border);
        box-shadow: var(--px-glass-shadow, var(--px-shadow-sm));
        backdrop-filter: var(--px-blur-md);
        -webkit-backdrop-filter: var(--px-blur-md);
    }

    &--bare {
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;

        > .luma-panel__body {
            padding: 0 !important;
        }
    }

    &__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--px-space-3);
        padding: var(--px-space-4) var(--px-space-4) 0;
        flex-wrap: wrap;
    }

    &__head-text {
        min-width: 0;
        flex: 1;
    }

    &__title {
        margin: 0;
        font-size: var(--px-text-md);
        font-weight: $px-weight-bold;
        color: var(--px-text);
        line-height: 1.3;
    }

    &__lead {
        margin: 0.25rem 0 0;
        font-size: var(--px-text-sm);
        color: var(--px-text-muted);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex-wrap: wrap;
    }

    &__body {
        padding: var(--px-space-4);

        &--flush {
            padding: 0;
        }
    }

    &__footer {
        padding: var(--px-space-3) var(--px-space-4);
        border-top: 1px solid var(--px-border-soft, var(--px-border));
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--px-space-2);
        flex-wrap: wrap;
    }
}
</style>
