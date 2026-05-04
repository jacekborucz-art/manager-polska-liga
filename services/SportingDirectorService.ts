import { Club, Region, SportingDirector, SportingDirectorPersonality } from '../types';
import { NameGeneratorService } from './NameGeneratorService';

type DirectorNationality = {
  region: Region;
  country: string;
};

type AttributeKey =
  | 'patience'
  | 'control'
  | 'flexibility'
  | 'ambition'
  | 'footballKnowledge'
  | 'negotiation'
  | 'developmentVision'
  | 'financialDiscipline';

const EUROPEAN_NATIONALITIES: DirectorNationality[] = [
  { region: Region.GERMANY, country: 'Niemcy' },
  { region: Region.FRANCE, country: 'Francja' },
  { region: Region.TURKEY, country: 'Turcja' },
  { region: Region.BENELUX, country: 'Belgia' },
  { region: Region.BENELUX, country: 'Holandia' },
  { region: Region.CZ_SK, country: 'Czechy' },
  { region: Region.CZ_SK, country: 'Slowacja' },
  { region: Region.SPAIN, country: 'Hiszpania' },
  { region: Region.ITALY, country: 'Wlochy' },
  { region: Region.IBERIA, country: 'Portugalia' },
  { region: Region.BALKANS, country: 'Chorwacja' },
  { region: Region.BALKANS, country: 'Serbia' },
  { region: Region.SCANDINAVIA, country: 'Dania' },
  { region: Region.SWEDEN, country: 'Szwecja' },
  { region: Region.ROMANIA, country: 'Rumunia' },
  { region: Region.HUNGARIAN, country: 'Wegry' },
];

const PERSONALITIES: SportingDirectorPersonality[] = [
  'CONTROLLER',
  'VISIONARY',
  'ACCOUNTANT',
  'PARTNER',
  'POLITICIAN',
  'TALENT_HUNTER',
];

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const randomInt = (min: number, max: number, rng: () => number): number =>
  Math.floor(min + rng() * (max - min + 1));

const weightedAge = (rng: () => number): number => {
  const roll = rng();
  if (roll < 0.12) return randomInt(34, 40, rng);
  if (roll < 0.82) return randomInt(41, 58, rng);
  return randomInt(59, 68, rng);
};

const pickNationality = (rng: () => number): DirectorNationality => {
  if (rng() < 0.9) {
    return { region: Region.POLAND, country: 'Polska' };
  }

  return EUROPEAN_NATIONALITIES[randomInt(0, EUROPEAN_NATIONALITIES.length - 1, rng)];
};

const pickPersonality = (club: Club, rng: () => number): SportingDirectorPersonality => {
  const candidates = [...PERSONALITIES];

  if ((club.reputation ?? 5) >= 8 && rng() < 0.25) return 'CONTROLLER';
  if ((club.budget ?? 0) < 5_000_000 && rng() < 0.25) return 'ACCOUNTANT';

  return candidates[randomInt(0, candidates.length - 1, rng)];
};

const baseAttributes = (rng: () => number): Record<AttributeKey, number> => ({
  patience: randomInt(7, 15, rng),
  control: randomInt(7, 15, rng),
  flexibility: randomInt(7, 15, rng),
  ambition: randomInt(7, 15, rng),
  footballKnowledge: randomInt(7, 15, rng),
  negotiation: randomInt(7, 15, rng),
  developmentVision: randomInt(7, 15, rng),
  financialDiscipline: randomInt(7, 15, rng),
});

const applyPersonality = (
  attrs: Record<AttributeKey, number>,
  personality: SportingDirectorPersonality,
  rng: () => number
): Record<AttributeKey, number> => {
  const adjust = (key: AttributeKey, delta: number) => {
    attrs[key] = clamp(attrs[key] + delta + randomInt(-1, 1, rng), 1, 20);
  };

  switch (personality) {
    case 'CONTROLLER':
      adjust('control', 5);
      adjust('ambition', 2);
      adjust('flexibility', -4);
      adjust('patience', -2);
      break;
    case 'VISIONARY':
      adjust('developmentVision', 5);
      adjust('ambition', 3);
      adjust('patience', 2);
      adjust('financialDiscipline', -2);
      break;
    case 'ACCOUNTANT':
      adjust('financialDiscipline', 5);
      adjust('negotiation', 3);
      adjust('ambition', -2);
      adjust('developmentVision', -1);
      break;
    case 'PARTNER':
      adjust('flexibility', 5);
      adjust('patience', 4);
      adjust('control', -4);
      adjust('footballKnowledge', 2);
      break;
    case 'POLITICIAN':
      adjust('control', 3);
      adjust('negotiation', 2);
      adjust('flexibility', -2);
      adjust('footballKnowledge', -1);
      break;
    case 'TALENT_HUNTER':
      adjust('developmentVision', 5);
      adjust('footballKnowledge', 3);
      adjust('negotiation', 2);
      adjust('financialDiscipline', -1);
      break;
    default:
      break;
  }

  return attrs;
};

const buildId = (clubId: string, firstName: string, lastName: string, rng: () => number): string =>
  `SD_${clubId}_${firstName}_${lastName}_${randomInt(1000, 9999, rng)}`.replace(/\W+/g, '_').toUpperCase();

export const SportingDirectorService = {
  generateForClub(club: Club, rng: () => number = Math.random): SportingDirector {
    const nationality = pickNationality(rng);
    const name = NameGeneratorService.getRandomName(nationality.region);
    const personality = pickPersonality(club, rng);
    const attrs = applyPersonality(baseAttributes(rng), personality, rng);

    return {
      id: buildId(club.id, name.firstName, name.lastName, rng),
      firstName: name.firstName,
      lastName: name.lastName,
      age: weightedAge(rng),
      nationality: nationality.region,
      nationalityCountry: nationality.country,
      patience: attrs.patience,
      control: attrs.control,
      flexibility: attrs.flexibility,
      ambition: attrs.ambition,
      footballKnowledge: attrs.footballKnowledge,
      negotiation: attrs.negotiation,
      developmentVision: attrs.developmentVision,
      financialDiscipline: attrs.financialDiscipline,
      relationshipWithManager: randomInt(45, 65, rng),
      personality,
    };
  },

  ensureForUserClub(clubs: Club[], userTeamId: string | null, rng: () => number = Math.random): Club[] {
    if (!userTeamId) return clubs;

    return clubs.map(club => {
      if (club.id !== userTeamId || club.sportingDirector) return club;
      return {
        ...club,
        sportingDirector: this.generateForClub(club, rng),
      };
    });
  },
};
