<template>
  <div :class="['luma-field', inline && 'luma-field--inline', fieldError && 'luma-field--invalid']">
    <FloatLabel v-if="floating" :variant="floatVariant">
      <slot :id="inputId" />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>
    <template v-else>
      <label v-if="label" :for="inputId" class="luma-field__label">
        {{ label }}
        <i v-if="required" class="luma-field__required" aria-hidden="true">*</i>
      </label>
      <div class="luma-field__control">
        <slot :id="inputId" />
      </div>
    </template>
    <p
      v-if="!floating && (fieldError || hint)"
      :class="['luma-field__hint', fieldError && 'luma-field__hint--error']"
    >
      {{ fieldError || hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import FloatLabel from 'primevue/floatlabel';

const FORM_VALIDATION_KEY = Symbol.for('luma.formValidation');

/**
 * LField — themed form field wrapper.
 *
 * Two modes:
 *   - floating=true  → uses PrimeVue FloatLabel (label inside input)
 *   - floating=false → static label above input
 *
 * Bind `name` to a useFormValidation field to show client/server errors.
 */
const props = defineProps({
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    name: { type: String, default: '' },
    required: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    floating: { type: Boolean, default: false },
    floatVariant: { type: String, default: 'over' },
    id: { type: String, default: '' },
});

const form = inject(FORM_VALIDATION_KEY, null);
const inputId = computed(() => props.id || `luma-field-${Math.random().toString(36).slice(2, 9)}`);
const fieldError = computed(() => props.error || (props.name && form?.error?.(props.name)) || '');
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

    &__hint--error {
        color: #dc2626;
    }

    &__required {
        margin-inline-start: 0.15rem;
        color: #ef4444;
        font-style: normal;
        font-weight: 800;
    }

    &--invalid {
        .p-inputtext,
        .p-select,
        .p-treeselect,
        .p-autocomplete,
        .p-textarea,
        .p-inputnumber-input {
            border-color: #dc2626 !important;
        }
    }
}
</style>
