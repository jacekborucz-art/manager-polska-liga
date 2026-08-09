import { AcademyService } from '../services/AcademyService';
import { ScoutService } from '../services/ScoutService';
import { PlayerPosition, Region, Scout, YouthPlayer } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const createScout = (overrides: Partial<Scout> = {}): Scout => ({
  id: 'SCOUT_TEST',
  firstName: 'Jan',
  lastName: 'Testowy',
  age: 42,
  nationality: Region.POLAND,
  judgmentAccuracy: 16,
  networkDepth: 16,
  reportSpeed: 16,
  experience: 16,
  regionalSpecialty: Region.POLAND,
  positionSpecialty: PlayerPosition.MID,
  personality: 'VERSATILE',
  minClubReputation: 1,
  weeklySalary: 20_000,
  employedByClubId: 'CLUB_TEST',
  isOnMission: false,
  ...overrides,
});

const strongScout = createScout();
const weakScout = createScout({
  id: 'SCOUT_WEAK',
  judgmentAccuracy: 4,
  networkDepth: 4,
  reportSpeed: 4,
  experience: 4,
  regionalSpecialty: undefined,
  positionSpecialty: undefined,
});

assert(
  ScoutService.getMissionCost(strongScout, Region.POLAND, 1) < ScoutService.getMissionCost(weakScout, Region.POLAND, 1),
  'Lepsza sieć kontaktów powinna obniżać koszt misji.'
);
assert(
  ScoutService.getMissionDays(strongScout, Region.POLAND, 1) < ScoutService.getMissionDays(weakScout, Region.POLAND, 1),
  'Większa mobilność powinna skracać misję.'
);
assert(
  ScoutService.getAnnualIntakeDays(strongScout, Region.POLAND) < ScoutService.getAnnualIntakeDays(weakScout, Region.POLAND),
  'Lepszy i wyspecjalizowany skaut powinien szybciej zakończyć coroczny nabór.'
);
assert(
  ScoutService.getDiscoveryChance(strongScout, Region.POLAND, 1) > ScoutService.getDiscoveryChance(weakScout, Region.POLAND, 1),
  'Kontakty i specjalizacja regionalna powinny zwiększać szansę powodzenia.'
);

const youth = {
  id: 'YOUTH_TEST',
  firstName: 'Piotr',
  lastName: 'Próbny',
  age: 17,
  position: PlayerPosition.MID,
  nationality: Region.POLAND,
  attributes: { technique: 50, passing: 50, vision: 50 },
  hiddenTalent: 70,
  readinessScore: 5,
  monthsInAcademy: 0,
  contractEndDate: '2029-08-01',
} as unknown as YouthPlayer;

const strongReport = ScoutService.createCandidateReport(youth, strongScout);
const weakReport = ScoutService.createCandidateReport(youth, weakScout);
const strongTechnique = strongReport.attributeEstimates.technique!;
const weakTechnique = weakReport.attributeEstimates.technique!;
assert(
  strongTechnique.max - strongTechnique.min < weakTechnique.max - weakTechnique.min,
  'Dokładniejszy skaut powinien prezentować węższy zakres oceny atrybutów.'
);

const startDate = new Date('2026-08-09T12:00:00Z');
const mission = AcademyService.buildScoutMission(
  undefined,
  Region.POLAND,
  1,
  startDate,
  PlayerPosition.MID,
  16,
  19,
  20,
  4_000,
  strongScout.id,
);
assert(mission.startedDate === '2026-08-09', 'Misja powinna zapisać dzień rozpoczęcia.');
assert(mission.completionDate === '2026-08-29', 'Misja powinna używać czasu wyliczonego dla wybranego skauta.');
assert(mission.cost === 4_000 && mission.scoutId === strongScout.id, 'Misja powinna zapisać koszt i przypisanego skauta.');

const annualIntake = AcademyService.generateYouthIntake(1, Region.POLAND, 2026, 0, 5);
assert(
  annualIntake.length >= 3 && annualIntake.length <= 4,
  'Coroczny nabór akademii poziomu 1 powinien przygotować 3–4 kandydatów niezależnie od zajętych miejsc.'
);
assert(
  annualIntake.every(candidate => candidate.age >= 14 && candidate.age <= 17),
  'Coroczny nabór powinien wyszukiwać kandydatów w wieku 14–17 lat.'
);

console.log('AcademyScoutingTests: OK');
