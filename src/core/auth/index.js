import axios from 'axios';
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { createAuth, createHttp } from '@pinooxhq/auth';
import { env, isDev } from '../env.js';

/**
 * Default auth instance. Luma auto-creates one at module load using the
 * pinoox bootstrap (`__PINOOX__.auth`) and Pinoox's default `remote`
 * strategy. Apps that need to override the default `me/login/logout`
 * endpoints, or use a different auth strategy, can call `configureAuth()`
 * before `createApp()` to register their overrides.
 *
 * `@pinooxhq/auth/vue` ships a second bundled createAuth singleton.
 * The Pinia store and `useAuthRedirect` must use this instance (and its
 * axios `http`), not that copy, or `me()` runs on a detached fetch client.
 *
 * `baseUrl: ''` skips `auth.client.baseUrl` from `__PINOOX__`. Axios already
 * prefixes with `url.API` (`/api/v1/`). Joining both produced
 * `/api/v1/api/v1/auth/me`.
 *
 * Note: the very first `createAuth()` call below sets pinoox-auth's global
 * defaultInstance. Subsequent `configureAuth()` calls reset that singleton
 * by calling `createAuth()` again.
 */
const defaultAuth = createAuth({
    debug: isDev(),
    baseUrl: '',
});

let activeAuth = defaultAuth;
let activeHttp = buildHttp(activeAuth);
let isConfigured = false;

/**
 * Build a fresh `http` (axios client) bound to the given auth instance.
 *
 * `createHttp({ auth })` closes over the auth instance so the
 * `Authorization` interceptor and the `apiBase` resolution both read
 * from this specific auth. We rebuild this whenever `configureAuth()`
 * replaces the underlying auth so the exported `http` always tracks
 * the active config.
 */
function buildHttp(authInstance) {
    return createHttp({
        auth: authInstance,
        axios,
        baseURL: env('VITE_API_PATH', '') || undefined,
    });
}

/**
 * Replace the default auth (and the matching `http`) instance. Call once,
 * before `createApp()`.
 *
 * @example
 *   configureAuth({
 *     endpoints: { me: '/api/v1/auth/me' },
 *   });
 */
export const configureAuth = (options = {}) => {
    activeAuth = createAuth({
        debug: isDev(),
        baseUrl: '',
        ...options,
    });
    activeHttp = buildHttp(activeAuth);
    isConfigured = true;
    return activeAuth;
};

/**
 * Currently-active auth instance. Replaced by `configureAuth()`.
 */
export const getActiveAuth = () => activeAuth;

/**
 * Currently-active `http` (axios) client. Replaced by `configureAuth()`
 * so the `Authorization` interceptor and `baseURL` always match the active
 * auth config.
 */
export const getActiveHttp = () => activeHttp;

/**
 * Whether `configureAuth()` has been called at least once.
 */
export const isAuthConfigured = () => isConfigured;

/**
 * `http` is a Proxy that always reads through to the latest `activeHttp`.
 * Reassigning `activeHttp` in `configureAuth()` automatically updates every
 * caller that imported `http` at module load time — they keep the same
 * identifier but pick up the new axios client on the next call.
 */
export const http = new Proxy({}, {
    get: (_target, prop) => activeHttp[prop],
    set: (_target, prop, value) => {
        activeHttp[prop] = value;
        return true;
    },
});

function syncStoreFromAuth(user, token) {
    const instance = getActiveAuth();
    user.value = instance.user;
    token.value = instance.getToken();
}

/**
 * Pinia store bound to Luma's active auth (axios `http` included).
 * Same field names as `@pinooxhq/auth/vue`'s `createPiniaAuthStore`.
 */
export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(null);

    const isAuthenticated = computed(() => {
        const instance = getActiveAuth();
        return instance.isAuthenticated || !!token.value;
    });

    const login = (loginKey, userData = null) => {
        const instance = getActiveAuth();
        instance.setToken(loginKey);
        token.value = loginKey;
        instance.isAuthenticated = true;
        if (userData) {
            instance.user = userData;
            user.value = userData;
        }
    };

    const me = async () => {
        const profile = await getActiveAuth().me();
        syncStoreFromAuth(user, token);
        return profile;
    };

    const canUserAccess = async (refresh = false) => {
        const instance = getActiveAuth();
        token.value = instance.getToken();
        if (!refresh && instance.isAuthenticated) {
            return true;
        }
        const profile = await me();
        return !!profile || instance.isAuthenticated;
    };

    const logout = async () => {
        await getActiveAuth().logout();
        syncStoreFromAuth(user, token);
    };

    const syncTokenFromStorage = () => {
        const instance = getActiveAuth();
        const latest = instance.getToken();
        if (latest) {
            instance.setToken(latest);
        }
        token.value = latest;
        user.value = instance.user;
        return !!latest;
    };

    const loginWithCredentials = async (credentials) => {
        const result = await getActiveAuth().login(credentials);
        syncStoreFromAuth(user, token);
        return result;
    };

    syncTokenFromStorage();

    return {
        auth: isAuthenticated,
        user,
        token,
        isAuth: isAuthenticated,
        getUser: user,
        login,
        logout,
        canUserAccess,
        syncTokenFromStorage,
        me,
        loginWithCredentials,
    };
});

/**
 * Post-login `?redirect=` helpers bound to Luma's active auth instance.
 */
export function useAuthRedirect(fallback = '/') {
    const route = useRoute();
    const instance = () => getActiveAuth();
    const returnPath = computed(() => instance().getReturnPath(route.query, fallback));
    const returnUrl = computed(() => instance().getReturnUrl(route.query, fallback));
    const redirectQuery = computed(() => instance().getRedirectQuery(route.query, fallback));
    return {
        returnPath,
        returnUrl,
        redirectQuery,
        resolveRedirect: () => returnUrl.value,
        redirectBack: () => instance().redirectBack(route.query, fallback),
    };
}

// Backwards-compat: `auth` exported as a const proxy. Always reads the
// current `activeAuth` instance — module-level reassignment is supported by
// Rolldown for `let` exports, but consumers in this codebase access `auth`
// directly via the local reference, which `createApp.js` does via
// `getActiveAuth()` to always read the latest.
export const auth = new Proxy({}, {
    get: (_target, prop) => activeAuth[prop],
    set: (_target, prop, value) => {
        activeAuth[prop] = value;
        return true;
    },
});

export default auth;
