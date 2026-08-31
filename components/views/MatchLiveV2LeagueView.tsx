import { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import {
  CompetitionType,
  MatchStatus,
  ViewState,
  type Lineup,
  type MatchContext,
  type Player,
} from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { KitSelectionService } from '../../services/KitSelectionService';
import { LineupService } from '../../services/LineupService';
import { CupMatchInputAdapter } from '../../services/match/adapters/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  type MatchEngineV2Runtime,
} from '../../services/match/engines/v2';
import type { CupTeamSide } from '../../services/match/engines/cupV2';
import { MatchLiveV2Session } from '../match/v2';

type PreparedLeaguePrototype = {
  runtime: MatchEngineV2Runtime;
  userSide: CupTeamSide;
  homeLogo?: string;
  awayLogo?: string;
  homeColor: string;
  awayColor: string;
};

const cloneLineup = (lineup: Lineup): Lineup => ({
  ...lineup,
  startingXI: [...lineup.startingXI],
  bench: [...lineup.bench],
  reserves: [...lineup.reserves],
});

const hasValidStartingEleven = (lineup: Lineup | undefined, squad: Player[]): lineup is Lineup => {
  if (!lineup) return false;
  const squadIds = new Set(squad.map(player => player.id));
  const starters = lineup.startingXI.filter((id): id is string => Boolean(id) && squadIds.has(id));
  return starters.length === 11 && new Set(starters).size === 11;
};

/**
 * Builds one isolated V2 runtime from the same fixture, squads, lineups, kits,
 * referee/weather adapter and coach data used by the existing league flow.
 * Runtime lineups are cloned because live substitutions must never mutate the
 * React world state before the future shared finalization service commits it.
 */
export const MatchLiveV2LeagueView = () => {
  const {
    navigateTo,
    userTeamId,
    clubs,
    fixtures,
    players,
    lineups,
    coaches,
    currentDate,
    pendingMatchKits,
    pendingLeagueMatchEngine,
    setPendingLeagueMatchEngine,
  } = useGame();

  const prepared = useMemo<PreparedLeaguePrototype | null>(() => {
    if (!userTeamId || pendingLeagueMatchEngine?.engineId !== 'PROTOTYPE_2_0') return null;

    const fixture = fixtures.find(item =>
      item.id === pendingLeagueMatchEngine.fixtureId &&
      item.status === MatchStatus.SCHEDULED &&
      item.date.toDateString() === currentDate.toDateString() &&
      (item.homeTeamId === userTeamId || item.awayTeamId === userTeamId)
    );
    if (!fixture) return null;

    const homeClub = clubs.find(club => club.id === fixture.homeTeamId);
    const awayClub = clubs.find(club => club.id === fixture.awayTeamId);
    if (!homeClub || !awayClub) return null;

    const homePlayers = players[homeClub.id] ?? [];
    const awayPlayers = players[awayClub.id] ?? [];
    const homeCoach = homeClub.coachId ? coaches[homeClub.coachId] ?? null : null;
    const awayCoach = awayClub.coachId ? coaches[awayClub.coachId] ?? null : null;
    const storedHomeLineup = lineups[homeClub.id];
    const storedAwayLineup = lineups[awayClub.id];
    const homeLineup = hasValidStartingEleven(storedHomeLineup, homePlayers)
      ? cloneLineup(storedHomeLineup)
      : LineupService.autoPickLineup(homeClub.id, homePlayers, storedHomeLineup?.tacticId ?? '4-4-2', homeCoach);
    const awayLineup = hasValidStartingEleven(storedAwayLineup, awayPlayers)
      ? cloneLineup(storedAwayLineup)
      : LineupService.autoPickLineup(awayClub.id, awayPlayers, storedAwayLineup?.tacticId ?? '4-4-2', awayCoach);

    const context: MatchContext = {
      fixture,
      homeClub,
      awayClub,
      homePlayers,
      awayPlayers,
      homeCoach,
      awayCoach,
      homeAdvantage: true,
      competition: CompetitionType.LEAGUE,
    };
    const userSide: CupTeamSide = homeClub.id === userTeamId ? 'HOME' : 'AWAY';
    const adapted = CupMatchInputAdapter.fromMatchContext(context, {
      homeLineup,
      awayLineup,
      userSide,
      enableExtraTime: false,
      enablePenaltyShootout: false,
      seedSuffix: 'league_live_v2',
    });
    const { config: _cupConfig, ...neutralInput } = adapted.input;
    const runtime = MatchEngineV2.createMatch({
      ...neutralInput,
      rules: LEAGUE_MATCH_RULES_V2,
      config: { tickSeconds: 5 },
      coaching: {
        aiSides: [userSide === 'HOME' ? 'AWAY' : 'HOME'],
        coachAttributes: {
          HOME: homeCoach?.attributes,
          AWAY: awayCoach?.attributes,
        },
      },
    });
    const kits = pendingMatchKits?.fixtureId === fixture.id
      ? pendingMatchKits.kits
      : KitSelectionService.selectOptimalKits(homeClub, awayClub);

    return {
      runtime,
      userSide,
      homeLogo: getClubLogo(homeClub.id) ?? undefined,
      awayLogo: getClubLogo(awayClub.id) ?? undefined,
      homeColor: kits.home.primary || homeClub.colorPrimary || homeClub.colorsHex[0] || '#3b82f6',
      awayColor: kits.away.primary || awayClub.colorPrimary || awayClub.colorsHex[0] || '#f43f5e',
    };
  }, [
    clubs,
    coaches,
    currentDate,
    fixtures,
    lineups,
    pendingLeagueMatchEngine,
    pendingMatchKits,
    players,
    userTeamId,
  ]);

  if (!prepared) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 px-8 text-white">
        <div className="max-w-xl rounded-3xl border border-rose-400/25 bg-slate-900 p-8 text-center shadow-2xl">
          <h1 className="font-black italic uppercase tracking-tighter text-2xl text-rose-300">
            Nie można uruchomić prototypu 2.0
          </h1>
          <p className="font-black italic uppercase tracking-tighter mt-3 text-sm text-slate-300">
            Nie znaleziono aktualnego meczu ligowego albo pełnej jedenastki.
          </p>
          <button
            type="button"
            onClick={() => {
              setPendingLeagueMatchEngine(null);
              navigateTo(ViewState.PRE_MATCH_STUDIO);
            }}
            className="font-black italic uppercase tracking-tighter mt-6 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-6 py-3 text-cyan-100 hover:bg-cyan-400/20"
          >
            Wróć do studia
          </button>
        </div>
      </div>
    );
  }

  return (
    <MatchLiveV2Session
      runtime={prepared.runtime}
      managedSide={prepared.userSide}
      homeLogo={prepared.homeLogo}
      awayLogo={prepared.awayLogo}
      homeColor={prepared.homeColor}
      awayColor={prepared.awayColor}
      initialPlayback={{ paused: true, renderMode: 'INTERACTIVE', transmissionMode: 'KEY_MOMENTS', goalReplays: false }}
      onExit={() => {
        /*
         * Stage 8 exposes an intentionally disposable live prototype. Leaving
         * it discards the uncommitted runtime and unlocks the fixture, allowing
         * the player to return to the safe 1.0 route. Stage 9 will replace this
         * abort path with the shared, exactly-once world finalization service.
         */
        setPendingLeagueMatchEngine(null);
        navigateTo(ViewState.PRE_MATCH_STUDIO);
      }}
    />
  );
};
