import { InjurySeverity } from '../types';

export interface InjuryPoolEntry {
  type: string;
  min: number;
  max: number;
  weight?: number;
}

export interface RolledInjury {
  type: string;
  days: number;
}

export const LIGHT_INJURY_POOL: InjuryPoolEntry[] = [
  { type: 'Skurcz mięśnia udowego', min: 1, max: 5 },
  { type: 'Stłuczenie palca stopy', min: 3, max: 14 },
  { type: 'Skręcenie kostki I°', min: 2, max: 10 },
  { type: 'Skręcenie palca stopy', min: 5, max: 21 },
  { type: 'Uraz stawu skokowego I°', min: 5, max: 14 },
  { type: 'Stłuczenie mięśnia', min: 3, max: 14 },
  { type: 'Stłuczenie łydki', min: 5, max: 14 },
  { type: 'Stłuczenie żebra', min: 7, max: 28 },
  { type: 'Stłuczenie kolana', min: 7, max: 28 },
  { type: 'Skręcenie nadgarstka', min: 7, max: 21 },
  { type: 'Uraz głowy (łagodny)', min: 7, max: 21 },
  { type: 'Złamanie nosa', min: 14, max: 42 },
  { type: 'Ból pleców (ostry)', min: 7, max: 28 },
  { type: 'Naderwanie mięśnia I°', min: 7, max: 21 },
  { type: 'Uraz uda (lekki)', min: 7, max: 14 },
];

export const SEVERE_INJURY_POOL: InjuryPoolEntry[] = [
  { type: 'Naciągnięcie więzadeł kolanowych', min: 14, max: 42, weight: 16 },
  { type: 'Skręcenie kolana (więzadła poboczne)', min: 14, max: 56, weight: 13 },
  { type: 'Naciągnięcie mięśnia dwugłowego uda', min: 10, max: 56, weight: 12 },
  { type: 'Skręcenie kostki II-III°', min: 10, max: 90, weight: 10 },
  { type: 'Złamanie nosa (ciężkie)', min: 21, max: 56, weight: 7 },
  { type: 'Złamanie żebra', min: 28, max: 84, weight: 7 },
  { type: 'Wstrząs mózgu (poważny)', min: 21, max: 90, weight: 5 },
  { type: 'Złamanie palca stopy', min: 21, max: 56, weight: 5 },
  { type: 'Uszkodzenie łąkotki', min: 30, max: 270, weight: 5 },
  { type: 'Uszkodzenie chrząstki kolana', min: 60, max: 180, weight: 4 },
  { type: 'Złamanie kości śródstopia', min: 42, max: 168, weight: 4 },
  { type: 'Złamanie kości strzałkowej', min: 42, max: 168, weight: 4 },
  { type: 'Zwichnięcie barku', min: 28, max: 180, weight: 3 },
  { type: 'Złamanie obojczyka', min: 42, max: 90, weight: 2 },
  { type: 'Poważny uraz więzadeł bocznych kolana', min: 42, max: 112, weight: 2 },
  { type: 'Złamanie nadgarstka', min: 42, max: 112, weight: 1 },
  { type: 'Uszkodzenie więzadeł krzyżowych (ACL)', min: 180, max: 365, weight: 0.5 },
  { type: 'Zerwanie ścięgna Achillesa', min: 150, max: 270, weight: 0.5 },
];

const randomIntInclusive = (min: number, max: number, random: () => number): number =>
  min + Math.floor(random() * (max - min + 1));

const pickLightInjury = (random: () => number): InjuryPoolEntry =>
  LIGHT_INJURY_POOL[Math.floor(random() * LIGHT_INJURY_POOL.length)] ?? LIGHT_INJURY_POOL[0];

const pickSevereInjury = (random: () => number): InjuryPoolEntry => {
  const total = SEVERE_INJURY_POOL.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  let roll = random() * total;

  for (const item of SEVERE_INJURY_POOL) {
    roll -= item.weight ?? 0;
    if (roll <= 0) return item;
  }

  return SEVERE_INJURY_POOL[SEVERE_INJURY_POOL.length - 1];
};

export const rollInjuryBySeverity = (
  severity: InjurySeverity,
  random: () => number = Math.random
): RolledInjury => {
  const picked = severity === InjurySeverity.SEVERE
    ? pickSevereInjury(random)
    : pickLightInjury(random);

  return {
    type: picked.type,
    days: randomIntInclusive(picked.min, picked.max, random),
  };
};
