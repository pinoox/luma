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
let isConfigured = false;

/**
 * Replace the default auth instance. Call once, before `createApp()`.
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
    isConfigured = true;
    return activeAuth;
};

/**
 * Currently-active auth instance. Replaced by `configureAuth()`.
 */
export const getActiveAuth = () => activeAuth;

/**
 * Whether `configureAuth()` has been called at least once.
 */
export const isAuthConfigured = () => isConfigured;

export const http = createHttp({
    auth: defaultAuth,
    axios,
    baseURL: env('VITE_API_PATH', '') || undefined,
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
