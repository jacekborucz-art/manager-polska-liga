import React, { useState } from 'react';
import { MailMessage, MailType, Newspaper, ViewState } from '../../types';
import { useGame } from '../../context/GameContext';
import { LeagueFinanceReportModal } from './LeagueFinanceReportModal';
import { MediaInterviewModal, MediaInterviewResult } from './MediaInterviewModal';
import { MediaInterviewService } from '../../services/MediaInterviewService';
import { KitPreview } from '../common/KitPreview';
import { getClubLogo } from '../../resources/ClubLogoAssets';

interface MailDetailsModalProps {
  mail: MailMessage;
  onClose: () => void;
}

const TeamOfWeekPitch: React.FC<{ mail: MailMessage }> = ({ mail }) => {
  const { players } = useGame();

  if (mail.metadata?.type !== 'TEAM_OF_WEEK') return null;

  const getLeagueDisplayName = (leagueId: string, fallback: string): string => {
    switch (leagueId) {
      case 'L_PL_1':
        return 'Ekstraklasa';
      case 'L_PL_2':
        return '1. Liga';
      case 'L_PL_3':
        return '2. Liga';
      case 'L_PL_4':
        return 'Liga Regionalna';
      default:
        return fallback
          .replace(/Polish League 1/gi, 'Ekstraklasa')
          .replace(/Polish League 2/gi, '1. Liga')
          .replace(/Polish League 3/gi, '2. Liga')
          .replace(/Regional League/gi, 'Liga Regionalna');
    }
  };

  const getShortPlayerName = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return fullName;
    return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
  };

  const getCurrentOverall = (playerId: string): number | undefined => {
    for (const squad of Object.values(players)) {
      const player = squad.find(item => item.id === playerId);
      if (player) return player.overallRating;
    }
    return undefined;
  };

  const getPositionRowClass = (role: string): string => {
    switch (role) {
      case 'GK':
        return 'border-yellow-300/55 bg-gradient-to-r from-yellow-500/55 via-yellow-500/22 to-slate-950/70 shadow-[inset_4px_0_0_rgba(250,204,21,0.95)]';
      case 'DEF':
        return 'border-blue-300/55 bg-gradient-to-r from-blue-500/50 via-blue-500/20 to-slate-950/70 shadow-[inset_4px_0_0_rgba(96,165,250,0.95)]';
      case 'MID':
        return 'border-emerald-300/55 bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-slate-950/70 shadow-[inset_4px_0_0_rgba(52,211,153,0.95)]';
      case 'FWD':
        return 'border-red-300/55 bg-gradient-to-r from-red-500/50 via-red-500/20 to-slate-950/70 shadow-[inset_4px_0_0_rgba(248,113,113,0.95)]';
      default:
        return 'border-white/10 bg-slate-950/55';
    }
  };

  const leagueName = getLeagueDisplayName(mail.metadata.leagueId, mail.metadata.leagueName);
  const rows = [
    mail.metadata.team.filter(player => player.role === 'GK'),
    mail.metadata.team.filter(player => player.role === 'DEF'),
    mail.metadata.team.filter(player => player.role === 'MID'),
    mail.metadata.team.filter(player => player.role === 'FWD'),
  ];
  const orderedTeam = rows.flat();

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(250px,0.78fr)_minmax(380px,1.05fr)_minmax(230px,0.62fr)] gap-5">
      <div className="min-h-0 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="mb-4 text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">
          Treść informacji
        </div>
        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-300 opacity-90">
          {mail.body}
        </p>
      </div>

      <div className="flex min-h-0 flex-col rounded-[24px] border border-emerald-300/20 bg-emerald-950/30 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-3 shrink-0">
          <div>
            <p className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">
              Jedenastka {mail.metadata.roundNumber}. tygodnia
            </p>
            <h4 className="text-[20px] font-black italic uppercase tracking-tighter text-white">
              {leagueName} / 4-4-2
            </h4>
          </div>
        </div>

        <div className="relative mx-auto min-h-0 flex-1 aspect-[2/3.05] max-h-full overflow-hidden bg-[#0e5a20] shadow-[0_35px_90px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_50%,transparent_50%)] bg-[length:80px_80px]" />
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 100 150" fill="none" stroke="white" strokeWidth="0.8">
            <rect x="2" y="2" width="96" height="146" />
            <line x1="2" y1="75" x2="98" y2="75" />
            <circle cx="50" cy="75" r="15" />
            <circle cx="50" cy="75" r="1" fill="white" />
            <rect x="20" y="2" width="60" height="25" />
            <rect x="35" y="2" width="30" height="10" />
            <path d="M 35 27 Q 50 35 65 27" />
            <rect x="20" y="123" width="60" height="25" />
            <rect x="35" y="138" width="30" height="10" />
            <path d="M 35 123 Q 50 115 65 123" />
          </svg>

          {mail.metadata.team.map(player => (
            <div
              key={player.playerId}
              className="absolute z-10 flex w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%` }}
            >
              <div className="relative">
                <KitPreview
                  shirt={player.shirt}
                  shirtSecondary={player.shirtSecondary}
                  shorts={player.shorts}
                  socks={player.socks}
                  pattern={player.pattern}
                  className="h-12 w-12"
                  label={player.overallRating ?? getCurrentOverall(player.playerId)}
                  labelColor={player.labelColor}
                />
              </div>
              <div className="mt-0.5 w-full rounded-xl border border-black/30 bg-black/55 px-2 py-1 shadow-lg">
                <p className="truncate text-[8px] font-black italic uppercase tracking-tighter text-white">{getShortPlayerName(player.playerName)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-0 rounded-[24px] border border-white/10 bg-black/25 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">Pierwsza 11</span>
          <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Oceny</span>
        </div>
        <div className="custom-scrollbar flex min-h-0 flex-col gap-1.5 overflow-y-auto pr-1">
          {orderedTeam.map(player => {
            const logo = getClubLogo(player.clubId);
            return (
              <div key={player.playerId} className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${getPositionRowClass(player.role)}`}>
                <KitPreview
                  shirt={player.shirt}
                  shirtSecondary={player.shirtSecondary}
                  shorts={player.shorts}
                  socks={player.socks}
                  pattern={player.pattern}
                  className="h-8 w-8"
                  showShorts={false}
                  label={player.rating.toFixed(1)}
                  labelColor={player.labelColor}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <span className="truncate text-[9px] font-black italic uppercase tracking-tighter text-white">
                      {getShortPlayerName(player.playerName)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1">
                    {logo && (
                      <img src={logo} alt={player.clubName} className="h-3 w-3 shrink-0 object-contain" />
                    )}
                    <p className="truncate text-[7px] font-black italic uppercase tracking-tighter text-slate-500">{player.clubName}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[12px] font-black italic uppercase tracking-tighter text-emerald-300">{player.rating.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MailDetailsModal: React.FC<MailDetailsModalProps> = ({ mail, onClose }) => {
  const {
    finalizeFreeAgentContract,
    terminateLoanEarly,
    deleteMessage,
    navigateWithoutHistory,
    setTransferNewsActiveTab,
    currentDate,
    clubs,
    userTeamId,
    reopenWinterCampInvite,
    respondToSportingDirectorObjective,
    setMediaRelationships,
    setClubs,
    setPlayers,
    managerProfile,
    addPendingPressArticle,
  } = useGame();

  const [financeReportLeague, setFinanceReportLeague] = useState<{ id: string; name: string } | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const handleInterviewComplete = (result: MediaInterviewResult) => {
    setMediaRelationships(prev =>
      MediaInterviewService.updateRelationship(prev, result.newspaper as Newspaper, result.totalRelationshipDelta)
    );
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      return {
        ...c,
        morale: Math.min(100, Math.max(0, (c.morale ?? 50) + result.totalScore.morale)),
        boardConfidence: Math.min(100, Math.max(0, (c.boardConfidence ?? 50) + result.totalScore.zarzad)),
      };
    }));
    if (result.totalScore.zawodnicy !== 0 && userTeamId) {
      setPlayers(prev => {
        const squad = prev[userTeamId] ?? [];
        return {
          ...prev,
          [userTeamId]: squad.map(p => ({
            ...p,
            morale: Math.min(100, Math.max(0, (p.morale ?? 50) + result.totalScore.zawodnicy)),
          })),
        };
      });
    }
    const userClub = clubs.find(c => c.id === userTeamId);
    if (userClub && managerProfile) {
      const variant = MediaInterviewService.determinePressVariant(result.totalProfileScore);
      const pressArticleMail = MediaInterviewService.generatePressArticleMail(
        variant,
        result.newspaper as Newspaper,
        managerProfile.lastName,
        userClub.name,
        currentDate
      );
      const deliveryDate = pressArticleMail.date.toISOString().split('T')[0];
      addPendingPressArticle({ mail: pressArticleMail, deliveryDate });
    }
    deleteMessage(mail.id);
    setShowInterviewModal(false);
    onClose();
  };

  const handleInterviewDecline = () => {
    if (mail.metadata?.type !== 'INTERVIEW_REQUEST') return;
    const newspaper = mail.metadata.newspaper as Newspaper;
    const declineOutcome = MediaInterviewService.determineDeniedPressOutcome();
    setMediaRelationships(prev =>
      MediaInterviewService.updateRelationship(prev, newspaper, declineOutcome.relationshipDelta)
    );
    const userClub = clubs.find(c => c.id === userTeamId);
    if (userClub && managerProfile) {
      const pressArticleMail = MediaInterviewService.generatePressArticleMail(
        declineOutcome.variant,
        newspaper,
        managerProfile.lastName,
        userClub.name,
        currentDate
      );
      const deliveryDate = pressArticleMail.date.toISOString().split('T')[0];
      addPendingPressArticle({ mail: pressArticleMail, deliveryDate });
    }
    deleteMessage(mail.id);
    onClose();
  };
  const isTeamOfWeek = mail.metadata?.type === 'TEAM_OF_WEEK';

  const userClub = clubs.find(c => c.id === userTeamId);
  const activeDirectorObjective = userClub?.sportingDirectorObjective;
  const canRespondToObjective =
    mail.metadata?.type === 'SPORTING_DIRECTOR_OBJECTIVE' &&
    !!activeDirectorObjective &&
    activeDirectorObjective.status === 'ACTIVE' &&
    activeDirectorObjective.id === mail.metadata.objectiveId;

  const getTypeColor = (type: MailType) => {
    switch (type) {
      case MailType.BOARD:
        return 'text-amber-500';
      case MailType.FANS:
        return 'text-rose-500';
      case MailType.STAFF:
        return 'text-blue-500';
      case MailType.MEDIA:
        return 'text-emerald-500';
      case MailType.SCOUT:
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  const getAvatarIcon = (type: MailType) => {
    switch (type) {
      case MailType.BOARD:
        return 'Board';
      case MailType.FANS:
        return 'Fans';
      case MailType.STAFF:
        return 'Staff';
      case MailType.MEDIA:
        return 'Media';
      case MailType.SCOUT:
        return 'Scout';
      default:
        return 'Mail';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-6 animate-fade-in">
      <div
        className={`${
          mail.type === MailType.SCOUT ? 'max-w-[1693px] w-[88vw] h-[86vh]' : isTeamOfWeek ? 'max-w-[1500px] w-[82vw] h-[90vh]' : 'max-w-2xl max-h-[90vh]'
        } w-full overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/60 shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col relative`}
      >
        <div className={`${isTeamOfWeek ? 'p-5' : 'p-8'} shrink-0 border-b border-white/5 bg-white/5 flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/5 bg-black/40 text-sm font-black uppercase tracking-widest text-slate-200 shadow-inner">
              {getAvatarIcon(mail.type)}
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${getTypeColor(mail.type)}`}>
                Wiadomosc przychodzaca
              </span>
              <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">
                {mail.sender}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{mail.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-lg font-light text-slate-300 shadow-lg transition-all hover:scale-110 hover:border-white/30 hover:bg-white/20 hover:text-white active:scale-95"
          >
            x
          </button>
        </div>

        <div className={`custom-scrollbar flex-1 min-h-0 ${isTeamOfWeek ? 'overflow-hidden p-4' : 'overflow-y-auto p-10'}`}>
          {mail.type !== MailType.SCOUT && (
            <div className={isTeamOfWeek ? 'mb-4' : 'mb-10'}>
              <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-600">Temat:</span>
              <h3 className="text-[10px] font-black italic uppercase tracking-tight leading-relaxed text-white">
                {mail.subject}
              </h3>
              <div className="mt-4 h-1 w-12 rounded-full bg-blue-500" />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            {mail.type === MailType.SCOUT ? (
              <div dangerouslySetInnerHTML={{ __html: mail.body }} />
            ) : mail.metadata?.type === 'TEAM_OF_WEEK' ? (
              <TeamOfWeekPitch mail={mail} />
            ) : mail.subject?.toLowerCase().includes('sparing') ? (
              (() => {
                const matchRegex = /^(.+)\s(\d+[–-]\d+)\s(.+)$/;
                const lines = mail.body.split('\n');
                const headerLine = lines.find(l => l.trim() !== '' && !matchRegex.test(l));
                const matchLines = lines.filter(l => matchRegex.test(l));
                return (
                  <div>
                    {headerLine && (
                      <p className="mb-5 text-sm font-medium text-slate-400">{headerLine}</p>
                    )}
                    <div className="flex flex-col">
                      {matchLines.map((line, idx) => {
                        const m = line.match(matchRegex);
                        if (!m) return null;
                        const [, home, score, away] = m;
                        return (
                          <div key={idx}>
                            {idx > 0 && <div className="border-t border-white/10 mx-1" />}
                            <div className="flex items-center gap-3 py-2">
                              <span className="flex-1 text-right text-sm font-medium text-slate-300">{home}</span>
                              <span className="w-14 shrink-0 text-center text-sm font-black text-white">{score}</span>
                              <span className="flex-1 text-left text-sm font-medium text-slate-300">{away}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-300 opacity-90">
                {mail.body}
              </p>
            )}
          </div>
        </div>

        <div className={`${isTeamOfWeek ? 'p-4' : 'p-8'} shrink-0 border-t border-white/5 bg-black/20 flex items-center justify-between`}>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Wyslano:</span>
            <span className="text-[10px] font-black uppercase text-slate-400">
              {mail.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {mail.metadata?.type === 'WINTER_CAMP_INVITE' && (() => {
              const expiryDate = new Date(mail.metadata.expiryDate);
              expiryDate.setHours(23, 59, 59, 999);
              const today = new Date(currentDate);
              const isExpired = today > expiryDate;
              const userClub = clubs.find(c => c.id === userTeamId);
              const alreadyChosen = !!(userClub?.winterCamp?.location !== null && userClub?.winterCamp?.location !== undefined) || !!(userClub?.winterCamp?.isDeclined);
              const isActive = !isExpired && !alreadyChosen;
              const label = isExpired ? 'Termin minął' : alreadyChosen ? 'Już zadecydowano' : 'Wybierz lokalizację obozu';
              return (
                <button
                  disabled={!isActive}
                  onClick={isActive ? () => { reopenWinterCampInvite(); onClose(); } : undefined}
                  className={`mr-4 rounded-2xl px-10 py-4 text-xs font-black italic uppercase tracking-widest shadow-xl transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {label}
                </button>
              );
            })()}

            {mail.metadata?.type === 'INCOMING_TRANSFER_OFFER' && (
              <button
                onClick={() => {
                  setTransferNewsActiveTab('incoming');
                  navigateWithoutHistory(ViewState.TRANSFER_NEWS);
                  onClose();
                }}
                className="mr-4 rounded-2xl bg-amber-500 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Zobacz
              </button>
            )}

            {mail.metadata?.type === 'CONTRACT_OFFER' && mail.metadata.accepted && (
              <button
                onClick={() => {
                  finalizeFreeAgentContract(mail.id);
                  onClose();
                }}
                className="mr-4 rounded-2xl bg-emerald-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Podpisz kontrakt
              </button>
            )}

            {canRespondToObjective && (
              <>
                <button
                  onClick={() => {
                    respondToSportingDirectorObjective('ACCEPT');
                    onClose();
                  }}
                  className="mr-4 rounded-2xl bg-emerald-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Akceptuj cel
                </button>
                <button
                  onClick={() => {
                    respondToSportingDirectorObjective('NEGOTIATE');
                    onClose();
                  }}
                  className="mr-4 rounded-2xl bg-sky-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Negocjuj
                </button>
                <button
                  onClick={() => {
                    respondToSportingDirectorObjective('CHALLENGE');
                    onClose();
                  }}
                  className="mr-4 rounded-2xl bg-red-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Odrzuc cel
                </button>
              </>
            )}

            {mail.metadata?.type === 'AI_FRIENDLY_REPORT_LINK' && (
              <button
                onClick={() => { navigateWithoutHistory(ViewState.AI_FRIENDLY_REPORTS); onClose(); }}
                className="mr-4 rounded-2xl bg-green-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Zobacz raporty
              </button>
            )}

            {mail.metadata?.type === 'LEAGUE_FINANCE_REPORT' && (
              <>
                {[
                  { id: 'L_PL_1', name: 'Ekstraklasa' },
                  { id: 'L_PL_2', name: '1. Liga' },
                  { id: 'L_PL_3', name: '2. Liga' },
                  { id: 'L_PL_4', name: 'Liga Regionalna' },
                ].map(league => (
                  <button
                    key={league.id}
                    onClick={() => setFinanceReportLeague(league)}
                    className="mr-3 rounded-2xl bg-emerald-700 px-7 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    {league.name}
                  </button>
                ))}
              </>
            )}

            {mail.metadata?.type === 'LOAN_PLAYTIME_WARNING' && (
              <>
                <button
                  onClick={() => {
                    terminateLoanEarly(mail.metadata!.playerId);
                    deleteMessage(mail.id);
                    onClose();
                  }}
                  className="mr-4 rounded-2xl bg-amber-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Skróć wypożyczenie
                </button>
                <button
                  onClick={() => {
                    deleteMessage(mail.id);
                    onClose();
                  }}
                  className="mr-4 rounded-2xl bg-slate-700 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-slate-200 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Ignoruj
                </button>
              </>
            )}

            {mail.metadata?.type === 'INTERVIEW_REQUEST' && (
              <>
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="mr-4 rounded-2xl bg-emerald-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Udziel wywiadu
                </button>
                <button
                  onClick={handleInterviewDecline}
                  className="mr-4 rounded-2xl bg-slate-700 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-slate-300 shadow-xl transition-all hover:scale-105 hover:bg-slate-600 active:scale-95"
                >
                  Odmów wywiadu
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className={`${isTeamOfWeek ? 'px-8 py-3' : 'px-10 py-4'} rounded-2xl bg-white text-xs font-black italic uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95`}
            >
              Zamknij wiadomosc
            </button>
          </div>
        </div>
      </div>

      {financeReportLeague && (
        <LeagueFinanceReportModal
          leagueName={financeReportLeague.name}
          clubs={clubs.filter(c => c.leagueId === financeReportLeague.id)}
          onClose={() => setFinanceReportLeague(null)}
        />
      )}

      {showInterviewModal && mail.metadata?.type === 'INTERVIEW_REQUEST' && (
        <MediaInterviewModal
          isOpen={showInterviewModal}
          onClose={handleInterviewComplete}
          newspaper={mail.metadata.newspaper}
          questionIds={mail.metadata.questionIds}
          placeholders={mail.metadata.placeholders}
        />
      )}
    </div>
  );
};
