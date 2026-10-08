const NBSP = ' ';

export function parseNumber(value: string): number | null {
  const n = Number(value.trim().replace(',', '.'));
  return value.trim() === '' || Number.isNaN(n) ? null : n;
}

export function formatNumber(n: number): string {
  return String(Math.round(n * 1000) / 1000).replace('.', ',');
}

export function formatNumberText(value: string): string {
  const n = parseNumber(value);
  return n === null ? value.trim() : formatNumber(n);
}

export function sumHours(sails: string, engine: string): string {
  const a = parseNumber(sails);
  const b = parseNumber(engine);
  return a === null && b === null ? '' : formatNumber((a ?? 0) + (b ?? 0));
}

export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : value;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/[\s.-]/g, '');
  return /^\d{9}$/.test(digits) ? digits.replace(/(\d{3})(?=\d)/g, `$1${NBSP}`) : value.trim();
}

export function fullName(m: { firstName: string; lastName: string }): string {
  return `${m.firstName} ${m.lastName}`.trim();
}
