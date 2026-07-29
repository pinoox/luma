import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'pinoox-theme';
const THEMES = ['light', 'dark'];

const activeTheme = ref('light');
let initialized = false;

const readSaved = () => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch (_) {
        return null;
    }
};

const writeSaved = (value) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
        // ignore quota / privacy errors
    }
};

const resolveInitial = () => {
    const saved = readSaved();
    if (saved && THEMES.includes(saved)) {
        return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

const applyToDocument = (value) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', value);
    document.documentElement.classList.toggle('console-dark', value === 'dark');
    document.documentElement.style.colorScheme = value;
};

const ensureInitialized = () => {
    if (initialized) return;
    initialized = true;
    activeTheme.value = resolveInitial();
    applyToDocument(activeTheme.value);
    if (typeof window !== 'undefined' && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (event) => {
            if (readSaved()) return;
            activeTheme.value = event.matches ? 'dark' : 'light';
            applyToDocument(activeTheme.value);
        };
        if (mq.addEventListener) {
            mq.addEventListener('change', listener);
        } else if (mq.addListener) {
            mq.addListener(listener);
        }
    }
};

export const useTheme = () => {
    if (typeof window !== 'undefined') {
        ensureInitialized();
    }

    watch(activeTheme, (value) => {
        applyToDocument(value);
        writeSaved(value);
    });

    const setTheme = (value) => {
        if (!THEMES.includes(value)) return;
        activeTheme.value = value;
    };

    const toggleTheme = () => {
        activeTheme.value = activeTheme.value === 'dark' ? 'light' : 'dark';
    };

    const isDark = () => activeTheme.value === 'dark';

    return {
        theme: activeTheme,
        themes: THEMES,
        setTheme,
        toggleTheme,
        isDark,
    };
};

export const initThemeEarly = () => {
    if (typeof document === 'undefined') return;
    const saved = (() => {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch (_) {
            return null;
        }
    })();
    const next = (saved && THEMES.includes(saved))
        ? saved
        : (typeof window !== 'undefined' && window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('console-dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
};

export const getActiveTheme = () => activeTheme.value;