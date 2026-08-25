import { Club, PolishVoivodeship } from '../types';

export const THIRD_LEAGUE_GROUP_IDS = [
  'L_PL_4_G1',
  'L_PL_4_G2',
  'L_PL_4_G3',
  'L_PL_4_G4',
] as const;

export type ThirdLeagueGroupId = typeof THIRD_LEAGUE_GROUP_IDS[number];

export const THIRD_LEAGUE_GROUP_NAMES: Record<ThirdLeagueGroupId, string> = {
  L_PL_4_G1: 'Betclic 3. Liga – Grupa 1',
  L_PL_4_G2: 'Betclic 3. Liga – Grupa 2',
  L_PL_4_G3: 'Betclic 3. Liga – Grupa 3',
  L_PL_4_G4: 'Betclic 3. Liga – Grupa 4',
};

const GROUP_BY_VOIVODESHIP: Record<PolishVoivodeship, ThirdLeagueGroupId> = {
  'łódzkie': 'L_PL_4_G1',
  'mazowieckie': 'L_PL_4_G1',
  'podlaskie': 'L_PL_4_G1',
  'warmińsko-mazurskie': 'L_PL_4_G1',
  'kujawsko-pomorskie': 'L_PL_4_G2',
  'pomorskie': 'L_PL_4_G2',
  'wielkopolskie': 'L_PL_4_G2',
  'zachodniopomorskie': 'L_PL_4_G2',
  'dolnośląskie': 'L_PL_4_G3',
  'lubuskie': 'L_PL_4_G3',
  'opolskie': 'L_PL_4_G3',
  'śląskie': 'L_PL_4_G3',
  'lubelskie': 'L_PL_4_G4',
  'małopolskie': 'L_PL_4_G4',
  'podkarpackie': 'L_PL_4_G4',
  'świętokrzyskie': 'L_PL_4_G4',
};

export const PolishThirdLeagueService = {
  isThirdLeagueId(leagueId: string | null | undefined): leagueId is ThirdLeagueGroupId {
    return THIRD_LEAGUE_GROUP_IDS.includes(leagueId as ThirdLeagueGroupId);
  },

  isThirdLeagueClub(club: Club): boolean {
    return this.isThirdLeagueId(club.leagueId);
  },

  getGroupForVoivodeship(voivodeship: PolishVoivodeship): ThirdLeagueGroupId {
    return GROUP_BY_VOIVODESHIP[voivodeship];
  },

  getGroupForClub(club: Club): ThirdLeagueGroupId {
    if (!club.polishVoivodeship) {
      throw new Error(`Club ${club.id} cannot be routed to III liga: polishVoivodeship is missing.`);
    }
    return GROUP_BY_VOIVODESHIP[club.polishVoivodeship];
  },

  getPolishTier(leagueId: string | null | undefined): number | null {
    if (this.isThirdLeagueId(leagueId) || leagueId === 'L_PL_4') return 4;
    if (leagueId === 'L_PL_5' || /^L_PL_5_/.test(leagueId ?? '')) return 5;
    if (/^L_PL_6_/.test(leagueId ?? '')) return 6;
    const match = /^L_PL_([1-3])$/.exec(leagueId ?? '');
    return match ? Number(match[1]) : null;
  },
};
