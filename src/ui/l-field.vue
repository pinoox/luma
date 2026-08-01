<template>
  <div :class="['luma-field', inline && 'luma-field--inline']">
    <FloatLabel v-if="floating" :variant="floatVariant">
      <slot :id="inputId" />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>
    <template v-else>
      <label v-if="label" :for="inputId" class="luma-field__label">{{ label }}</label>
      <div class="luma-field__control">
        <slot :id="inputId" />
        <p v-if="hint" class="luma-field__hint">{{ hint }}</p>
      </div>
    </template>
    <p v-if="!floating && hint" class="luma-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FloatLabel from 'primevue/floatlabel';

/**
 * LField — themed form field wrapper.
 *
 * Two modes:
 *   - floating=true  → uses PrimeVue FloatLabel (label inside input)
 *   - floating=false → static label above input
 *
 * See: https://primevue.org/inputtext/
 *      https://primevue.org/floatlabel/
 *
 * Slot:
 *   default — receives scoped { id } so you can bind it to your input
 *             <LField label="Username"><InputText :id="id" /></LField>
 */
const props = defineProps({
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    floating: { type: Boolean, default: false },
    /** PrimeVue FloatLabel variant: 'over' | 'in' | 'on' */
    floatVariant: { type: String, default: 'over' },
    id: { type: String, default: '' },
});

const inputId = computed(() => props.id || `luma-field-${Math.random().toString(36).slice(2, 9)}`);
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-field {
    display: flex;
    flex-direction: column;
    gap: var(--px-space-1);
    min-width: 0;

    &--inline {
        flex-direction: row;
        align-items: center;
        gap: var(--px-space-3);
    }

    &__label {
        font-size: var(--px-text-sm);
        font-weight: $px-weight-medium;
        color: var(--px-text-soft);
    }

    &__control {
        display: flex;
        flex-direction: column;
        gap: var(--px-space-1);

        > .l-inputtext,
        > .l-password {
            width: 100%;
        }
    }

    &__hint {
        margin: 0;
        font-size: var(--px-text-xs);
        color: var(--px-text-muted);
    }
}
</style>
