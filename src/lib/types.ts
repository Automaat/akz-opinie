export type Gender = 'm' | 'f';

export interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  rank: string;
  patent: string;
  role: string;
  duty: string;
  seasickness: string;
  resistance: string;
  suitableFor: string;
  remarks: string;
}

export interface Cruise {
  id: string;
  title: string;
  series: string;
  yacht: { type: string; class: string; name: string; length: string };
  embark: { port: string; date: string };
  disembark: { port: string; date: string };
  visitedPorts: string;
  tidal: boolean;
  hours: { harbour: string; sails: string; engine: string; above6B: string; miles: string };
  captainRemarks: string;
  captain: { name: string; patent: string; phone: string; email: string };
  crew: CrewMember[];
  images: { crew: string | null; yacht: string | null };
  createdAt: string;
  updatedAt: string;
}

export type ImageSlot = keyof Cruise['images'];
export const IMAGE_SLOTS: ImageSlot[] = ['crew', 'yacht'];

export function newId(): string {
  return crypto.randomUUID();
}

export function emptyMember(): CrewMember {
  return {
    id: newId(),
    firstName: '',
    lastName: '',
    gender: 'm',
    rank: 'Brak',
    patent: '',
    role: 'Załogant',
    duty: 'Bardzo dobrze',
    seasickness: 'Nie podlegał',
    resistance: 'Bardzo dobra',
    suitableFor: 'Szkolenia na Jachtowego Sternika Morskiego',
    remarks: ''
  };
}

export function emptyCruise(): Cruise {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: '',
    series: '',
    yacht: { type: '', class: '', name: '', length: '' },
    embark: { port: '', date: '' },
    disembark: { port: '', date: '' },
    visitedPorts: '',
    tidal: false,
    hours: { harbour: '', sails: '', engine: '', above6B: '', miles: '' },
    captainRemarks: '',
    captain: { name: '', patent: '', phone: '', email: '' },
    crew: [emptyMember()],
    images: { crew: null, yacht: null },
    createdAt: now,
    updatedAt: now
  };
}
