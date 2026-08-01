<template>
  <header class="page-header">
    <div class="page-header__content">
      <div v-if="icon" class="page-header__icon">
        <LIcon :name="icon" size="md" />
      </div>
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import LIcon from './l-icon.vue';

defineProps({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
});
</script>

<style lang="scss">
@use '../scss/tokens' as *;

.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--px-space-4);
    padding: 0 0 var(--px-space-5);
    margin: 0;
    font-family: var(--px-font-sans);

    &__content {
        display: flex;
        align-items: center;
        gap: var(--px-space-3);
        min-width: 0;
        flex: 1;
    }

    &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: var(--px-radius-md);
        background: var(--px-primary-soft);
        color: var(--px-primary);
    }

    &__text {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    &__title {
        margin: 0;
        font-size: var(--px-text-2xl);
        font-weight: var(--px-weight-bold);
        color: var(--px-text);
        line-height: var(--px-leading-snug);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__subtitle {
        margin: 4px 0 0;
        font-size: var(--px-text-sm);
        font-weight: var(--px-weight-medium);
        color: var(--px-text-muted);
        line-height: var(--px-leading-normal);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: var(--px-space-2);
        flex-shrink: 0;
    }
}
</style>
