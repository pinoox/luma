import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import preset from './preset.js';

/**
 * Install PrimeVue with the Luma preset, toast + confirm services, and
 * tooltip directive. Also globally registers the `<LIcon>` component if
 * the app passes one via the `IconComponent` option.
 *
 * @param {import('vue').App} app
 * @param {{ IconComponent?: object, rtl?: boolean }} [options]
 */
export default function setupPrimeVue(app, options = {}) {
    const { IconComponent, rtl = false } = options;
    const isRtl = !!rtl;

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
              autoComplete: {
                  overlay: { dir: 'rtl' },
                  list: { dir: 'rtl' },
                  option: { style: { textAlign: 'right' } },
                  emptyMessage: { style: { textAlign: 'right' } },
              },
              treeSelect: {
                  overlay: { dir: 'rtl' },
              },
          }
        : undefined;

    app.use(PrimeVue, {
        ripple: true,
        rtl: isRtl,
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
