/**
 * Shared Vite perf presets for Luma consumers (dev pre-bundle + prod chunks).
 * Imported by vite.js; also exposed as @pinooxhq/luma/vite/perf.
 */

/** Rolldown / Vite 8 vendor groups for Luma's peer + direct deps. */
export const LUMA_CHUNK_GROUPS = [
    {
        name: 'vendor-vue',
        test: /node_modules\/(?:vue|vue-router|pinia|vue-i18n|@vue\/)/,
    },
    {
        name: 'vendor-luma',
        test: /node_modules\/@pinooxhq\/(?:luma|auth|pinion-client|slug)/,
    },
    {
        name: 'vendor-prime',
        test: /node_modules\/(?:primevue|@primeuix|primeicons)/,
    },
    {
        name: 'vendor-tiptap',
        test: /node_modules\/@tiptap\//,
    },
    {
        name: 'vendor-icons',
        test: /node_modules\/(?:@lucide\/vue|lucide-vue-next)/,
    },
    {
        name: 'vendor-date',
        test: /node_modules\/(?:moment-jalaali|moment|jalaali-js)/,
    },
    {
        name: 'vendor-http',
        test: /node_modules\/(?:axios|yup|toposort|property-expr|tiny-case)/,
    },
];

/** Pre-bundle targets for Luma peers (safe when Luma comes from npm). */
export const LUMA_OPTIMIZE_DEPS = [
    'vue',
    'vue-router',
    'pinia',
    'vue-i18n',
    'axios',
    '@pinooxhq/auth',
    '@pinooxhq/pinion-client',
    '@pinooxhq/slug',
    '@pinooxhq/slug/vue',
    'primevue/config',
    'primevue/toastservice',
    'primevue/confirmationservice',
    'primevue/tooltip',
    'primevue/usetoast',
    'primevue/useconfirm',
    '@tiptap/core',
    '@tiptap/vue-3',
    '@tiptap/starter-kit',
    '@tiptap/extension-link',
    '@tiptap/extension-list',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-image',
    '@tiptap/extension-table',
    '@tiptap/extension-table-cell',
    '@tiptap/extension-table-header',
    '@tiptap/extension-table-row',
    '@tiptap/extension-color',
    '@tiptap/extension-font-family',
    '@tiptap/extension-highlight',
    '@tiptap/extension-text-align',
    '@tiptap/extension-text-style',
    '@tiptap/extension-underline',
    '@tiptap/extension-youtube',
    '@vueuse/gesture',
    'lucide-vue-next',
    '@lucide/vue',
    'chart.js',
    'moment-jalaali',
    'moment',
    'jalaali-js',
    'yup',
];

/**
 * @param {Array<{ name: string, test: RegExp }>} [extraGroups]
 * @returns {Array<{ name: string, test: RegExp }>}
 */
export function mergeChunkGroups(extraGroups = []) {
    return [...LUMA_CHUNK_GROUPS, ...extraGroups];
}

/**
 * @param {Partial<{
 *   extraGroups: Array<{ name: string, test: RegExp }>,
 *   chunkSizeWarningLimit: number,
 * }>} [options]
 */
export function buildChunkConfig(options = {}) {
    const { extraGroups = [], chunkSizeWarningLimit = 1200 } = options;

    return {
        chunkSizeWarningLimit,
        reportCompressedSize: false,
        rolldownOptions: {
            output: {
                codeSplitting: { groups: mergeChunkGroups(extraGroups) },
            },
        },
    };
}

/**
 * @param {Partial<{
 *   entry: string,
 *   warmup: string[],
 *   extraOptimizeDeps: string[],
 *   includeLumaPackage: boolean,
 * }>} [options]
 */
export function devPerfConfig(options = {}) {
    const {
        entry = 'src/main.js',
        warmup = [],
        extraOptimizeDeps = [],
        includeLumaPackage = true,
    } = options;

    const include = [
        ...(includeLumaPackage ? ['@pinooxhq/luma'] : []),
        ...LUMA_OPTIMIZE_DEPS,
        ...extraOptimizeDeps,
    ];

    /** @type {import('vite').UserConfig} */
    const patch = {
        css: { devSourcemap: false },
        optimizeDeps: {
            entries: [entry],
            include: [...new Set(include)],
            holdUntilCrawlEnd: false,
        },
    };

    if (warmup.length > 0) {
        patch.server = {
            warmup: {
                clientFiles: warmup,
            },
        };
    }

    return patch;
}

/**
 * @param {Partial<{
 *   entry: string,
 *   warmup: string[],
 *   extraOptimizeDeps: string[],
 *   extraChunkGroups: Array<{ name: string, test: RegExp }>,
 *   chunkSizeWarningLimit: number,
 *   includeLumaPackage: boolean,
 *   build: boolean,
 *   dev: boolean,
 * }>} [options]
 */
export function lumaPerfConfig(options = {}) {
    const {
        build = false,
        dev = true,
        extraChunkGroups = [],
        chunkSizeWarningLimit,
        ...devOptions
    } = options;

    /** @type {import('vite').UserConfig} */
    const patch = {};

    if (build) {
        patch.build = buildChunkConfig({
            extraGroups: extraChunkGroups,
            chunkSizeWarningLimit,
        });
    }

    if (dev) {
        Object.assign(patch, devPerfConfig(devOptions));
    }

    return patch;
}
