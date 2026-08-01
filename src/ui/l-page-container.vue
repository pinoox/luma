<template>
  <div class="ppage-container">
    <slot />
  </div>
</template>

<script setup>
/**
 * LPageContainer — wrapper that gives a page section consistent vertical
 * spacing between siblings (toolbar → container → container → …).
 *
 * The container shares the same horizontal inset as LPageToolbar and
 * LPageHeader, so cards, empty states, and tables visually align with the
 * toolbar edges and the header content.
 */
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.ppage-container {
    --ppage-container-padding-x: var(--px-space-4);
    display: flex;
    flex-direction: column;
    gap: var(--px-space-4);
    width: 100%;
    flex: 1;
    min-height: 0;
    //padding-inline: var(--ppage-container-padding-x);
}
</style>
