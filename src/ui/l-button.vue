<template>
    <Button
        :class="classes"
        :disabled="disabled || loading"
        :aria-busy="loading || null"
        :outlined="primeOutlined"
        :text="primeText"
        :severity="primeSeverity"
        v-bind="passthroughAttrs"
    >
        <LIcon
            v-if="icon && !loading"
            :name="icon"
            :size="iconSize"
            class="luma-btn__icon"
        />
        <slot />
        <LIcon
            v-if="iconRight && !loading"
            :name="iconRight"
            :size="iconSize"
            class="luma-btn__icon luma-btn__icon--right"
        />
    </Button>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import Button from 'primevue/button';
import LIcon from './l-icon.vue';

/**
 * LButton — themed wrapper around PrimeVue Button.
 *
 * The whole `.luma-btn` class system is exposed through composed
 * `variant`, `severity`, `size`, `shape` props so consumers don't have
 * to repeat class chains. Defaults are sensible out of the box:
 *
 *     variant = 'gradient'
 *     severity = 'primary'
 *     size     = 'md'
 *     shape    = 'pill'
 *
 *     <LButton>Save</LButton>
 *     <LButton variant="ghost" severity="neutral">Cancel</LButton>
 *     <LButton severity="success" icon="check">Approve</LButton>
 *     <LButton variant="soft" severity="danger" icon="trash" icon-only>Delete</LButton>
 *     <LButton :loading="busy" icon="refresh">Sync</LButton>
 *     <LButton icon="refresh-cw" spin-on-hover>Retry</LButton>
 *
 * Escape hatch: pass `bare` to drop the auto-class system entirely,
 * then add any class you want via `rawClass` or any unstyled passthrough.
 *
 * Important: Luma's `variant`/`severity` are NOT the same as PrimeVue's.
 * We map them so PrimeVue stops painting a solid primary fill on top of
 * outline/ghost/soft/glass — without this, runtime PrimeVue CSS wins.
 */
const props = defineProps({
    /**
     * Visual treatment:
     *   solid | gradient (default) | soft | outline | ghost | glass
     */
    variant: {
        type: String,
        default: 'gradient',
        validator: (v) => ['solid', 'gradient', 'soft', 'outline', 'ghost', 'glass'].includes(v),
    },
    /**
     * Color channel:
     *   primary (default) | neutral | success | warn | danger | info
     */
    severity: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'neutral', 'success', 'warn', 'danger', 'info'].includes(v),
    },
    /**
     * Size scale:
     *   xs | sm | md (default) | lg | xl
     */
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
    },
    /**
     * Shape:
     *   pill (default) | square | rounded | circle
     */
    shape: {
        type: String,
        default: 'pill',
        validator: (v) => ['pill', 'square', 'rounded', 'circle'].includes(v),
    },
    /**
     * Lucide icon name. Rendered as a leading icon.
     * Use `iconRight` for a trailing icon.
     */
    icon: { type: String, default: '' },
    iconRight: { type: String, default: '' },
    /**
     * When true, applies `--icon-only` modifier (square hit area, hide label).
     * Pair with `aria-label` for accessibility.
     */
    iconOnly: { type: Boolean, default: false },
    /**
     * Adds the icon-spin animation. Replaces PrimeVue's `:loading` prop.
     * Pair with `disabled` to prevent double-submit.
     */
    loading: { type: Boolean, default: false },
    /**
     * Opt-in to the "icon rotates 180° on hover" effect. Only meaningful
     * for buttons that visually represent a refresh/reload action —
     * applying it to every icon-only button looks like a hover glitch.
     */
    spinOnHover: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /**
     * Bypass the auto-class system; only `rawClass` (and any unstyled
     * passthrough) will be applied. Useful for fully custom buttons.
     */
    bare: { type: Boolean, default: false },
    /**
     * Extra class(es) appended on top of the auto-class chain.
     */
    rawClass: { type: [String, Array, Object], default: '' },
});

const attrs = useAttrs();

/**
 * Map icon size to Luma's button-size scale. Smaller buttons
 * get smaller icons automatically.
 */
const iconSize = computed(() => {
    switch (props.size) {
        case 'xs': return 'xs';
        case 'sm': return 'xs';
        case 'lg': return 'md';
        case 'xl': return 'md';
        default:  return 'sm';
    }
});

const classes = computed(() => {
    if (props.bare) return props.rawClass;
    return [
        'luma-btn',
        `luma-btn--${props.variant}`,
        `luma-btn--${props.severity}`,
        `luma-btn--${props.size}`,
        `luma-btn--${props.shape}`,
        props.iconOnly && 'luma-btn--icon-only',
        props.spinOnHover && 'luma-btn--spin-on-hover',
        props.loading && 'luma-btn--loading',
        props.rawClass,
    ];
});

/**
 * Tell PrimeVue to drop its solid fill when Luma is drawing outline /
 * ghost / soft / glass. Without this, PrimeVue's runtime `.l-button`
 * primary fill lands AFTER Luma CSS and paints over the outline.
 */
const primeOutlined = computed(() => props.variant === 'outline');
const primeText = computed(() => ['ghost', 'soft', 'glass'].includes(props.variant));

/**
 * PrimeVue has no `neutral` severity — map it to `secondary` so the
 * outlined/text tokens stay gray instead of brand-blue.
 */
const primeSeverity = computed(() => {
    if (props.severity === 'neutral') return 'secondary';
    if (props.severity === 'warn') return 'warn';
    return props.severity;
});

/**
 * Drop `class` from passthrough attrs since Luma owns the class chain.
 * Also strip PrimeVue visual props we already map above so callers
 * can't accidentally re-introduce a solid fill.
 */
const passthroughAttrs = computed(() => {
    const {
        class: _ignored,
        outlined: _o,
        text: _t,
        severity: _s,
        variant: _v,
        ...rest
    } = attrs;
    return rest;
});
</script>