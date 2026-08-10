/**
 * Jalali helpers — thin wrappers around npm `moment-jalaali`.
 * @see https://www.npmjs.com/package/moment-jalaali
 *
 * Prefer the plugin API (`jYYYY` / `jMMMM` / `jYear` / `loadPersian`)
 * instead of hand-rolled conversions.
 *
 * `moment-jalaali` is CJS (`module.exports = …`). Resolve both the
 * optimized ESM interop shape (`{ default }`) and raw namespace forms.
 */
import * as momentJalaaliNs from 'moment-jalaali';

const moment =
    typeof momentJalaaliNs === 'function'
        ? momentJalaaliNs
        : typeof momentJalaaliNs.default === 'function'
            ? momentJalaaliNs.default
            : momentJalaaliNs;

// Official Persian locale (modern dialect: مرداد، جمعه، …)
moment.loadPersian({
    dialect: 'persian-modern',
    usePersianDigits: false,
});

/** Re-export the configured moment-jalaali instance. */
export { moment as jalaliMoment };
export default moment;

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Weekday labels starting Saturday (Persian week). */
export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/** Jalali month names from moment-jalaali (jMMMM). */
export const JALALI_MONTHS = Array.from({ length: 12 }, (_, i) =>
    moment().jMonth(i).format('jMMMM'),
);

export const toPersianDigits = (input) =>
    String(input ?? '').replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);

export const fromPersianDigits = (input) =>
    String(input ?? '').replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));

/**
 * @param {Date|string|number|null|undefined} value
 * @returns {{ jy: number, jm: number, jd: number }|null}
 */
export function toJalali(value) {
    const m = toMoment(value);
    if (!m) return null;
    return {
        jy: m.jYear(),
        jm: m.jMonth() + 1, // moment-jalaali months are 0-based
        jd: m.jDate(),
    };
}

/**
 * Parse a Jalali Y/M/D into a Date (noon local).
 * @param {number} jy
 * @param {number} jm 1-12
 * @param {number} jd
 * @returns {Date|null}
 */
export function fromJalali(jy, jm, jd) {
    if (!Number.isFinite(jy) || !Number.isFinite(jm) || !Number.isFinite(jd)) return null;
    if (jm < 1 || jm > 12 || jd < 1) return null;

    // Official parse: moment('1360/5/26', 'jYYYY/jM/jD')
    const m = moment(`${jy}/${jm}/${jd}`, 'jYYYY/jM/jD');
    if (!m.isValid()) return null;
    if (m.jYear() !== jy || m.jMonth() + 1 !== jm || m.jDate() !== jd) return null;

    m.hour(12).minute(0).second(0).millisecond(0);
    return m.toDate();
}

/** Days in a Jalali month (`moment.jDaysInMonth`, month is 0-based). */
export function jalaliMonthLength(jy, jm) {
    return moment.jDaysInMonth(jy, jm - 1);
}

/**
 * Build a 6×7 month grid (week starts Saturday).
 * Cell: { jy, jm, jd, inMonth, date, isToday }
 */
export function buildJalaliMonthGrid(jy, jm) {
    const monthStart = moment(`${jy}/${jm}/1`, 'jYYYY/jM/jD');
    if (!monthStart.isValid()) return [];

    const daysInMonth = moment.jDaysInMonth(jy, jm - 1);
    // JS getDay(): 0=Sun … 6=Sat → Persian week offset
    const startOffset = (monthStart.toDate().getDay() + 1) % 7;
    const today = moment().startOf('day');
    const cells = [];

    const pushCell = (m, inMonth) => {
        cells.push({
            jy: m.jYear(),
            jm: m.jMonth() + 1,
            jd: m.jDate(),
            inMonth,
            date: m.clone().hour(12).minute(0).second(0).millisecond(0).toDate(),
            isToday: m.isSame(today, 'day'),
        });
    };

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i -= 1) {
        pushCell(monthStart.clone().subtract(i + 1, 'day'), false);
    }

    for (let jd = 1; jd <= daysInMonth; jd += 1) {
        pushCell(moment(`${jy}/${jm}/${jd}`, 'jYYYY/jM/jD'), true);
    }

    let next = monthStart.clone().endOf('jMonth').add(1, 'day').startOf('day');
    while (cells.length < 42) {
        pushCell(next.clone(), false);
        next.add(1, 'day');
    }

    return cells;
}

/**
 * Display with moment-jalaali tokens (`jD jMMMM jYYYY`).
 * @param {Date|string|number|null|undefined} value
 * @param {{ digits?: boolean, format?: string }} [opts]
 */
export function formatJalaliDisplay(value, opts = {}) {
    const m = toMoment(value);
    if (!m) return '';
    const pattern = opts.format || 'jD jMMMM jYYYY';
    const text = m.format(pattern);
    return opts.digits === false ? text : toPersianDigits(text);
}

export function isSameDay(a, b) {
    const ma = toMoment(a);
    const mb = toMoment(b);
    if (!ma || !mb) return false;
    return ma.isSame(mb, 'day');
}

function toMoment(value) {
    if (value == null || value === '') return null;
    const m = moment(value);
    return m.isValid() ? m : null;
}
