import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
    getActiveThemeConfig,
    findNavItemByRoute,
    findPageMeta,
    composeMetaTitle,
} from '../ds/theme-config.js';

/**
 * Luma — `usePage` composable
 *
 * Returns reactive page metadata (title, lead, badge, metaTitle) and the
 * matching nav item for the currently-active route. Reads from the active
 * `themeConfig` (set via `setActiveThemeConfig(...)` from `createApp`).
 *
 * Apps use it inside any page to drive `LPageHeader` and the document
 * `<title>` tag:
 *
 *     const { pageTitle, pageLead, pageBadge, metaTitle } = usePage();
 *
 * The router auto-syncs `document.title` to `metaTitle` after each
 * navigation, so pages don't need to manage it themselves.
 */
export function usePage() {
    const route = useRoute();
    const config = getActiveThemeConfig();

    const fallback = computed(() => ({
        title: config.brand.title,
        lead: config.brand.subtitle,
        badge: '',
        metaTitle: '',
    }));

    const pageMeta = computed(() => {
        const name = String(route.name || '');
        return findPageMeta(config.pageMeta, name, fallback.value);
    });

    const navItem = computed(() =>
        findNavItemByRoute(config.nav.sections ?? [], String(route.name || ''))
    );

    const pagePart = computed(() => {
        const meta = pageMeta.value;
        return meta.metaTitle ?? meta.title ?? '';
    });

    return {
        pageMeta,
        navItem,
        pageTitle: computed(() => pageMeta.value.title),
        pageLead:  computed(() => pageMeta.value.lead),
        pageBadge: computed(() => pageMeta.value.badge ?? ''),
        /**
         * Full `<title>` value: "{page} · {brand}".
         * Auto-synced to `document.title` by the router guard.
         */
        metaTitle: computed(() =>
            composeMetaTitle(pagePart.value, config.brand?.title ?? '')
        ),
        /**
         * Page-only part of the title (no brand suffix).
         * Use this when you need the bare page title.
         */
        metaTitlePage: pagePart,
    };
}