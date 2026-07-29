// @pinooxhq/luma — Vite config helpers.
//
// All `@pinooxhq/luma/<subpath>` imports are resolved directly through the
// package's `package.json#exports` map (Node-style). Apps no longer need
// to wire Vite aliases for the package — `node_modules/@pinooxhq/luma`
// has full subpath exports.
//
// This file is kept for future Vite-specific helpers (preset builders,
// scss `additionalData` injectors, etc.). For now it's a no-op that apps
// can still import to keep their config stable.

export const lumaAliases = {};

export default lumaAliases;
