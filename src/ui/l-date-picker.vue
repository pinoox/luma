<template>
  <div class="luma-datepicker" :class="{ 'is-open': open, 'is-disabled': disabled }" ref="rootEl">
    <button
      type="button"
      class="luma-datepicker__trigger"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="luma-datepicker__value" :class="{ 'is-placeholder': !displayText }">
        {{ displayText || placeholder }}
      </span>
      <LIcon v-if="showIcon" name="calendar" size="sm" class="luma-datepicker__icon" />
    </button>

    <div v-if="open" class="luma-datepicker__panel" role="dialog">
      <template v-if="calendar === 'jalali'">
        <div class="luma-datepicker__nav">
          <button type="button" class="luma-datepicker__nav-btn" @click="shiftMonth(-1)">
            <LIcon name="chevron-right" size="sm" />
          </button>
          <strong>{{ monthTitle }}</strong>
          <button type="button" class="luma-datepicker__nav-btn" @click="shiftMonth(1)">
            <LIcon name="chevron-left" size="sm" />
          </button>
        </div>
        <div class="luma-datepicker__weekdays">
          <span v-for="d in JALALI_WEEKDAYS" :key="d">{{ d }}</span>
        </div>
        <div class="luma-datepicker__grid">
          <button
            v-for="(cell, idx) in grid"
            :key="idx"
            type="button"
            class="luma-datepicker__day"
            :class="{
              'is-outside': !cell.inMonth,
              'is-today': cell.isToday,
              'is-selected': isSelected(cell.date),
            }"
            @click="selectDate(cell.date)"
          >
            {{ digit(cell.jd) }}
          </button>
        </div>
      </template>
      <div v-else class="luma-datepicker__gregorian">
        <DatePicker
          :model-value="modelValue"
          inline
          :manual-input="false"
          @update:model-value="onGregorianPick"
        />
      </div>
      <div class="luma-datepicker__footer">
        <button type="button" class="luma-datepicker__link" @click="clear">پاک کردن</button>
        <button type="button" class="luma-datepicker__link" @click="pickToday">امروز</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import DatePicker from 'primevue/datepicker';
import LIcon from './l-icon.vue';
import {
    JALALI_MONTHS,
    JALALI_WEEKDAYS,
    buildJalaliMonthGrid,
    formatJalaliDisplay,
    fromJalali,
    isSameDay,
    toJalali,
    toPersianDigits,
} from '../core/format/jalali.js';

const props = defineProps({
    modelValue: { type: [Date, String, Number], default: null },
    calendar: {
        type: String,
        default: 'jalali',
        validator: (v) => ['jalali', 'gregorian'].includes(v),
    },
    placeholder: { type: String, default: 'انتخاب تاریخ' },
    disabled: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: true },
    persianDigits: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const rootEl = ref(null);
const viewJy = ref(1404);
const viewJm = ref(1);

const syncViewFromValue = () => {
    const j = toJalali(props.modelValue) || toJalali(new Date());
    if (j) {
        viewJy.value = j.jy;
        viewJm.value = j.jm;
    }
};

watch(() => props.modelValue, syncViewFromValue, { immediate: true });

const displayText = computed(() => {
    if (!props.modelValue) return '';
    if (props.calendar === 'jalali') {
        return formatJalaliDisplay(props.modelValue, { digits: props.persianDigits });
    }
    const d = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA');
});

const monthTitle = computed(() => {
    const title = `${JALALI_MONTHS[viewJm.value - 1] ?? ''} ${viewJy.value}`;
    return props.persianDigits ? toPersianDigits(title) : title;
});

const grid = computed(() => buildJalaliMonthGrid(viewJy.value, viewJm.value));

const digit = (n) => (props.persianDigits ? toPersianDigits(n) : String(n));

const isSelected = (date) => isSameDay(date, props.modelValue);

const toggle = () => {
    if (props.disabled) return;
    open.value = !open.value;
    if (open.value) syncViewFromValue();
};

const shiftMonth = (delta) => {
    let jm = viewJm.value + delta;
    let jy = viewJy.value;
    if (jm < 1) {
        jm = 12;
        jy -= 1;
    } else if (jm > 12) {
        jm = 1;
        jy += 1;
    }
    viewJm.value = jm;
    viewJy.value = jy;
};

const selectDate = (date) => {
    if (!date) return;
    emit('update:modelValue', date);
    open.value = false;
};

const onGregorianPick = (val) => {
    emit('update:modelValue', val);
    open.value = false;
};

const clear = () => {
    emit('update:modelValue', null);
    open.value = false;
};

const pickToday = () => {
    const now = new Date();
    if (props.calendar === 'jalali') {
        const j = toJalali(now);
        emit('update:modelValue', fromJalali(j.jy, j.jm, j.jd));
    } else {
        emit('update:modelValue', now);
    }
    open.value = false;
};

const onDocClick = (e) => {
    if (!open.value) return;
    if (rootEl.value && !rootEl.value.contains(e.target)) {
        open.value = false;
    }
};

onMounted(() => document.addEventListener('mousedown', onDocClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick));
</script>

<style lang="scss">
.luma-datepicker {
    position: relative;
    width: 100%;

    &__trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        min-height: 2.5rem;
        padding: 0.45rem 0.75rem;
        border: 1px solid var(--px-border, #e2e8f0);
        border-radius: var(--px-radius-md, 10px);
        background: var(--px-surface, #fff);
        color: var(--px-text, #0f172a);
        cursor: pointer;
        font: inherit;
        text-align: start;
    }

    &.is-disabled &__trigger {
        opacity: 0.55;
        cursor: not-allowed;
    }

    &__value.is-placeholder {
        color: var(--px-text-muted, #94a3b8);
    }

    &__icon {
        color: var(--px-text-muted, #64748b);
        flex-shrink: 0;
    }

    &__panel {
        position: absolute;
        z-index: 40;
        inset-inline-start: 0;
        top: calc(100% + 6px);
        min-width: 280px;
        padding: 0.75rem;
        border-radius: 16px;
        background: var(--px-surface-strong, #fff);
        border: 1px solid var(--px-border, #e2e8f0);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }

    &__nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.55rem;
        gap: 0.35rem;
    }

    &__nav strong {
        font-size: 0.9rem;
        font-weight: 700;
    }

    &__nav-btn {
        appearance: none;
        border: 0;
        background: var(--px-surface-muted, #f1f5f9);
        width: 1.85rem;
        height: 1.85rem;
        border-radius: 8px;
        display: grid;
        place-items: center;
        cursor: pointer;
        color: inherit;
    }

    &__weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.15rem;
        margin-bottom: 0.25rem;
        text-align: center;
        font-size: 0.72rem;
        color: var(--px-text-muted, #64748b);
        font-weight: 600;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.15rem;
    }

    &__day {
        appearance: none;
        border: 0;
        background: transparent;
        aspect-ratio: 1;
        border-radius: 999px;
        cursor: pointer;
        font: inherit;
        font-size: 0.82rem;
        color: inherit;

        &:hover {
            background: var(--px-surface-muted, #f1f5f9);
        }

        &.is-outside {
            opacity: 0.35;
        }

        &.is-today {
            box-shadow: inset 0 0 0 1px var(--px-primary, #6366f1);
        }

        &.is-selected {
            background: var(--px-primary, #6366f1);
            color: var(--px-primary-contrast, #fff);
        }
    }

    &__footer {
        display: flex;
        justify-content: space-between;
        margin-top: 0.55rem;
        padding-top: 0.45rem;
        border-top: 1px solid var(--px-border, #e2e8f0);
    }

    &__link {
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--px-primary, #6366f1);
        font: inherit;
        font-size: 0.8rem;
        font-weight: 650;
        cursor: pointer;
        padding: 0;
    }

    &__gregorian {
        :deep(.p-datepicker) {
            border: 0;
            padding: 0;
        }
    }
}
</style>
