import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ViewState, CompetitionType, MatchStatus } from '../types';
import { getClubLogo } from '../resources/ClubLogoAssets';
import ligaMistrzowBg from '../Graphic/themes/CL_theme.png';
import ligaEuropaBg from '../Graphic/themes/LigaEuropa.png';
import { MatchReportModal } from '../components/modals/MatchReportModal';

const GLASS_CARD = "bg-slate-950/20 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px] relative overflow-hidden";
const GLOSS_LAYER = "absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none";

export const PostMatchCLStudioView: React.FC = () => {
  const { fixtures, clubs, currentDate, navigateTo, advanceDay, clGroups } = useGame();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [animated, setAnimated] = useState(false);

  const results = useMemo(() => {
    const dateStr = currentDate.toDateString();
    return fixtures.filter(f =>
      f.date.toDateString() === dateStr &&
      f.status === MatchStatus.FINISHED &&
                 (f.leagueId === CompetitionType.CL_R1Q || f.leagueId === CompetitionType.CL_R1Q_RETURN ||
       f.leagueId === CompetitionType.CL_R2Q || f.leagueId === CompetitionType.CL_R2Q_RETURN ||
        f.leagueId === CompetitionType.CL_GROUP_STAGE ||
       f.leagueId === CompetitionType.CL_R16 || f.leagueId === CompetitionType.CL_R16_RETURN ||
            f.leagueId === CompetitionType.CL_QF || f.leagueId === CompetitionType.CL_QF_RETURN ||
       f.leagueId === CompetitionType.CL_SF || f.leagueId === CompetitionType.CL_SF_RETURN ||
       f.leagueId === CompetitionType.CL_FINAL ||
       f.leagueId === CompetitionType.EL_QF || f.leagueId === CompetitionType.EL_QF_RETURN ||
       f.leagueId === CompetitionType.EL_SF || f.leagueId === CompetitionType.EL_SF_RETURN ||
       f.leagueId === CompetitionType.EL_FINAL)
    );
  }, [fixtures, currentDate]);

  const groupedResults = useMemo(() => {
    const isGS = results.length > 0 && results[0].leagueId === CompetitionType.CL_GROUP_STAGE;
    if (!isGS || !clGroups) return null;
    const GRP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const groups: { label: string; matches: typeof results }[] = [];
    clGroups.forEach((groupTeams, gi) => {
      const groupMatches = results.filter(f =>
        groupTeams.includes(f.homeTeamId) && groupTeams.includes(f.awayTeamId)
      );
      if (groupMatches.length > 0) {
        groups.push({ label: GRP_LABELS[gi] ?? String(gi + 1), matches: groupMatches });
      }
    });
    return groups;
  }, [results, clGroups]);

  const getClub = (id: string) => clubs.find(c => c.id === id);

  const isELDay = results.length > 0 &&
    (results[0].leagueId === CompetitionType.EL_QF ||
     results[0].leagueId === CompetitionType.EL_QF_RETURN ||
     results[0].leagueId === CompetitionType.EL_SF ||
     results[0].leagueId === CompetitionType.EL_SF_RETURN ||
     results[0].leagueId === CompetitionType.EL_FINAL);

    const isReturn = results.length > 0 &&
    (results[0].leagueId === CompetitionType.CL_R1Q_RETURN ||
     results[0].leagueId === CompetitionType.CL_R2Q_RETURN ||
     results[0].leagueId === CompetitionType.CL_R16_RETURN ||
     results[0].leagueId === CompetitionType.CL_QF_RETURN ||
     results[0].leagueId === CompetitionType.CL_SF_RETURN ||
     results[0].leagueId === CompetitionType.EL_QF_RETURN ||
     results[0].leagueId === CompetitionType.EL_SF_RETURN);

  const isQF = results.length > 0 &&
    (results[0].leagueId === CompetitionType.CL_QF ||
     results[0].leagueId === CompetitionType.CL_QF_RETURN);

  const isSF = results.length > 0 &&
    (results[0].leagueId === CompetitionType.CL_SF ||
     results[0].leagueId === CompetitionType.CL_SF_RETURN);

 const isR2Q = results.length > 0 &&
    (results[0].leagueId === CompetitionType.CL_R2Q ||
     results[0].leagueId === CompetitionType.CL_R2Q_RETURN);

  const isGroupStage = results.length > 0 &&
    results[0].leagueId === CompetitionType.CL_GROUP_STAGE;
    const isR16 = results.length > 0 &&
    (results[0].leagueId === CompetitionType.CL_R16 ||
     results[0].leagueId === CompetitionType.CL_R16_RETURN);

  const isELQF = results.length > 0 &&
    (results[0].leagueId === CompetitionType.EL_QF ||
     results[0].leagueId === CompetitionType.EL_QF_RETURN);

  const isELSF = results.length > 0 &&
    (results[0].leagueId === CompetitionType.EL_SF ||
     results[0].leagueId === CompetitionType.EL_SF_RETURN);

  const isELFinal = results.length > 0 &&
    results[0].leagueId === CompetitionType.EL_FINAL;

  const isCLFinal = results.length > 0 &&
    results[0].leagueId === CompetitionType.CL_FINAL;

  const finalFixture = isCLFinal ? results.find(r => r.leagueId === CompetitionType.CL_FINAL) ?? null : null;

  const getFinalWinnerId = () => {
    if (!finalFixture) return null;
    const h = finalFixture.homeScore ?? 0;
    const a = finalFixture.awayScore ?? 0;
    if (h > a) return finalFixture.homeTeamId;
    if (a > h) return finalFixture.awayTeamId;
    if (finalFixture.homePenaltyScore != null && finalFixture.awayPenaltyScore != null) {
      return finalFixture.homePenaltyScore > finalFixture.awayPenaltyScore
        ? finalFixture.homeTeamId
        : finalFixture.awayTeamId;
    }
    return null;
  };

  const finalWinnerId = getFinalWinnerId();
  const finalWinnerClub = finalWinnerId ? getClub(finalWinnerId) : null;

  useEffect(() => {
    if (!finalFixture) return;
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [finalFixture]);

  // Dla rewanżu: oblicz agregat dla każdego meczu
  const getAggregate = (fixture: typeof results[0]) => {
    if (!isReturn) return null;
    const firstLegId = fixture.id.replace('_RETURN', '');
    const firstLeg = fixtures.find(f => f.id === firstLegId);
    if (!firstLeg || firstLeg.homeScore === null) return null;
    // W 1. meczu: home=A, away=B. W rewanżu: home=B, away=A
    const teamATotal = firstLeg.homeScore + (fixture.awayScore ?? 0);
    const teamBTotal = firstLeg.awayScore! + (fixture.homeScore ?? 0);
    return { teamATotal, teamBTotal, teamAId: firstLeg.homeTeamId, teamBId: firstLeg.awayTeamId };
  };

  const handleContinue = () => {
    advanceDay();
    navigateTo(ViewState.DASHBOARD);
  };

  const renderFixtureRow = (fixture: typeof results[0]) => {
    const home = getClub(fixture.homeTeamId);
    const away = getClub(fixture.awayTeamId);
    if (!home || !away) return null;

    const agg = getAggregate(fixture);
    const homeWins = (fixture.homeScore ?? 0) > (fixture.awayScore ?? 0);
    const awayWins = (fixture.awayScore ?? 0) > (fixture.homeScore ?? 0);
    const hasPens = fixture.homePenaltyScore !== undefined;

    let aggWinnerId: string | null = null;
    if (agg) {
      if (agg.teamATotal > agg.teamBTotal) aggWinnerId = agg.teamAId;
      else if (agg.teamBTotal > agg.teamATotal) aggWinnerId = agg.teamBId;
      else if (hasPens) {
        aggWinnerId = (fixture.homePenaltyScore ?? 0) > (fixture.awayPenaltyScore ?? 0)
          ? fixture.homeTeamId : fixture.awayTeamId;
      }
    }

    return (
      <div key={fixture.id} className="flex flex-col px-6 py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-3xl transition-colors group gap-1">
        {/* Wynik meczu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 justify-end">
            {aggWinnerId === fixture.homeTeamId && (
              <span className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">AWANS</span>
            )}
            <span className={`text-sm font-black uppercase italic tracking-tight text-right truncate max-w-[180px] transition-colors ${homeWins ? 'text-white' : 'text-slate-400'}`}>
              {home.name}
            </span>
            <div className="w-3 h-6 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: home.colorsHex[0] }} />
          </div>
          <div className="w-28 flex flex-col items-center shrink-0">
            <span className="text-lg font-black text-white font-mono tracking-tighter tabular-nums cursor-pointer hover:text-amber-300 transition-colors" onClick={() => setSelectedMatchId(fixture.id)}>
              {fixture.homeScore} : {fixture.awayScore}
            </span>
            {hasPens && (
              <span className="text-[8px] text-rose-400 font-black uppercase tracking-widest">
                k. {fixture.homePenaltyScore}:{fixture.awayPenaltyScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-1 justify-start">
            <div className="w-3 h-6 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: away.colorsHex[0] }} />
            <span className={`text-sm font-black uppercase italic tracking-tight truncate max-w-[180px] transition-colors ${awayWins ? 'text-white' : 'text-slate-400'}`}>
              {away.name}
            </span>
            {aggWinnerId === fixture.awayTeamId && (
              <span className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">AWANS</span>
            )}
          </div>
        </div>
        {/* Agregat (tylko rewanż) */}
        {agg && (
          <div className="flex justify-center">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">
              Agregat: {agg.teamBTotal} : {agg.teamATotal}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">

      {/* TŁO */}
      <div className="fixed inset-0 z-0">
        <img 
          src={isELDay ? ligaEuropaBg : ligaMistrzowBg} 
          alt="" 
          className="w-full h-full object-cover" 
          style={{ filter: 'brightness(0.4)' }}
        />
        <div className="absolute inset-0 bg-slate-950/60" />
      </div>

      {/* OVERLAY ZWYCIĘZCY LIGI MISTRZÓW */}
      {showOverlay && finalFixture && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(2, 6, 23, 0.65)', opacity: animated ? 1 : 0, transition: 'opacity 0.7s ease' }}
        >
          <p
            className="text-amber-400 font-black uppercase text-center"
            style={{ fontSize: '2rem', letterSpacing: '0.3em', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(-32px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            ZWYCIĘZCA LIGI MISTRZÓW
          </p>
          <div style={{ transform: animated ? 'scale(1)' : 'scale(0.05)', opacity: animated ? 1 : 0, transition: 'transform 2.5s cubic-bezier(0.22,1,0.36,1) 0.15s, opacity 0.6s ease 0.15s' }}>
            {finalWinnerClub ? (() => {
              const logoUrl = getClubLogo(finalWinnerClub.id) ?? (finalWinnerClub.logoFile ? new URL(`../Graphic/logo/${finalWinnerClub.logoFile}`, import.meta.url).href : null);
              return logoUrl
                ? <img src={logoUrl} alt="" style={{ width: '42vmin', height: '42vmin', objectFit: 'contain' }} />
                : <div style={{ width: '42vmin', height: '42vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15vmin' }}>🏆</div>;
            })() : (
              <div style={{ width: '42vmin', height: '42vmin', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15vmin' }}>🏆</div>
            )}
          </div>
          {finalWinnerClub && (
            <h2
              className="font-black italic uppercase text-white text-center"
              style={{ fontSize: '6rem', letterSpacing: '-0.03em', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s' }}
            >
              {finalWinnerClub.name}
            </h2>
          )}
          <button
            onClick={() => setShowOverlay(false)}
            className="px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 font-black italic uppercase tracking-widest rounded-2xl shadow-2xl text-sm"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.5s ease 1s' }}
          >
            KONTYNUUJ →
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full p-6 gap-4">

        {/* HEADER */}
        <div className={GLASS_CARD + " p-6 flex items-center justify-between shrink-0"}>
          <div className={GLOSS_LAYER} />
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isELDay ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-amber-400/10 border border-amber-400/20'}`}>
              {isELDay ? '🟠' : '⭐'}
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-[0.5em] ${isELDay ? 'text-orange-400' : 'text-amber-400'}`}>{isELDay ? 'UEFA Europa League · Wyniki' : 'UEFA Champions League · Wyniki'}</p>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                          {isCLFinal
                  ? 'Finał Ligi Mistrzów · Wynik'
                  : isELFinal
                  ? 'Finał Ligi Europy · Wynik'
                  : isELSF
                    ? (isReturn ? 'LE: 1/2 Finału — Rewanż · Wyniki' : 'LE: 1/2 Finału — 1. Mecz · Wyniki')
                    : isELQF
                      ? (isReturn ? 'LE: 1/4 Finału — Rewanż · Wyniki' : 'LE: 1/4 Finału — 1. Mecz · Wyniki')
                      : isGroupStage
                        ? `Faza Grupowa LM · Wyniki`
                        : isSF
                          ? (isReturn ? '1/2 Finału — Rewanż · Wyniki' : '1/2 Finału — 1. Mecz · Wyniki')
                          : isQF
                            ? (isReturn ? '1/4 Finału — Rewanż · Wyniki' : '1/4 Finału — 1. Mecz · Wyniki')
                            : isR16
                              ? (isReturn ? '1/8 Finału — Rewanż · Wyniki' : '1/8 Finału — 1. Mecz · Wyniki')
                              : isReturn
                                ? `Rewanż — ${isR2Q ? '2.' : '1.'} Runda Preeliminacyjna`
                                : `1. Mecz — ${isR2Q ? '2.' : '1.'} Runda Preeliminacyjna`}
              </h1>
              <p className="text-slate-400 text-xs mt-1">{currentDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 font-black italic uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-sm"
          >
            KONTYNUUJ →
          </button>
        </div>

        {/* WYNIKI */}
        <div className={GLASS_CARD + " flex-1 overflow-y-auto p-6"}>
          <div className={GLOSS_LAYER} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-5 text-center">
              {results.length} meczów · Wyniki oficjalne
            </p>
            <div className="flex flex-col gap-2">
              {groupedResults ? (
                groupedResults.map((group, gi) => (
                  <React.Fragment key={group.label}>
                    {gi > 0 && <div className="h-1.5 bg-blue-950/50 border-y border-blue-900/30 my-3" />}
                    <p className="text-lg font-black uppercase tracking-[0.5em] text-cyan-300 text-center mt-2 mb-1">
                      Grupa {group.label}
                    </p>
                    <div className="h-px bg-amber-400/35 mx-4 mb-3 rounded-full" />
                    {group.matches.map(renderFixtureRow)}
                  </React.Fragment>
                ))
              ) : (
                <>
                  {results.map(renderFixtureRow)}
                  {results.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-slate-600 text-sm italic">Brak wyników</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedMatchId && (
        <MatchReportModal matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
      )}
    </div>
  );
};
