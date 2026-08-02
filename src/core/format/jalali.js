/**
 * Jalali (Persian) calendar helpers for Luma.
 * Uses moment-jalaali; week starts on Saturday.
 */
import moment from 'moment-jalaali';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const JALALI_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

/** Weekday labels starting Saturday (Persian week). */
export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

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
        jm: m.jMonth() + 1,
        jd: m.jDate(),
    };
}

/**
 * @param {number} jy
 * @param {number} jm 1-12
 * @param {number} jd
 * @returns {Date|null}
 */
export function fromJalali(jy, jm, jd) {
    if (!Number.isFinite(jy) || !Number.isFinite(jm) || !Number.isFinite(jd)) return null;
    if (jm < 1 || jm > 12 || jd < 1) return null;
    const daysInMonth = jalaliMonthLength(jy, jm);
    if (jd > daysInMonth) return null;
    const m = moment(`${jy}/${jm}/${jd}`, 'jYYYY/jM/jD');
    if (!m.isValid()) return null;
    // noon avoids DST edge cases when converting to Date
    m.hour(12).minute(0).second(0).millisecond(0);
    return m.toDate();
}

/** Days in a Jalali month. */
export function jalaliMonthLength(jy, jm) {
    // moment-jalaali jDaysInMonth expects 0-based month
    return moment.jDaysInMonth(jy, jm - 1);
}

/**
 * Build calendar cells for a Jalali month (6x7 grid).
 * Each cell: { jy, jm, jd, inMonth, date: Date, isToday }
 * Week starts Saturday.
 */
export function buildJalaliMonthGrid(jy, jm) {
    const daysInMonth = jalaliMonthLength(jy, jm);
    const first = fromJalali(jy, jm, 1);
    if (!first) return [];

    // JS getDay(): 0=Sun … 6=Sat. Persian week start Sat → offset = (getDay()+1)%7
    const startOffset = (first.getDay() + 1) % 7;
    const cells = [];

    let prevJy = jy;
    let prevJm = jm - 1;
    if (prevJm < 1) {
        prevJm = 12;
        prevJy -= 1;
    }
    const prevLen = jalaliMonthLength(prevJy, prevJm);
    for (let i = startOffset - 1; i >= 0; i -= 1) {
        const jd = prevLen - i;
        const date = fromJalali(prevJy, prevJm, jd);
        cells.push({
            jy: prevJy,
            jm: prevJm,
            jd,
            inMonth: false,
            date,
            isToday: isSameDay(date, new Date()),
        });
    }

    for (let jd = 1; jd <= daysInMonth; jd += 1) {
        const date = fromJalali(jy, jm, jd);
        cells.push({
            jy,
            jm,
            jd,
            inMonth: true,
            date,
            isToday: isSameDay(date, new Date()),
        });
    }

    let nextJy = jy;
    let nextJm = jm + 1;
    if (nextJm > 12) {
        nextJm = 1;
        nextJy += 1;
    }
    let nextJd = 1;
    while (cells.length < 42) {
        const date = fromJalali(nextJy, nextJm, nextJd);
        cells.push({
            jy: nextJy,
            jm: nextJm,
            jd: nextJd,
            inMonth: false,
            date,
            isToday: isSameDay(date, new Date()),
        });
        nextJd += 1;
    }

    return cells;
}

/**
 * @param {Date|string|number|null|undefined} value
 * @param {{ digits?: boolean }} [opts]
 */
export function formatJalaliDisplay(value, opts = {}) {
    const j = toJalali(value);
    if (!j) return '';
    const month = JALALI_MONTHS[j.jm - 1] ?? '';
    const text = `${j.jd} ${month} ${j.jy}`;
    return opts.digits === false ? text : toPersianDigits(text);
}

export function isSameDay(a, b) {
    const da = toDate(a);
    const db = toDate(b);
    if (!da || !db) return false;
    return (
        da.getFullYear() === db.getFullYear()
        && da.getMonth() === db.getMonth()
        && da.getDate() === db.getDate()
    );
}

function toMoment(value) {
    if (value == null || value === '') return null;
    const m = value instanceof Date || typeof value === 'number' || typeof value === 'string'
        ? moment(value)
        : null;
    if (!m || !m.isValid()) return null;
    return m;
}

function toDate(value) {
    const m = toMoment(value);
    return m ? m.toDate() : null;
}
