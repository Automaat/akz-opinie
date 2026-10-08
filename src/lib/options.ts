import type { Gender } from './types';

export const RANKS = [
  'Brak',
  'Żeglarz Jachtowy',
  'Sternik Jachtowy',
  'Jachtowy Sternik Morski',
  'Kapitan Jachtowy'
];

export const ROLES = [
  'Kapitan',
  'Pierwszy oficer',
  'Drugi Oficer',
  'Trzeci Oficer',
  'Oficer Wachtowy',
  'Załogant',
  'Kuk',
  'Mechanik',
  'Bosman'
];

export const DUTIES = ['Bardzo dobrze', 'Dobrze', 'Miernie', 'Niewłaściwie'];

export const SEASICKNESS = [
  'Nie podlegał',
  'Chorował ale mógł pracować',
  'Chorował co wykluczało pracę'
];

export const RESISTANCE = ['Wyjątkowa', 'Bardzo dobra', 'Dobra', 'Średnia', 'Słaba'];

export const SUITABLE_FOR = [
  'Szkolenia na Jachtowego Sternika Morskiego',
  'Szkolenia na Kapitana Jachtowego',
  'Samodzielnego prowadzenia rejsów'
];

export const YACHT_TYPES = ['Ket', 'Slup', 'Kecz', 'Szkuner gaflowy'];

const FEMALE: Record<string, string> = {
  Załogant: 'Załogantka',
  'Nie podlegał': 'Nie podlegała',
  'Chorował ale mógł pracować': 'Chorowała ale mogła pracować',
  'Chorował co wykluczało pracę': 'Chorowała co wykluczało pracę'
};

export function inflect(value: string, gender: Gender): string {
  return gender === 'f' ? (FEMALE[value] ?? value) : value;
}
