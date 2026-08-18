<template>
    <AutoComplete
        v-bind="forwardedAttrs"
        :class="['luma-chip-field', attrs.class, { 'luma-chip-field--disabled': disabled }]"
        :model-value="modelValue"
        :suggestions="suggestions"
        :option-label="optionLabel"
        :data-key="dataKey"
        :placeholder="placeholder"
        :disabled="disabled"
        :fluid="fluid"
        :complete-on-focus="completeOnFocus"
        :empty-search-message="emptyMessage || undefined"
        :show-empty-message="showEmpty"
        multiple
        :dropdown="false"
        :pt="overlayPt"
        @update:model-value="emit('update:modelValue', $event)"
        @complete="emit('complete', $event)"
    >
        <template v-if="$slots.option" #option="slotProps">
            <slot name="option" v-bind="slotProps" />
        </template>
        <template v-if="$slots.chip" #chip="slotProps">
            <slot name="chip" v-bind="slotProps" />
        </template>
        <template v-if="showEmpty" #empty>
            <slot name="empty">{{ emptyMessage }}</slot>
        </template>
    </AutoComplete>
</template>

<script setup>
import { computed, useAttrs, useSlots } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import { resolveDirection } from '../core/direction.js';

defineOptions({ inheritAttrs: false });

/**
 * LChipField — multi-value chip input (PrimeVue AutoComplete, no dropdown button).
 *
 * Looks like a normal Luma input: type to pick or create, chips sit inside
 * the field. Pass `emptyMessage` so PrimeVue never falls back to English
 * "No results found".
 *
 *     <LChipField
 *       v-model="tags"
 *       option-label="title"
 *       :suggestions="suggestions"
 *       empty-message="No results found"
 *       @complete="search"
 *     />
 */
const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    suggestions: { type: Array, default: () => [] },
    optionLabel: { type: [String, Function], default: undefined },
    dataKey: { type: String, default: undefined },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    fluid: { type: Boolean, default: true },
    completeOnFocus: { type: Boolean, default: true },
    /** Overlay copy when there are no suggestions. Empty = hide the message. */
    emptyMessage: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'complete']);
const attrs = useAttrs();
const slots = useSlots();

const forwardedAttrs = computed(() => {
    const { dropdown, class: _class, pt: _pt, ...rest } = attrs;
    return rest;
});

const showEmpty = computed(() => !!(props.emptyMessage || slots.empty));

const overlayPt = computed(() => {
    const rtl = resolveDirection() === 'rtl';
    return {
        overlay: {
            class: 'luma-chip-field__overlay',
            dir: rtl ? 'rtl' : undefined,
        },
        emptyMessage: { class: 'luma-chip-field__empty' },
    };
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.luma-chip-field.p-autocomplete {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-width: 0;

    .p-autocomplete-dropdown {
        display: none !important;
    }

    .p-autocomplete-input-multiple {
        flex: 1;
        min-width: 0;
        min-height: 2.75rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--px-space-1);
        padding-block: 0.35rem;
        padding-inline: 0.75rem;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none;
    }

    .p-autocomplete-input-chip,
    .p-autocomplete-input-chip input,
    .p-autocomplete-input {
        flex: 1 1 6rem;
        min-width: 6rem;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none;
        padding: 0.2rem 0 !important;
        min-height: 0;
        font: inherit;
        color: inherit;
    }

    .p-chip,
    .p-autocomplete-chip {
        font-size: var(--px-text-sm);
        line-height: 1.3;
        border-radius: var(--px-radius-pill);
    }
}

.luma-chip-field--disabled {
    opacity: 0.6;
    pointer-events: none;
}

.luma-chip-field__empty {
    display: block;
    width: 100%;
    padding: var(--px-space-2) var(--px-space-3);
    font-size: var(--px-text-sm);
    color: var(--px-text-muted);
}

[dir='rtl'] .luma-chip-field__overlay,
.luma-chip-field__overlay[dir='rtl'] {
    direction: rtl;
    text-align: right;
}
</style>
