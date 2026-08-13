import { strict as assert } from 'node:assert';
import { Club, ClubKit } from '../types';
import { KitSelectionService, MIN_KIT_CONTRAST_DISTANCE } from '../services/KitSelectionService';
import { PreMatchKitSelectionService } from '../services/PreMatchKitSelectionService';
import type { KitVariant } from '../resources/PlayerCardAssets';

const createKit = (
  id: string,
  shirt: string,
  shirtSecondary: string,
  pattern: ClubKit['pattern'] = 'solid'
): ClubKit => ({
  id,
  name: id,
  shirt,
  shirtSecondary,
  shorts: shirt,
  socks: shirt,
  pattern,
  isActive: true
});

const createClub = (id: string, name: string, colorsHex: string[], kits: ClubKit[]): Club => ({
  id,
  name,
  shortName: name,
  leagueId: 'L_TEST',
  colorsHex,
  kits,
  stadiumName: 'Stadion testowy',
  stadiumCapacity: 5_000,
  reputation: 50,
  isDefaultActive: true,
  rosterIds: [],
  stats: { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  budget: 1_000_000,
  transferBudget: 100_000,
  boardStrictness: 50,
  signingBonusPool: 0
} as Club);

const hutnik = createClub('HUTNIK', 'Hutnik Kraków', ['#5EB6E4', '#FFFFFF', '#FF0000'], [
  createKit('home', '#5EB6E4', '#FFFFFF'),
  createKit('away', '#FFFFFF', '#5EB6E4'),
  createKit('third', '#FF0000', '#FFFFFF')
]);

const olimpia = createClub('OLIMPIA', 'Olimpia Grudziądz', ['#FFFFFF', '#FF0000', '#008000'], [
  createKit('home', '#FFFFFF', '#FF0000'),
  createKit('away', '#FF0000', '#FFFFFF'),
  createKit('third', '#008000', '#FFFFFF')
]);

const selectedWhiteHutnikVariant: KitVariant = {
  id: 'away',
  name: 'Wyjazdowy',
  hex: '#FFFFFF',
  shirtSecondaryHex: '#5EB6E4',
  secondaryHex: '#FFFFFF',
  pattern: 'solid',
  image: ''
};

const manualSelection = PreMatchKitSelectionService.selectForUserVariant(
  hutnik,
  olimpia,
  hutnik.id,
  selectedWhiteHutnikVariant
);
assert.equal(manualSelection.home.primary, '#FFFFFF', 'ręcznie wybrany biały strój Hutnika musi zostać zachowany');
assert.notEqual(manualSelection.away.primary, '#FFFFFF', 'Olimpia nie może pozostać w białej koszulce');
assert.ok(
  KitSelectionService.getKitClashScore(manualSelection.home, manualSelection.away) >= MIN_KIT_CONTRAST_DISTANCE,
  'automatycznie dobrany strój Olimpii musi wyraźnie kontrastować z białym strojem Hutnika'
);

const solidWhite = { primary: '#FFFFFF', shirtSecondary: '#000000', pattern: 'solid' as const };
const solidRed = { primary: '#FF0000', shirtSecondary: '#FFFFFF', pattern: 'solid' as const };
assert.ok(
  KitSelectionService.getKitClashScore(solidWhite, solidRed) >= MIN_KIT_CONTRAST_DISTANCE,
  'techniczny kolor dodatkowy stroju jednolitego nie może wywoływać fałszywego konfliktu'
);

const stripedWhiteRed = { primary: '#FFFFFF', shirtSecondary: '#FF0000', pattern: 'vertical_stripes' as const };
assert.equal(
  KitSelectionService.getKitClashScore(stripedWhiteRed, solidRed),
  0,
  'widoczny drugi kolor koszulki w pasy musi uczestniczyć w wykrywaniu konfliktu'
);

const initialSelection = KitSelectionService.selectOptimalKits(hutnik, olimpia);
assert.equal(initialSelection.home.primary, '#5EB6E4', 'gospodarz powinien zachować domowy strój, gdy istnieje kontrastowy strój gości');
assert.ok(
  !KitSelectionService.hasKitClash(initialSelection.home, initialSelection.away),
  'automatyczny wybór przed meczem nie może pozostawić konfliktu kolorów'
);

console.log('KitSelectionServiceTests: OK');
