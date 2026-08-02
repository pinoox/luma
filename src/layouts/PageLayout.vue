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
                :title="pageTitle"
                :subtitle="pageLead"
                :user="userInfo"
                @menu="drawerOpen = true"
                @user-click="handleUserClick"
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
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Drawer from 'primevue/drawer';
import { LSidebar, LTopbar, LMobileNav } from '../ds/index.js';
import { useAuthStore } from '../core/auth/index.js';
import { usePage } from '../composables/use-page.js';
import { getActiveThemeConfig, flattenNavItems, buildUserInfo } from '../ds/theme-config.js';

const config = getActiveThemeConfig();
const authStore = useAuthStore();
const { pageTitle, pageLead } = usePage();

const brand = config.brand;
const drawerOpen = ref(false);

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

const handleUserClick = () => {
    // Apps can wrap this layout in a parent and listen to user-click via the
    // emitted event, or replace this layout with their own.
};
</script>

<style lang="scss" src="../scss/layouts/_layout.scss"></style>