<template>
    <div class="px-layout" dir="rtl">
        <aside class="px-layout__sidebar">
            <LSidebar
                :brand-title="brand.title"
                :brand-subtitle="brand.subtitle"
                :brand-logo="brand.logo"
                :sections="navSections"
            />
        </aside>

        <div class="px-layout__main">
            <LTopbar
                :user="userInfo"
                :spotlight="spotlightEnabled"
                :spotlight-placeholder="spotlightPlaceholder"
                :spotlight-shortcut="spotlightShortcut"
                @menu="drawerOpen = true"
                @user-click="handleUserClick"
                @spotlight="openSpotlight()"
            />

            <LMobileNav class="px-layout__mobile-nav" :items="mobileNavItems" />

            <main class="px-layout__content">
                <RouterView />
            </main>
        </div>

        <Drawer
            :visible="drawerOpen"
            position="right"
            @update:visible="(value) => (drawerOpen = value)"
        >
            <template #header>
                <strong>{{ brand.title }}</strong>
            </template>
            <LSidebar
                :brand-title="brand.title"
                :brand-subtitle="brand.subtitle"
                :brand-logo="brand.logo"
                :sections="navSections"
            />
        </Drawer>

        <LSpotlight
            v-if="spotlightEnabled"
            :items="spotlightNavItems"
            :placeholder="spotlightPlaceholder"
            :empty-text="spotlightEmptyText"
            :show-shortcut-hint="spotlightShowHint"
            :dir="layoutDir"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Drawer from 'primevue/drawer';
import { LSidebar, LTopbar, LMobileNav, LSpotlight } from '../ds/index.js';
import { useAuthStore } from '../core/auth/index.js';
import { usePage } from '../composables/use-page.js';
import {
    bindSpotlightShortcut,
    openSpotlight,
    spotlightShortcutLabel,
    unbindSpotlightShortcut,
} from '../composables/use-spotlight.js';
import { getActiveThemeConfig, flattenNavItems, buildUserInfo } from '../ds/theme-config.js';

const config = getActiveThemeConfig();
const authStore = useAuthStore();

const brand = config.brand;
const drawerOpen = ref(false);

const spotlightCfg = computed(() => getActiveThemeConfig().spotlight ?? {});
const spotlightEnabled = computed(() => spotlightCfg.value.enabled !== false);
const spotlightPlaceholder = computed(
    () => spotlightCfg.value.placeholder || 'جستجو...',
);
const spotlightEmptyText = computed(
    () => spotlightCfg.value.emptyText || 'نتیجه‌ای پیدا نشد',
);
const spotlightShowHint = computed(
    () => spotlightCfg.value.showShortcutHint !== false,
);
const spotlightShortcut = computed(() =>
    spotlightEnabled.value ? spotlightShortcutLabel() : '',
);
const layoutDir = computed(() => {
    const dir = getActiveThemeConfig().direction;
    return dir === 'ltr' || dir === 'rtl' ? dir : 'rtl';
});

// Title/lead kept for document.title sync via usePage(); topbar shows Spotlight instead.
usePage();

const canPermission = (permission) => {
    if (!permission) return true;
    const user = authStore.user || {};
    const group = user.group_key;
    if (group === 'admin' || group === 'superadmin') return true;
    const abilities = user.abilities || [];
    if (abilities.includes('*')) return true;
    return abilities.includes(permission);
};

const navSections = computed(() =>
    (config.nav?.sections ?? [])
        .map((section) => ({
            ...section,
            items: (section.items ?? []).filter((item) => canPermission(item.permission)),
        }))
        .filter((section) => (section.items ?? []).length > 0),
);

const userInfo = computed(() => buildUserInfo(authStore.user, config.user.roleLabel));
const mobileNavItems = computed(() => flattenNavItems(navSections.value));

const spotlightNavItems = computed(() => {
    const group = spotlightCfg.value.navGroup || 'صفحات';
    return flattenNavItems(navSections.value).map((item, index) => ({
        id: `nav:${item.route || item.key || index}`,
        title: item.label,
        icon: item.icon || 'file',
        group,
        keywords: [item.label, item.key, item.route].filter(Boolean).join(' '),
        route: item.route ? { name: item.route } : undefined,
        to: item.to,
    }));
});

onMounted(() => {
    if (spotlightEnabled.value) bindSpotlightShortcut();
});

onUnmounted(() => {
    unbindSpotlightShortcut();
});

const handleUserClick = () => {
    // Apps can wrap this layout in a parent and listen to user-click via the
    // emitted event, or replace this layout with their own.
};
</script>

<style lang="scss" src="../scss/layouts/_layout.scss"></style>
