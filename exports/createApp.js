// @pinooxhq/luma/createApp — Vue app factory with theme config support.
// Mirrors the previous theme helper signature so apps can swap a one-liner:
//
//   import { createAppWithLuma } from '@pinooxhq/luma/createApp';
//   import App from './App.vue';
//   const theme = { brand: { primary: '#FF0000' } };
//   const app = createAppWithLuma(App, theme, (app) => {
//     app.use(router);
//     app.use(pinia);
//     // ...other plugins (i18n, axios, etc.)
//   });
//   app.mount('#app');

import { createApp } from 'vue';
import { applyThemeConfig } from './applyThemeConfig.js';

export default function createAppWithLuma(App, themeConfig, setupFn) {
    const app = createApp(App);
    applyThemeConfig(themeConfig || {});
    if (typeof setupFn === 'function') setupFn(app);
    return app;
}