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
  SportingDirector,
  SportingDirectorPersonality,
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { pickNationalityForRegion } from './NationalityService';

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

const PERSONALITIES: SportingDirectorPersonality[] = [
  'CONTROLLER', 'VISIONARY', 'ACCOUNTANT', 'PARTNER', 'POLITICIAN', 'TALENT_HUNTER',
];

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
const randomInt = (min: number, max: number): number => Math.floor(min + Math.random() * (max - min + 1));
const pickFrom = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

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
  return {
    id: buildId(club.id, 'OWN', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(45),
    nationality: nat.region,
    nationalityCountry: nat.country,
    cierpliwosc: biasedAttr(club.reputation),
    ambicja: biasedAttr(club.reputation),
    hojnosc: biasedAttr(club.reputation),
    doswiadczenie: biasedAttr(club.reputation),
  };
};

const generateCEO = (club: Club, nat: NatPair): ClubCEO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  return {
    id: buildId(club.id, 'CEO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(45),
    nationality: nat.region,
    nationalityCountry: nat.country,
    cierpliwosc: biasedAttr(club.reputation),
    ambicja: biasedAttr(club.reputation),
    hojnosc: biasedAttr(club.reputation),
    doswiadczenie: biasedAttr(club.reputation),
  };
};

const generateSportingDirector = (club: Club, nat: NatPair): SportingDirector => {
  const name = NameGeneratorService.getRandomName(nat.region);
  const personality = pickFrom(PERSONALITIES);
  return {
    id: buildId(club.id, 'SD', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    patience: biasedAttr(club.reputation),
    control: biasedAttr(club.reputation),
    flexibility: biasedAttr(club.reputation),
    ambition: biasedAttr(club.reputation),
    footballKnowledge: biasedAttr(club.reputation),
    negotiation: biasedAttr(club.reputation),
    developmentVision: biasedAttr(club.reputation),
    financialDiscipline: biasedAttr(club.reputation),
    relationshipWithManager: 50,
    personality,
  };
};

const generateCFO = (club: Club, nat: NatPair): ClubCFO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  return {
    id: buildId(club.id, 'CFO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    hojnosc: biasedAttr(club.reputation),
    doswiadczenie: biasedAttr(club.reputation),
    zdolnosciMarketingowe: biasedAttr(club.reputation),
    dyscyplinaFinansowa: biasedAttr(club.reputation),
  };
};

const generateCOO = (club: Club, nat: NatPair): ClubCOO => {
  const name = NameGeneratorService.getRandomName(nat.region);
  return {
    id: buildId(club.id, 'COO', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie: biasedAttr(club.reputation),
    organizacja: biasedAttr(club.reputation),
    zarzadzanieInfrastruktura: biasedAttr(club.reputation),
    efektywnoscKosztowa: biasedAttr(club.reputation),
    logistykaIPlanowanie: biasedAttr(club.reputation),
  };
};

const generateMarketingDirector = (club: Club, nat: NatPair): ClubMarketingDirector => {
  const name = NameGeneratorService.getRandomName(nat.region);
  return {
    id: buildId(club.id, 'MKT', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie: biasedAttr(club.reputation),
    zdolnosciMarketingowe: biasedAttr(club.reputation),
  };
};

const generateAcademyDirector = (club: Club, nat: NatPair): ClubAcademyDirector => {
  const name = NameGeneratorService.getRandomName(nat.region);
  return {
    id: buildId(club.id, 'ACD', name.firstName, name.lastName),
    firstName: name.firstName,
    lastName: name.lastName,
    age: seniorAge(37),
    nationality: nat.region,
    nationalityCountry: nat.country,
    doswiadczenie: biasedAttr(club.reputation),
    rozwojMlodziezy: biasedAttr(club.reputation),
    zarzadzanie: biasedAttr(club.reputation),
  };
};

export const ClubManagementService = {
  generateForClub(club: Club): ClubManagement {
    const clubRegion = getClubRegion(club);

    const owner = generateOwner(club, pickNationality(clubRegion));

    const ceo: ClubCEO | undefined = Math.random() < ceoChance(club.reputation)
      ? generateCEO(club, pickNationality(clubRegion))
      : undefined;

    const sportingDirector = generateSportingDirector(club, pickNationality(clubRegion));

    const cfo = generateCFO(club, pickNationality(clubRegion));
    const coo = generateCOO(club, pickNationality(clubRegion));
    const marketingDirector = generateMarketingDirector(club, pickNationality(clubRegion));

    const academyDirector: ClubAcademyDirector | undefined =
      club.academy && club.academy.level >= 3
        ? generateAcademyDirector(club, pickNationality(clubRegion))
        : undefined;

    return {
      owner,
      ceo,
      sportingDirector,
      cfo,
      coo,
      marketingDirector,
      academyDirector,
    };
  },

  generateForAllClubs(clubs: Club[]): Club[] {
    return clubs.map(club => {
      if (club.management) return club;
      return { ...club, management: this.generateForClub(club) };
    });
  },
};
