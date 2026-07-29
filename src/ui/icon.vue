<template>
  <span class="lucide-icon" :class="sizeClass">
    <component
        :is="icon"
        v-if="icon"
        :size="pixelSize"
        :stroke-width="stroke"
        color="currentColor"
        absolute-stroke-width
    />
  </span>
</template>

<script setup>
import { computed } from 'vue';
import {
    lucidePixelSize,
    lucideStrokeWidth,
    resolveLucideComponent,
} from '../core/icons/lucide.js';

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    size: {
        type: [String, Number],
        default: 'sm',
    },
});

const icon = computed(() => resolveLucideComponent(props.name));

const pixelSize = computed(() => lucidePixelSize(props.size));

const stroke = computed(() => lucideStrokeWidth(props.size));

const sizeClass = computed(() => (
    typeof props.size === 'string' && !Number.isFinite(Number(props.size))
        ? `lucide-icon--${props.size}`
        : null
));
</script>

<style lang="scss" src="../scss/components/_lucide-icon.scss"></style>
