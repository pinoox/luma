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
    (sections ?? []).flatMap((section) => section.items ?? []);

/**
 * Find the nav item whose `route` matches the given route name.
 * @param {Array<object>} sections
 * @param {string} routeName
 */
export const findNavItemByRoute = (sections, routeName) =>
    flattenNavItems(sections).find((item) => item.route === routeName) ?? null;

/**
 * Resolve the page-meta entry for a route name with a safe fallback.
 * @param {Record<string, { title: string, lead: string, badge?: string }>} pageMeta
 * @param {string} routeName
 * @param {{ title: string, lead: string, badge?: string }} fallback
 */
export const findPageMeta = (pageMeta, routeName, fallback) =>
    pageMeta?.[routeName] ?? fallback;

/**
 * Compute the user display name from an auth profile object.
 * @param {object|null} profile
 * @param {string} fallback
 */
export const resolveUserDisplayName = (profile, fallback = '') => {
    const p = profile ?? {};
    const fullName = [p.fname, p.lname].filter(Boolean).join(' ').trim();
    return fullName || p.username || p.email || fallback;
};

/**
 * Build a user-info object suitable for `PTopbar` from an auth profile.
 * @param {object|null} profile
 * @param {string} roleLabel
 */
export const buildUserInfo = (profile, roleLabel) => ({
    name: resolveUserDisplayName(profile, roleLabel),
    role: roleLabel,
});

/**
 * Default shape — apps normally override `brand`, `nav.sections`, `pageMeta`,
 * `user.roleLabel`. Anything left out falls back to these safe values.
 *
 * `auth` is opt-in: leave it empty to use Luma's defaults (read endpoints
 * from `__PINOOX__.auth.endpoints`, run `canUserAccess(true)` on first nav).
 * Override any of the following to customize:
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
        subtitle: 'داشبورد مدیریتی',
        logo: null,
    },
    nav: {
        sections: [],
    },
    pageMeta: {},
    user: {
        roleLabel: 'مدیر',
    },
    auth: {
        endpoints: null,        // { me?, login?, logout? }
        skipMe: false,          // if true, never call auth.me() — trust token presence
        autoLoginFromUrl: false, // if true, adopt ?__manager_token=... and treat as logged-in
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