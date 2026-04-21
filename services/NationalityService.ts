import { Region } from '../types';
import { NATIONAL_TEAMS_EUROPE } from '../resources/static_db/NationalTeams/NationalTeamsEurope';
import { NATIONAL_TEAMS_AFRICA } from '../resources/static_db/NationalTeams/NationalTeamsAfrica';
import { NATIONAL_TEAMS_AFC } from '../resources/static_db/NationalTeams/NationalTeamsAFC';
import { NATIONAL_TEAMS_CONCACAF } from '../resources/static_db/NationalTeams/NationalTeamsCONCACAF';
import { NATIONAL_TEAMS_CONMEBOL } from '../resources/static_db/NationalTeams/NationalTeamsCONMEBOL';
import { NATIONAL_TEAMS_OFC } from '../resources/static_db/NationalTeams/NationalTeamsOFC';

// ── Budowanie mapy Region → lista reprezentacji (name + reputation) ───────────

type NtEntry = { name: string; reputation: number };

const REGION_TO_NT_LIST: Partial<Record<Region, NtEntry[]>> = {};

const allNTData = [
  ...(NATIONAL_TEAMS_EUROPE as { name: string; reputation: number; region: string }[]),
  ...(NATIONAL_TEAMS_AFRICA as { name: string; reputation: number; region: string }[]),
  ...(NATIONAL_TEAMS_AFC as { name: string; reputation: number; region: string }[]),
  ...(NATIONAL_TEAMS_CONCACAF as { name: string; reputation: number; region: string }[]),
  ...(NATIONAL_TEAMS_CONMEBOL as { name: string; reputation: number; region: string }[]),
  ...(NATIONAL_TEAMS_OFC as { name: string; reputation: number; region: string }[]),
];

for (const nt of allNTData) {
  const region = nt.region as Region;
  if (!REGION_TO_NT_LIST[region]) {
    REGION_TO_NT_LIST[region] = [];
  }
  REGION_TO_NT_LIST[region]!.push({ name: nt.name, reputation: nt.reputation });
}

// ── Losowanie konkretnego kraju z puli regionu (ważone reputacją) ─────────────

export function pickNationalityForRegion(region: Region): string {
  const list = REGION_TO_NT_LIST[region];
  if (!list || list.length === 0) return '';
  if (list.length === 1) return list[0].name;

  const totalWeight = list.reduce((sum, nt) => sum + nt.reputation, 0);
  let roll = Math.random() * totalWeight;
  for (const nt of list) {
    roll -= nt.reputation;
    if (roll <= 0) return nt.name;
  }
  return list[list.length - 1].name;
}

// ── Eksport mapy do użytku w UI (podgląd jakie kraje należą do regionu) ──────

export { REGION_TO_NT_LIST };
