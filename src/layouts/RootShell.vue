<template>
  <RouterView />
  <!-- Position & dir resolve from app bootstrap (RTL → top-left). -->
  <LToast />
</template>

<script setup>
import { LToast } from '../ui/index.js';
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
