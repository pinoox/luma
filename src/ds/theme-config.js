/**
 * Luma — Theme Config Helpers
 *
 * Apps pass a single `themeConfig` object to `createApp({ config, routes })`.
 * The shape below is the Luma baseline; apps override any field.
 */

/**
 * Flatten a nav `sections[]` array into a single list of nav items.
 * @param {Array<{ items?: Array<object> }>} sections
 * @returns {Array<object>}
 */
export const flattenNavItems = (sections) =>
    (sections ?? []).flatMap((section) =>
        (section.items ?? []).flatMap((item) => (
            Array.isArray(item.children) && item.children.length
                ? item.children
                : [item]
        )),
    );

/**
 * Find the nav item whose `route` matches the given route name.
 * @param {Array<object>} sections
 * @param {string} routeName
 */
export const findNavItemByRoute = (sections, routeName) =>
    flattenNavItems(sections).find((item) => item.route === routeName) ?? null;

/**
 * Resolve the page-meta entry for a route name with a safe fallback.
 * @param {Record<string, { title: string, lead?: string, badge?: string, metaTitle?: string }>} pageMeta
 * @param {string} routeName
 * @param {{ title: string, lead: string, badge?: string, metaTitle?: string }} fallback
 */
export const findPageMeta = (pageMeta, routeName, fallback) =>
    pageMeta?.[routeName] ?? fallback;

/**
 * Resolve the `<title>` tag value for a page.
 *
 * Priority:
 *   1. pageMeta[routeName].metaTitle  — explicit override
 *   2. pageMeta[routeName].title      — falls back to the visible title
 *   3. brand.title                    — last-resort fallback
 *
 * The returned value is just the page part (e.g. "Dashboard").
 * Use `composeMetaTitle()` to combine it with the brand suffix.
 *
 * @param {{ pageMeta?: object, routeName?: string, brand?: { title?: string } }} refs
 */
export const resolveMetaTitle = ({ pageMeta, routeName, brand } = {}) => {
    const meta = pageMeta?.[routeName] ?? {};
    return meta.metaTitle ?? meta.title ?? brand?.title ?? '';
};

/**
 * Build the full `<title>` value: "{page} · {brand}".
 * Returns just the brand title if the page part is empty.
 *
 * @param {string} page
 * @param {string} brand
 */
export const composeMetaTitle = (page, brand) => {
    const pagePart = (page ?? '').trim();
    const brandPart = (brand ?? '').trim();
    if (!pagePart) return brandPart;
    if (!brandPart || pagePart === brandPart) return pagePart;
    return `${pagePart} · ${brandPart}`;
};

/**
 * Compute the user display name from an auth profile object.
 * @param {object|null} profile
 * @param {string} fallback
 */
export const resolveUserDisplayName = (profile, fallback = '') => {
    const p = profile ?? {};
    const fullName = [p.fname, p.lname].filter(Boolean).join(' ').trim();
    return fullName || p.name || p.username || p.email || fallback;
};

/**
 * Build a user-info object suitable for `LTopbar` from an auth profile.
 * @param {object|null} profile
 * @param {string} roleLabel
 */
export const buildUserInfo = (profile, roleLabel) => {
    const p = profile ?? {};
    return {
        name: resolveUserDisplayName(p, roleLabel),
        role: roleLabel,
        image: p.avatar_url || p.avatar || p.image || p.photo || '',
        fname: p.fname || '',
        lname: p.lname || '',
    };
};

/**
 * Default shape — apps normally override `brand`, `nav.sections`, `pageMeta`,
 * `user.roleLabel`. Anything left out falls back to these safe values.
 *
 * `auth` is opt-in: leave it empty to use Luma's defaults (read endpoints
 * from `__PINOOX__.auth.endpoints`, hydrate the profile via me()/auth.get
 * on first nav). Override any of the following to customize:
 *
 *   auth: {
 *     endpoints: { me, login, logout }, // override individual URLs
 *     skipMe: true,                      // never call me(); trust token presence
 *     autoLoginFromUrl: true,            // auto-pickup ?__manager_token=... JWT
 *   }
 */
export const DEFAULT_THEME_CONFIG = {
    brand: {
        title: 'Luma',
        subtitle: 'Admin dashboard',
        logo: null,
    },
    nav: {
        sections: [],
    },
    pageMeta: {},
    user: {
        roleLabel: 'Admin',
    },
    auth: {
        endpoints: null,        // { me?, login?, logout? }
        skipMe: false,          // if true, never call auth.me() — trust token presence (manager proxy)
        autoLoginFromUrl: false, // if true, adopt ?__manager_token=... and treat as logged-in
    },
    /**
     * Spotlight (⌘K / Ctrl+K) command palette.
     * Apps can register async providers via `registerSpotlightProvider()`.
     */
    spotlight: {
        enabled: true,
        placeholder: 'جستجو...',
        emptyText: 'نتیجه‌ای پیدا نشد',
        showShortcutHint: true,
        navGroup: 'صفحات',
    },
    /**
     * Text direction for the shell + PrimeVue.
     * Prefer leaving this unset so Luma can detect from `<html dir>` /
     * `__PINOOX__.direction`. Set `'rtl'` / `'ltr'` only to force.
     */
    direction: null,
    /**
     * Default type stack — Vazir ships with Luma (`@use '@pinooxhq/luma/styles'`).
     * Apps can override via `applyThemeConfig({ font: { sans, mono } })`.
     */
    font: {
        sans: "Vazir, Vazirmatn, Inter, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
        mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
    },
};

/**
 * Resolve a user-supplied config against the defaults.
 * @param {object} config
 * @returns {object}
 */
export const resolveThemeConfig = (config = {}) => ({
    brand:  { ...DEFAULT_THEME_CONFIG.brand, ...(config.brand ?? {}) },
    nav:    { ...DEFAULT_THEME_CONFIG.nav,   ...(config.nav ?? {}) },
    pageMeta: { ...(config.pageMeta ?? {}) },
    user:   { ...DEFAULT_THEME_CONFIG.user,  ...(config.user ?? {}) },
    auth: {
        ...DEFAULT_THEME_CONFIG.auth,
        ...(config.auth ?? {}),
        // Endpoints are merged one level deeper so apps can override just `me`.
        endpoints: {
            ...(DEFAULT_THEME_CONFIG.auth.endpoints ?? {}),
            ...((config.auth && config.auth.endpoints) ?? {}),
        },
    },
    spotlight: {
        ...DEFAULT_THEME_CONFIG.spotlight,
        ...(config.spotlight ?? {}),
    },
    // Pass through layout/font tokens used by applyThemeConfig.
    font: config.font ?? DEFAULT_THEME_CONFIG.font ?? null,
    layout: config.layout ?? DEFAULT_THEME_CONFIG.layout ?? null,
    direction: config.direction ?? DEFAULT_THEME_CONFIG.direction,
});

/**
 * Active theme config — set by `createApp`, read by `usePage` and layouts.
 * Apps normally don't touch this directly.
 */
let activeThemeConfig = resolveThemeConfig();

export const setActiveThemeConfig = (config) => {
    activeThemeConfig = resolveThemeConfig(config);
    return activeThemeConfig;
};

export const getActiveThemeConfig = () => activeThemeConfig;