import { strict as assert } from 'node:assert';
import {
  ClubReputationService,
} from '../services/ClubReputationService';
import {
  CLUB_REPUTATION_DOMESTIC_CEILING,
  CLUB_REPUTATION_MAX,
} from '../services/ClubStrengthService';

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(7, { wonPolishChampionship: true }),
  8,
  'mistrzostwo Polski powinno zwiększać reputację o 1',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(9, {
    wonPolishChampionship: true,
    wonPolishCup: true,
  }),
  CLUB_REPUTATION_DOMESTIC_CEILING,
  'krajowy dublet nie może przekroczyć reputacji 10',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(12, {
    wonPolishChampionship: true,
    wonPolishCup: true,
  }),
  12,
  'krajowe trofea nie mogą obniżyć ani zwiększyć reputacji powyżej 10',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(10, {
    europeanTrophies: ['CONFERENCE_LEAGUE'],
  }),
  11,
  'Liga Konferencji powinna pozwolić przekroczyć krajowy limit',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(10, {
    europeanTrophies: ['EUROPA_LEAGUE'],
  }),
  11,
  'Liga Europy powinna zwiększyć reputację o 1',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(10, {
    europeanTrophies: ['CHAMPIONS_LEAGUE'],
  }),
  12,
  'Liga Mistrzów powinna zwiększyć reputację o 2',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(9, {
    wonPolishChampionship: true,
    wonPolishCup: true,
    europeanTrophies: ['CHAMPIONS_LEAGUE'],
  }),
  12,
  'najpierw powinien zadziałać krajowy limit, a potem bonus europejski',
);

assert.equal(
  ClubReputationService.calculateSeasonEndReputation(19.5, {
    europeanTrophies: ['CHAMPIONS_LEAGUE'],
  }),
  CLUB_REPUTATION_MAX,
  'żaden bonus nie może przekroczyć reputacji 20',
);

assert.equal(
  ClubReputationService.resolveFinalWinnerId({
    homeTeamId: 'HOME',
    awayTeamId: 'AWAY',
    homeScore: 1,
    awayScore: 1,
    homePenaltyScore: 4,
    awayPenaltyScore: 5,
  }),
  'AWAY',
  'zwycięzca finału rozstrzygniętego karnymi musi być poprawnie wykryty',
);

assert.equal(
  ClubReputationService.resolveFinalWinnerId({
    homeTeamId: 'HOME',
    awayTeamId: 'AWAY',
    homeScore: null,
    awayScore: null,
  }),
  null,
  'nierozegrany finał nie może przyznać reputacji',
);

console.log('Club reputation tests passed.');
