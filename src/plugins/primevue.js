import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { PIcon } from '../ui/index.js';
import preset from './preset.js';

export default function setupPrimeVue(app) {
    app.component('PIcon', PIcon);

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