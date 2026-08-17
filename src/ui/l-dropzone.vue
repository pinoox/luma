<template>
    <div
        class="luma-dropzone"
        :class="{
            'luma-dropzone--active': dragging,
            'luma-dropzone--disabled': disabled,
            'luma-dropzone--filled': filled,
        }"
        role="button"
        :tabindex="disabled ? -1 : 0"
        @click="open"
        @keydown.enter.prevent="open"
        @keydown.space.prevent="open"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="handleDrop"
    >
        <input
            ref="input"
            class="luma-dropzone__input"
            type="file"
            :accept="accept"
            :multiple="multiple"
            :disabled="disabled"
            @change="handleInput"
        />

        <slot
            :open="open"
            :dragging="dragging"
            :errors="errors"
        >
            <slot v-if="filled" name="content" :open="open" />
            <slot v-else name="empty" :open="open" :dragging="dragging" />
        </slot>
    </div>
</template>

<script setup>
import { toRef } from 'vue';
import { useFilePicker } from '../composables/use-file-picker.js';

const props = defineProps({
    accept: { type: String, default: '' },
    multiple: { type: Boolean, default: true },
    maxFiles: { type: Number, default: 0 },
    maxSize: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    filled: { type: Boolean, default: false },
    validate: { type: Function, default: null },
});

const emit = defineEmits(['select', 'error']);

const picker = useFilePicker({
    accept: toRef(props, 'accept'),
    multiple: toRef(props, 'multiple'),
    maxFiles: toRef(props, 'maxFiles'),
    maxSize: toRef(props, 'maxSize'),
    disabled: toRef(props, 'disabled'),
    validate: props.validate,
});

const {
    input,
    dragging,
    errors,
    open,
    onDragEnter,
    onDragOver,
    onDragLeave,
} = picker;

const emitResult = (files) => {
    if (files.length) emit('select', files);
    if (errors.value.length) emit('error', errors.value);
};

const handleInput = async (event) => {
    const files = await picker.select(event.target?.files);
    if (event.target) event.target.value = '';
    emitResult(files);
};

const handleDrop = async (event) => {
    const files = await picker.onDrop(event);
    emitResult(files);
};

defineExpose({ open });
</script>

<style lang="scss">
.luma-dropzone {
    position: relative;
    min-height: 6rem;
    padding: 0.75rem;
    border: 1.5px dashed var(--px-border);
    border-radius: var(--px-radius-md, 0.75rem);
    background: var(--px-surface-muted);
    color: var(--px-text);
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;

    &--filled {
        border-style: solid;
        background: var(--px-surface-strong);
    }

    &--active {
        border-color: var(--px-primary);
        background: color-mix(in srgb, var(--px-primary) 8%, var(--px-surface-strong));
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--px-primary) 14%, transparent);
    }

    &--disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    &__input {
        display: none;
    }
}
</style>
