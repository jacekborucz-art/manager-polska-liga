import React, { useState, useEffect, useMemo } from 'react';
import { useModalClose } from '../ui/useModalClose';
import { useGame } from '../../context/GameContext';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { Club, CompetitionType, MatchStatus } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { MatchReportModal } from './MatchReportModal';
import { MatchReportModalPolishLeague } from './MatchReportModalPolishLeague';

interface TeamResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
}

export const TeamResultsModal: React.FC<TeamResultsModalProps> = ({ isOpen, onClose, club }) => {
  const { closeModal, exitClass } = useModalClose(onClose);
  const { clubs, fixtures, currentDate, leagues, seasonNumber } = useGame();

  const neutralTypes: string[] = [
    CompetitionType.SUPER_CUP, CompetitionType.UEFA_SUPER_CUP,
    CompetitionType.CL_FINAL, CompetitionType.EL_FINAL, CompetitionType.CONF_FINAL,
  ];

  const getVenueInfo = (homeTeamId: string, neutralVenue?: boolean, leagueId?: string): { label: string; short: string; color: string } => {
    if (neutralVenue || neutralTypes.includes(leagueId as string)) {
      return { label: 'NEUTRALNY', short: 'N', color: 'text-amber-400' };
    }
    if (homeTeamId === club.id) return { label: 'DOM', short: 'D', color: 'text-emerald-400' };
    return { label: 'WYJAZD', short: 'W', color: 'text-sky-400' };
  };

  const getCompLabel = (leagueId: string): string => {
    if (leagueId === CompetitionType.POLISH_CUP) return 'PUCHAR POLSKI';
    if (leagueId === CompetitionType.SUPER_CUP) return 'SUPERPUCHAR';
    if (leagueId === CompetitionType.UEFA_SUPER_CUP) return 'UEFA SUPER';
    if (leagueId === CompetitionType.FRIENDLY) return 'SPARINGI';
    if (leagueId.startsWith('CL_')) return 'LM';
    if (leagueId.startsWith('EL_')) return 'LE';
    if (leagueId.startsWith('CONF_')) return 'KONF';
    if (leagueId.startsWith('WC')) return 'MŚ';
    if (leagueId.startsWith('PLAYOFF') || leagueId.startsWith('PROMOTION') || leagueId.startsWith('RELEGATION')) return 'BARAŻE';
    if (leagueId === 'L_PL_1') return 'EKSTRAKLASA';
    if (leagueId === 'L_PL_2') return '1. LIGA';
    if (leagueId === 'L_PL_3') return '2. LIGA';
    if (leagueId === 'L_PL_4') return '3. LIGA';
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name.toUpperCase() : 'LIGA';
  };

  const compCupColors: Record<string, string> = {
    'PUCHAR POLSKI': 'text-red-600 bg-white border-white',
    'SUPERPUCHAR': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'UEFA SUPER': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'LM': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    'LE': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'KONF': 'text-green-400 bg-green-500/10 border-green-500/30',
    'SPARINGI': 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    'BARAŻE': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    'MŚ': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSeason(null);
      setSelectedReportId(null);
    }
  }, [isOpen]);

  const allHistory = useMemo(() => MatchHistoryService.getAll(), [isOpen, fixtures]);
  const selectedReport = useMemo(
    () => selectedReportId ? [...MatchHistoryService.getAll()].reverse().find(match => match.matchId === selectedReportId) ?? null : null,
    [selectedReportId, allHistory]
  );
  const isSelectedReportEuropean = !!selectedReport && (
    selectedReport.competition.startsWith('CL_') ||
    selectedReport.competition.startsWith('EL_') ||
    selectedReport.competition.startsWith('CONF_') ||
    selectedReport.competition === CompetitionType.UEFA_SUPER_CUP
  );

  type ScheduleItem = {
    id: string;
    date: Date;
    homeTeamId: string;
    awayTeamId: string;
    leagueId: string;
    isFinished: boolean;
    homeScore: number | null;
    awayScore: number | null;
    neutralVenue: boolean;
    season: number;
    reportMatchId?: string;
  };

  const schedule = useMemo((): ScheduleItem[] => {
    const fixtureItems: ScheduleItem[] = fixtures
      .filter(f =>
        (f.homeTeamId === club.id || f.awayTeamId === club.id) &&
        !String(f.leagueId).endsWith('_DRAW')
      )
      .map(f => {
        const isPast = new Date(f.date) < currentDate;
        const histEntry = allHistory.find(e => e.matchId === f.id);
        const isDisplayFinished = f.status === MatchStatus.FINISHED || !!histEntry;
        return {
          id: f.id,
          date: new Date(f.date),
          homeTeamId: f.homeTeamId,
          awayTeamId: f.awayTeamId,
          leagueId: f.leagueId as string,
          isFinished: isDisplayFinished,
          homeScore: isDisplayFinished ? (f.homeScore ?? histEntry?.homeScore ?? null) : null,
          awayScore: isDisplayFinished ? (f.awayScore ?? histEntry?.awayScore ?? null) : null,
          neutralVenue: f.neutralVenue ?? false,
          season: seasonNumber,
          reportMatchId: histEntry?.matchId,
        };
      });

    const fixtureIds = new Set(fixtureItems.map(i => i.id));

    const historyItems: ScheduleItem[] = allHistory
      .filter(h =>
        (h.homeTeamId === club.id || h.awayTeamId === club.id) &&
        !fixtureIds.has(h.matchId)
      )
      .map(h => ({
        id: h.matchId,
        date: new Date(h.date),
        homeTeamId: h.homeTeamId,
        awayTeamId: h.awayTeamId,
        leagueId: h.competition,
        isFinished: true,
        homeScore: h.homeScore,
        awayScore: h.awayScore,
        neutralVenue: false,
        season: h.season,
        reportMatchId: h.matchId,
      }));

    return [...fixtureItems, ...historyItems]
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [fixtures, club.id, allHistory, currentDate, seasonNumber]);

  const availableSeasons = useMemo(() => {
    const seasonMap = new Map<number, number>();
    schedule.forEach(item => {
      if (item.season >= seasonNumber) return;
      const year = item.date.getFullYear();
      const existing = seasonMap.get(item.season);
      if (existing === undefined || year < existing) seasonMap.set(item.season, year);
    });
    return [...seasonMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([season, minYear]) => ({ season, label: `${minYear}/${String(minYear + 1).slice(-2)}` }));
  }, [schedule, seasonNumber]);

  const filteredSchedule = useMemo(() => {
    const targetSeason = selectedSeason ?? seasonNumber;
    return schedule.filter(item => item.season === targetSeason);
  }, [schedule, selectedSeason, seasonNumber]);

  if (!isOpen) return null;

  return (
    <>
    <div className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 ${exitClass}`}>
      <div className="max-w-3xl w-full border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
        <div className="border-b border-white/5 p-6 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Terminarz</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{club.name}</p>
          </div>
          <button onClick={closeModal} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all text-2xl">&times;</button>
        </div>

        {availableSeasons.length > 0 && (
          <div className="flex gap-2 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
            <button
              onClick={() => setSelectedSeason(null)}
              className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${selectedSeason === null ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
            >BIEŻĄCY</button>
            {availableSeasons.map(({ season, label }) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${selectedSeason === season ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
              >{label}</button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[65vh]">
          {filteredSchedule.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <span className="text-4xl block mb-4">🏜️</span>
              <p className="text-sm font-black uppercase tracking-widest italic">Brak meczów w terminarzu</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-6 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">M</th>
                  <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-28">Data</th>
                  <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-36">Rozgrywki</th>
                  <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Przeciwnik</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-24">Wynik</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((f) => {
                  const isHome = f.homeTeamId === club.id;
                  const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
                  const opponent = clubs.find(c => c.id === opponentId);
                  const venue = getVenueInfo(f.homeTeamId, f.neutralVenue, f.leagueId as string);
                  const compLabel = getCompLabel(f.leagueId as string);
                  const isLeague = !['PUCHAR POLSKI','SUPERPUCHAR','UEFA SUPER','LM','LE','KONF','SPARINGI','BARAŻE','MŚ'].includes(compLabel);
                  const compCls = isLeague ? 'text-white bg-red-600 border-red-600' : (compCupColors[compLabel] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');

                  const isPast = f.date < currentDate;
                  const isDisplayFinished = f.isFinished;

                  const myScore = isHome ? f.homeScore : f.awayScore;
                  const oppScore = isHome ? f.awayScore : f.homeScore;

                  let resultLabel = '';
                  let resultColor = 'text-slate-600';
                  if (isDisplayFinished && myScore !== null && oppScore !== null) {
                    if (myScore > oppScore) { resultLabel = 'Z'; resultColor = 'text-emerald-400'; }
                    else if (myScore < oppScore) { resultLabel = 'P'; resultColor = 'text-red-400'; }
                    else { resultLabel = 'R'; resultColor = 'text-slate-300'; }
                  }

                  const logo = opponent ? getClubLogo(opponent.id) : null;
                  const d = new Date(f.date);
                  const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;

                  return (
                    <tr key={f.id} className={`border-b border-white/[0.06] transition-colors ${isPast ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-3 align-middle">
                        <span className={`text-[11px] font-black italic uppercase ${venue.color}`}>{venue.short}</span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="text-[11px] font-black italic uppercase tracking-tighter font-mono text-slate-300">{dateStr}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[8px] font-black italic uppercase tracking-tighter ${compCls}`}>
                          {compLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          {logo ? (
                            <img src={logo} alt={opponent?.name ?? ''} className="w-6 h-6 object-contain shrink-0" />
                          ) : opponent ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[0] }} />
                              <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[1] || opponent.colorsHex[0] }} />
                            </div>
                          ) : null}
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-white">{opponent?.name ?? opponentId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {isDisplayFinished && f.reportMatchId ? (
                            <button
                              type="button"
                              onClick={() => setSelectedReportId(f.reportMatchId ?? null)}
                              className={`rounded-md px-2 py-1 text-[13px] font-black italic tracking-tighter font-mono transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/30 ${resultColor}`}
                              title="Otwórz raport meczowy"
                            >
                              {myScore}:{oppScore}
                            </button>
                          ) : (
                            <span className={`text-[13px] font-black italic tracking-tighter font-mono ${resultColor}`}>
                              {isDisplayFinished ? `${myScore}:${oppScore}` : '-:-'}
                            </span>
                          )}
                          {resultLabel && (
                            <span className={`text-[9px] font-black italic ${resultColor}`}>{resultLabel}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 text-center border-t border-white/5">
          <button onClick={closeModal} className="px-10 py-3 bg-white text-slate-900 font-black italic uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-xl">Zamknij</button>
        </div>
      </div>
    </div>
    {selectedReportId && (
      isSelectedReportEuropean ? (
        <MatchReportModal matchId={selectedReportId} onClose={() => setSelectedReportId(null)} />
      ) : (
        <MatchReportModalPolishLeague matchId={selectedReportId} onClose={() => setSelectedReportId(null)} />
      )
    )}
    </>
  );
};
