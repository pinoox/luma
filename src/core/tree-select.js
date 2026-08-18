/**
 * TreeSelect helpers — PrimeVue 4 checkbox mode always cascades to children.
 * Independent selection stores only the keys the user toggled.
 */

export function coerceTreeKey(key) {
    if (key == null || key === '') return null;
    const numeric = Number(key);
    return Number.isFinite(numeric) && String(numeric) === String(key) ? numeric : String(key);
}

export function uniqueTreeKeys(ids = []) {
    const seen = new Set();
    const out = [];
    for (const raw of ids) {
        const id = coerceTreeKey(raw);
        if (id == null) continue;
        const token = String(id);
        if (seen.has(token)) continue;
        seen.add(token);
        out.push(id);
    }
    return out;
}

export function toCheckboxKeys(ids = []) {
    return Object.fromEntries(
        uniqueTreeKeys(ids).map((id) => [String(id), { checked: true, partialChecked: false }]),
    );
}

export function toMultipleKeys(ids = []) {
    return Object.fromEntries(uniqueTreeKeys(ids).map((id) => [String(id), true]));
}

export function selectedIdsFromTreeKeys(keys) {
    if (!keys || typeof keys !== 'object') return [];
    return uniqueTreeKeys(
        Object.entries(keys)
            .filter(([, state]) => state === true || state?.checked === true)
            .map(([key]) => key),
    );
}

export function toggleTreeKey(ids, key, selected) {
    const token = String(key);
    const current = uniqueTreeKeys(ids);
    if (selected) {
        return uniqueTreeKeys([...current, key]);
    }
    return current.filter((id) => String(id) !== token);
}
