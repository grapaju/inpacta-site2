// Date-only helpers (YYYY-MM-DD) that avoid timezone day-shift.
// We intentionally format using UTC so a stored midnight-UTC date prints as the same calendar day.

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const BR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function parseDateInputToUTC(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();

  if (DATE_ONLY_RE.test(str)) {
    // Date-only input from <input type="date">. JS parses YYYY-MM-DD as UTC already,
    // but we keep it explicit to avoid engine differences.
    return new Date(`${str}T00:00:00.000Z`);
  }

  const brMatch = str.match(BR_DATE_RE);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  }

  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateOnlyPtBR(value) {
  const date = parseDateInputToUTC(value);
  if (!date) return '-';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

export function toDateInputValueUTC(value) {
  const date = parseDateInputToUTC(value);
  if (!date) return '';

  const yyyy = String(date.getUTCFullYear()).padStart(4, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getYearFromDateInputUTC(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (DATE_ONLY_RE.test(str)) return parseInt(str.slice(0, 4), 10);

  const date = parseDateInputToUTC(str);
  return date ? date.getUTCFullYear() : null;
}
