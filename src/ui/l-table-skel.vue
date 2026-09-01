<template>
    <span v-if="part === 'check'" class="luma-table-skel luma-table-skel--check" />

    <span v-else-if="part === 'id'" class="luma-table-skel luma-table-skel--id" />

    <div v-else-if="part === 'entity'" class="luma-table-skel-entity">
        <span class="luma-table-skel luma-table-skel--thumb" />
        <span class="luma-table-skel-lines">
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-title" />
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-sub" />
        </span>
    </div>

    <div v-else-if="part === 'product'" class="luma-table-skel-entity">
        <span class="luma-table-skel luma-table-skel--thumb luma-table-skel--thumb-product" />
        <span class="luma-table-skel-lines">
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-title" />
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-sub" />
            <span
                v-if="composite"
                class="luma-table-skel luma-table-skel--line luma-table-skel--line-meta-short"
            />
        </span>
    </div>

    <span v-else-if="part === 'count'" class="luma-table-skel luma-table-skel--count" />

    <span v-else-if="part === 'status-pill'" class="luma-table-skel luma-table-skel--status-pill" />

    <span v-else-if="part === 'tone-badge'" class="luma-table-skel luma-table-skel--tone-badge" />

    <div v-else-if="part === 'meta'" class="luma-table-skel-stack">
        <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-meta" />
        <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-meta-short" />
    </div>

    <span v-else-if="part === 'line'" class="luma-table-skel luma-table-skel--line luma-table-skel--line-title" />

    <div v-else-if="part === 'chips'" class="luma-table-skel-chips">
        <span
            v-for="chip in 3"
            :key="chip"
            class="luma-table-skel luma-table-skel--chip"
        />
    </div>

    <div v-else-if="part === 'actions'" class="luma-table-skel-actions">
        <span
            v-for="action in actionCount"
            :key="action"
            class="luma-table-skel luma-table-skel--action"
        />
    </div>

    <div
        v-else-if="part === 'tree'"
        class="luma-table-skel-tree"
        :style="{ '--luma-skel-indent': treeIndent }"
    >
        <span class="luma-table-skel luma-table-skel--thumb" />
        <span class="luma-table-skel-lines">
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-title" />
            <span class="luma-table-skel luma-table-skel--line luma-table-skel--line-sub" />
        </span>
        <span class="luma-table-skel luma-table-skel--count" />
        <div class="luma-table-skel-actions">
            <span
                v-for="action in 3"
                :key="action"
                class="luma-table-skel luma-table-skel--action"
            />
        </div>
    </div>

    <span v-else class="luma-table-skel luma-table-skel--line luma-table-skel--line-title" />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    part: {
        type: String,
        required: true,
    },
    composite: {
        type: Boolean,
        default: true,
    },
    count: {
        type: Number,
        default: 2,
    },
    depth: {
        type: Number,
        default: 0,
    },
});

const actionCount = computed(() => Math.max(1, props.count));

const treeIndent = computed(() => `${0.85 + props.depth * 1.35}rem`);
</script>
