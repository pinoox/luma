import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import preset from './preset.js';

/**
 * Install PrimeVue with the Luma preset, toast service, and tooltip
 * directive. Also globally registers the `<PIcon>` component if the
 * app passes one via the `IconComponent` option (recommended:
 * import `PIcon` from `@pinooxhq/luma/ui` and pass it through).
 *
 * Apps that don't need the global `PIcon` registration can simply
 * skip the option — `<PIcon>` will resolve as an unregistered custom
 * element if not globally registered.
 *
 * @param {import('vue').App} app
 * @param {{ IconComponent?: object }} [options]
 */
export default function setupPrimeVue(app, options = {}) {
    const { IconComponent } = options;

    if (IconComponent) {
        app.component('PIcon', IconComponent);
    }

    app.use(PrimeVue, {
        ripple: true,
        rtl: true,
        theme: {
            preset,
            options: {
                prefix: 'p',
                darkModeSelector: '[data-theme="dark"]',
                cssLayer: false,
            },
        },
    });

    app.use(ToastService);
    app.directive('tooltip', Tooltip);
}
