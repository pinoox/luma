/**
 * Resolve a Lucide kebab-case name to a lucide-vue-next component.
 * @see https://lucide.dev/
 */
import * as LucideIcons from 'lucide-vue-next';

export function resolveLucideComponent(name) {
    if (!name || typeof name !== 'string') {
        return null;
    }

    const key = name
        .trim()
        .toLowerCase()
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    return LucideIcons[key] ?? null;
}

export function lucidePixelSize(size) {
    const map = {
        xs: 14,
        sm: 16,
        md: 18,
        lg: 20,
        xl: 24,
    };

    if (typeof size === 'number') {
        return size;
    }

    return map[size] ?? map.sm;
}

export function lucideStrokeWidth(size) {
    const map = {
        xs: 1.75,
        sm: 1.85,
        md: 1.9,
        lg: 2,
        xl: 2,
    };

    if (typeof size === 'number') {
        return size <= 16 ? 1.85 : 2;
    }

    return map[size] ?? map.sm;
}
