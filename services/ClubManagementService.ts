import {
  Club,
  ClubAcademyDirector,
  ClubCEO,
  ClubCFO,
  ClubCOO,
  ClubManagement,
  ClubMarketingDirector,
  ClubOwner,
  Region,
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { pickNationalityForRegion } from './NationalityService';
import { computeBoardFromManagement } from '../constants';
import { CLUBS_WITH_PRESET_ACADEMY } from './AcademyService';

type NatPair = { region: Region; country: string };

const COUNTRY_CODE_TO_REGION: Partial<Record<string, Region>> = {
  'ENG': Region.ENGLAND, 'SCO': Region.ENGLAND, 'WAL': Region.ENGLAND, 'NIR': Region.ENGLAND, 'IRL': Region.ENGLAND,
  'GIB': Region.IBERIA,
  'GER': Region.GERMANY, 'AUT': Region.GERMANY, 'LIE': Region.GERMANY, 'LUX': Region.FRANCE, 'SUI': Region.GERMANY,
  'ESP': Region.SPAIN, 'AND': Region.IBERIA, 'POR': Region.IBERIA,
  'FRA': Region.FRANCE, 'ITA': Region.ITALY, 'SMR': Region.ITALY,
  'NOR': Region.SCANDINAVIA, 'DEN': Region.SCANDINAVIA, 'ISL': Region.SCANDINAVIA, 'FRO': Region.SCANDINAVIA,
  'SWE': Region.SWEDEN,
  'FIN': Region.FINLAND,
  'TUR': Region.TURKEY, 'CYP': Region.TURKEY,
  'GEO': Region.GEORGIA,
  'ARM': Region.ARMENIA,
  'ALB': Region.ALBANIA, 'KOS': Region.ALBANIA,
  'ROU': Region.ROMANIA,
  'SRB': Region.BALKANS, 'CRO': Region.BALKANS, 'BIH': Region.BALKANS, 'MKD': Region.BALKANS,
  'MNE': Region.BALKANS, 'BUL': Region.BALKANS, 'SVN': Region.BALKANS,
  'GRE': Region.GREEK,
  'MLT': Region.MALTESE,
  'LTU': Region.BALTIC, 'LAT': Region.BALTIC, 'EST': Region.BALTIC,
  'UKR': Region.EX_USSR, 'RUS': Region.EX_USSR, 'BLR': Region.EX_USSR, 'MDA': Region.EX_USSR,
  'KAZ': Region.KAZAKH,
  'AZE': Region.AZERBAIJANI,
  'CZE': Region.CZ_SK, 'SVK': Region.CZ_SK,
  'HUN': Region.HUNGARIAN,
  'NED': Region.BENELUX, 'BEL': Region.BENELUX,
  'ISR': Region.ISRAELI,
  'ARG': Region.ARGENTINA,
  'BRA': Region.BRAZIL,
  'MEX': Region.MEXICO,
  'USA': Region.NORTH_AMERICA, 'CAN': Region.NORTH_AMERICA,
  'JPN': Region.JAPAN,
  'KOR': Region.KOREA,
};

const FOREIGN_REGIONS: Region[] = [
  Region.ENGLAND, Region.GERMANY, Region.FRANCE, Region.SPAIN, Region.ITALY,
  Region.IBERIA, Region.BENELUX, Region.SCANDINAVIA, Region.SWEDEN, Region.CZ_SK,
  Region.BALKANS, Region.TURKEY, Region.EX_USSR, Region.POLAND, Region.GREEK,
  Region.ROMANIA, Region.HUNGARIAN, Region.FINLAND, Region.BALTIC,
];

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
const randomInt = (min: number, max: number): number => Math.floor(min + Math.random() * (max - min + 1));
const pickFrom = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const CEO_SALARY: Record<number, { min: number; max: number }> = {
  1: { min: 40_000, max: 120_000 },
  2: { min: 15_000, max:  50_000 },
  3: { min:  5_000, max:  20_000 },
  4: { min:  1_500, max:   6_000 },
};
const DIR_SALARY: Record<number, { min: number; max: number }> = {
  1: { min: 20_000, max: 50_000 },
  2: { min:  7_000, max: 20_000 },
  3: { min:  2_500, max:  7_000 },
  4: { min:    700, max:  2_500 },
};
const ACD_SALARY: Record<number, { min: number; max: number }> = {
  1: { min: 15_000, max: 40_000 },
  2: { min:  5_000, max: 15_000 },
  3: { min:  2_000, max:  5_000 },
  4: { min:    500, max:  2_000 },
};
const OWN_SALARY: Record<number, { min: number; max: number }> = {
  1: { min:  5_000, max:  60_000 },
  2: { min:  2_000, max:  25_000 },
  3: { min:    500, max:   8_000 },
  4: { min:    200, max:   2_000 },
};

const getClubTierFromId = (club: Club): number =>
  Math.min(4, Math.max(1, parseInt((club.leagueId as string).split('_')[2] || '4')));

const calcSalary = (
  range: { min: number; max: number },
  reputation: number,
  avgAttr: number,
): number => {
  const rep = Math.min(10, Math.max(1, reputation));
  const base = range.min + (rep / 10) * (range.max - range.min);
  const attrMod = 0.85 + (avgAttr / 20) * 0.30;
  const jitter = 0.90 + Math.random() * 0.20;
  return Math.round((base * attrMod * jitter) / 500) * 500;
};

const avg = (...vals: number[]): number => vals.reduce((a, b) => a + b, 0) / vals.length;

const getClubRegion = (club: Club): Region =>
  club.country ? (COUNTRY_CODE_TO_REGION[club.country] ?? Region.POLAND) : Region.POLAND;

const pickNationality = (clubRegion: Region): NatPair => {
  if (Math.random() >= 0.05) {
    return { region: clubRegion, country: pickNationalityForRegion(clubRegion) };
  }
  const pool = FOREIGN_REGIONS.filter(r => r !== clubRegion);
  const region = pickFrom(pool);
  return { region, country: pickNationalityForRegion(region) };
};

const buildId = (clubId: string, prefix: string, firstName: string, lastName: string): string =>
  `${prefix}_${clubId}_${firstName}_${lastName}_${randomInt(1000, 9999)}`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]+/gi, '_')
    .toUpperCase();

const biasedAttr = (reputation: number): number => {
  const repFactor = clamp(reputation, 1, 20) / 20;
  const numRolls =
    Math.random() < repFactor * repFactor * 0.9 ? 3 :
    Math.random() < repFactor * 0.85 ? 2 :
    1;
  let best = 0;
  for (let i = 0; i < numRolls; i++) {
    const v = randomInt(1, 20);
    if (v > best) best = v;
  }
  return best;
};

const seniorAge = (minAge: number): number => {
  const range = 75 - minAge;
  const roll = Math.random();
  if (roll < 0.6) return randomInt(minAge, minAge + Math.round(range * 0.5));
  if (roll < 0.9) return randomInt(minAge + Math.round(range * 0.5), minAge + Math.round(range * 0.75));
  return randomInt(minAge + Math.round(range * 0.75), 75);
};

const ceoChance = (reputation: number): number =>
  clamp(0.30 + (clamp(reputation, 1, 20) / 20) * 0.65, 0.30, 0.95);

const generateOwner = (club: Club, nat: NatPair): ClubOwner => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const hojnosc = biasedAttr(club.reputation);
  const doswiadczenie = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const salaryProb = Math.max(0.05, 1 - (hojnosc - 1) / 19);
  const monthlySalary = Math.random() < salaryProb
    ? calcSalary(OWN_SALARY[tier], club.reputation, doswiadczenie)
    : 0;
  return {
    id: buildId(club.id, 'OWN', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(45),
    nationality: nat.region,
    nationalityCountry: nat.country,
    cierpliwosc: randomInt(1, 20),
    ambicja: biasedAttr(club.reputation),
    hojnosc,
    doswiadczenie,
    monthlySalary,
  };
};

const generateCEO = (club: Club, nat: NatPair): ClubCEO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const ambicja = biasedAttr(club.reputation);
  const doswiadczenie = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const monthlySalary = calcSalary(CEO_SALARY[tier], club.reputation, avg(ambicja, doswiadczenie));
  return {
    id: buildId(club.id, 'CEO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(45),
    nationality: nat.region,
    nationalityCountry: nat.country,
    cierpliwosc: randomInt(1, 20),
    ambicja,
    hojnosc: biasedAttr(club.reputation),
    doswiadczenie,
    monthlySalary,
  };
};

const generateCFO = (club: Club, nat: NatPair): ClubCFO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const doswiadczenie = biasedAttr(club.reputation);
  const dyscyplinaFinansowa = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const monthlySalary = calcSalary(DIR_SALARY[tier], club.reputation, avg(doswiadczenie, dyscyplinaFinansowa));
  return {
    id: buildId(club.id, 'CFO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    hojnosc: biasedAttr(club.reputation),
    doswiadczenie,
    zdolnosciMarketingowe: biasedAttr(club.reputation),
    dyscyplinaFinansowa,
    monthlySalary,
  };
};

const generateCOO = (club: Club, nat: NatPair): ClubCOO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const doswiadczenie = biasedAttr(club.reputation);
  const organizacja = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const monthlySalary = calcSalary(DIR_SALARY[tier], club.reputation, avg(doswiadczenie, organizacja));
  return {
    id: buildId(club.id, 'COO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie,
    organizacja,
    zarzadzanieInfrastruktura: biasedAttr(club.reputation),
    efektywnoscKosztowa: biasedAttr(club.reputation),
    logistykaIPlanowanie: biasedAttr(club.reputation),
    monthlySalary,
  };
};

const generateMarketingDirector = (club: Club, nat: NatPair): ClubMarketingDirector => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const doswiadczenie = biasedAttr(club.reputation);
  const zdolnosciMarketingowe = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const monthlySalary = calcSalary(DIR_SALARY[tier], club.reputation, avg(doswiadczenie, zdolnosciMarketingowe));
  return {
    id: buildId(club.id, 'MKT', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie,
    zdolnosciMarketingowe,
    monthlySalary,
  };
};

const generateAcademyDirector = (club: Club, nat: NatPair): ClubAcademyDirector => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const doswiadczenie = biasedAttr(club.reputation);
  const rozwojMlodziezy = biasedAttr(club.reputation);
  const zarzadzanie = biasedAttr(club.reputation);
  const tier = getClubTierFromId(club);
  const monthlySalary = calcSalary(ACD_SALARY[tier], club.reputation, avg(doswiadczenie, rozwojMlodziezy, zarzadzanie));
  return {
    id: buildId(club.id, 'ACD', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie,
    rozwojMlodziezy,
    zarzadzanie,
    monthlySalary,
  };
};

export const ClubManagementService = {
  generateForClub(club: Club): ClubManagement {
    const clubRegion = getClubRegion(club);

    const owner = generateOwner(club, pickNationality(clubRegion));

    const ceo: ClubCEO | undefined = Math.random() < ceoChance(club.reputation)
      ? generateCEO(club, pickNationality(clubRegion))
      : undefined;

    const cfo = generateCFO(club, pickNationality(clubRegion));
    const coo = generateCOO(club, pickNationality(clubRegion));
    const marketingDirector = generateMarketingDirector(club, pickNationality(clubRegion));

    const academyDirector: ClubAcademyDirector | undefined =
      (club.academy?.level ?? CLUBS_WITH_PRESET_ACADEMY[club.id] ?? 0) >= 3
        ? generateAcademyDirector(club, pickNationality(clubRegion))
        : undefined;

    return {
      owner,
      ceo,
      cfo,
      coo,
      marketingDirector,
      academyDirector,
    };
  },

  generateForAllClubs(clubs: Club[]): Club[] {
    return clubs.map(club => {
      if (club.management) {
        const { sportingDirector: legacySportingDirector, ...management } = club.management as ClubManagement & { sportingDirector?: Club['sportingDirector'] };
        return {
          ...club,
          sportingDirector: club.sportingDirector ?? legacySportingDirector,
          management,
        };
      }
      const management = this.generateForClub(club);
      return { ...club, management, board: computeBoardFromManagement(management) };
    });
  },
};
