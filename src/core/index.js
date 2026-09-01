// Core utilities — barrel exports
export { auth, http, useAuthStore, useAuthRedirect } from './auth/index.js';
export {
    configureHttpLoading,
    useHttpLoading,
    attachHttpLoading,
    beginLocalLoading,
    endLocalLoading,
} from './http/loading.js';
export { unwrapApiBody, attachApiEnvelope } from './http/envelope.js';
export {
    TABLE_SKEL_FLAG,
    TABLE_SKEL_KEY,
    TABLE_SKEL_COUNT,
    createSkeletonRows,
    isSkelRow,
    isSkelRowSelectable,
} from './table/skeleton.js';
export {
    lucidePixelSize,
    lucideStrokeWidth,
    resolveLucideComponent,
} from './icons/lucide.js';
export { formatDate } from './format/date.js';
export {
    jalaliMoment,
    toJalali,
    fromJalali,
    formatJalaliDisplay,
    buildJalaliMonthGrid,
    jalaliMonthLength,
    toPersianDigits,
    fromPersianDigits,
    isSameDay,
    JALALI_MONTHS,
    JALALI_WEEKDAYS,
} from './format/jalali.js';
export { resolveMediaUrl } from './media/url.js';
export { env, isDev, isProd } from './env.js';
export { resolveDirection, applyDocumentDirection } from './direction.js';
export {
    toFinglish,
    toPinglish,
    slugify,
    sanitizeSlug,
    extendLoanwords,
} from './slug.js';