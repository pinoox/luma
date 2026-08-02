<template>
  <ConfirmDialog
    class="luma-confirm"
    :draggable="false"
    :pt="pt"
  >
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div
        class="luma-confirm__card"
        role="alertdialog"
        :dir="resolvedDir"
        :aria-label="message.header || 'Confirm'"
      >
        <header class="luma-confirm__head">
          <div class="luma-confirm__icon" :class="`luma-confirm__icon--${severityOf(message)}`">
            <LIcon :name="iconOf(message)" size="md" />
          </div>
          <div class="luma-confirm__titles">
            <h3 class="luma-confirm__title">{{ message.header || 'تأیید' }}</h3>
            <p v-if="message.message" class="luma-confirm__message">{{ message.message }}</p>
          </div>
        </header>
        <footer class="luma-confirm__footer">
          <LButton
            variant="ghost"
            shape="rounded"
            @click="rejectCallback"
          >
            {{ message.rejectLabel || 'انصراف' }}
          </LButton>
          <LButton
            shape="rounded"
            :severity="severityOf(message) === 'danger' ? 'danger' : 'primary'"
            :variant="severityOf(message) === 'danger' ? 'solid' : 'solid'"
            @click="acceptCallback"
          >
            {{ message.acceptLabel || 'تأیید' }}
          </LButton>
        </footer>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup>
import { computed } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import { resolveDirection } from '../core/direction.js';
import LIcon from './l-icon.vue';
import LButton from './l-button.vue';

/**
 * LConfirmDialog — Luma-styled PrimeVue confirm surface.
 * Mount once (RootShell). Trigger with `useConfirm().require({…})`.
 *
 * Direction follows Luma's resolve order (theme / `<html dir>` / boot),
 * because ConfirmDialog teleports to `<body>` and would otherwise stay LTR.
 *
 *     const confirm = useConfirm();
 *     confirm.require({
 *       header: 'حذف پروژه',
 *       message: 'این عمل قابل بازگشت نیست.',
 *       severity: 'danger',
 *       acceptLabel: 'حذف',
 *       accept: () => deleteProject(),
 *     });
 */
const pt = {
    root: { class: 'luma-confirm__root' },
    mask: { class: 'luma-confirm__mask' },
};

const resolvedDir = computed(() => resolveDirection());

const severityOf = (message) => {
    const s = message?.severity || message?.icon || '';
    if (s === 'danger' || s === 'warn' || s === 'info' || s === 'success') return s;
    if (typeof s === 'string' && s.includes('trash')) return 'danger';
    if (typeof s === 'string' && s.includes('exclamation')) return 'warn';
    return 'warn';
};

const iconOf = (message) => {
    if (message?.lucideIcon) return message.lucideIcon;
    const s = severityOf(message);
    if (s === 'danger') return 'trash-2';
    if (s === 'success') return 'circle-check';
    if (s === 'info') return 'info';
    return 'triangle-alert';
};
</script>

<style lang="scss">
.luma-confirm__mask.p-dialog-mask,
.p-dialog-mask.luma-confirm__mask {
    background: color-mix(in srgb, #0f172a 45%, transparent) !important;
    backdrop-filter: blur(2px);
}

.luma-confirm__card {
    width: min(420px, calc(100vw - 2rem));
    background: var(--px-surface-strong, #fff);
    border: 1px solid var(--px-border, #e2e8f0);
    border-radius: var(--px-radius-lg, 16px);
    box-shadow: var(--px-shadow-lg, 0 20px 40px rgba(15, 23, 42, 0.18));
    padding: 1.15rem 1.25rem 1rem;
    color: var(--px-text);
    text-align: start;
}

.luma-confirm__head {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
}

.luma-confirm__icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--px-warning, #f59e0b) 16%, transparent);
    color: var(--px-warning, #d97706);

    &--danger {
        background: color-mix(in srgb, var(--px-danger, #ef4444) 14%, transparent);
        color: var(--px-danger, #dc2626);
    }

    &--info {
        background: color-mix(in srgb, var(--px-info, #3b82f6) 14%, transparent);
        color: var(--px-info, #2563eb);
    }

    &--success {
        background: color-mix(in srgb, var(--px-success, #22c55e) 14%, transparent);
        color: var(--px-success, #16a34a);
    }
}

.luma-confirm__titles {
    min-width: 0;
    flex: 1;
}

.luma-confirm__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 750;
    line-height: 1.35;
}

.luma-confirm__message {
    margin: 0.35rem 0 0;
    font-size: 0.88rem;
    color: var(--px-text-muted);
    line-height: 1.55;
}

.luma-confirm__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.45rem;
    margin-top: 1.15rem;
    flex-wrap: wrap;
}
</style>
