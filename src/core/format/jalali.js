/**
 * Jalali (Persian) calendar helpers for Luma.
 * Uses jalaali-js for conversions; week starts on Saturday.
 */
import {
    toJalaali as g2j,
    toGregorian as j2g,
    isValidJalaaliDate,
    jalaaliMonthLength as monthLen,
} from 'jalaali-js';

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
    const d = toDate(value);
    if (!d) return null;
    return g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * @param {number} jy
 * @param {number} jm 1-12
 * @param {number} jd
 * @returns {Date|null}
 */
export function fromJalali(jy, jm, jd) {
    if (!isValidJalaaliDate(jy, jm, jd)) return null;
    const g = j2g(jy, jm, jd);
    return new Date(g.gy, g.gm - 1, g.gd, 12, 0, 0, 0);
}

/** Days in a Jalali month. */
export function jalaliMonthLength(jy, jm) {
    return monthLen(jy, jm);
}

/**
 * Build calendar cells for a Jalali month (6x7 grid).
 * Each cell: { jy, jm, jd, inMonth, date: Date, isToday }
 * Week starts Saturday.
 */
export function buildJalaliMonthGrid(jy, jm) {
    const daysInMonth = monthLen(jy, jm);
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
    const prevLen = monthLen(prevJy, prevJm);
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

function toDate(value) {
    if (value == null || value === '') return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}
