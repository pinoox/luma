<template>
  <RouterView />
  <!-- Position & dir resolve from theme / document (RTL apps → top-left). -->
  <LToast />
  <LConfirmDialog />
  <LLoading />
</template>

<script setup>
import { LToast, LConfirmDialog, LLoading } from '../ui/index.js';
import { useTheme } from '../ds/composables/use-theme.js';

const theme = useTheme();
</script>

<style>
html,
body,
#app {
    height: 100%;
}

body {
    margin: 0;
    font-family: var(--px-font-sans);
    background: var(--px-bg);
    color: var(--px-text);
}
</style>
