import { emptyMember, type CrewMember, type Cruise, type Gender } from '$lib/types';

type Obj = Record<string, unknown>;

const obj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {});
const str = (v: unknown, max = 5000): string => (typeof v === 'string' ? v.slice(0, max) : '');

function member(raw: unknown): CrewMember {
  const m = obj(raw);
  const base = emptyMember();
  return {
    id: typeof m.id === 'string' && m.id ? m.id.slice(0, 64) : base.id,
    firstName: str(m.firstName, 100),
    lastName: str(m.lastName, 100),
    gender: (m.gender === 'f' ? 'f' : 'm') satisfies Gender,
    rank: str(m.rank, 100),
    patent: str(m.patent, 100),
    role: str(m.role, 100),
    duty: str(m.duty, 100),
    seasickness: str(m.seasickness, 100),
    resistance: str(m.resistance, 100),
    suitableFor: str(m.suitableFor, 200),
    remarks: str(m.remarks)
  };
}

export function sanitizeCruise(raw: unknown, current: Cruise): Cruise {
  const c = obj(raw);
  const yacht = obj(c.yacht);
  const embark = obj(c.embark);
  const disembark = obj(c.disembark);
  const hours = obj(c.hours);
  const captain = obj(c.captain);
  const crew = Array.isArray(c.crew) ? c.crew.slice(0, 200).map(member) : current.crew;
  return {
    id: current.id,
    title: str(c.title, 200),
    series: str(c.series, 200),
    yacht: {
      type: str(yacht.type, 100),
      class: str(yacht.class, 100),
      name: str(yacht.name, 100),
      length: str(yacht.length, 20)
    },
    embark: { port: str(embark.port, 100), date: str(embark.date, 20) },
    disembark: { port: str(disembark.port, 100), date: str(disembark.date, 20) },
    visitedPorts: str(c.visitedPorts, 500),
    tidal: c.tidal === true,
    hours: {
      harbour: str(hours.harbour, 20),
      sails: str(hours.sails, 20),
      engine: str(hours.engine, 20),
      above6B: str(hours.above6B, 20),
      miles: str(hours.miles, 20)
    },
    captainRemarks: str(c.captainRemarks),
    captain: {
      name: str(captain.name, 100),
      patent: str(captain.patent, 100),
      phone: str(captain.phone, 30),
      email: str(captain.email, 200)
    },
    crew,
    images: current.images,
    createdAt: current.createdAt,
    updatedAt: current.updatedAt
  };
}
