import { Club, PolishVoivodeship } from '../types';
import { THIRD_LEAGUE_GROUP_IDS, ThirdLeagueGroupId } from './PolishThirdLeagueService';
import { PolishFourthLeagueService } from './PolishFourthLeagueService';

type PolishLeagueId = 'L_PL_1' | 'L_PL_2' | 'L_PL_3';
type ConfiguredPolishLeagueId = PolishLeagueId | ThirdLeagueGroupId;

export type PolishLeagueSeasonMembership = Record<PolishLeagueId, readonly string[]> &
  Partial<Record<ThirdLeagueGroupId, readonly string[]>>;

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
  L_PL_4_G1: [
    'PL_KTS_WESZLO_WARSZAWA',
    'PL_WIDZEW_LODZ_II',
    'PL_MAZOVIA_MINSK_MAZOWIECKI',
    'PL_PELIKAN_LOWICZ',
    'PL_LECHIA_TOMASZOW_MAZOWIECKI',
    'PL_WIGRY_SUWALKI',
    'PL_OLIMPIA_ZAMBROW',
    'PL_SWIT_NOWY_DWOR_MAZOWIECKI',
    'PL_WISLA_PLOCK_II',
    'PL_JAGIELLONIA_BIALYSTOK_II',
    'PL_OLIMPIA_ELBLAG',
    'PL_WARTA_SIERADZ',
    'PL_ZABKOVIA_ZABKI',
    'PL_MLAWIANKA_MLAWA',
    'PL_LKS_LOMZA',
    'PL_POLONIA_LIDZBARK_WARMINSKI',
    'PL_KS_CK_TROSZYN',
    'PL_LKS_II_LODZ',
  ],
  L_PL_4_G2: [
    'PL_POLONIA_SRODA_WIELKOPOLSKA',
    'PL_WDA_SWIECIE',
    'PL_WIKED_LUZINO',
    'PL_MKS_FLOTA_SWINOUJSCIE',
    'PL_LECH_POZNAN_II',
    'PL_ZKS_KLUCZEVIA_STARGARD',
    'PL_NOTEC_CZARNKOW',
    'PL_KKS_1925_KALISZ',
    'PL_BLEKITNI_STARGARD',
    'PL_GEDANIA_GDANSK',
    'PL_SKS_UNIA_SWARZEDZ',
    'PL_ELANA_TORUN',
    'PL_CHEMIK_BYDGOSZCZ',
    'PL_BALTYK_KOSZALIN',
    'PL_GROM_NOWY_STAW',
    'PL_MKS_VIKTORIA_WRZESNIA',
    'PL_KS_LIPNO_STESZEW',
    'PL_KOTWICA_KORNIK',
  ],
  L_PL_4_G3: [
    'PL_ODRA_BYTOM_ODRZANSKI',
    'PL_ZAGLEBIE_LUBIN_II',
    'PL_ZAGLEBIE_SOSNOWIEC',
    'PL_BARYCZ_SULOW',
    'PL_BKS_SPARTA_KATOWICE',
    'PL_ROW_RYBNIK',
    'PL_STAL_BRZEG',
    'PL_KARKONOSZE_JELENIA_GORA',
    'PL_GORNIK_POLKOWICE',
    'PL_WARTA_GORZOW_WIELKOPOLSKI',
    'PL_STILON_GORZOW',
    'PL_MKS_KLUCZBORK',
    'PL_POLONIA_NYSA',
    'PL_LKS_GOCZALKOWICE_ZDROJ',
    'PL_MKP_CARINA_GUBIN',
    'PL_SLEZA_WROCLAW',
    'PL_MIEDZ_LEGNICA_II',
    'PL_RAKOW_CZESTOCHOWA_II',
  ],
  L_PL_4_G4: [
    'PL_CHELMIANKA_CHELM',
    'PL_WISLANIE_SKAWINA',
    'PL_KSZO_OSTROWIEC',
    'PL_WISLA_KRAKOW_II',
    'PL_MKS_CZARNI_POLANIEC',
    'PL_WIECZYSTA_KRAKOW_II',
    'PL_JKS_JAROSLAW',
    'PL_WISLOKA_DEBICA',
    'PL_MKS_PODLASIE_BIALA_PODLASKA',
    'PL_HETMAN_ZAMOSC',
    'PL_MORAVIA_MORAWICA',
    'PL_KS_NAPRZOD_JEDRZEJOW',
    'PL_SOKOL_KOLBUSZOWA_DOLNA',
    'PL_AKS_1947_BUSKO_ZDROJ',
    'PL_STAR_STARACHOWICE',
    'PL_SIARKA_TARNOBRZEG',
    'PL_KORONA_KIELCE_II',
    'PL_POGON_SOKOL_LUBACZOW',
  ],
};

const MEMBERSHIPS_BY_START_YEAR: Partial<Record<number, PolishLeagueSeasonMembership>> = {
  2025: SEASON_2025_26,
  2026: SEASON_2026_27,
};

const leagueTier = (leagueId: ConfiguredPolishLeagueId): number =>
  THIRD_LEAGUE_GROUP_IDS.includes(leagueId as ThirdLeagueGroupId) ? 4 : Number(leagueId.slice(-1));

const DEFAULT_GROUP_VOIVODESHIP: Record<ThirdLeagueGroupId, PolishVoivodeship> = {
  L_PL_4_G1: 'mazowieckie',
  L_PL_4_G2: 'wielkopolskie',
  L_PL_4_G3: 'śląskie',
  L_PL_4_G4: 'małopolskie',
};

// Upper-league clubs need a stable administrative region before they can ever
// be relegated to III liga. Group members below receive a group-compatible
// fallback during initial assignment, so a later promotion/relegation cycle can
// always return them to the same territorial section.
const CLUB_VOIVODESHIPS: Record<string, PolishVoivodeship> = {
  PL_LEGIA_WARSZAWA: 'mazowieckie',
  PL_POLONIA_WARSZAWA: 'mazowieckie',
  PL_RADOMIAK_RADOM: 'mazowieckie',
  PL_POGON_GRODZISK_MAZOWIECKI: 'mazowieckie',
  PL_POGON_SIEDLCE: 'mazowieckie',
  PL_ZNICZ_PRUSZKOW: 'mazowieckie',
  PL_LEGIA_WARSZAWA_II: 'mazowieckie',
  PL_LECH_POZNAN: 'wielkopolskie',
  PL_WARTA_POZNAN: 'wielkopolskie',
  PL_SOKOL_KLECZEW: 'wielkopolskie',
  PL_KKS_1925_KALISZ: 'wielkopolskie',
  PL_UNIA_SKIERNIEWICE: 'łódzkie',
  PL_WIDZEW_LODZ: 'łódzkie',
  PL_LKS_LODZ: 'łódzkie',
  PL_LKS_II_LODZ: 'łódzkie',
  PL_JAGIELLONIA_BIALYSTOK: 'podlaskie',
  PL_WISLA_PLOCK: 'mazowieckie',
  PL_ARKA_GDYNIA: 'pomorskie',
  PL_LECHIA_GDANSK: 'pomorskie',
  PL_CHOJNICZANKA_CHOJNICE: 'pomorskie',
  PL_OLIMPIA_GRUDZIADZ: 'kujawsko-pomorskie',
  PL_ZAWISZA_BYDGOSZCZ: 'kujawsko-pomorskie',
  PL_POGON_SZCZECIN: 'zachodniopomorskie',
  PL_SWIT_SZCZECIN: 'zachodniopomorskie',
  PL_SLASK_WROCLAW: 'dolnośląskie',
  PL_SLASK_WROCLAW_II: 'dolnośląskie',
  PL_ZAGLEBIE_LUBIN: 'dolnośląskie',
  PL_MIEDZ_LEGNICA: 'dolnośląskie',
  PL_CHROBRY_GLOGOW: 'dolnośląskie',
  PL_LECHIA_ZIELONA_GORA: 'lubuskie',
  PL_ODRA_OPOLE: 'opolskie',
  PL_GORNIK_ZABRZE: 'śląskie',
  PL_GKS_KATOWICE: 'śląskie',
  PL_GKS_TYCHY: 'śląskie',
  PL_PIAST_GLIWICE: 'śląskie',
  PL_RUCH_CHORZOW: 'śląskie',
  PL_REKORD_BIELSKO_BIALA: 'śląskie',
  PL_PODBESKIDZIE_BIELSKO_BIALA: 'śląskie',
  PL_POLONIA_BYTOM: 'śląskie',
  PL_CRACOVIA: 'małopolskie',
  PL_WISLA_KRAKOW: 'małopolskie',
  PL_WIECZYSTA_KRAKOW: 'małopolskie',
  PL_TERMALICA_NIECIECZA: 'małopolskie',
  PL_PUSZCZA_NIEPOLOMICE: 'małopolskie',
  PL_HUTNIK_KRAKOW: 'małopolskie',
  PL_SANDECJA_NOWY_SACZ: 'małopolskie',
  PL_PODHALE_NOWY_TARG: 'małopolskie',
  PL_RAKOW_CZESTOCHOWA: 'śląskie',
  PL_MOTOR_LUBLIN: 'lubelskie',
  PL_GORNIK_LECZNA: 'lubelskie',
  PL_AVIA_SWIDNIK: 'lubelskie',
  PL_STAL_RZESZOW: 'podkarpackie',
  PL_STAL_MIELEC: 'podkarpackie',
  PL_STAL_STALOWA_WOLA: 'podkarpackie',
  PL_RESOVIA: 'podkarpackie',
  PL_KORONA_KIELCE: 'świętokrzyskie',
  PL_GKS_BELCHATOW: 'łódzkie',
  PL_BRON_RADOM: 'mazowieckie',
  PL_WIKIELEC: 'warmińsko-mazurskie',
  PL_STOMIL_OLSZTYN: 'warmińsko-mazurskie',
  PL_SOKOL_OSTRODA: 'warmińsko-mazurskie',
  PL_KS_WASILKOW: 'podlaskie',
  PL_MLKS_ZNICZ_BIALA_PISKA: 'warmińsko-mazurskie',
  PL_CARTUSIA_KARTUZY: 'pomorskie',
  PL_POGON_NOWE_SKALMIERZYCE: 'wielkopolskie',
  PL_GZS_TLUCHOVIA_TLUCHOWO: 'kujawsko-pomorskie',
  PL_LKS_WYBRZEZE_REWALSKIE_REWAL: 'zachodniopomorskie',
  PL_GWARDIA_KOSZALIN: 'zachodniopomorskie',
  PL_BALTYK_GDYNIA: 'pomorskie',
  PL_VINETA_WOLIN: 'zachodniopomorskie',
  PL_CHEMIK_POLICE: 'zachodniopomorskie',
  PL_UNIA_JANIKOWO: 'kujawsko-pomorskie',
  PL_POLONIA_BYDGOSZCZ: 'kujawsko-pomorskie',
  PL_SKRA_CZESTOCHOWA: 'śląskie',
  PL_SLOWIANIN_WOLIBORZ: 'dolnośląskie',
  PL_PNIOWEK_PAWLOWICE_SLASKIE: 'śląskie',
  PL_LZS_STAROWICE: 'opolskie',
  PL_MKS_STAL_JASIEN: 'lubuskie',
  PL_LECHIA_DZIERZONIOW: 'dolnośląskie',
  PL_FOTO_HIGIENA_GAC: 'dolnośląskie',
  PL_WLOKNIARZ_CZESTOCHOWA: 'śląskie',
  PL_VICTORIA_CZESTOCHOWA: 'śląskie',
  PL_FKS_STAL_KRASNIK: 'lubelskie',
  PL_SWIDNICZANKA_SWIDNIK: 'lubelskie',
  PL_SPARTA_KAZIMIERZA_WIELKA: 'świętokrzyskie',
  PL_WISLANIE_JASKOWICE: 'małopolskie',
  PL_WISLA_PULAWY: 'lubelskie',
};

export const PolishLeagueSeasonService = {
  getMembership(startYear: number): PolishLeagueSeasonMembership | null {
    return MEMBERSHIPS_BY_START_YEAR[startYear] ?? null;
  },

  buildClubsForCareerStart(sourceClubs: Club[], startYear: number): Club[] {
    const membership = this.getMembership(startYear);
    if (!membership) return sourceClubs.map(club => ({ ...club }));

    // IV liga has its own researched 2026/27 membership. Merge it before the
    // central-league assignment so an existing database/datapack record is
    // reused instead of creating a second copy of the same regional club.
    const careerSourceClubs = PolishFourthLeagueService.mergeCareerClubs(sourceClubs, startYear);

    const clubById = new Map(careerSourceClubs.map(club => [club.id, club]));
    const configuredIds: string[] = (Object.values(membership) as Array<readonly string[] | undefined>)
      .flatMap(clubIds => clubIds ?? []);
    const uniqueConfiguredIds = new Set(configuredIds);
    if (uniqueConfiguredIds.size !== configuredIds.length) {
      throw new Error(`Konfiguracja polskich lig ${startYear}/${startYear + 1} zawiera powtórzone kluby.`);
    }

    const missingIds = configuredIds.filter(clubId => !clubById.has(clubId));
    if (missingIds.length > 0) {
      throw new Error(`Brak klubów wymaganych dla sezonu ${startYear}/${startYear + 1}: ${missingIds.join(', ')}`);
    }

    const configuredClubs = (Object.entries(membership) as Array<[ConfiguredPolishLeagueId, readonly string[]]>)
      .flatMap(([leagueId, clubIds]) => clubIds.map(clubId => {
        const groupFallback = THIRD_LEAGUE_GROUP_IDS.includes(leagueId as ThirdLeagueGroupId)
          ? DEFAULT_GROUP_VOIVODESHIP[leagueId as ThirdLeagueGroupId]
          : undefined;
        return {
          ...clubById.get(clubId)!,
          leagueId,
          tier: leagueTier(leagueId),
          polishVoivodeship: CLUB_VOIVODESHIPS[clubId] ?? clubById.get(clubId)!.polishVoivodeship ?? groupFallback,
          isDefaultActive: true,
        };
      }));

    const remainingClubs = careerSourceClubs
      .filter(club => !uniqueConfiguredIds.has(club.id))
      .map(club => ({
        ...club,
        polishVoivodeship: CLUB_VOIVODESHIPS[club.id] ?? club.polishVoivodeship,
        // Only the 72 configured clubs receive a full III-liga schedule in a
        // 2026/27 career. Every other regional club is retained as a transfer
        // and future-promotion candidate in the lightweight feeder pool.
        leagueId: startYear >= 2026 && PolishFourthLeagueService.isFourthLeagueId(club.leagueId)
          ? club.leagueId
          : startYear >= 2026 ? 'L_PL_5' : 'L_PL_4',
        tier: startYear >= 2026
          ? (PolishFourthLeagueService.isFourthLeagueId(club.leagueId) ? 5 : 6)
          : 4,
        // Exact IV-league members are simulated by the lightweight regional
        // engine. Keeping them inactive prevents full squads, coaches and AI
        // transfer processing from being allocated to hundreds of background
        // clubs. The deeper regional candidates are equally lightweight and
        // therefore must not receive full squads, coaches or transfer AI.
        isDefaultActive: startYear >= 2026 ? false : true,
      }));

    const configuredWorld = [...configuredClubs, ...remainingClubs];
    return startYear === 2026
      ? PolishFourthLeagueService.ensureRegionalFeederPools(configuredWorld, startYear)
      : configuredWorld;
  },
};
