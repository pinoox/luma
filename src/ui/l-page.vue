<template>
  <LView class="luma-page" :class="toneClass">
    <LPageHeader
      v-if="showHeader"
      :title="resolvedTitle"
      :lead="resolvedLead"
      :eyebrow="resolvedEyebrow"
      :icon="resolvedIcon"
      :icon-color="iconColor"
      :tone="resolvedHeaderTone"
    >
      <slot name="actions" />
    </LPageHeader>

    <LPageToolbar v-if="$slots.toolbar || $slots['toolbar-info']" :tone="toolbarTone">
      <template v-if="$slots['toolbar-info']" #info>
        <slot name="toolbar-info" />
      </template>
      <slot name="toolbar" />
    </LPageToolbar>

    <LPageContainer>
      <slot />
    </LPageContainer>
  </LView>
</template>

<script setup>
import { computed } from 'vue';
import LView from './l-view.vue';
import LPageHeader from './l-page-header.vue';
import LPageToolbar from './l-page-toolbar.vue';
import LPageContainer from './l-page-container.vue';
import { usePage } from '../composables/use-page.js';

/**
 * LPage — default admin page shell.
 *
 * Reads title / lead / badge from `themeConfig.pageMeta` via `usePage()`,
 * so most pages need zero header markup:
 *
 *     <LPage icon="users">
 *       <template #actions>
 *         <LButton icon="plus">افزودن</LButton>
 *       </template>
 *       <LPanel>…</LPanel>
 *     </LPage>
 *
 * Override any meta field with props. Hide the header with `:header="false"`.
 */
const props = defineProps({
    title: { type: String, default: '' },
    lead: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    icon: { type: String, default: '' },
    iconColor: { type: String, default: '' },
    /** Show page header (default true). */
    header: { type: Boolean, default: true },
    /**
     * Page surface tone:
     *   default | glass
     * Affects header treatment when headerTone is not set.
     */
    tone: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'glass'].includes(v),
    },
    /**
     * Header tone override:
     *   default | glass | gradient
     */
    headerTone: {
        type: String,
        default: '',
        validator: (v) => !v || ['default', 'glass', 'gradient'].includes(v),
    },
    toolbarTone: {
        type: String,
        default: 'glass',
        validator: (v) => ['glass', 'flat', 'solid'].includes(v),
    },
});

const { pageTitle, pageLead, pageBadge, navItem } = usePage();

const showHeader = computed(() => props.header !== false);

const resolvedTitle = computed(() => props.title || pageTitle.value || '');
const resolvedLead = computed(() => props.lead || pageLead.value || '');
const resolvedEyebrow = computed(() => props.eyebrow || pageBadge.value || '');
const resolvedIcon = computed(() => props.icon || navItem.value?.icon || '');

const resolvedHeaderTone = computed(() => {
    if (props.headerTone) return props.headerTone;
    if (props.tone === 'glass') return 'glass';
    return 'default';
});

const toneClass = computed(() =>
    props.tone === 'glass' ? 'luma-page--glass' : null,
);
</script>

<style lang="scss">
.luma-page {
    width: 100%;
}
</style>
