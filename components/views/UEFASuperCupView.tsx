import React from 'react';
import supercupBg from '../../Graphic/themes/supercup.png';
import { useGame } from '../../context/GameContext';
import { CompetitionType, MatchStatus, ViewState } from '../../types';
import { CLUB_LOGOS } from '../../resources/ClubLogoAssets';

const GLASS_CARD = 'bg-slate-950/40 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px] relative overflow-hidden';
const GLOSS_LAYER = 'absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none';
const HEADING_FONT = 'font-black italic uppercase tracking-tighter';

// Skrót nazwy klubu do wyświetlenia gdy brak logo
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

interface ClubBadgeProps {
  clubId: string;
  clubName: string;
}

const ClubBadge: React.FC<ClubBadgeProps> = ({ clubId, clubName }) => {
  const logo = CLUB_LOGOS[clubId];
  if (logo) {
    return (
      <img
        src={logo}
        alt={clubName}
        className="w-24 h-24 object-contain drop-shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
      />
    );
  }
  return (
    <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-white">
      {getInitials(clubName)}
    </div>
  );
};

const UEFASuperCupView: React.FC = () => {
  const { lastUEFASuperCupResult, setLastUEFASuperCupResult, advanceDay, navigateTo, fixtures, clubs, currentDate } = useGame();

  // Szukamy rozgranego fixture Superpucharu Europy
  const fixture = fixtures.find(
    f => f.leagueId === CompetitionType.UEFA_SUPER_CUP && f.status === MatchStatus.FINISHED
  );

  const homeClub = clubs.find(c => fixture && c.id === fixture.homeTeamId);
  const awayClub = clubs.find(c => fixture && c.id === fixture.awayTeamId);

  const homeGoals = lastUEFASuperCupResult?.goals.filter(g => fixture && g.teamId === fixture.homeTeamId && !('varDisallowed' in g && g.varDisallowed)) ?? [];
  const awayGoals = lastUEFASuperCupResult?.goals.filter(g => fixture && g.teamId === fixture.awayTeamId && !('varDisallowed' in g && g.varDisallowed)) ?? [];

  const hasPenalties = fixture?.homePenaltyScore != null;

  // Wyznacz zwycięzcę
  const homeScore = fixture?.homeScore ?? 0;
  const awayScore = fixture?.awayScore ?? 0;
  let winnerName = '';
  if (fixture) {
    if (hasPenalties) {
      const homeWins = (fixture.homePenaltyScore ?? 0) > (fixture.awayPenaltyScore ?? 0);
      winnerName = homeWins ? (homeClub?.name ?? '') : (awayClub?.name ?? '');
    } else if (homeScore > awayScore) {
      winnerName = homeClub?.name ?? '';
    } else if (awayScore > homeScore) {
      winnerName = awayClub?.name ?? '';
    }
  }

  const dateLabel = currentDate.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleContinue = () => {
    setLastUEFASuperCupResult(null);
    advanceDay();
    navigateTo(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative">
      {/* Tło */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${supercupBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.35)',
        }}
      />
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-slate-950/55 pointer-events-none" />

      <div className={`${GLASS_CARD} relative z-10 w-full max-w-[860px] mx-4 p-10`}>
        <div className={GLOSS_LAYER} />

        {/* Nagłówek */}
        <div className="text-center mb-8">
          <p className="text-xs text-amber-400/80 tracking-[0.25em] uppercase mb-2">
            {dateLabel}
          </p>
          <h1 className={`${HEADING_FONT} text-amber-300 text-3xl mb-1`}>
            Superpuchar Europy
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">UEFA Super Cup</p>
        </div>

        {/* Wynik meczu */}
        {fixture ? (
          <>
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Gospodarz */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <ClubBadge clubId={fixture.homeTeamId} clubName={homeClub?.name ?? fixture.homeTeamId} />
                <span className={`${HEADING_FONT} text-white text-xl text-center`}>
                  {homeClub?.name ?? fixture.homeTeamId}
                </span>
                <span className="text-xs text-amber-400/70 uppercase tracking-widest">Zwycięzca LM</span>
              </div>

              {/* Wynik */}
              <div className="flex flex-col items-center gap-2 min-w-[140px]">
                <div className="flex items-center gap-3">
                  <span className="text-6xl font-black tabular-nums text-white">{homeScore}</span>
                  <span className="text-3xl font-black text-slate-500">:</span>
                  <span className="text-6xl font-black tabular-nums text-white">{awayScore}</span>
                </div>
                {hasPenalties && (
                  <div className="text-sm font-bold text-amber-300 tracking-widest">
                    ({fixture.homePenaltyScore} : {fixture.awayPenaltyScore}) — karne
                  </div>
                )}
                {hasPenalties && (
                  <div className="mt-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-widest">
                      Po dogrywce
                    </span>
                  </div>
                )}
              </div>

              {/* Gość */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <ClubBadge clubId={fixture.awayTeamId} clubName={awayClub?.name ?? fixture.awayTeamId} />
                <span className={`${HEADING_FONT} text-white text-xl text-center`}>
                  {awayClub?.name ?? fixture.awayTeamId}
                </span>
                <span className="text-xs text-amber-400/70 uppercase tracking-widest">Zwycięzca LE</span>
              </div>
            </div>

            {/* Strzelcy */}
            {(homeGoals.length > 0 || awayGoals.length > 0) && (
              <div className="mb-8 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                <div className="grid grid-cols-2 gap-6">
                  {/* Gole gospodarza */}
                  <div className="flex flex-col gap-1.5 items-end">
                    {homeGoals.map((g, i) => (
                      <span key={i} className="text-sm text-slate-200">
                        <span className="text-emerald-300 mr-1">⚽</span>
                        {g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}
                      </span>
                    ))}
                  </div>
                  {/* Gole gościa */}
                  <div className="flex flex-col gap-1.5 items-start">
                    {awayGoals.map((g, i) => (
                      <span key={i} className="text-sm text-slate-200">
                        <span className="text-emerald-300 mr-1">⚽</span>
                        {g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Zwycięzca */}
            {winnerName && (
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 rounded-2xl bg-amber-400/10 border border-amber-400/30">
                  <p className="text-xs text-amber-300/70 uppercase tracking-widest mb-1">Zdobywca Superpucharu Europy</p>
                  <p className={`${HEADING_FONT} text-amber-300 text-2xl`}>{winnerName}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Brak danych o meczu.</p>
          </div>
        )}

        {/* Przycisk Kontynuuj */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="px-10 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black italic uppercase tracking-widest text-sm transition-colors shadow-[0_4px_20px_rgba(251,191,36,0.3)]"
          >
            Kontynuuj
          </button>
        </div>
      </div>
    </div>
  );
};

export default UEFASuperCupView;
