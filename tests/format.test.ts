import { describe, expect, it } from 'vitest';
import { formatDate, formatNumberText, formatPhone, sumHours } from '../src/lib/format';

describe('format', () => {
  it.each([
    ['71.5', '71,5'],
    ['13,33', '13,33'],
    ['0', '0'],
    ['', ''],
    ['abc', 'abc']
  ])('formatNumberText(%s) = %s', (input, expected) => {
    expect(formatNumberText(input)).toBe(expected);
  });

  it.each([
    ['71,5', '48,5', '120'],
    ['', '50', '50'],
    ['', '', '']
  ])('sumHours(%s, %s) = %s', (sails, engine, expected) => {
    expect(sumHours(sails, engine)).toBe(expected);
  });

  it('converts ISO dates and leaves free text alone', () => {
    expect(formatDate('2025-07-10')).toBe('10.07.2025');
    expect(formatDate('lipiec')).toBe('lipiec');
  });

  it('groups nine-digit phones with non-breaking spaces', () => {
    expect(formatPhone('509581588')).toBe('509 581 588');
    expect(formatPhone('+48 509 581 588')).toBe('+48 509 581 588');
  });
});
