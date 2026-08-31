import type {
  LeagueMatchEngineId,
  PendingLeagueMatchEngineSelection,
} from '../../types';

export type LeagueMatchEngineDefinition = {
  id: LeagueMatchEngineId;
  label: string;
  shortLabel: string;
  description: string;
  isPrototype: boolean;
};

const DEFINITIONS: Record<LeagueMatchEngineId, LeagueMatchEngineDefinition> = {
  LEGACY_1_0: {
    id: 'LEGACY_1_0',
    label: 'Silnik 1.0 — klasyczny',
    shortLabel: 'Silnik 1.0',
    description: 'Dotychczasowy, domyślny przebieg meczu.',
    isPrototype: false,
  },
  PROTOTYPE_2_0: {
    id: 'PROTOTYPE_2_0',
    label: 'Silnik 2.0 — prototyp',
    shortLabel: 'Silnik 2.0',
    description: 'Interaktywny prototyp SVG przeznaczony do dobrowolnych testów.',
    isPrototype: true,
  },
};

/**
 * One registry owns the fallback rule for every league-match entry point.
 * Missing, stale or malformed state can never opt a player into the prototype.
 */
export const MatchEngineRegistry = {
  defaultEngineId: 'LEGACY_1_0' as LeagueMatchEngineId,

  listLeagueEngines(): readonly LeagueMatchEngineDefinition[] {
    return [DEFINITIONS.LEGACY_1_0, DEFINITIONS.PROTOTYPE_2_0];
  },

  get(engineId: LeagueMatchEngineId): LeagueMatchEngineDefinition {
    return DEFINITIONS[engineId] ?? DEFINITIONS.LEGACY_1_0;
  },

  resolveLeagueEngine(
    fixtureId: string | undefined,
    pending: PendingLeagueMatchEngineSelection | null | undefined,
  ): LeagueMatchEngineDefinition {
    if (!fixtureId || pending?.fixtureId !== fixtureId) return DEFINITIONS.LEGACY_1_0;
    return DEFINITIONS[pending.engineId] ?? DEFINITIONS.LEGACY_1_0;
  },
};
