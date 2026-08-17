import { getCurrentInstance, onBeforeUnmount, ref, unref } from 'vue';

const normalizeAccept = (accept) =>
    String(unref(accept) || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

const acceptsFile = (file, accept) => {
    const rules = normalizeAccept(accept);
    if (!rules.length) return true;

    const name = String(file?.name || '').toLowerCase();
    const type = String(file?.type || '').toLowerCase();

    return rules.some((rule) => {
        if (rule.startsWith('.')) return name.endsWith(rule);
        if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
        return type === rule;
    });
};

export function useFilePicker(options = {}) {
    const input = ref(null);
    const dragging = ref(false);
    const errors = ref([]);
    const previewUrls = new Set();
    let dragDepth = 0;

    const createPreview = (file) => {
        if (typeof URL === 'undefined' || !URL.createObjectURL) return '';
        const url = URL.createObjectURL(file);
        previewUrls.add(url);
        return url;
    };

    const revokePreview = (url) => {
        if (!previewUrls.has(url)) return;
        URL.revokeObjectURL(url);
        previewUrls.delete(url);
    };

    const clearPreviews = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        previewUrls.clear();
    };

    const select = async (fileList) => {
        errors.value = [];
        let files = [...(fileList || [])];
        const multiple = unref(options.multiple) !== false;
        const maxFiles = Number(unref(options.maxFiles)) || 0;
        const maxSize = Number(unref(options.maxSize)) || 0;

        files = files.filter((file) => {
            if (!acceptsFile(file, options.accept)) {
                errors.value.push({ code: 'type', file });
                return false;
            }
            if (maxSize > 0 && file.size > maxSize) {
                errors.value.push({ code: 'size', file });
                return false;
            }
            const customError = options.validate?.(file);
            if (customError) {
                errors.value.push({ code: 'validation', file, message: customError });
                return false;
            }
            return true;
        });

        if (!multiple) files = files.slice(0, 1);
        if (maxFiles > 0 && files.length > maxFiles) {
            errors.value.push({ code: 'limit', limit: maxFiles });
            files = files.slice(0, maxFiles);
        }

        if (files.length) await options.onSelect?.(files);
        return files;
    };

    const open = () => {
        if (!unref(options.disabled)) input.value?.click();
    };

    const onInput = async (event) => {
        await select(event.target?.files);
        if (event.target) event.target.value = '';
    };

    const onDragEnter = () => {
        if (unref(options.disabled)) return;
        dragDepth += 1;
        dragging.value = true;
    };

    const onDragOver = () => {
        if (!unref(options.disabled)) dragging.value = true;
    };

    const onDragLeave = () => {
        dragDepth = Math.max(0, dragDepth - 1);
        if (!dragDepth) dragging.value = false;
    };

    const onDrop = async (event) => {
        dragDepth = 0;
        dragging.value = false;
        if (unref(options.disabled)) return [];
        return select(event.dataTransfer?.files);
    };

    if (getCurrentInstance()) onBeforeUnmount(clearPreviews);

    return {
        input,
        dragging,
        errors,
        open,
        select,
        onInput,
        onDragEnter,
        onDragOver,
        onDragLeave,
        onDrop,
        createPreview,
        revokePreview,
        clearPreviews,
    };
}
