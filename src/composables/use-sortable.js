import { ref, unref } from 'vue';

export function moveItem(list, from, to) {
    if (!Array.isArray(list) || from === to) return list;
    if (from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export function useSortable(list, { onUpdate } = {}) {
    const activeIndex = ref(null);
    const overIndex = ref(null);

    const update = (next) => {
        if (onUpdate) {
            onUpdate(next);
            return;
        }
        const target = unref(list);
        if (Array.isArray(target)) target.splice(0, target.length, ...next);
    };

    const start = (index, event) => {
        activeIndex.value = index;
        overIndex.value = null;
        if (event?.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
        }
    };

    const over = (index) => {
        overIndex.value = index;
    };

    const leave = (index) => {
        if (overIndex.value === index) overIndex.value = null;
    };

    const reset = () => {
        activeIndex.value = null;
        overIndex.value = null;
    };

    const drop = (index) => {
        const from = activeIndex.value;
        const current = unref(list);
        if (from != null && Array.isArray(current)) update(moveItem(current, from, index));
        reset();
        return index;
    };

    return { activeIndex, overIndex, start, over, leave, drop, reset };
}
