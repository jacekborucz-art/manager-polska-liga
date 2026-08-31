import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import type {
  Player,
  UserCoachInstructionId,
  UserCoachShoutId,
} from '../../../types';
import type { CupTeamInput, CupTeamSide } from '../../../services/match/engines/cupV2';
import type {
  MatchEngineV2Snapshot,
  MatchEngineV2TacticalPatch,
} from '../../../services/match/engines/v2';

type OverlayButtonProps = {
  x: number;
  y: number;
  width: number;
  height?: number;
  label: string;
  active?: boolean;
  disabled?: boolean;
  accent?: string;
  onActivate?: () => void;
};

const OverlayButton = ({
  x,
  y,
  width,
  height = 50,
  label,
  active = false,
  disabled = false,
  accent = '#38bdf8',
  onActivate,
}: OverlayButtonProps) => {
  const activate = () => {
    if (!disabled) onActivate?.();
  };
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    activate();
  };
  return (
    <g
      role="button"
      tabIndex={disabled || !onActivate ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      onClick={activate}
      onKeyDown={handleKeyDown}
      className={disabled ? 'cursor-not-allowed' : 'cursor-pointer outline-none'}
      opacity={disabled ? 0.35 : 1}
    >
      <rect x={x} y={y} width={width} height={height} rx="10" fill={active ? `${accent}25` : '#0a1425'} stroke={active ? accent : '#30415d'} strokeWidth={active ? 2 : 1} />
      <path d={`M ${x + 12} ${y + 6} H ${x + width - 12}`} stroke={active ? accent : '#ffffff'} strokeOpacity="0.25" />
      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill={active ? '#ffffff' : '#cbd5e1'} fontSize="11" className="font-black italic uppercase tracking-tighter">
        {label}
      </text>
    </g>
  );
};

const OverlayShell = ({
  title,
  subtitle,
  accent,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#01050d]/95 backdrop-blur-md">
    <svg viewBox="0 0 1600 920" preserveAspectRatio="xMidYMid meet" className="h-full w-full max-h-[96vh] max-w-[96vw]" role="dialog" aria-label={title}>
      <defs>
        <linearGradient id="v2-control-overlay-background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d1b31" />
          <stop offset="0.55" stopColor="#050b16" />
          <stop offset="1" stopColor="#0b1728" />
        </linearGradient>
        <pattern id="v2-control-overlay-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#7dd3fc" strokeOpacity="0.045" />
        </pattern>
        <filter id="v2-control-overlay-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="20" stdDeviation="24" floodColor="#000000" floodOpacity="0.75" />
        </filter>
      </defs>
      <rect x="30" y="24" width="1540" height="872" rx="26" fill="url(#v2-control-overlay-background)" stroke={accent} strokeOpacity="0.42" filter="url(#v2-control-overlay-shadow)" />
      <rect x="30" y="24" width="1540" height="872" rx="26" fill="url(#v2-control-overlay-grid)" />
      <path d="M 30 135 H 1570" stroke={accent} strokeOpacity="0.38" />
      <rect x="62" y="50" width="8" height="58" rx="4" fill={accent} />
      <text x="92" y="78" fill="#ffffff" fontSize="29" className="font-black italic uppercase tracking-tighter">{title}</text>
      <text x="92" y="103" fill={accent} fontSize="11" className="font-black italic uppercase tracking-tighter">{subtitle}</text>
      <OverlayButton x={1405} y={55} width={125} label="ZAMKNIJ" accent={accent} onActivate={onClose} />
      {children}
    </svg>
  </div>
);

type TacticalKey = 'tempo' | 'mindset' | 'intensity' | 'passing' | 'pressing' | 'counterAttack' | 'marking';
type TacticalOption = { value: string; label: string };
type TacticalGroup = { key: TacticalKey; label: string; description: string; options: TacticalOption[] };

const TACTICAL_GROUPS: TacticalGroup[] = [
  { key: 'tempo', label: 'TEMPO GRY', description: 'Szybkość budowania akcji', options: [{ value: 'SLOW', label: 'WOLNE' }, { value: 'NORMAL', label: 'NORMALNE' }, { value: 'FAST', label: 'SZYBKIE' }] },
  { key: 'mindset', label: 'NASTAWIENIE', description: 'Poziom ryzyka całej drużyny', options: [{ value: 'DEFENSIVE', label: 'DEFENSYWNE' }, { value: 'NEUTRAL', label: 'ZRÓWNOWAŻONE' }, { value: 'OFFENSIVE', label: 'OFENSYWNE' }] },
  { key: 'intensity', label: 'INTENSYWNOŚĆ', description: 'Koszt kondycyjny i agresja', options: [{ value: 'CAUTIOUS', label: 'OSTROŻNA' }, { value: 'NORMAL', label: 'NORMALNA' }, { value: 'AGGRESSIVE', label: 'AGRESYWNA' }] },
  { key: 'passing', label: 'PODANIA', description: 'Preferowana długość podań', options: [{ value: 'SHORT', label: 'KRÓTKIE' }, { value: 'MIXED', label: 'MIESZANE' }, { value: 'LONG', label: 'DŁUGIE' }] },
  { key: 'pressing', label: 'PRESSING', description: 'Sposób odbioru piłki', options: [{ value: 'NORMAL', label: 'STANDARDOWY' }, { value: 'PRESSING', label: 'WYSOKI' }] },
  { key: 'counterAttack', label: 'KONTRAATAK', description: 'Reakcja po odzyskaniu piłki', options: [{ value: 'NORMAL', label: 'BEZ PRIORYTETU' }, { value: 'COUNTER', label: 'SZYBKA KONTRA' }] },
  { key: 'marking', label: 'KRYCIE', description: 'Organizacja bez piłki', options: [{ value: 'ZONE', label: 'STREFOWE' }, { value: 'MAN', label: 'INDYWIDUALNE' }, { value: 'NONE', label: 'SWOBODNE' }] },
];

const TOUCHLINE_OPTIONS: Array<{ id: UserCoachInstructionId | null; label: string }> = [
  { id: 'NARROW', label: 'GRAJCIE WĘŻEJ' },
  { id: 'WIDE', label: 'ROZSZERZCIE GRĘ' },
  { id: 'CALM_DOWN', label: 'USPOKÓJCIE GRĘ' },
  { id: 'SPEED_UP', label: 'PRZYSPIESZCIE' },
  { id: 'KEEP_BALL', label: 'UTRZYMAJCIE PIŁKĘ' },
  { id: 'TAKE_RISKS', label: 'RYZYKUJCIE' },
  { id: 'CLOSE_DOWN', label: 'DOSKAKUJCIE' },
  { id: 'DROP_BACK', label: 'COFNIJCIE SIĘ' },
  { id: 'ALL_FORWARD', label: 'WSZYSCY DO ATAKU' },
  { id: 'TIME_WASTE', label: 'GRAJCIE NA CZAS' },
  { id: null, label: 'ODWOŁAJ POLECENIE' },
];

const SHOUT_OPTIONS: Array<{ id: UserCoachShoutId | null; label: string }> = [
  { id: 'MOTIVATE', label: 'ZMOTYWUJ' },
  { id: 'PRAISE', label: 'POCHWAL' },
  { id: 'FOCUS', label: 'SKUPIENIE' },
  { id: 'NO_PANIC', label: 'BEZ PANIKI' },
  { id: 'MORE_EFFORT', label: 'WIĘCEJ WYSIŁKU' },
  { id: 'CALM_EMOTIONS', label: 'SPOKOJNIE' },
  { id: 'DO_BETTER', label: 'STAĆ WAS NA WIĘCEJ' },
  { id: 'DONT_GIVE_UP', label: 'NIE PODDAWAĆ SIĘ' },
  { id: null, label: 'ODWOŁAJ OKRZYK' },
];

export const MatchEngineV2TacticsOverlay = ({
  team,
  coachSummary,
  activeInstructionId,
  activeShoutId,
  statusMessage,
  accent,
  onApplyPatch,
  onIssueInstruction,
  onIssueShout,
  onClose,
}: {
  team: CupTeamInput;
  coachSummary: string;
  activeInstructionId?: UserCoachInstructionId | null;
  activeShoutId?: UserCoachShoutId | null;
  statusMessage?: string | null;
  accent: string;
  onApplyPatch: (patch: MatchEngineV2TacticalPatch) => boolean;
  onIssueInstruction: (instructionId: UserCoachInstructionId | null) => boolean;
  onIssueShout: (shoutId: UserCoachShoutId | null) => boolean;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'TACTICS' | 'TOUCHLINE' | 'SHOUTS'>('TACTICS');
  const [draft, setDraft] = useState<MatchEngineV2TacticalPatch>({
    tempo: team.instructions.tempo,
    mindset: team.instructions.mindset,
    intensity: team.instructions.intensity,
    passing: team.instructions.passing,
    pressing: team.instructions.pressing,
    counterAttack: team.instructions.counterAttack ?? 'NORMAL',
    marking: team.instructions.marking ?? 'ZONE',
  });
  const [selectedInstruction, setSelectedInstruction] = useState<UserCoachInstructionId | null>(activeInstructionId ?? null);
  const [selectedShout, setSelectedShout] = useState<UserCoachShoutId | null>(activeShoutId ?? null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const applyCurrent = () => {
    const accepted = tab === 'TACTICS'
      ? onApplyPatch(draft)
      : tab === 'TOUCHLINE'
        ? onIssueInstruction(selectedInstruction)
        : onIssueShout(selectedShout);
    setLocalStatus(accepted ? 'DECYZJA PRZYJĘTA PRZEZ SILNIK' : 'DECYZJA ODRZUCONA — SPRAWDŹ CZAS ODNOWIENIA');
    if (accepted) onClose();
  };

  return (
    <OverlayShell title="CENTRUM TAKTYCZNE 2.0" subtitle={`${team.name} • ${team.tactic.name}`} accent={accent} onClose={onClose}>
      <OverlayButton x={70} y={158} width={230} label="TAKTYKA DRUŻYNY" active={tab === 'TACTICS'} accent={accent} onActivate={() => setTab('TACTICS')} />
      <OverlayButton x={315} y={158} width={230} label="POLECENIA Z LINII" active={tab === 'TOUCHLINE'} accent={accent} onActivate={() => setTab('TOUCHLINE')} />
      <OverlayButton x={560} y={158} width={230} label="OKRZYKI TRENERA" active={tab === 'SHOUTS'} accent={accent} onActivate={() => setTab('SHOUTS')} />

      {tab === 'TACTICS' && TACTICAL_GROUPS.map((group, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = 76 + column * 740;
        const y = 245 + row * 133;
        const selected = draft[group.key];
        return (
          <g key={group.key}>
            <rect x={x} y={y} width="700" height="112" rx="15" fill="#081324" stroke="#2c3e59" />
            <rect x={x} y={y} width="5" height="112" rx="2.5" fill={accent} />
            <text x={x + 25} y={y + 28} fill="#ffffff" fontSize="15" className="font-black italic uppercase tracking-tighter">{group.label}</text>
            <text x={x + 25} y={y + 47} fill="#94a3b8" fontSize="9" className="font-black italic uppercase tracking-tighter">{group.description}</text>
            {group.options.map((option, optionIndex) => (
              <OverlayButton
                key={option.value}
                x={x + 25 + optionIndex * 215}
                y={y + 59}
                width={group.options.length === 2 ? 300 : 198}
                height={40}
                label={option.label}
                active={selected === option.value}
                accent={accent}
                onActivate={() => setDraft(current => ({ ...current, [group.key]: option.value }))}
              />
            ))}
          </g>
        );
      })}

      {tab === 'TOUCHLINE' && (
        <g>
          <text x="82" y="254" fill="#ffffff" fontSize="20" className="font-black italic uppercase tracking-tighter">KRÓTKIE POLECENIE DLA DRUŻYNY</text>
          <text x="82" y="280" fill="#94a3b8" fontSize="10" className="font-black italic uppercase tracking-tighter">REAKCJA ZALEŻY OD SYTUACJI, MORALE, ZMĘCZENIA I ATRYBUTÓW TRENERA</text>
          {TOUCHLINE_OPTIONS.map((option, index) => {
            const column = index % 3;
            const row = Math.floor(index / 3);
            return <OverlayButton key={option.id ?? 'CLEAR'} x={82 + column * 490} y={315 + row * 88} width={455} height={64} label={option.label} active={selectedInstruction === option.id} accent={accent} onActivate={() => setSelectedInstruction(option.id)} />;
          })}
        </g>
      )}

      {tab === 'SHOUTS' && (
        <g>
          <text x="82" y="254" fill="#ffffff" fontSize="20" className="font-black italic uppercase tracking-tighter">REAKCJA EMOCJONALNA TRENERA</text>
          <text x="82" y="280" fill="#94a3b8" fontSize="10" className="font-black italic uppercase tracking-tighter">OKRZYK MOŻE POMÓC, ZOSTAĆ ŹLE ODEBRANY ALBO NIE PRZYNIEŚĆ EFEKTU</text>
          {SHOUT_OPTIONS.map((option, index) => {
            const column = index % 3;
            const row = Math.floor(index / 3);
            return <OverlayButton key={option.id ?? 'CLEAR'} x={82 + column * 490} y={315 + row * 92} width={455} height={68} label={option.label} active={selectedShout === option.id} accent={accent} onActivate={() => setSelectedShout(option.id)} />;
          })}
        </g>
      )}

      <rect x="70" y="787" width="1110" height="72" rx="13" fill="#07111f" stroke="#2e405c" />
      <text x="92" y="815" fill={accent} fontSize="10" className="font-black italic uppercase tracking-tighter">AKTUALNA INFORMACJA TRENERA</text>
      <text x="92" y="839" fill="#ffffff" fontSize="11" className="font-black italic uppercase tracking-tighter">{localStatus ?? statusMessage ?? coachSummary}</text>
      <OverlayButton x={1205} y={795} width={325} height={56} label={tab === 'TACTICS' ? 'ZATWIERDŹ TAKTYKĘ' : tab === 'TOUCHLINE' ? 'WYDAJ POLECENIE' : 'PRZEKAŻ OKRZYK'} active accent={accent} onActivate={applyCurrent} />
    </OverlayShell>
  );
};

const playerName = (player?: Player): string =>
  player ? `${player.firstName} ${player.lastName}` : 'Nieznany zawodnik';

export const MatchEngineV2SubstitutionOverlay = ({
  team,
  side,
  snapshot,
  maxSubstitutions,
  statusMessage,
  accent,
  onApply,
  onClose,
}: {
  team: CupTeamInput;
  side: CupTeamSide;
  snapshot: MatchEngineV2Snapshot;
  maxSubstitutions: number;
  statusMessage?: string | null;
  accent: string;
  onApply: (playerOutId: string, playerInId: string) => boolean;
  onClose: () => void;
}) => {
  const [playerOutId, setPlayerOutId] = useState<string | null>(null);
  const [playerInId, setPlayerInId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const lookup = useMemo(() => new Map(team.players.map(player => [player.id, player])), [team.players]);
  const redCards = snapshot.result.finalState.redCards;
  const alreadyLeft = new Set(snapshot.result.events
    .filter(event => event.side === side && event.type === 'SUBSTITUTION')
    .map(event => event.secondaryPlayerId)
    .filter((id): id is string => Boolean(id)));
  const starters = team.lineup.startingXI.filter((id): id is string => Boolean(id) && !redCards[id]);
  const bench = team.lineup.bench.filter(id => !alreadyLeft.has(id) && !redCards[id]);
  const used = snapshot.result.finalState.substitutionsUsed[side];
  const disabled = used >= maxSubstitutions;

  const apply = () => {
    if (!playerOutId || !playerInId || disabled) return;
    const accepted = onApply(playerOutId, playerInId);
    setLocalStatus(accepted ? 'ZMIANA PRZYJĘTA PRZEZ SILNIK' : 'ZMIANA ODRZUCONA — WYBIERZ INNYCH ZAWODNIKÓW');
    if (accepted) onClose();
  };

  const renderRows = (ids: string[], columnX: number, selectedId: string | null, select: (id: string) => void) =>
    ids.slice(0, 11).map((id, index) => {
      const player = lookup.get(id);
      const rowY = 276 + index * 47;
      const selected = selectedId === id;
      const condition = Math.round(snapshot.result.finalState.fatigue[id] ?? player?.condition ?? 100);
      return (
        <g key={id} role="button" tabIndex={0} aria-label={playerName(player)} onClick={() => select(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') select(id); }} className="cursor-pointer outline-none">
          <rect x={columnX} y={rowY} width="650" height="40" rx="9" fill={selected ? `${accent}25` : index % 2 ? '#0c1728' : '#091322'} stroke={selected ? accent : '#263752'} strokeWidth={selected ? 2 : 1} />
          <circle cx={columnX + 26} cy={rowY + 20} r="12" fill={accent} fillOpacity="0.16" stroke={accent} />
          <text x={columnX + 26} y={rowY + 24} textAnchor="middle" fill={accent} fontSize="8" className="font-black italic uppercase tracking-tighter">{player?.position ?? '—'}</text>
          <text x={columnX + 50} y={rowY + 25} fill="#ffffff" fontSize="12" className="font-black italic uppercase tracking-tighter">{playerName(player)}</text>
          <text x={columnX + 615} y={rowY + 25} textAnchor="end" fill={condition < 65 ? '#fb7185' : condition < 78 ? '#fbbf24' : '#34d399'} fontSize="11" className="font-black italic uppercase tracking-tighter">{condition}%</text>
        </g>
      );
    });

  return (
    <OverlayShell title="PANEL ZMIAN 2.0" subtitle={`${team.name} • WYKORZYSTANO ${used} Z ${maxSubstitutions}`} accent={accent} onClose={onClose}>
      <rect x="72" y="162" width="1456" height="88" rx="16" fill="#081324" stroke="#2c3f5b" />
      <text x="96" y="194" fill="#ffffff" fontSize="15" className="font-black italic uppercase tracking-tighter">WYBIERZ ZAWODNIKA SCHODZĄCEGO I WCHODZĄCEGO</text>
      <text x="96" y="220" fill="#94a3b8" fontSize="10" className="font-black italic uppercase tracking-tighter">SILNIK SPRAWDZI LIMIT, CZERWONE KARTKI, ŁAWKĘ ORAZ WCZEŚNIEJSZE ZMIANY</text>
      <text x="87" y="269" fill={accent} fontSize="12" className="font-black italic uppercase tracking-tighter">BOISKO — ZAWODNIK SCHODZĄCY</text>
      <text x="837" y="269" fill={accent} fontSize="12" className="font-black italic uppercase tracking-tighter">ŁAWKA — ZAWODNIK WCHODZĄCY</text>
      {renderRows(starters, 76, playerOutId, setPlayerOutId)}
      {renderRows(bench, 826, playerInId, setPlayerInId)}
      <rect x="72" y="808" width="1070" height="58" rx="12" fill="#07111f" stroke="#2d405c" />
      <text x="94" y="843" fill={disabled || localStatus?.includes('ODRZUCONA') ? '#fb7185' : '#ffffff'} fontSize="11" className="font-black italic uppercase tracking-tighter">
        {disabled ? 'WYKORZYSTANO WSZYSTKIE DOSTĘPNE ZMIANY' : localStatus ?? statusMessage ?? 'WYBIERZ DWÓCH ZAWODNIKÓW'}
      </text>
      <OverlayButton x={1168} y={808} width={360} height={58} label="ZATWIERDŹ ZMIANĘ" active={Boolean(playerOutId && playerInId)} disabled={disabled || !playerOutId || !playerInId} accent={accent} onActivate={apply} />
    </OverlayShell>
  );
};
