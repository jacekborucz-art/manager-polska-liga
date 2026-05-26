type RivalryTier = 'NONE' | 'RIVAL' | 'DERBY' | 'CLASSIC';

export type RivalryDefinition = {
  clubs: [string, string];
  tier: Exclude<RivalryTier, 'NONE'>;
  label: string;
  attendanceBoost: number;
  pressureBoost: number;
  briefingBoost: number;
  minimumAttendancePct?: number;
};

export type RivalryGroup = {
  clubs: string[];
  tier: Exclude<RivalryTier, 'NONE'>;
  label: string;
  attendanceBoost: number;
  pressureBoost: number;
  briefingBoost: number;
  minimumAttendancePct?: number;
};

export const directRivalries: RivalryDefinition[] = [
  {
    clubs: ['Legia Warszawa', 'Polonia Warszawa'],
    tier: 'DERBY',
    label: 'DERBY STOLICY',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.84,
  },
  {
    clubs: ['Legia Warszawa', 'Lech Poznan'],
    tier: 'CLASSIC',
    label: 'KLASYCZNY HIT',
    attendanceBoost: 0.20,
    pressureBoost: 0.065,
    briefingBoost: 0.24,
    minimumAttendancePct: 0.90,
  },
  {
    clubs: ['Wisla Krakow', 'Cracovia'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.86,
  },
  {
    clubs: ['Wisla Krakow', 'Hutnik Krakow'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.14,
    pressureBoost: 0.045,
    briefingBoost: 0.16,
    minimumAttendancePct: 0.74,
  },
  {
    clubs: ['Cracovia', 'Hutnik Krakow'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.13,
    pressureBoost: 0.040,
    briefingBoost: 0.15,
    minimumAttendancePct: 0.70,
  },
  {
    clubs: ['Lechia Gdansk', 'Arka Gdynia'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.17,
    pressureBoost: 0.050,
    briefingBoost: 0.18,
    minimumAttendancePct: 0.80,
  },
  {
    clubs: ['Lechia Gdansk', 'Pogon Szczecin'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.12,
    pressureBoost: 0.034,
    briefingBoost: 0.12,
    minimumAttendancePct: 0.64,
  },
  {
    clubs: ['Arka Gdynia', 'Pogon Szczecin'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.11,
    pressureBoost: 0.032,
    briefingBoost: 0.11,
    minimumAttendancePct: 0.60,
  },
  {
    clubs: ['Lech Poznan', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'KLASYCZNY MECZ WROGOW',
    attendanceBoost: 0.10,
    pressureBoost: 0.028,
    briefingBoost: 0.10,
    minimumAttendancePct: 0.62,
  },
  {
    clubs: ['Widzew Lodz', 'LKS Lodz'],
    tier: 'DERBY',
    label: 'DERBY LODZI',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.86,
  },
  {
    clubs: ['Miedz Legnica', 'Zaglebie Lubin'],
    tier: 'DERBY',
    label: 'DERBY DOLNEGO SLASKA',
    attendanceBoost: 0.14,
    pressureBoost: 0.042,
    briefingBoost: 0.15,
    minimumAttendancePct: 0.72,
  },
  {
    clubs: ['Miedz Legnica', 'Chrobry Glogow'],
    tier: 'RIVAL',
    label: 'MECZ WROGOW',
    attendanceBoost: 0.10,
    pressureBoost: 0.028,
    briefingBoost: 0.10,
    minimumAttendancePct: 0.60,
  },
];

export const rivalryGroups: RivalryGroup[] = [
  {
    clubs: ['Lech Poznan', 'Legia Warszawa', 'Widzew Lodz', 'Gornik Zabrze', 'Pogon Szczecin', 'Wisla Krakow'],
    tier: 'RIVAL',
    label: 'MECZ WROGOW',
    attendanceBoost: 0.08,
    pressureBoost: 0.022,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.58,
  },
  {
    clubs: ['Ruch Chorzow', 'Gornik Zabrze', 'GKS Katowice', 'Piast Gliwice', 'GKS Tychy'],
    tier: 'DERBY',
    label: 'DERBY WIELKIEGO SLASKA',
    attendanceBoost: 0.13,
    pressureBoost: 0.038,
    briefingBoost: 0.14,
    minimumAttendancePct: 0.68,
  },
  {
    clubs: ['Zaglebie Lubin', 'Slask Wroclaw', 'Gornik Zabrze', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'MECZ PODWYŻSZONEGO RYZYKA',
    attendanceBoost: 0.07,
    pressureBoost: 0.020,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.54,
  },
  {
    clubs: ['Polonia Warszawa', 'Legia Warszawa', 'Znicz Pruszkow', 'Pogon Siedlce', 'Pogon Grodzisk Mazowiecki', 'Wisla Krakow', 'LKS Lodz', 'Slask Wroclaw', 'Ruch Chorzow', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'MECZ PODWYŻSZONEGO RYZYKA',
    attendanceBoost: 0.08,
    pressureBoost: 0.024,
    briefingBoost: 0.10,
    minimumAttendancePct: 0.56,
  },
];
