// @pinooxhq/luma/applyThemeConfig — runtime theme customization (re-export).
// Apps import this from the public entry:
//
//   import { applyThemeConfig } from '@pinooxhq/luma/applyThemeConfig';
//   applyThemeConfig({ brand: { primary: '#FF0000' } });

export { applyThemeConfig, applyDarkThemeConfig } from '../src/customization/applyThemeConfig.js';