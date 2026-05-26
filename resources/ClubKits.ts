import { Club, ClubKit, ClubKitPattern } from '../types';

const FALLBACK_COLORS = ['#111111', '#ffffff', '#ff0000', '#facc15'];
const DEFAULT_KIT_PATTERN: ClubKitPattern = 'solid';

export const normalizeKitColor = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
};

export const normalizeKitPattern = (value: string | undefined): ClubKitPattern => {
  if (value === 'horizontal_stripes' || value === 'vertical_stripes') return value;
  return DEFAULT_KIT_PATTERN;
};

export const createDefaultClubKits = (colorsHex: string[] = []): ClubKit[] => {
  const colors = [
    normalizeKitColor(colorsHex[0], FALLBACK_COLORS[0]),
    normalizeKitColor(colorsHex[1], FALLBACK_COLORS[1]),
    normalizeKitColor(colorsHex[2], FALLBACK_COLORS[2]),
    normalizeKitColor(colorsHex[3], FALLBACK_COLORS[3]),
  ];

  return [
    {
      id: 'home',
      name: 'Domowy',
      shirt: colors[0],
      shirtSecondary: colors[1],
      shorts: colors[0],
      socks: colors[0],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: true,
    },
    {
      id: 'away',
      name: 'Wyjazdowy',
      shirt: colors[1],
      shirtSecondary: colors[0],
      shorts: colors[1],
      socks: colors[1],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: true,
    },
    {
      id: 'third',
      name: 'Trzeci',
      shirt: colors[2],
      shirtSecondary: colors[0],
      shorts: colors[2],
      socks: colors[2],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: Boolean(colorsHex[2]),
    },
    {
      id: 'fourth',
      name: 'Czwarty',
      shirt: colors[3],
      shirtSecondary: colors[0],
      shorts: colors[3],
      socks: colors[3],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: Boolean(colorsHex[3]),
    },
  ];
};

export const getClubKits = (club: Club): ClubKit[] => {
  const fallback = createDefaultClubKits(club.colorsHex);
  const source = club.kits && club.kits.length >= 2 ? club.kits : fallback;

  return [0, 1, 2, 3].map(index => {
    const base = fallback[index];
    const kit = source[index];
    return {
      id: kit?.id || base.id,
      name: kit?.name || base.name,
      shirt: normalizeKitColor(kit?.shirt, base.shirt),
      shirtSecondary: normalizeKitColor(kit?.shirtSecondary, base.shirtSecondary ?? base.shorts),
      shorts: normalizeKitColor(kit?.shorts, base.shorts),
      socks: normalizeKitColor(kit?.socks, base.socks),
      pattern: normalizeKitPattern(kit?.pattern),
      isActive: index < 2 ? true : Boolean(kit?.isActive),
    };
  });
};

export const getActiveClubKits = (club: Club): ClubKit[] =>
  getClubKits(club).filter((kit, index) => index < 2 || kit.isActive);
