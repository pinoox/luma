// Core utilities — barrel exports
export { auth, http, useAuthStore } from './auth/index.js';
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