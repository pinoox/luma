import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import preset from './preset.js';

/**
 * Install PrimeVue with the Luma preset, toast service, and tooltip
 * directive. Also globally registers the `<LIcon>` component if the
 * app passes one via the `IconComponent` option (recommended:
 * import `LIcon` from `@pinooxhq/luma/ui` and pass it through).
 *
 * Apps that don't need the global `LIcon` registration can simply
 * skip the option — `<LIcon>` will resolve as an unregistered custom
 * element if not globally registered.
 *
 * @param {import('vue').App} app
 * @param {{ IconComponent?: object }} [options]
 */
export default function setupPrimeVue(app, options = {}) {
    const { IconComponent } = options;

    if (IconComponent) {
        app.component('LIcon', IconComponent);
    }

    app.use(PrimeVue, {
        ripple: true,
        rtl: true,
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
    app.directive('tooltip', Tooltip);
}
