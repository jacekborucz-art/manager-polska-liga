import { Club } from '../types';

type PolishLeagueId = 'L_PL_1' | 'L_PL_2' | 'L_PL_3';

export type PolishLeagueSeasonMembership = Record<PolishLeagueId, readonly string[]>;

const SEASON_2025_26: PolishLeagueSeasonMembership = {
  L_PL_1: [
    'PL_LEGIA_WARSZAWA',
    'PL_LECH_POZNAN',
    'PL_JAGIELLONIA_BIALYSTOK',
    'PL_RAKOW_CZESTOCHOWA',
    'PL_POGON_SZCZECIN',
    'PL_GORNIK_ZABRZE',
    'PL_CRACOVIA',
    'PL_ZAGLEBIE_LUBIN',
    'PL_WIDZEW_LODZ',
    'PL_LECHIA_GDANSK',
    'PL_PIAST_GLIWICE',
    'PL_ARKA_GDYNIA',
    'PL_KORONA_KIELCE',
    'PL_RADOMIAK_RADOM',
    'PL_MOTOR_LUBLIN',
    'PL_GKS_KATOWICE',
    'PL_TERMALICA_NIECIECZA',
    'PL_WISLA_PLOCK',
  ],
  L_PL_2: [
    'PL_WISLA_KRAKOW',
    'PL_POGON_GRODZISK_MAZOWIECKI',
    'PL_POLONIA_BYTOM',
    'PL_CHROBRY_GLOGOW',
    'PL_STAL_RZESZOW',
    'PL_SLASK_WROCLAW',
    'PL_POLONIA_WARSZAWA',
    'PL_WIECZYSTA_KRAKOW',
    'PL_RUCH_CHORZOW',
    'PL_MIEDZ_LEGNICA',
    'PL_LKS_LODZ',
    'PL_POGON_SIEDLCE',
    'PL_ODRA_OPOLE',
    'PL_PUSZCZA_NIEPOLOMICE',
    'PL_ZNICZ_PRUSZKOW',
    'PL_STAL_MIELEC',
    'PL_GKS_TYCHY',
    'PL_GORNIK_LECZNA',
  ],
  L_PL_3: [
    'PL_UNIA_SKIERNIEWICE',
    'PL_WARTA_POZNAN',
    'PL_OLIMPIA_GRUDZIADZ',
    'PL_PODBESKIDZIE_BIELSKO_BIALA',
    'PL_SLASK_WROCLAW_II',
    'PL_SANDECJA_NOWY_SACZ',
    'PL_PODHALE_NOWY_TARG',
    'PL_CHOJNICZANKA_CHOJNICE',
    'PL_REKORD_BIELSKO_BIALA',
    'PL_STAL_STALOWA_WOLA',
    'PL_HUTNIK_KRAKOW',
    'PL_SWIT_SZCZECIN',
    'PL_RESOVIA',
    'PL_SOKOL_KLECZEW',
    'PL_ZAGLEBIE_SOSNOWIEC',
    'PL_KKS_1925_KALISZ',
    'PL_LKS_II_LODZ',
    'PL_GKS_JASTRZEBIE',
  ],
};

const SEASON_2026_27: PolishLeagueSeasonMembership = {
  L_PL_1: [
    'PL_LEGIA_WARSZAWA',
    'PL_JAGIELLONIA_BIALYSTOK',
    'PL_LECH_POZNAN',
    'PL_WISLA_PLOCK',
    'PL_GKS_KATOWICE',
    'PL_GORNIK_ZABRZE',
    'PL_POGON_SZCZECIN',
    'PL_WISLA_KRAKOW',
    'PL_SLASK_WROCLAW',
    'PL_ZAGLEBIE_LUBIN',
    'PL_PIAST_GLIWICE',
    'PL_RADOMIAK_RADOM',
    'PL_WIDZEW_LODZ',
    'PL_MOTOR_LUBLIN',
    'PL_CRACOVIA',
    'PL_KORONA_KIELCE',
    'PL_RAKOW_CZESTOCHOWA',
    'PL_WIECZYSTA_KRAKOW',
  ],
  L_PL_2: [
    'PL_ARKA_GDYNIA',
    'PL_POGON_GRODZISK_MAZOWIECKI',
    'PL_POLONIA_WARSZAWA',
    'PL_TERMALICA_NIECIECZA',
    'PL_MIEDZ_LEGNICA',
    'PL_STAL_MIELEC',
    'PL_LKS_LODZ',
    'PL_CHROBRY_GLOGOW',
    'PL_WARTA_POZNAN',
    'PL_POLONIA_BYTOM',
    'PL_ODRA_OPOLE',
    'PL_PODBESKIDZIE_BIELSKO_BIALA',
    'PL_POGON_SIEDLCE',
    'PL_PUSZCZA_NIEPOLOMICE',
    'PL_UNIA_SKIERNIEWICE',
    'PL_RUCH_CHORZOW',
    'PL_LECHIA_GDANSK',
    'PL_STAL_RZESZOW',
  ],
  L_PL_3: [
    'PL_AVIA_SWIDNIK',
    'PL_GKS_TYCHY',
    'PL_ZNICZ_PRUSZKOW',
    'PL_REKORD_BIELSKO_BIALA',
    'PL_HUTNIK_KRAKOW',
    'PL_SANDECJA_NOWY_SACZ',
    'PL_PODHALE_NOWY_TARG',
    'PL_SLASK_WROCLAW_II',
    'PL_STAL_STALOWA_WOLA',
    'PL_GORNIK_LECZNA',
    'PL_LECHIA_ZIELONA_GORA',
    'PL_SOKOL_KLECZEW',
    'PL_OLIMPIA_GRUDZIADZ',
    'PL_ZAWISZA_BYDGOSZCZ',
    'PL_LEGIA_WARSZAWA_II',
    'PL_SWIT_SZCZECIN',
    'PL_CHOJNICZANKA_CHOJNICE',
    'PL_RESOVIA',
  ],
};

const MEMBERSHIPS_BY_START_YEAR: Partial<Record<number, PolishLeagueSeasonMembership>> = {
  2025: SEASON_2025_26,
  2026: SEASON_2026_27,
};

const leagueTier = (leagueId: PolishLeagueId): number => Number(leagueId.slice(-1));

export const PolishLeagueSeasonService = {
  getMembership(startYear: number): PolishLeagueSeasonMembership | null {
    return MEMBERSHIPS_BY_START_YEAR[startYear] ?? null;
  },

  buildClubsForCareerStart(sourceClubs: Club[], startYear: number): Club[] {
    const membership = this.getMembership(startYear);
    if (!membership) return sourceClubs.map(club => ({ ...club }));

    const clubById = new Map(sourceClubs.map(club => [club.id, club]));
    const configuredIds = Object.values(membership).flat();
    const uniqueConfiguredIds = new Set(configuredIds);
    if (uniqueConfiguredIds.size !== configuredIds.length) {
      throw new Error(`Konfiguracja polskich lig ${startYear}/${startYear + 1} zawiera powtórzone kluby.`);
    }

    const missingIds = configuredIds.filter(clubId => !clubById.has(clubId));
    if (missingIds.length > 0) {
      throw new Error(`Brak klubów wymaganych dla sezonu ${startYear}/${startYear + 1}: ${missingIds.join(', ')}`);
    }

    const configuredClubs = (Object.entries(membership) as Array<[PolishLeagueId, readonly string[]]>)
      .flatMap(([leagueId, clubIds]) => clubIds.map(clubId => ({
        ...clubById.get(clubId)!,
        leagueId,
        tier: leagueTier(leagueId),
        isDefaultActive: true,
      })));

    const remainingClubs = sourceClubs
      .filter(club => !uniqueConfiguredIds.has(club.id))
      .map(club => ({
        ...club,
        leagueId: 'L_PL_4',
        tier: 4,
        isDefaultActive: true,
      }));

    return [...configuredClubs, ...remainingClubs];
  },
};
