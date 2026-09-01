export const TABLE_SKEL_FLAG = '__skel';
export const TABLE_SKEL_KEY = '__skelKey';
export const TABLE_SKEL_COUNT = 5;

export function createSkeletonRows(count = TABLE_SKEL_COUNT) {
    return Array.from({ length: count }, (_, index) => ({
        [TABLE_SKEL_FLAG]: true,
        [TABLE_SKEL_KEY]: `skel-${index}`,
    }));
}

export function isSkelRow(data) {
    return Boolean(data?.[TABLE_SKEL_FLAG]);
}

export function isSkelRowSelectable(event) {
    return !isSkelRow(event?.data);
}
