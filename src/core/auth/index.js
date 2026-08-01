import axios from 'axios';
import { defineStore } from 'pinia';
import { createAuth, createHttp } from '@pinooxhq/auth';
import { createPiniaAuthStore } from '@pinooxhq/auth/vue';
import { env, isDev } from '../env.js';

/**
 * Default auth instance. Luma auto-creates one at module load using the
 * pinoox bootstrap (`__PINOOX__.auth`) and Pinoox's default `remote`
 * strategy. Apps that need to override the default `me/login/logout`
 * endpoints, or use a different auth strategy, can call `configureAuth()`
 * before `createApp()` to register their overrides.
 *
 * Why expose this? Because `@pinooxhq/auth` closes over its options in
 * `createAuth()` and exposes the singleton via `getAuth()`. Apps can call
 * `configureAuth({ endpoints: { me: '/api/me' } })` to redirect the broken
 * default `/account/api/v1/auth/get` (or replace it entirely).
 *
 * Note: the very first `createAuth()` call below sets pinoox-auth's global
 * defaultInstance. Subsequent `configureAuth()` calls reset that singleton
 * by calling `createAuth()` again.
 */
const defaultAuth = createAuth({
    debug: isDev(),
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

export const useAuthStore = createPiniaAuthStore(defineStore, 'auth');

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
