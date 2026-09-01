<template>
    <LTableSkel v-if="showSkel" :part="part" v-bind="skelBind" />
    <slot v-else />
</template>

<script setup>
import { computed } from 'vue';
import LTableSkel from './l-table-skel.vue';
import { isSkelRow } from '../core/table/skeleton.js';

const props = defineProps({
    data: {
        type: Object,
        default: null,
    },
    part: {
        type: String,
        required: true,
    },
    skelProps: {
        type: Object,
        default: () => ({}),
    },
});

const showSkel = computed(() => isSkelRow(props.data));

const skelBind = computed(() => props.skelProps);
</script>
