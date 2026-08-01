<template>
  <div class="ppage-view">
    <slot />
  </div>
</template>

<script setup>
/**
 * LView — root of every page. Adds the standard vertical rhythm between
 * LPageHeader / LPageToolbar / LPageContainer children. Override the
 * `--ppage-view-gap` CSS variable on the host element to tighten or
 * loosen the rhythm without touching the primitives.
 */
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.ppage-view {
    --ppage-view-gap: var(--px-space-5);
    display: flex;
    flex-direction: column;
    gap: var(--ppage-view-gap);
    flex: 1;
    min-height: 0;
}
</style>
