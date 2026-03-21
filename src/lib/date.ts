import { ALL_TIME_SLOTS } from './booking';
import { CONDO_TIME_ZONE } from './constants';

function getFormatterParts(
  value: Date,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CONDO_TIME_ZONE,
    ...options,
  })
    .formatToParts(value)
    .reduce<Record<string, string>>((accumulator, part) => {
      if (part.type !== 'literal') {
        accumulator[part.type] = part.value;
      }

      return accumulator;
    }, {});
}

function getSafeDate(dateValue: string): Date {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function getComparableTimestamp(dateValue: string, timeValue: string): number {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);

  return Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
}

export function getTodayDateValue(): string {
  const parts = getFormatterParts(new Date(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getCurrentTimeValue(): string {
  const parts = getFormatterParts(new Date(), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return `${parts.hour}:${parts.minute}`;
}

export function addDaysToDateValue(dateValue: string, days: number): string {
  const safeDate = getSafeDate(dateValue);
  safeDate.setUTCDate(safeDate.getUTCDate() + days);

  const parts = getFormatterParts(safeDate, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getMaxAdvanceBookingDateValue(): string {
  return addDaysToDateValue(getTodayDateValue(), 7);
}

export function formatDateForDisplay(dateValue: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: CONDO_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(getSafeDate(dateValue));
}

export function isPastDateValue(dateValue: string): boolean {
  return dateValue < getTodayDateValue();
}

export function isTimeSlotInPast(dateValue: string, timeValue: string): boolean {
  const todayDateValue = getTodayDateValue();

  if (dateValue < todayDateValue) {
    return true;
  }

  if (dateValue > todayDateValue) {
    return false;
  }

  return timeValue <= getCurrentTimeValue();
}

export function canCancelBooking(dateValue: string, startTime: string): boolean {
  const bookingTimestamp = getComparableTimestamp(dateValue, startTime);
  const currentTimestamp = getComparableTimestamp(getTodayDateValue(), getCurrentTimeValue());

  return bookingTimestamp - currentTimestamp >= 2 * 60 * 60 * 1000;
}

export function getAvailableTimeSlots(dateValue: string): string[] {
  return ALL_TIME_SLOTS.filter((slot) => !isTimeSlotInPast(dateValue, slot));
}
