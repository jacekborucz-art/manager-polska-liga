import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AiTransferLogEntry, AiTransferLogStatus, ViewState } from '../../types';
import negocjacjeBg from '../../Graphic/themes/negocjacje.png';

const MONTHS_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

const POS_COLOR: Record<string, string> = {
  GK: 'text-yellow-400',
  DEF: 'text-blue-400',
  MID: 'text-emerald-400',
  FWD: 'text-red-400',
};

const STATUS_LABEL: Record<AiTransferLogStatus, string> = {
  OFFER_MADE: 'Oferta złożona',
  TRANSFER_SIGNED: 'Transfer podpisany',
  PLAYER_REJECTED: 'Zawodnik odrzucił',
  CANCELLED_NO_BUDGET: 'Anulowano — brak budżetu',
  CANCELLED_OTHER: 'Anulowano',
};

const STATUS_COLOR: Record<AiTransferLogStatus, string> = {
  OFFER_MADE: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  TRANSFER_SIGNED: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  PLAYER_REJECTED: 'text-red-300 bg-red-500/10 border-red-500/30',
  CANCELLED_NO_BUDGET: 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  CANCELLED_OTHER: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}`;
};

const formatFee = (fee?: number) => {
  if (!fee) return '—';
  return fee.toLocaleString('pl-PL') + ' PLN';
};

const ALL_STATUSES: AiTransferLogStatus[] = [
  'OFFER_MADE',
  'TRANSFER_SIGNED',
  'PLAYER_REJECTED',
  'CANCELLED_NO_BUDGET',
  'CANCELLED_OTHER',
];

const ALL_POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

export const AiMarketNewsView: React.FC = () => {
  const { aiTransferLog, navigateTo } = useGame();

  const [statusFilter, setStatusFilter] = useState<AiTransferLogStatus | 'ALL'>('ALL');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const filtered = useMemo(() => {
    return aiTransferLog.filter(entry => {
      if (statusFilter !== 'ALL' && entry.status !== statusFilter) return false;
      if (posFilter !== 'ALL' && entry.playerPosition !== posFilter) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        if (
          !entry.playerName.toLowerCase().includes(q) &&
          !entry.fromClub.toLowerCase().includes(q) &&
          !entry.toClub.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [aiTransferLog, statusFilter, posFilter, searchText]);

  const counts = useMemo(() => {
    const result: Partial<Record<AiTransferLogStatus, number>> = {};
    for (const s of ALL_STATUSES) {
      result[s] = aiTransferLog.filter(e => e.status === s).length;
    }
    return result;
  }, [aiTransferLog]);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-50 flex flex-col p-4 gap-4"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.93), rgba(2, 6, 23, 0.93)), url(${negocjacjeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* HEADER */}
      <header className="w-full max-w-[1680px] mx-auto flex items-center justify-between shrink-0 bg-white/[0.03] border border-white/10 rounded-[30px] p-5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="text-3xl">📊</div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              MARKET <span className="text-yellow-400">NEWS</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1">
              Log transferów AI • śledzenie transakcji
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {aiTransferLog.length} wpisów
          </span>
          <button
            onClick={() => navigateTo(ViewState.TRANSFER_NEWS)}
            className="px-8 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/[0.15] transition-all shadow-xl active:scale-95 group"
          >
            <span className="group-hover:text-emerald-400 transition-colors">&larr; Aktywność rynkowa</span>
          </button>
        </div>
      </header>

      {/* FILTRY */}
      <div className="w-full max-w-[1680px] mx-auto flex flex-wrap items-center gap-3 px-1">
        {/* Status filter */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
            statusFilter === 'ALL'
              ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07]'
          }`}
        >
          Wszystkie ({aiTransferLog.length})
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              statusFilter === s
                ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07]'
            }`}
          >
            {STATUS_LABEL[s]} ({counts[s] ?? 0})
          </button>
        ))}

        {/* separator */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Pozycja */}
        {['ALL', ...ALL_POSITIONS].map(p => (
          <button
            key={p}
            onClick={() => setPosFilter(p)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              posFilter === p
                ? 'bg-slate-400/20 border-slate-400/50 text-slate-200'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07]'
            }`}
          >
            {p === 'ALL' ? 'Poz: Wszystkie' : p}
          </button>
        ))}

        {/* Szukaj */}
        <div className="ml-auto">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Szukaj zawodnika lub klubu..."
            className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-yellow-400/40 w-64"
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="w-full max-w-[1680px] mx-auto" style={{ height: 'calc(100vh - 220px)', overflowY: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[11px] font-black uppercase tracking-widest">Brak wpisów</p>
            <p className="text-[10px] mt-2 text-slate-700">Logi pojawią się gdy AI-kluby zaczną przeprowadzać transfery</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: '100px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '48px' }} />
                <col style={{ width: '44px' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '160px' }} />
                <col />
              </colgroup>
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10">
                  {['DATA', 'ZAWODNIK', 'OVR', 'POZ', 'OBECNY KLUB', 'OFERUJĄCY KLUB', 'OPŁATA', 'STATUS', 'POWÓD / SZCZEGÓŁY'].map(col => (
                    <th key={col} className="text-[8px] font-black uppercase tracking-widest text-slate-500 py-2 px-3 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((entry: AiTransferLogEntry, idx: number) => (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.015]'} hover:bg-white/[0.04]`}
                  >
                    {/* Data */}
                    <td className="text-[10px] text-slate-400 font-mono px-3 py-3 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>

                    {/* Zawodnik */}
                    <td className="px-3 py-3 max-w-0">
                      <span className="text-[11px] font-bold text-slate-200 truncate block">
                        {entry.playerName}
                      </span>
                    </td>

                    {/* OVR */}
                    <td className="text-[11px] font-black text-yellow-400 px-3 py-3 text-center">
                      {entry.playerOvr}
                    </td>

                    {/* Pozycja */}
                    <td className={`text-[10px] font-black px-3 py-3 text-center ${POS_COLOR[entry.playerPosition] ?? 'text-slate-400'}`}>
                      {entry.playerPosition}
                    </td>

                    {/* Obecny klub */}
                    <td className="px-3 py-3 max-w-0">
                      <span className="text-[10px] text-slate-300 truncate block">
                        {entry.fromClub}
                      </span>
                    </td>

                    {/* Oferujący klub */}
                    <td className="px-3 py-3 max-w-0">
                      <span className="text-[10px] text-slate-300 truncate block">
                        {entry.toClub}
                      </span>
                    </td>

                    {/* Opłata */}
                    <td className="text-[10px] font-mono text-slate-400 px-3 py-3 whitespace-nowrap">
                      {formatFee(entry.fee)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border whitespace-nowrap ${STATUS_COLOR[entry.status]}`}>
                        {STATUS_LABEL[entry.status]}
                      </span>
                    </td>

                    {/* Powód */}
                    <td
                      className="px-3 py-3 max-w-0 cursor-default"
                      onMouseEnter={entry.reason ? (e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTooltip({ text: entry.reason!, x: rect.left, y: rect.top });
                      } : undefined}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span className="text-[9px] text-slate-500 truncate block">
                        {entry.reason ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooltip fixed — nie jest przycinany przez overflow:hidden rodziców */}
      {tooltip && (
        <div
          className="fixed z-[9999] w-80 bg-slate-900 border border-white/20 rounded-xl p-3 shadow-2xl pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translateY(-100%)' }}
        >
          <p className="text-[10px] text-slate-200 leading-relaxed whitespace-normal break-words">
            {tooltip.text}
          </p>
          <div className="absolute bottom-[-5px] left-4 w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45" />
        </div>
      )}
    </div>
  );
};
