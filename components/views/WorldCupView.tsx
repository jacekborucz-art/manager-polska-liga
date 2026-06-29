import React, { useEffect, useMemo, useState } from 'react';
import wcBgImg from '../../Graphic/themes/worldcup.png';
import { useGame } from '../../context/GameContext';
import { MatchCardEntry, MatchGoalEntry, NationalTeam, ViewState, WCGroup, WCGroupStanding, WCKnockoutMatch, WCState } from '../../types';
import { WorldCupService, computeGroupStandings } from '../../services/WorldCupService';
import { EuroTournamentService } from '../../services/EuroTournamentService';
import { useProcessing } from '../ui/ProcessingOverlay';

const GLASS_CARD = 'bg-slate-950/20 border border-white/[0.07] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[40px] relative overflow-hidden';
const GLOSS_LAYER = 'absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none';
const HEADING_FONT = 'font-black italic uppercase tracking-tighter';
const BTN_FONT = 'font-black italic uppercase tracking-widest';

const FLAG_CODE_MAP: Record<string, string> = {
  Albania: 'AL', Andora: 'AD', Armenia: 'AM', Austria: 'AT', Azerbejdżan: 'AZ',
  Belgia: 'BE', Białoruś: 'BY', 'Bośnia i Hercegowina': 'BA', Bułgaria: 'BG', Chorwacja: 'HR',
  Cypr: 'CY', Czarnogóra: 'ME', Czechy: 'CZ', Dania: 'DK', Estonia: 'EE',
  Finlandia: 'FI', Francja: 'FR', Gibraltar: 'GI', Grecja: 'GR', Gruzja: 'GE',
  Hiszpania: 'ES', Holandia: 'NL', Irlandia: 'IE', Islandia: 'IS', Izrael: 'IL',
  Kazachstan: 'KZ', Kosovo: 'XK', Liechtenstein: 'LI', Litwa: 'LT', Luksemburg: 'LU',
  Łotwa: 'LV', 'Macedonia Północna': 'MK', Malta: 'MT', Mołdawia: 'MD', Niemcy: 'DE',
  Norwegia: 'NO', Polska: 'PL', Portugalia: 'PT', Rosja: 'RU', Rumunia: 'RO',
  'San Marino': 'SM', Serbia: 'RS', Słowacja: 'SK', Słowenia: 'SI', Szwajcaria: 'CH',
  Szwecja: 'SE', Turcja: 'TR', Ukraina: 'UA', Węgry: 'HU', Włochy: 'IT', 'Wyspy Owcze': 'FO',
  Szkocja: 'gb-sct', Anglia: 'gb-eng', 'Irlandia Północna': 'gb-nir',
  Algieria: 'DZ', Angola: 'AO', 'Burkina Faso': 'BF', Kamerun: 'CM', 'Côte d\'Ivoire': 'CI',
  Egipt: 'EG', Ghana: 'GH', Gwinea: 'GN', Maroko: 'MA', Mali: 'ML', Nigeria: 'NG',
  Senegal: 'SN', 'RPA': 'ZA', Tanzania: 'TZ', Tunezja: 'TN', Uganda: 'UG', Zambia: 'ZM',
  'Wybrzeże Kości Słoniowej': 'CI', Gabon: 'GA', 'Demokratyczna Republika Konga': 'CD', 'Demokratyczna Republika Kongo': 'CD', Sudan: 'SD',
  Argentyna: 'AR', Boliwia: 'BO', Brazylia: 'BR', Chile: 'CL', Ekwador: 'EC',
  Kolumbia: 'CO', Peru: 'PE', Paragwaj: 'PY', Urugwaj: 'UY', Wenezuela: 'VE',
  Meksyk: 'MX', Kanada: 'CA', 'Stany Zjednoczone': 'US', Kostaryka: 'CR', Honduras: 'HN',
  Jamajka: 'JM', Panama: 'PA', 'Trynidad i Tobago': 'TT', Kuba: 'CU', Nikaragua: 'NI',
  Australia: 'AU', Chiny: 'CN', Indie: 'IN', Indonezja: 'ID', Iran: 'IR',
  Irak: 'IQ', Japonia: 'JP', 'Korea Południowa': 'KR', 'Korea PŁD': 'KR', 'Arabia Saudyjska': 'SA',
  'Zjednoczone Emiraty Arabskie': 'AE', Uzbekistan: 'UZ', 'Wietnam': 'VN', Katar: 'QA', Tajlandia: 'TH', Kuwejt: 'KW', Tadżykistan: 'TJ',
  'Nowa Zelandia': 'NZ', Fiji: 'FJ', Fidżi: 'FJ', 'Nowa Kaledonia': 'NC', Salwador: 'SV',
};

function getFlagCode(name: string): string | null {
  return FLAG_CODE_MAP[name]?.toLowerCase() ?? null;
}

function NTStyleFlag({ name }: { name: string }) {
  const code = getFlagCode(name);
  if (!code) {
    return (
      <div className="h-6 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-200 shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      className="h-6 w-8 object-cover rounded-md border border-white/10 bg-white/5 shrink-0"
    />
  );
}

function SmallFlag({ name }: { name: string }) {
  const code = getFlagCode(name);
  if (!code) return <span className="text-xs text-white/40">—</span>;
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} className="w-5 h-3 object-cover rounded-sm inline-block shrink-0" />;
}

type Tab = 'grupy' | 'drabinka' | 'final' | 'statystyki';

const ROUND_LABEL: Record<string, string> = {
  R32: '1/16 Finału', R16: '1/8 Finału', QF: 'Ćwierćfinał', SF: 'Półfinał', THIRD: 'O 3. miejsce', FINAL: 'FINAŁ',
};

const WC_KNOCKOUT_DAYS = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 29, 30];

function getTeamGradient(wcState: WCState, home: string, away: string): string {
  const ht = wcState.teams.find(t => t.name === home);
  const at = wcState.teams.find(t => t.name === away);
  const hc = ht?.colors?.[0] ?? '#334155';
  const ac = at?.colors?.[0] ?? '#334155';
  return `linear-gradient(to right, ${hc}2e 0%, transparent 42%, transparent 58%, ${ac}2e 100%)`;
}

function filterGoals(goals: MatchGoalEntry[] | undefined, teamName: string, nationalTeams: NationalTeam[]): MatchGoalEntry[] {
  if (!goals) return [];
  const nt = nationalTeams.find(t => t.name === teamName);
  return goals.filter(g => g.teamId === nt?.id || g.teamId === teamName);
}

function filterCards(cards: MatchCardEntry[] | undefined, teamName: string, nationalTeams: NationalTeam[]): MatchCardEntry[] {
  if (!cards) return [];
  const nt = nationalTeams.find(t => t.name === teamName);
  return cards.filter(c => c.teamId === nt?.id || c.teamId === teamName);
}

interface WCMatchRowProps {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  goals?: MatchGoalEntry[];
  cards?: MatchCardEntry[];
  metaLabel?: string;
  wcState: WCState;
  nationalTeams: NationalTeam[];
}

type TournamentReportMatch = {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  date: string;
  label: string;
  goals?: MatchGoalEntry[];
  cards?: MatchCardEntry[];
  homeGoalsAET?: number;
  awayGoalsAET?: number;
  homePenalties?: number;
  awayPenalties?: number;
  wentToET?: boolean;
  wentToPenalties?: boolean;
  winner?: string;
};

function WCMatchRow({ home, away, homeGoals, awayGoals, goals, cards, metaLabel, wcState, nationalTeams }: WCMatchRowProps) {
  const gradient = getTeamGradient(wcState, home, away);
  const homeGoalsList = filterGoals(goals, home, nationalTeams);
  const awayGoalsList = filterGoals(goals, away, nationalTeams);
  const homeCardsList = filterCards(cards, home, nationalTeams);
  const awayCardsList = filterCards(cards, away, nationalTeams);
  const isDraw = homeGoals === awayGoals;
  const scoreColor = isDraw ? 'text-slate-200' : 'text-white';
  const hasEvents = homeGoalsList.length > 0 || awayGoalsList.length > 0 || homeCardsList.length > 0 || awayCardsList.length > 0;

  return (
    <div
      className="px-8 py-4 rounded-2xl mb-3 border border-white/[0.08] transition-all"
      style={{ background: gradient }}
    >
      {metaLabel && (
        <div className="mb-4 flex justify-center">
          <div className="max-w-full rounded-xl border border-white/10 bg-slate-950/85 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
            {metaLabel}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <span className={`inline-flex items-center justify-end gap-2 ${HEADING_FONT} text-3xl text-white`}>
            <NTStyleFlag name={home} />
            <span>{home}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 mx-8 min-w-[120px] justify-center">
          <span className={`text-2xl font-black tabular-nums ${scoreColor}`}>{homeGoals}</span>
          <span className="text-slate-500 text-xl font-black">:</span>
          <span className={`text-2xl font-black tabular-nums ${scoreColor}`}>{awayGoals}</span>
        </div>

        <div className="flex-1 text-left">
          <span className={`inline-flex items-center justify-start gap-2 ${HEADING_FONT} text-3xl text-white`}>
            <span>{away}</span>
            <NTStyleFlag name={away} />
          </span>
        </div>
      </div>

      {hasEvents && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
          {(homeGoalsList.length > 0 || awayGoalsList.length > 0) && (
            <div className="flex items-start">
              <div className="flex-1 flex flex-col items-end gap-0.5">
                {homeGoalsList.map((g, i) => (
                  <div key={i} className="text-[12px] text-slate-300 flex items-center justify-end gap-1.5">
                    <span>{g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}</span>
                    <span className="text-emerald-300 text-[13px]">⚽</span>
                  </div>
                ))}
              </div>
              <div className="min-w-[120px] mx-8 shrink-0" />
              <div className="flex-1 flex flex-col items-start gap-0.5">
                {awayGoalsList.map((g, i) => (
                  <div key={i} className="text-[12px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-emerald-300 text-[13px]">⚽</span>
                    <span>{g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(homeCardsList.length > 0 || awayCardsList.length > 0) && (
            <div className="flex items-start">
              <div className="flex-1 flex flex-col items-end gap-0.5">
                {homeCardsList.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center justify-end gap-1.5">
                    <span>{c.type === 'SECOND_YELLOW' ? `${c.minute}' ${c.playerName} (2. żółta)` : `${c.minute}' ${c.playerName}`}</span>
                    <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                  </div>
                ))}
              </div>
              <div className="min-w-[120px] mx-8 shrink-0" />
              <div className="flex-1 flex flex-col items-start gap-0.5">
                {awayCardsList.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                    <span>{c.type === 'SECOND_YELLOW' ? `${c.minute}' ${c.playerName} (2. żółta)` : `${c.minute}' ${c.playerName}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WCGroupMatchResultRow({ home, away, homeGoals, awayGoals, onClick }: Pick<WCMatchRowProps, 'home' | 'away' | 'homeGoals' | 'awayGoals'> & { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-2 border-b border-white/[0.06] px-1 py-2 text-left transition-colors last:border-b-0 hover:bg-white/[0.05]"
    >
      <div className="min-w-0 flex items-center gap-2">
        <SmallFlag name={home} />
        <span className="text-xs font-bold leading-tight text-white/85">{home}</span>
      </div>

      <div className="px-2 py-1 text-center text-sm font-black tabular-nums text-white">
        {homeGoals} : {awayGoals}
      </div>

      <div className="min-w-0 flex items-center justify-end gap-2 text-right">
        <span className="text-xs font-bold leading-tight text-white/85">{away}</span>
        <SmallFlag name={away} />
      </div>
    </button>
  );
}

function WCGroupResults({ group, onOpenReport }: { group: WCGroup; onOpenReport: (match: TournamentReportMatch) => void }) {
  const matchesByDate = group.matches.reduce<Record<string, WCGroup['matches']>>((acc, match) => {
    if (!acc[match.date]) acc[match.date] = [];
    acc[match.date].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(matchesByDate).map(([date, matches]) => (
        <div key={date}>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-300/90">
            {date}
          </div>
          <div className="space-y-1.5">
            {matches.map((m, idx) => (
              <WCGroupMatchResultRow
                key={`${date}-${idx}`}
                home={m.home}
                away={m.away}
                homeGoals={m.homeGoals}
                awayGoals={m.awayGoals}
                onClick={() => onOpenReport({
                  home: m.home,
                  away: m.away,
                  homeGoals: m.homeGoals,
                  awayGoals: m.awayGoals,
                  date: m.date,
                  label: `Grupa ${group.label}`,
                  goals: m.goals,
                  cards: m.cards,
                })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface WCKOMatchRowProps {
  m: WCKnockoutMatch;
  wcState: WCState;
  nationalTeams: NationalTeam[];
  onOpenReport?: (match: TournamentReportMatch) => void;
}

function WCKOMatchRow({ m, wcState, nationalTeams, onOpenReport }: WCKOMatchRowProps) {
  if (!m.home || !m.away) {
    return (
      <div className="px-8 py-4 rounded-2xl mb-3 border border-white/[0.06] bg-white/[0.03] flex items-center justify-center">
        <span className="text-white/30 text-sm font-bold">TBD — TBD</span>
      </div>
    );
  }

  if (!m.winner) {
    return (
      <div className="px-8 py-4 rounded-2xl mb-3 border border-white/[0.06] bg-white/[0.03]"
        style={{ background: getTeamGradient(wcState, m.home, m.away) }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <span className={`inline-flex items-center justify-end gap-2 ${HEADING_FONT} text-2xl text-white/60`}>
              <NTStyleFlag name={m.home} />
              <span>{m.home}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mx-8 min-w-[120px] justify-center">
            <span className="text-white/30 text-xl font-black">— : —</span>
          </div>
          <div className="flex-1 text-left">
            <span className={`inline-flex items-center justify-start gap-2 ${HEADING_FONT} text-2xl text-white/60`}>
              <span>{m.away}</span>
              <NTStyleFlag name={m.away} />
            </span>
          </div>
        </div>
      </div>
    );
  }

  const homeWon = m.winner === m.home;
  const awayWon = m.winner === m.away;

  const mainScore = `${m.homeGoals ?? 0} : ${m.awayGoals ?? 0}`;
  const etScore = m.wentToET ? `(${m.homeGoalsAET ?? 0}:${m.awayGoalsAET ?? 0} d.)` : null;
  const penScore = m.wentToPenalties ? `(${m.homePenalties ?? 0}:${m.awayPenalties ?? 0} k.)` : null;

  const roundLabel = ROUND_LABEL[m.round] ?? m.round;
  const gradient = getTeamGradient(wcState, m.home, m.away);
  const homeGoalsList = filterGoals(m.goals, m.home, nationalTeams);
  const awayGoalsList = filterGoals(m.goals, m.away, nationalTeams);
  const homeCardsList = filterCards(m.cards, m.home, nationalTeams);
  const awayCardsList = filterCards(m.cards, m.away, nationalTeams);
  const hasEvents = homeGoalsList.length > 0 || awayGoalsList.length > 0 || homeCardsList.length > 0 || awayCardsList.length > 0;

  return (
    <button
      type="button"
      onClick={() => onOpenReport?.({
        home: m.home as string,
        away: m.away as string,
        homeGoals: m.homeGoals ?? 0,
        awayGoals: m.awayGoals ?? 0,
        date: m.date,
        label: ROUND_LABEL[m.round] ?? m.round,
        goals: m.goals,
        cards: m.cards,
        homeGoalsAET: m.homeGoalsAET,
        awayGoalsAET: m.awayGoalsAET,
        homePenalties: m.homePenalties,
        awayPenalties: m.awayPenalties,
        wentToET: m.wentToET,
        wentToPenalties: m.wentToPenalties,
        winner: m.winner,
      })}
      className="w-full px-8 py-4 rounded-2xl mb-3 border border-white/[0.08] text-left transition-all hover:border-white/20 hover:brightness-110"
      style={{ background: gradient }}
    >
      <div className="mb-4 flex justify-center">
        <div className="max-w-full rounded-xl border border-white/10 bg-slate-950/85 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          {roundLabel} · {m.date}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex-1 text-right ${homeWon ? 'opacity-100' : 'opacity-50'}`}>
          <span className={`inline-flex items-center justify-end gap-2 ${HEADING_FONT} text-3xl text-white`}>
            <NTStyleFlag name={m.home} />
            <span>{m.home}</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 mx-8 min-w-[140px] justify-center">
          <span className="text-2xl font-black text-white tabular-nums">{mainScore}</span>
          {(etScore || penScore) && (
            <span className="text-xs font-bold tabular-nums flex gap-1">
              {etScore && <span className="text-amber-400">{etScore}</span>}
              {penScore && <span className="text-cyan-400">{penScore}</span>}
            </span>
          )}
        </div>

        <div className={`flex-1 text-left ${awayWon ? 'opacity-100' : 'opacity-50'}`}>
          <span className={`inline-flex items-center justify-start gap-2 ${HEADING_FONT} text-3xl text-white`}>
            <span>{m.away}</span>
            <NTStyleFlag name={m.away} />
          </span>
        </div>
      </div>

      {hasEvents && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
          {(homeGoalsList.length > 0 || awayGoalsList.length > 0) && (
            <div className="flex items-start">
              <div className="flex-1 flex flex-col items-end gap-0.5">
                {homeGoalsList.map((g, i) => (
                  <div key={i} className="text-[12px] text-slate-300 flex items-center justify-end gap-1.5">
                    <span>{g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}</span>
                    <span className="text-emerald-300 text-[13px]">⚽</span>
                  </div>
                ))}
              </div>
              <div className="min-w-[140px] mx-8 shrink-0" />
              <div className="flex-1 flex flex-col items-start gap-0.5">
                {awayGoalsList.map((g, i) => (
                  <div key={i} className="text-[12px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-emerald-300 text-[13px]">⚽</span>
                    <span>{g.minute}' {g.playerName}{g.isPenalty ? ' (k.)' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(homeCardsList.length > 0 || awayCardsList.length > 0) && (
            <div className="flex items-start">
              <div className="flex-1 flex flex-col items-end gap-0.5">
                {homeCardsList.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center justify-end gap-1.5">
                    <span>{c.type === 'SECOND_YELLOW' ? `${c.minute}' ${c.playerName} (2. żółta)` : `${c.minute}' ${c.playerName}`}</span>
                    <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                  </div>
                ))}
              </div>
              <div className="min-w-[140px] mx-8 shrink-0" />
              <div className="flex-1 flex flex-col items-start gap-0.5">
                {awayCardsList.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                    <span>{c.type === 'SECOND_YELLOW' ? `${c.minute}' ${c.playerName} (2. żółta)` : `${c.minute}' ${c.playerName}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

function TournamentMatchReportModal({ match, nationalTeams, onClose }: { match: TournamentReportMatch; nationalTeams: NationalTeam[]; onClose: () => void }) {
  const homeGoals = filterGoals(match.goals, match.home, nationalTeams);
  const awayGoals = filterGoals(match.goals, match.away, nationalTeams);
  const homeCards = filterCards(match.cards, match.home, nationalTeams);
  const awayCards = filterCards(match.cards, match.away, nationalTeams);
  const hasDetails = homeGoals.length > 0 || awayGoals.length > 0 || homeCards.length > 0 || awayCards.length > 0;
  const extraLabel = match.wentToPenalties
    ? `Karne ${match.homePenalties ?? 0}:${match.awayPenalties ?? 0}`
    : match.wentToET
      ? `Po dogrywce ${match.homeGoalsAET ?? 0}:${match.awayGoalsAET ?? 0}`
      : null;

  const EventList = ({ title, goals, cards }: { title: string; goals: MatchGoalEntry[]; cards: MatchCardEntry[] }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className={`${HEADING_FONT} mb-3 text-sm text-white`}>{title}</div>
      <div className="space-y-2">
        {goals.map((goal, index) => (
          <div key={`g-${index}`} className="flex items-center justify-between gap-3 text-xs text-slate-200">
            <span>{goal.playerName}{goal.isPenalty ? ' (k.)' : ''}</span>
            <span className="font-black text-emerald-300">{goal.minute}' GOL</span>
          </div>
        ))}
        {cards.map((card, index) => (
          <div key={`c-${index}`} className="flex items-center justify-between gap-3 text-xs text-slate-300">
            <span>{card.playerName}</span>
            <span className={`font-black ${card.type === 'YELLOW' ? 'text-yellow-300' : 'text-red-300'}`}>
              {card.minute}' {card.type === 'YELLOW' ? 'ŻÓŁTA' : card.type === 'SECOND_YELLOW' ? 'DRUGA ŻÓŁTA' : 'CZERWONA'}
            </span>
          </div>
        ))}
        {goals.length === 0 && cards.length === 0 && (
          <div className="text-xs font-bold text-slate-500">Brak zdarzeń po tej stronie.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/15 bg-slate-950 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)]" onClick={event => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">{match.label} · {match.date}</div>
            <div className={`${HEADING_FONT} mt-1 text-3xl text-white`}>Raport meczowy</div>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white">×</button>
        </div>

        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex min-w-0 items-center justify-end gap-3 text-right">
            <span className={`${HEADING_FONT} truncate text-2xl text-white`}>{match.home}</span>
            <NTStyleFlag name={match.home} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-black tabular-nums text-white">{match.homeGoals} : {match.awayGoals}</div>
            {extraLabel && <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-200">{extraLabel}</div>}
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <NTStyleFlag name={match.away} />
            <span className={`${HEADING_FONT} truncate text-2xl text-white`}>{match.away}</span>
          </div>
        </div>

        {match.winner && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-emerald-200">
            Awans / zwycięzca: {match.winner}
          </div>
        )}

        {hasDetails ? (
          <div className="grid gap-4 md:grid-cols-2">
            <EventList title={match.home} goals={homeGoals} cards={homeCards} />
            <EventList title={match.away} goals={awayGoals} cards={awayCards} />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm font-bold text-slate-400">
            Raport nie ma szczegółowych zdarzeń dla tego meczu.
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, wcState, nationalTeams, onOpenReport }: { group: WCGroup; wcState: WCState; nationalTeams: NationalTeam[]; onOpenReport: (match: TournamentReportMatch) => void }) {
  const standings = computeGroupStandings(group);
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3">
      <div className="relative flex flex-col items-center mb-1">
        <div className="relative w-full flex justify-center py-1 overflow-hidden rounded-lg">
          <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to right, transparent 0%, #f59e0b 25%, #ffffff 50%, #f59e0b 75%, transparent 100%)' }} />
          <p className="text-lg font-black italic uppercase tracking-tighter text-white text-center relative z-10">Grupa {group.label}</p>
        </div>
        <div className="w-full h-[2px] rounded-full opacity-60" style={{ background: 'linear-gradient(to right, transparent 0%, #f59e0b 20%, #ffffff 50%, #f59e0b 80%, transparent 100%)' }} />
      </div>

      <table className="w-full text-xs text-white/80">
        <thead>
          <tr className="text-white/40 text-[10px] uppercase">
            <th className="text-left pb-1 pl-1">Drużyna</th>
            <th className="w-6 text-center">M</th>
            <th className="w-6 text-center">W</th>
            <th className="w-6 text-center">R</th>
            <th className="w-6 text-center">P</th>
            <th className="w-10 text-center">Gole</th>
            <th className="w-7 text-center font-bold text-white/60">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.name} className={`border-t border-white/[0.04] ${i < 2 ? 'bg-amber-400/15 shadow-[inset_3px_0_0_rgba(251,191,36,0.85)]' : 'opacity-60'}`}>
              <td className="py-0.5 pl-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className={`text-[10px] w-3 text-center font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-white/30'}`}>{i + 1}</span>
                  <SmallFlag name={s.name} />
                  <span className="min-w-0 text-[11px] leading-tight">{s.name}</span>
                </div>
              </td>
              <td className="text-center">{s.M}</td>
              <td className="text-center">{s.W}</td>
              <td className="text-center">{s.D}</td>
              <td className="text-center">{s.L}</td>
              <td className="text-center">{s.GF}:{s.GA}</td>
              <td className="text-center font-bold text-white">{s.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {group.matches.length > 0 && (
        <div className="mt-1">
          <div className="h-px bg-white/10 mb-3" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Wyniki</p>
          <WCGroupResults group={group} onOpenReport={onOpenReport} />
          {false && (
          <div>
            {group.matches.map((m, idx) => (
              <WCMatchRow
                key={idx}
                home={m.home}
                away={m.away}
                homeGoals={m.homeGoals}
                awayGoals={m.awayGoals}
                goals={m.goals}
                cards={m.cards}
                metaLabel={`Grupa ${group.label} · ${m.date}`}
                wcState={wcState}
                nationalTeams={nationalTeams}
              />
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function BracketTab({ wcState, nationalTeams, onOpenReport }: { wcState: WCState; nationalTeams: NationalTeam[]; onOpenReport: (match: TournamentReportMatch) => void }) {
  const rounds: Array<'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL'> = ['R32', 'R16', 'QF', 'SF', 'THIRD', 'FINAL'];
  return (
    <div className="flex flex-col gap-8">
      {rounds.map(round => {
        const matches = wcState.knockoutMatches.filter(m => m.round === round);
        if (matches.length === 0) return null;
        return (
          <div key={round}>
            <div className="relative flex flex-col items-center mb-4">
              <div className="relative w-full flex justify-center py-1 overflow-hidden rounded-lg">
                <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to right, transparent 0%, #f59e0b 25%, #ffffff 50%, #f59e0b 75%, transparent 100%)' }} />
                <p className="text-xl font-black italic uppercase tracking-tighter text-white text-center relative z-10">{ROUND_LABEL[round]}</p>
              </div>
              <div className="w-full h-[2px] rounded-full opacity-60" style={{ background: 'linear-gradient(to right, transparent 0%, #f59e0b 20%, #ffffff 50%, #f59e0b 80%, transparent 100%)' }} />
            </div>
            <div>
              {matches.map(m => <WCKOMatchRow key={m.id} m={m} wcState={wcState} nationalTeams={nationalTeams} onOpenReport={onOpenReport} />)}
            </div>
          </div>
        );
      })}
      {wcState.knockoutMatches.length === 0 && (
        <div className="text-white/40 text-sm text-center py-8">Faza grupowa w toku — drabinka zostanie wygenerowana po jej zakończeniu.</div>
      )}
    </div>
  );
}

function FinalTab({ wcState, nationalTeams, onOpenReport }: { wcState: WCState; nationalTeams: NationalTeam[]; onOpenReport: (match: TournamentReportMatch) => void }) {
  const finalMatch = wcState.knockoutMatches.find(m => m.round === 'FINAL');
  const thirdMatch = wcState.knockoutMatches.find(m => m.round === 'THIRD');

  if (!finalMatch) {
    return <div className="text-white/40 text-sm text-center py-12">Finał zostanie rozegrany 30 czerwca.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {wcState.champion && (
        <div className="text-center py-4">
          <div className="text-xs text-amber-400 uppercase tracking-widest mb-2">Mistrz Świata</div>
          <div className="flex items-center justify-center gap-3">
            <NTStyleFlag name={wcState.champion} />
            <span className={`${HEADING_FONT} text-4xl text-amber-300`}>{wcState.champion}</span>
            <NTStyleFlag name={wcState.champion} />
          </div>
        </div>
      )}
      <div>
        <WCKOMatchRow m={finalMatch} wcState={wcState} nationalTeams={nationalTeams} onOpenReport={onOpenReport} />
      </div>
      {thirdMatch && thirdMatch.winner && (
        <div>
          <WCKOMatchRow m={thirdMatch} wcState={wcState} nationalTeams={nationalTeams} onOpenReport={onOpenReport} />
          {wcState.thirdPlace && (
            <div className="text-center text-xs text-white/60 mt-1">3. miejsce: <span className="text-white font-bold">{wcState.thirdPlace}</span></div>
          )}
        </div>
      )}
    </div>
  );
}

interface PlayerStatRow {
  playerId?: string;
  playerName: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

function buildPlayerStats(wcState: WCState): PlayerStatRow[] {
  const map = new Map<string, PlayerStatRow>();
  const key = (g: MatchGoalEntry | MatchCardEntry) => g.playerId ?? g.playerName;

  const allGroupGoals: MatchGoalEntry[] = wcState.groups.flatMap(g => g.matches.flatMap(m => m.goals ?? []));
  const allGroupCards: MatchCardEntry[] = wcState.groups.flatMap(g => g.matches.flatMap(m => m.cards ?? []));
  const allKOGoals: MatchGoalEntry[] = wcState.knockoutMatches.flatMap(m => m.goals ?? []);
  const allKOCards: MatchCardEntry[] = wcState.knockoutMatches.flatMap(m => m.cards ?? []);

  const allGoals = [...allGroupGoals, ...allKOGoals];
  const allCards = [...allGroupCards, ...allKOCards];

  for (const g of allGoals) {
    const k = key(g);
    if (!map.has(k)) map.set(k, { playerId: g.playerId, playerName: g.playerName, teamId: g.teamId, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
    map.get(k)!.goals += 1;
    if (g.assistantId || g.assistantName) {
      const ak = g.assistantId ?? g.assistantName!;
      if (!map.has(ak)) map.set(ak, { playerId: g.assistantId, playerName: g.assistantName!, teamId: g.teamId, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
      map.get(ak)!.assists += 1;
    }
  }
  for (const c of allCards) {
    const k = key(c);
    if (!map.has(k)) map.set(k, { playerId: c.playerId, playerName: c.playerName, teamId: c.teamId, goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
    if (c.type === 'YELLOW') map.get(k)!.yellowCards += 1;
    else if (c.type === 'RED' || c.type === 'SECOND_YELLOW') map.get(k)!.redCards += 1;
  }

  return Array.from(map.values());
}

function StatystykiTab({ wcState, nationalTeams }: { wcState: WCState; nationalTeams: NationalTeam[] }) {
  const stats = useMemo(() => buildPlayerStats(wcState), [wcState]);

  const getTeamName = (teamId: string): string => {
    const nt = nationalTeams.find(t => t.id === teamId);
    return nt?.name ?? teamId;
  };

  const topScorers = [...stats].filter(s => s.goals > 0).sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 15);
  const topAssists = [...stats].filter(s => s.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 15);
  const topCards = [...stats].filter(s => s.yellowCards + s.redCards > 0).sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2)).slice(0, 15);

  if (stats.length === 0) {
    return <div className="text-white/40 text-sm text-center py-12">Brak danych — mecze jeszcze się nie odbyły lub nie zawierają szczegółów.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">⚽ Klasyfikacja strzelców</div>
        <div className="flex flex-col gap-1">
          {topScorers.map((s, i) => (
            <div key={s.playerId ?? s.playerName} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.05]">
              <span className={`text-[10px] w-4 text-center font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/30'}`}>{i + 1}</span>
              <SmallFlag name={getTeamName(s.teamId)} />
              <span className="text-xs text-white flex-1 truncate">{s.playerName}</span>
              <span className="text-xs font-bold text-amber-300 w-4 text-center">{s.goals}</span>
              {s.assists > 0 && <span className="text-[9px] text-white/40">({s.assists}a)</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">🎯 Klasyfikacja asyst</div>
        <div className="flex flex-col gap-1">
          {topAssists.map((s, i) => (
            <div key={s.playerId ?? s.playerName} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.05]">
              <span className={`text-[10px] w-4 text-center font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/30'}`}>{i + 1}</span>
              <SmallFlag name={getTeamName(s.teamId)} />
              <span className="text-xs text-white flex-1 truncate">{s.playerName}</span>
              <span className="text-xs font-bold text-sky-300 w-4 text-center">{s.assists}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">🟨 Klasyfikacja kartek</div>
        <div className="flex flex-col gap-1">
          {topCards.map((s, i) => (
            <div key={s.playerId ?? s.playerName} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.05]">
              <span className={`text-[10px] w-4 text-center font-bold ${i === 0 ? 'text-amber-400' : 'text-white/30'}`}>{i + 1}</span>
              <SmallFlag name={getTeamName(s.teamId)} />
              <span className="text-xs text-white flex-1 truncate">{s.playerName}</span>
              <div className="flex items-center gap-1">
                {s.yellowCards > 0 && <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded">{s.yellowCards}🟨</span>}
                {s.redCards > 0 && <span className="text-[9px] bg-red-500/20 text-red-300 px-1 rounded">{s.redCards}🟥</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const WorldCupView: React.FC<{ mode?: 'world' | 'euro' }> = ({ mode = 'world' }) => {
  const { currentDate, wcState, setWcState, euroState, setEuroState, navigateTo, matchSimulationSeed, nationalTeams, players, setPlayers, coaches } = useGame();
  const { runWithProcessing } = useProcessing();
  const [activeTab, setActiveTab] = useState<Tab>('grupy');
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [selectedReportMatch, setSelectedReportMatch] = useState<TournamentReportMatch | null>(null);
  const isEuro = mode === 'euro';
  const tournamentState = isEuro ? euroState : wcState;
  const setTournamentState = isEuro ? setEuroState : setWcState;
  const title = isEuro ? 'Mistrzostwa Europy' : 'Mistrzostwa Świata';
  const emptyText = isEuro ? 'Mistrzostwa Europy jeszcze się nie rozpoczęły.' : 'Mistrzostwa Świata jeszcze się nie rozpoczęły.';
  const championLabel = isEuro ? 'Mistrz Europy' : 'Mistrz';
  const tournamentMeta = isEuro ? '24 drużyny · 6 grup' : '48 drużyn · 12 grup';
  const knockoutDays = isEuro ? EuroTournamentService.KNOCKOUT_DAYS : WC_KNOCKOUT_DAYS;

  if (!tournamentState) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center gap-4"
        style={{ backgroundImage: `url(${wcBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="text-white/60 text-lg font-bold">{emptyText}</div>
        <button
          className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all"
          onClick={() => navigateTo(ViewState.DASHBOARD)}
        >Powrót</button>
      </div>
    );
  }

  const tournamentStarted = currentDate >= new Date(tournamentState.year, 5, isEuro ? 1 : 2);

  if (!isEuro && tournamentState.drawComplete && !tournamentState.groupStageComplete && !tournamentStarted) {
    navigateTo(ViewState.WC_DRAW);
    return null;
  }

  const handleSkipToFinal = () => {
    if (!skipConfirm) { setSkipConfirm(true); return; }
    void runWithProcessing(
      () => {
        const result = isEuro
          ? EuroTournamentService.simulateFullTournament(tournamentState, matchSimulationSeed, nationalTeams, players, coaches)
          : WorldCupService.simulateFullTournament(tournamentState, matchSimulationSeed, nationalTeams, players, coaches);
        setTournamentState(result.state);
        if (result.updatedPlayers) setPlayers(result.updatedPlayers);
        setActiveTab('final');
        setSkipConfirm(false);
      },
      {
        status: `Symuluję cały turniej ${title.toLowerCase()}`,
      }
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'grupy', label: 'Grupy' },
    { id: 'drabinka', label: 'Drabinka' },
    { id: 'final', label: 'Finał' },
    { id: 'statystyki', label: 'Statystyki' },
  ];

  const canSkip = !tournamentState.knockoutComplete;

  useEffect(() => {
    if (!tournamentState.groupStageComplete || tournamentState.knockoutComplete) return;

    const currentDayKey = Number(`${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`);
    let healedState = tournamentState;
    let healedPlayers = players;
    let changed = false;

    for (const koDay of knockoutDays) {
      const koDayKey = Number(`${tournamentState.year}06${String(koDay).padStart(2, '0')}`);
      if (koDayKey > currentDayKey) continue;

      const date = `${tournamentState.year}-06-${String(koDay).padStart(2, '0')}`;
      const hasUnplayedDueMatch = healedState.knockoutMatches.some(m => m.date === date && !m.winner && m.home && m.away);
      if (!hasUnplayedDueMatch) continue;

      const knockoutSimulation = isEuro
        ? EuroTournamentService.simulateKnockoutDay(healedState, healedState.teams, koDay, 6, healedState.year, matchSimulationSeed, nationalTeams, healedPlayers, coaches)
        : WorldCupService.simulateKnockoutDay(healedState, healedState.teams, koDay, 6, healedState.year, matchSimulationSeed, nationalTeams, healedPlayers, coaches);
      healedPlayers = knockoutSimulation.updatedPlayers ?? healedPlayers;
      healedState = {
        ...healedState,
        knockoutMatches: knockoutSimulation.matches,
      };
      changed = true;
    }

    const finalMatch = healedState.knockoutMatches.find(m => m.round === 'FINAL' && m.winner);
    if (finalMatch) {
      const thirdMatch = healedState.knockoutMatches.find(m => m.round === 'THIRD');
      healedState = {
        ...healedState,
        knockoutComplete: true,
        champion: finalMatch.winner ?? undefined,
        runnerUp: finalMatch.winner === finalMatch.home ? finalMatch.away : finalMatch.home,
        thirdPlace: thirdMatch?.winner ?? undefined,
        fourthPlace: thirdMatch?.winner === thirdMatch?.home ? thirdMatch?.away : thirdMatch?.home,
      };
      changed = true;
    }

    if (changed) {
      setTournamentState(healedState);
      setPlayers(healedPlayers);
    }
  }, [coaches, currentDate, isEuro, knockoutDays, nationalTeams, players, matchSimulationSeed, setPlayers, setTournamentState, tournamentState]);

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{ backgroundImage: `url(${wcBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
      <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 px-4 py-6 max-w-5xl mx-auto w-full">

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`${HEADING_FONT} text-4xl text-white`}>
              {title}
              <span className="text-amber-400 ml-3">{tournamentState.year}</span>
            </div>
            {tournamentState.champion && (
              <div className="text-sm text-amber-300 mt-1 flex items-center gap-2">
                <NTStyleFlag name={tournamentState.champion} />
                {championLabel}: <span className="font-bold">{tournamentState.champion}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canSkip && (
              <button
                className={`hidden ${BTN_FONT} text-xs px-5 py-2.5 rounded-2xl transition-all ${
                  skipConfirm
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-white/10 text-amber-300 border border-amber-400/30 hover:bg-white/20'
                }`}
                onClick={handleSkipToFinal}
              >
                {skipConfirm ? 'Potwierdź →' : 'Skocz do Finału'}
              </button>
            )}
            <button
              className={`${BTN_FONT} text-xs px-5 py-2.5 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all`}
              onClick={() => navigateTo(ViewState.DASHBOARD)}
            >Powrót</button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 text-xs text-white/50">
          <span className={tournamentState.groupStageComplete ? 'text-green-400' : 'text-amber-400'}>
            {tournamentState.groupStageComplete ? '✓ Faza grupowa zakończona' : '⏳ Faza grupowa w toku'}
          </span>
          {tournamentState.groupStageComplete && (
            <span className={tournamentState.knockoutComplete ? 'text-green-400' : 'text-amber-400'}>
              {tournamentState.knockoutComplete ? '✓ Turniej zakończony' : '⏳ Faza pucharowa w toku'}
            </span>
          )}
          <span className="ml-auto">{tournamentMeta}</span>
        </div>

        <div className="flex gap-2 mb-5">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${BTN_FONT} text-xs px-6 py-2.5 rounded-2xl transition-all ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white/[0.07] text-white/70 border border-white/10 hover:bg-white/[0.12]'
              }`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        <div className={`${GLASS_CARD} flex-1 p-6`}>
          <div className={GLOSS_LAYER} />
          <div className="relative z-10">

            {activeTab === 'grupy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournamentState.groups.map(g => (
                  <GroupCard key={g.label} group={g} wcState={tournamentState} nationalTeams={nationalTeams} onOpenReport={setSelectedReportMatch} />
                ))}
              </div>
            )}

            {activeTab === 'drabinka' && <BracketTab wcState={tournamentState} nationalTeams={nationalTeams} onOpenReport={setSelectedReportMatch} />}

            {activeTab === 'final' && <FinalTab wcState={tournamentState} nationalTeams={nationalTeams} onOpenReport={setSelectedReportMatch} />}

            {activeTab === 'statystyki' && <StatystykiTab wcState={tournamentState} nationalTeams={nationalTeams} />}

          </div>
        </div>

      </div>

      {selectedReportMatch && (
        <TournamentMatchReportModal
          match={selectedReportMatch}
          nationalTeams={nationalTeams}
          onClose={() => setSelectedReportMatch(null)}
        />
      )}
    </div>
  );
};

export default WorldCupView;
