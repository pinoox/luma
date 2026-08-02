<template>
  <Toast
      :position="resolvedPosition"
      :pt="toastPt"
  >
    <template v-if="$slots.message" #message="slotProps">
      <slot name="message" v-bind="slotProps" />
    </template>
  </Toast>
</template>

<script setup>
import { computed } from 'vue';
import Toast from 'primevue/toast';
import { getBoot } from '../core/boot.js';
import { getActiveThemeConfig } from '../ds/theme-config.js';

/**
 * LToast — themed wrapper around PrimeVue Toast.
 *
 * Toast is portaled to <body>, so it does NOT inherit `dir` from
 * PageLayout. We set `dir` on the toast root from the app bootstrap
 * (or an explicit prop) so RTL text, flex order, and the
 * close-button offset all flip correctly.
 *
 * Use the `useToast()` composable from PrimeVue to trigger toasts.
 *
 * See: https://primevue.org/toast/
 */
const props = defineProps({
    /** PrimeVue Toast position. When omitted, picks start-side for the active direction. */
    position: { type: String, default: '' },
    /** Override text direction. Defaults to theme → `__PINOOX__.direction` → `document.dir` → `ltr`. */
    dir: { type: String, default: '', validator: (v) => !v || ['rtl', 'ltr'].includes(v) },
});

const resolvedDir = computed(() => {
    if (props.dir) return props.dir;
    const themeDir = getActiveThemeConfig()?.direction;
    if (themeDir === 'rtl' || themeDir === 'ltr') return themeDir;
    const bootDir = getBoot()?.direction;
    if (bootDir === 'rtl' || bootDir === 'ltr') return bootDir;
    if (typeof document !== 'undefined') {
        const htmlDir = document.documentElement?.getAttribute('dir');
        if (htmlDir === 'rtl' || htmlDir === 'ltr') return htmlDir;
    }
    return 'ltr';
});

const resolvedPosition = computed(() => {
    if (props.position) return props.position;
    // Prefer the side opposite the RTL sidebar (right): keep toasts top-left in RTL.
    return resolvedDir.value === 'rtl' ? 'top-left' : 'top-right';
});
const toastPt = computed(() => ({
    root: {
        class: ['luma-toast', 'luma-toast__root', `luma-toast--${resolvedDir.value}`],
        dir: resolvedDir.value,
        style: { direction: resolvedDir.value },
    },
    message: { class: 'luma-toast__message' },
    messageContent: {
        class: 'luma-toast__content',
        style: { direction: resolvedDir.value },
    },
    messageIcon: { class: 'luma-toast__icon' },
    messageText: { class: 'luma-toast__text' },
    summary: { class: 'luma-toast__summary' },
    detail: { class: 'luma-toast__detail' },
    buttonContainer: { class: 'luma-toast__close-wrap' },
    closeButton: { class: 'luma-toast__close' },
}));
</script>

<style lang="scss">
@use '../scss/tokens' as *;

// ============================================================
// LToast — RTL-aware toast surface
// ------------------------------------------------------------
// Toast is teleported to <body>, so all layout + direction rules
// live here. The root carries `dir="rtl|ltr"` via pass-through.
// ============================================================

.luma-toast,
.luma-toast__root.l-toast,
.l-toast.luma-toast__root {
    width: min(24rem, calc(100vw - 2rem));
    z-index: var(--px-z-toast);
    gap: var(--px-space-2);
}

.luma-toast__message.l-toast-message,
.l-toast-message.luma-toast__message {
    background: var(--px-surface-strong);
    border: 1px solid var(--px-border);
    border-radius: var(--px-radius-lg);
    box-shadow: var(--px-shadow-lg);
    backdrop-filter: var(--px-blur-md);
    -webkit-backdrop-filter: var(--px-blur-md);
    color: var(--px-text);
    overflow: hidden;

    // Soft severity tint on the whole message surface.
    &.l-toast-message-success {
        background: color-mix(in srgb, var(--px-success) 8%, var(--px-surface-strong));
        border-color: color-mix(in srgb, var(--px-success) 35%, transparent);
        --luma-toast-accent: var(--px-success);
    }
    &.l-toast-message-warn {
        background: color-mix(in srgb, var(--px-warning) 10%, var(--px-surface-strong));
        border-color: color-mix(in srgb, var(--px-warning) 40%, transparent);
        --luma-toast-accent: var(--px-warning);
    }
    &.l-toast-message-error {
        background: color-mix(in srgb, var(--px-danger) 8%, var(--px-surface-strong));
        border-color: color-mix(in srgb, var(--px-danger) 35%, transparent);
        --luma-toast-accent: var(--px-danger);
    }
    &.l-toast-message-info {
        background: color-mix(in srgb, var(--px-info) 8%, var(--px-surface-strong));
        border-color: color-mix(in srgb, var(--px-info) 35%, transparent);
        --luma-toast-accent: var(--px-info);
    }
}

.luma-toast__content.l-toast-message-content,
.l-toast-message-content.luma-toast__content {
    display: flex;
    align-items: flex-start;
    gap: var(--px-space-3);
    padding: var(--px-space-3) var(--px-space-4);
    direction: inherit;
}

// Explicit row order under dir=rtl: icon (start/right) → text → close (end/left).
.luma-toast--rtl .luma-toast__content.l-toast-message-content,
.luma-toast--rtl .l-toast-message-content.luma-toast__content {
    flex-direction: row;
}

.luma-toast__close-wrap {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    margin-inline-start: auto;
}

.luma-toast__icon.l-toast-message-icon,
.l-toast-message-icon.luma-toast__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.1rem;
    color: var(--luma-toast-accent, var(--px-text-muted));
}

.luma-toast__text.l-toast-message-text,
.l-toast-message-text.luma-toast__text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--px-space-1);
    text-align: start; // respects dir — right in RTL, left in LTR
}

.luma-toast__summary.l-toast-summary,
.l-toast-summary.luma-toast__summary {
    font-weight: $px-weight-semibold;
    font-size: var(--px-text-sm);
    line-height: $px-leading-tight;
    color: var(--px-text);
}

.luma-toast__detail.l-toast-detail,
.l-toast-detail.luma-toast__detail {
    font-weight: $px-weight-regular;
    font-size: var(--px-text-xs);
    line-height: $px-leading-normal;
    color: var(--px-text-muted);
    white-space: pre-line;
    word-break: break-word;
}

.luma-toast__close.l-toast-close-button,
.l-toast-close-button.luma-toast__close {
    // Kill PrimeVue's absolute-ish negative offsets that fight RTL.
    position: static !important;
    inset: auto !important;
    margin: 0 !important;
    right: auto !important;
    left: auto !important;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 0;
    border-radius: var(--px-radius-sm);
    background: transparent;
    color: var(--px-text-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition:
        background $px-duration-fast $px-easing-standard,
        color $px-duration-fast $px-easing-standard;

    &:hover {
        background: color-mix(in srgb, var(--px-text) 8%, transparent);
        color: var(--px-text);
    }

    &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--px-primary) 40%, transparent);
        outline-offset: 1px;
    }
}
</style>
