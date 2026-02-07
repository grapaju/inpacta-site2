export function formatCurrencyBRL(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  // Keep only digits and separators
  let cleaned = raw.replace(/[^0-9,\.]/g, '');
  if (!cleaned) return '';

  let integerDigits = '';
  let centsDigits = '';

  if (cleaned.includes(',')) {
    // Brazilian decimal separator
    const [intPart, decPart = ''] = cleaned.split(',');
    integerDigits = String(intPart).replace(/\D/g, '');
    centsDigits = String(decPart).replace(/\D/g, '').slice(0, 2).padEnd(2, '0');
  } else if (cleaned.includes('.')) {
    // If there's a dot, treat the last dot as decimal separator when possible
    const parts = cleaned.split('.');
    const last = parts.pop() ?? '';
    const rest = parts.join('');
    const restDigits = rest.replace(/\D/g, '');
    const lastDigits = last.replace(/\D/g, '');

    // If user typed something like 1234.56, use it as decimal; otherwise assume integer
    if (lastDigits.length > 0 && lastDigits.length <= 2) {
      integerDigits = restDigits || '0';
      centsDigits = lastDigits.padEnd(2, '0');
    } else {
      integerDigits = (restDigits + lastDigits) || '0';
      centsDigits = '00';
    }
  } else {
    // No separators: treat as integer reais
    integerDigits = cleaned.replace(/\D/g, '') || '0';
    centsDigits = '00';
  }

  integerDigits = integerDigits.replace(/^0+(\d)/, '$1');
  const integerFormatted = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${integerFormatted || '0'},${centsDigits || '00'}`;
}

export function normalizeCurrencyBRLToDecimalString(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  // Remove currency symbols and spaces but keep separators
  let cleaned = raw.replace(/[^0-9,\.]/g, '');
  if (!cleaned) return null;

  if (cleaned.includes(',')) {
    // Brazilian format: 1.234,56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // If multiple dots, keep only the last as decimal separator
    const parts = cleaned.split('.').filter(Boolean);
    if (parts.length > 2) {
      const decimal = parts.pop();
      const integer = parts.join('');
      cleaned = `${integer}.${decimal}`;
    }
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  return cleaned;
}
