<template>
    <TreeSelect
        v-bind="forwardedAttrs"
        :class="['luma-tree-select', attrs.class]"
        :model-value="treeKeys"
        :options="options"
        :selection-mode="selectionMode"
        :meta-key-selection="metaKeySelection"
        :display="display"
        :filter="filter"
        :show-clear="showClear"
        :placeholder="placeholder"
        :disabled="disabled"
        :fluid="fluid"
        :empty-message="emptyMessage || undefined"
        :pt="overlayPt"
        @update:model-value="onTreeKeys"
        @node-select="onNodeSelect"
        @node-unselect="onNodeUnselect"
    >
        <template v-for="name in slotNames" :key="name" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
    </TreeSelect>
</template>

<script setup>
import { computed, ref, useAttrs, useSlots, watch } from 'vue';
import TreeSelect from 'primevue/treeselect';
import { resolveDirection } from '../core/direction.js';
import {
    selectedIdsFromTreeKeys,
    toCheckboxKeys,
    toMultipleKeys,
    toggleTreeKey,
    uniqueTreeKeys,
} from '../core/tree-select.js';

defineOptions({ inheritAttrs: false });

/**
 * LTreeSelect — TreeSelect with a key-array v-model.
 *
 * PrimeVue 4 checkbox mode always checks descendants. Pass `independent`
 * (default for checkbox) so only the clicked node is stored. Expand
 * descendants later when *filtering* products, not when assigning them.
 *
 *     <LTreeSelect v-model="categoryIds" :options="tree" filter show-clear />
 */
const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    selectionMode: {
        type: String,
        default: 'checkbox',
        validator: (value) => ['single', 'multiple', 'checkbox'].includes(value),
    },
    /** When null, checkbox mode is independent; other modes follow PrimeVue. */
    independent: { type: Boolean, default: null },
    metaKeySelection: { type: Boolean, default: false },
    display: { type: String, default: 'chip' },
    filter: { type: Boolean, default: false },
    showClear: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    emptyMessage: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    fluid: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'node-select', 'node-unselect']);
const attrs = useAttrs();
const slots = useSlots();
const treeKeys = ref({});

const slotNames = computed(() => Object.keys(slots));
const isCheckbox = computed(() => props.selectionMode === 'checkbox');
const isIndependent = computed(() => (
    props.independent == null ? isCheckbox.value : props.independent
));

const forwardedAttrs = computed(() => {
    const {
        class: _class,
        pt: _pt,
        modelValue: _model,
        options: _options,
        selectionMode: _mode,
        ...rest
    } = attrs;
    return rest;
});

const overlayPt = computed(() => {
    const rtl = resolveDirection() === 'rtl';
    return {
        overlay: {
            class: 'luma-tree-select__overlay',
            dir: rtl ? 'rtl' : undefined,
        },
    };
});

const keysFromIds = (ids) => (
    isCheckbox.value ? toCheckboxKeys(ids) : toMultipleKeys(ids)
);

const commit = (ids) => {
    const next = uniqueTreeKeys(ids);
    treeKeys.value = keysFromIds(next);
    emit('update:modelValue', next);
};

watch(
    () => uniqueTreeKeys(props.modelValue).map(String).join('\0'),
    () => {
        treeKeys.value = keysFromIds(props.modelValue);
    },
    { immediate: true },
);

const onTreeKeys = (keys) => {
    if (!keys || !Object.keys(keys).length) {
        commit([]);
        return;
    }
    if (isIndependent.value) {
        treeKeys.value = keysFromIds(props.modelValue);
        return;
    }
    commit(selectedIdsFromTreeKeys(keys));
};

const onNodeSelect = (node) => {
    emit('node-select', node);
    if (!isIndependent.value) return;
    commit(toggleTreeKey(props.modelValue, node?.key, true));
};

const onNodeUnselect = (node) => {
    emit('node-unselect', node);
    if (!isIndependent.value) return;
    commit(toggleTreeKey(props.modelValue, node?.key, false));
};
</script>

<style lang="scss">
.luma-tree-select {
    width: 100%;
}

[dir='rtl'] .luma-tree-select__overlay,
.luma-tree-select__overlay[dir='rtl'] {
    direction: rtl;
    text-align: right;
}
</style>
