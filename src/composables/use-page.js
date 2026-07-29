import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getActiveThemeConfig, findNavItemByRoute, findPageMeta } from '../ds/theme-config.js';

/**
 * Luma — `usePage` composable
 *
 * Returns reactive page metadata (title, lead, badge) and the matching nav
 * item for the currently-active route. Reads from the active `themeConfig`
 * (set via `setActiveThemeConfig(...)` from `createApp`).
 *
 * Apps use it inside any page to drive `PHeader`:
 *
 *     const { pageTitle, pageLead, pageBadge } = usePage();
 */
export function usePage() {
    const route = useRoute();
    const config = getActiveThemeConfig();

    const fallback = computed(() => ({
        title: config.brand.title,
        lead: config.brand.subtitle,
        badge: '',
    }));

    const pageMeta = computed(() => {
        const name = String(route.name || '');
        return findPageMeta(config.pageMeta, name, fallback.value);
    });

    const navItem = computed(() =>
        findNavItemByRoute(config.nav.sections ?? [], String(route.name || ''))
    );

    return {
        pageMeta,
        navItem,
        pageTitle: computed(() => pageMeta.value.title),
        pageLead:  computed(() => pageMeta.value.lead),
        pageBadge: computed(() => pageMeta.value.badge ?? ''),
    };
}