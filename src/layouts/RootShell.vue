<template>
  <RouterView />
  <Toast position="top-left" />
</template>

<script setup>
import Toast from 'primevue/toast';
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
