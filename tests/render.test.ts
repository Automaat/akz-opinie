import { describe, expect, it } from 'vitest';
import { renderDocument } from '../src/lib/render';
import { emptyCruise, emptyMember } from '../src/lib/types';

function sample() {
  const cruise = emptyCruise();
  const ann = {
    ...emptyMember(),
    firstName: 'Anna',
    lastName: 'Testowa',
    gender: 'f' as const,
    patent: ''
  };
  const bob = { ...emptyMember(), firstName: 'Bob', lastName: '<b>Test</b>', remarks: 'a & b' };
  cruise.crew = [ann, bob];
  cruise.series = 'Rejs testowy';
  cruise.hours = { harbour: '10', sails: '71.5', engine: '48,5', above6B: '0', miles: '516' };
  cruise.embark = { port: 'Gdynia', date: '2025-07-10' };
  return { cruise, ann, bob };
}

describe('renderDocument', () => {
  it('inflects known values for female crew and falls back to "-" for a missing patent', () => {
    const { cruise, ann } = sample();
    const html = renderDocument(cruise, [ann]);
    expect(html).toContain('Anna Testowa, Brak, -');
    expect(html).toContain('<b>Załogantka</b>');
    expect(html).toContain('<b>Nie podlegała</b>');
  });

  it('escapes user text', () => {
    const { cruise, bob } = sample();
    const html = renderDocument(cruise, [bob]);
    expect(html).toContain('&lt;b&gt;Test&lt;/b&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).not.toContain('<b>Test</b>');
  });

  it('computes total hours and lists the whole crew with trailing comma', () => {
    const { cruise, ann } = sample();
    const html = renderDocument(cruise, [ann]);
    expect(html).toContain('<td>120</td>');
    expect(html).toContain('Anna Testowa, Bob &lt;b&gt;Test&lt;/b&gt;,');
  });

  it('renders one sheet per member and the tidal line only when set', () => {
    const { cruise, ann, bob } = sample();
    expect(renderDocument(cruise, [ann, bob]).match(/<section class="sheet">/g)).toHaveLength(2);
    expect(renderDocument(cruise, [ann])).not.toContain('Rejs na wodach pływowych');
    expect(renderDocument({ ...cruise, tidal: true }, [ann])).toContain('Rejs na wodach pływowych');
  });
});
