/**
 * Router prefetching utilities for instant page transitions in Luma apps.
 */

const prefetchedRoutes = new Set();

/**
 * Prefetch an async route component by route target (name, path, or route location object).
 *
 * @param {any} router - Vue Router instance
 * @param {any} target - Route target (string name, path, or location object)
 */
export function prefetchRoute(router, target) {
    if (!router || !target) return;
    try {
        const resolved = typeof router.resolve === 'function' ? router.resolve(target) : null;
        if (!resolved?.matched?.length) return;

        for (const record of resolved.matched) {
            const comp = record.components?.default;
            if (typeof comp === 'function') {
                const key = String(record.name || record.path || resolved.path || target);
                if (prefetchedRoutes.has(key)) continue;
                prefetchedRoutes.add(key);

                try {
                    const result = comp();
                    if (result && typeof result.catch === 'function') {
                        result.catch(() => {
                            prefetchedRoutes.delete(key);
                        });
                    }
                } catch {
                    prefetchedRoutes.delete(key);
                }
            }
        }
    } catch (_) {
        // best-effort
    }
}

/**
 * Automatically prefetch an array of nav items or route records on idle.
 *
 * @param {any} router - Vue Router instance
 * @param {Array<any>} items - Array of navigation sections or items
 * @param {number} [delay=400] - Initial delay in ms
 */
export function prefetchNavItemsOnIdle(router, items = [], delay = 400) {
    if (typeof window === 'undefined' || !router || !Array.isArray(items) || items.length === 0) return;

    const targets = [];
    const extract = (list) => {
        for (const item of list) {
            if (!item || item.disabled) continue;
            const target = item.to || (item.route ? { name: item.route } : null);
            if (target) targets.push(target);
            if (Array.isArray(item.children)) extract(item.children);
            if (Array.isArray(item.items)) extract(item.items);
        }
    };
    extract(items);

    if (targets.length === 0) return;

    const queue = [...targets];
    const next = () => {
        if (queue.length === 0) return;
        const target = queue.shift();
        prefetchRoute(router, target);

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(next, { timeout: 1200 });
        } else {
            setTimeout(next, 80);
        }
    };

    const schedule = () => {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(next, { timeout: 1200 });
        } else {
            setTimeout(next, delay);
        }
    };

    if (document.readyState === 'complete') {
        setTimeout(schedule, delay);
    } else {
        window.addEventListener('load', () => setTimeout(schedule, delay), { once: true });
    }
}
