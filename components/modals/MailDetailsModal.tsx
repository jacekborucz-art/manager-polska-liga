import React, { useState } from 'react';
import { MailMessage, MailType, ViewState } from '../../types';
import { useGame } from '../../context/GameContext';
import { LeagueFinanceReportModal } from './LeagueFinanceReportModal';

interface MailDetailsModalProps {
  mail: MailMessage;
  onClose: () => void;
}

export const MailDetailsModal: React.FC<MailDetailsModalProps> = ({ mail, onClose }) => {
  const {
    finalizeFreeAgentContract,
    navigateWithoutHistory,
    setTransferNewsActiveTab,
    currentDate,
    clubs,
    userTeamId,
    reopenWinterCampInvite,
    respondToSportingDirectorObjective,
  } = useGame();

  const [financeReportLeague, setFinanceReportLeague] = useState<{ id: string; name: string } | null>(null);

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
          mail.type === MailType.SCOUT ? 'max-w-[1693px] w-[88vw] h-[86vh]' : 'max-w-2xl max-h-[90vh]'
        } w-full overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/60 shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col relative`}
      >
        <div className="shrink-0 border-b border-white/5 bg-white/5 p-8 flex items-center justify-between">
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

        <div className="custom-scrollbar flex-1 overflow-y-auto p-10">
          <div className="mb-10">
            <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-600">Temat:</span>
            <h3 className="text-[10px] font-black italic uppercase tracking-tight leading-relaxed text-white">
              {mail.subject}
            </h3>
            <div className="mt-4 h-1 w-12 rounded-full bg-blue-500" />
          </div>

          <div className="prose prose-invert max-w-none">
            {mail.type === MailType.SCOUT ? (
              <div dangerouslySetInnerHTML={{ __html: mail.body }} />
            ) : (
              <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-300 opacity-90">
                {mail.body}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/5 bg-black/20 p-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Wyslano:</span>
            <span className="text-[10px] font-black uppercase text-slate-400">
              {mail.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center">
            {mail.metadata?.type === 'WINTER_CAMP_INVITE' && (() => {
              const expiryDate = new Date(mail.metadata.expiryDate);
              expiryDate.setHours(23, 59, 59, 999);
              const today = new Date(currentDate);
              const isExpired = today > expiryDate;
              const userClub = clubs.find(c => c.id === userTeamId);
              const alreadyChosen = !!(userClub?.winterCamp?.location !== null && userClub?.winterCamp?.location !== undefined) || !!(userClub?.winterCamp?.isDeclined);
              const isActive = !isExpired && !alreadyChosen && !!userClub?.winterCamp;
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

            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-10 py-4 text-xs font-black italic uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95"
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
    </div>
  );
};
