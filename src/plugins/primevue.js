import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import preset from './preset.js';

/**
 * Resolve a PrimeUI license key for PrimeVue v5+.
 * Priority: explicit option → `__PINOOX__.primevueLicense` → env.
 */
function resolvePrimevueLicense(license) {
    if (typeof license === 'string' && license.trim()) return license.trim();

    const bootLicense = globalThis?.__PINOOX__?.primevueLicense;
    if (typeof bootLicense === 'string' && bootLicense.trim()) {
        return bootLicense.trim();
    }

    try {
        const env = typeof process !== 'undefined' ? process.env : undefined;
        const fromEnv = env?.PRIMEUI_LICENSE || env?.VITE_PRIMEUI_LICENSE;
        if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
    } catch {
        // ignore — some runtimes restrict process.env access
    }

    return undefined;
}

/**
 * Install PrimeVue with the Luma preset, toast + confirm services, and
 * tooltip directive. Also globally registers the `<LIcon>` component if
 * the app passes one via the `IconComponent` option.
 *
 * PrimeVue v5 requires a PrimeUI license key (community or commercial).
 * Pass it via `options.license`, `__PINOOX__.primevueLicense`, or
 * `PRIMEUI_LICENSE` / `VITE_PRIMEUI_LICENSE`.
 *
 * @param {import('vue').App} app
 * @param {{ IconComponent?: object, rtl?: boolean, license?: string }} [options]
 */
export default function setupPrimeVue(app, options = {}) {
    const { IconComponent, rtl = false, license } = options;
    const isRtl = !!rtl;
    const resolvedLicense = resolvePrimevueLicense(license);

    if (IconComponent) {
        app.component('LIcon', IconComponent);
    }

    // Teleported Select/MultiSelect overlays leave the app shell's `dir`,
    // so stamp `dir` on the overlay itself when the app is RTL.
    const rtlOverlayPt = isRtl
        ? {
              select: {
                  overlay: { dir: 'rtl' },
                  list: { dir: 'rtl' },
                  option: { style: { textAlign: 'right' } },
              },
              multiSelect: {
                  overlay: { dir: 'rtl' },
                  list: { dir: 'rtl' },
                  option: { style: { textAlign: 'right' } },
              },
          }
        : undefined;

    app.use(PrimeVue, {
        ripple: true,
        rtl: isRtl,
        ...(resolvedLicense ? { license: resolvedLicense } : {}),
        ...(rtlOverlayPt ? { pt: rtlOverlayPt } : {}),
        theme: {
            preset,
            options: {
                prefix: 'l',
                darkModeSelector: '[data-theme="dark"]',
                cssLayer: false,
            },
        },
    });

    app.use(ToastService);
    app.use(ConfirmationService);
    app.directive('tooltip', Tooltip);
}
