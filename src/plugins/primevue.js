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
    app.use(ConfirmationService);
    app.directive('tooltip', Tooltip);
}
