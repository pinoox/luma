import { computed, ref } from 'vue';

const DEFAULTS = {
    enabled: true,
    delay: 220,
    exclude: [],
    label: '',
};

let options = { ...DEFAULTS, exclude: [] };
const pending = ref(0);
const localSurfaces = ref(0);
const visible = ref(false);
let showTimer = null;

export function configureHttpLoading(next = {}) {
    options = {
        enabled: next.enabled ?? options.enabled,
        delay: next.delay ?? options.delay,
        exclude: Array.isArray(next.exclude) ? next.exclude : options.exclude,
        label: next.label ?? options.label,
    };
    return getHttpLoadingOptions();
}

export function getHttpLoadingOptions() {
    return {
        enabled: options.enabled,
        delay: options.delay,
        exclude: [...options.exclude],
        label: options.label,
    };
}

export function resetHttpLoading() {
    pending.value = 0;
    localSurfaces.value = 0;
    visible.value = false;
    if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
    }
    options = { ...DEFAULTS, exclude: [] };
}

export function useHttpLoading() {
    return {
        visible: computed(() => visible.value),
        pending: computed(() => pending.value),
        local: computed(() => localSurfaces.value),
        show: begin,
        hide: end,
        beginLocal: beginLocalLoading,
        endLocal: endLocalLoading,
        configure: configureHttpLoading,
    };
}

export function shouldTrackRequest(config, rules = options) {
    if (!rules.enabled) return false;
    if (config?.skipLoading || config?.lumaSkipLoading) return false;
    const url = String(config?.url || '');
    return !rules.exclude.some((rule) => matchUrl(url, rule));
}

export function attachHttpLoading(client) {
    if (!client?.interceptors?.request || !client?.interceptors?.response) {
        return client;
    }
    if (client.__lumaHttpLoading) return client;
    client.__lumaHttpLoading = true;

    client.interceptors.request.use(
        (config) => {
            if (shouldTrackRequest(config)) {
                config.__lumaTracked = true;
                begin();
            }
            return config;
        },
        (error) => {
            if (error?.config?.__lumaTracked) end();
            return Promise.reject(error);
        },
    );

    client.interceptors.response.use(
        (response) => {
            if (response?.config?.__lumaTracked) end();
            return response;
        },
        (error) => {
            if (error?.config?.__lumaTracked) end();
            return Promise.reject(error);
        },
    );

    return client;
}

export function beginLocalLoading() {
    localSurfaces.value += 1;
    syncOverlay();
}

export function endLocalLoading() {
    localSurfaces.value = Math.max(0, localSurfaces.value - 1);
    syncOverlay();
}

function matchUrl(url, rule) {
    if (typeof rule === 'function') return !!rule(url);
    if (rule instanceof RegExp) return rule.test(url);
    return url.includes(String(rule));
}

function begin() {
    pending.value += 1;
    syncOverlay();
}

function end() {
    pending.value = Math.max(0, pending.value - 1);
    syncOverlay();
}

function syncOverlay() {
    const shouldShow = pending.value > 0 && localSurfaces.value === 0;

    if (shouldShow) {
        if (visible.value || showTimer) return;
        if (options.delay > 0) {
            showTimer = setTimeout(() => {
                showTimer = null;
                if (pending.value > 0 && localSurfaces.value === 0) {
                    visible.value = true;
                }
            }, options.delay);
            return;
        }
        visible.value = true;
        return;
    }

    if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
    }
    visible.value = false;
}
