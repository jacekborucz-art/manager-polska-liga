import { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { MatchStatus } from '../../types';
import { MatchEngineRegistry } from '../../services/match/MatchEngineRegistry';
import { MatchLiveView } from '../views/MatchLiveView';
import { MatchLiveV2LeagueView } from '../views/MatchLiveV2LeagueView';

/**
 * App.tsx routes league matches through one boundary. A missing/stale choice
 * resolves to 1.0, so adding the prototype cannot silently change old saves.
 */
export const LeagueMatchEngineRouter = () => {
  const { fixtures, currentDate, userTeamId, pendingLeagueMatchEngine } = useGame();
  const fixtureId = useMemo(() => fixtures.find(fixture =>
    fixture.status === MatchStatus.SCHEDULED &&
    fixture.date.toDateString() === currentDate.toDateString() &&
    (fixture.homeTeamId === userTeamId || fixture.awayTeamId === userTeamId)
  )?.id, [currentDate, fixtures, userTeamId]);
  const engine = MatchEngineRegistry.resolveLeagueEngine(fixtureId, pendingLeagueMatchEngine);

  return engine.id === 'PROTOTYPE_2_0'
    ? <MatchLiveV2LeagueView />
    : <MatchLiveView />;
};
