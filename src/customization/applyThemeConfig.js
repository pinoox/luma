// @pinooxhq/luma — runtime theme customization.
// `applyThemeConfig(config)` writes a set of CSS custom properties to
// `:root` so apps can rebrand at runtime without rebuilding Sass.
//
// Recognized keys:
//   config.brand.primary          → --px-primary
//   config.brand.primaryHover     → --px-primary-hover
//   config.brand.primaryActive    → --px-primary-active
//   config.brand.primarySoft      → --px-primary-soft
//   config.brand.bgLight          → --px-bg-light
//   config.brand.bgDark           → --px-bg-dark
//   config.font.sans              → --px-font-sans
//   config.font.mono              → --px-font-mono
//   config.layout.sidebarWidth           → --px-sidebar-width
//   config.layout.sidebarCollapsedWidth  → --px-sidebar-collapsed-width
//   config.layout.topbarHeight           → --px-topbar-height
//   config.layout.pageMaxWidth           → --px-page-max-width
//   config.layout.radius                 → --px-radius-scale

const BRAND_KEYS = [
    ['primary',       '--px-primary'],
    ['primaryHover',  '--px-primary-hover'],
    ['primaryActive', '--px-primary-active'],
    ['bgLight',       '--px-bg-light'],
    ['bgDark',        '--px-bg-dark'],
    ['primarySoft',   '--px-primary-soft'],
];

const FONT_KEYS = [
    ['sans', '--px-font-sans'],
    ['mono', '--px-font-mono'],
];

const LAYOUT_KEYS = [
    ['sidebarWidth',          '--px-sidebar-width'],
    ['sidebarCollapsedWidth', '--px-sidebar-collapsed-width'],
    ['topbarHeight',          '--px-topbar-height'],
    ['pageMaxWidth',          '--px-page-max-width'],
    ['radius',                '--px-radius-scale'],
];

function applyMap(target, source, map) {
    if (!source) return;
    for (const [from, to] of map) {
        if (source[from] != null) {
            target.style.setProperty(to, source[from]);
        }
    }
}

export function applyThemeConfig(config = {}) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    applyMap(root, config.brand,   BRAND_KEYS);
    applyMap(root, config.font,    FONT_KEYS);
    applyMap(root, config.layout,  LAYOUT_KEYS);
}

// `applyDarkThemeConfig` writes the same keys onto the
// `[data-theme="dark"]` selector so dark-mode overrides win.
export function applyDarkThemeConfig(config = {}) {
    if (typeof document === 'undefined') return;
    // [data-theme="dark"] exists in `:root` stylesheet via `_colors.scss`.
    // We resolve the same element to keep dark overrides consistent
    // with how `applyThemeConfig` writes defaults.
    const root = document.documentElement;
    applyMap(root, config.brand,   BRAND_KEYS);
    applyMap(root, config.font,    FONT_KEYS);
    applyMap(root, config.layout,  LAYOUT_KEYS);
}

export default applyThemeConfig;