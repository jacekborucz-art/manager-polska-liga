import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, ChevronDown, GripHorizontal, Megaphone, Minus, RotateCcw, X } from 'lucide-react';
import type { UserCoachInstructionId, UserCoachShoutId } from '../../types';
import {
  getUserCoachInstructionLabel,
  USER_COACH_INSTRUCTION_OPTIONS,
} from '../../services/UserCoachInstructionService';
import {
  getUserCoachShoutLabel,
  USER_COACH_SHOUT_OPTIONS,
} from '../../services/UserCoachShoutService';

type CommandMenu = 'INSTRUCTIONS' | 'SHOUTS';

type PanelPosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

const POSITION_STORAGE_KEY = 'fm-live-coach-panel-position-v2';
const EDGE_GAP = 12;
const PANEL_WIDTH = 220;
const MATCH_VIEW_PADDING = 24;
const SQUAD_COLUMN_WIDTH = 384;
const PANEL_TO_SQUAD_GAP = 18;
const DEFAULT_PANEL_TOP = 242;
const NO_COMMAND = 'BRAK POLECENIA';
const INSTRUCTIONS = USER_COACH_INSTRUCTION_OPTIONS.map(option => option.label);

const SHOUTS = USER_COACH_SHOUT_OPTIONS.map(option => option.label);

const getDefaultPosition = (): PanelPosition => {
  if (typeof window === 'undefined') return { x: 1274, y: DEFAULT_PANEL_TOP };

  // The live-match layout has 24 px outer padding and a fixed 384 px squad column.
  // Keeping an 18 px gutter places the 220 px coach panel in the visual corridor
  // between the pitch and the opponent list, matching the intended 1920×1080 layout.
  return {
    x: Math.max(
      EDGE_GAP,
      window.innerWidth - MATCH_VIEW_PADDING - SQUAD_COLUMN_WIDTH - PANEL_TO_SQUAD_GAP - PANEL_WIDTH
    ),
    y: Math.max(EDGE_GAP, Math.min(DEFAULT_PANEL_TOP, window.innerHeight - 340)),
  };
};

const readSavedPosition = (): PanelPosition => {
  if (typeof window === 'undefined') return getDefaultPosition();

  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return getDefaultPosition();
    const parsed = JSON.parse(raw) as Partial<PanelPosition>;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return getDefaultPosition();
    return { x: parsed.x as number, y: parsed.y as number };
  } catch {
    return getDefaultPosition();
  }
};

const clampPosition = (
  position: PanelPosition,
  panelWidth: number,
  panelHeight: number
): PanelPosition => ({
  x: Math.min(
    Math.max(EDGE_GAP, position.x),
    Math.max(EDGE_GAP, window.innerWidth - panelWidth - EDGE_GAP)
  ),
  y: Math.min(
    Math.max(EDGE_GAP, position.y),
    Math.max(EDGE_GAP, window.innerHeight - panelHeight - EDGE_GAP)
  ),
});

type CoachCommandsPanelProps = {
  hidden?: boolean;
  selectedInstructionId?: UserCoachInstructionId | null;
  instructionStartsMinute?: number;
  instructionExpiryMinute?: number;
  selectedShoutId?: UserCoachShoutId | null;
  currentMinute?: number;
  onInstructionSelect?: (instructionId: UserCoachInstructionId | null) => void;
  onShoutSelect?: (shoutId: UserCoachShoutId | null) => void;
};

export const CoachCommandsPanel = ({
  hidden = false,
  selectedInstructionId,
  instructionStartsMinute,
  instructionExpiryMinute,
  selectedShoutId,
  currentMinute = 0,
  onInstructionSelect,
  onShoutSelect,
}: CoachCommandsPanelProps) => {
  const [position, setPosition] = useState<PanelPosition>(readSavedPosition);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [openMenu, setOpenMenu] = useState<CommandMenu | null>(null);
  const [localSelectedInstruction, setLocalSelectedInstruction] = useState(NO_COMMAND);
  const [localSelectedShout, setLocalSelectedShout] = useState(NO_COMMAND);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const positionRef = useRef(position);
  const selectedInstruction = selectedInstructionId === undefined
    ? localSelectedInstruction
    : getUserCoachInstructionLabel(selectedInstructionId);
  const instructionStatus = selectedInstructionId
    ? currentMinute < (instructionStartsMinute ?? currentMinute)
      ? `REAKCJA OD ${instructionStartsMinute}'`
      : `AKTYWNE DO ${instructionExpiryMinute}'`
    : null;
  const selectedShout = selectedShoutId === undefined
    ? localSelectedShout
    : getUserCoachShoutLabel(selectedShoutId);
  const commandsLocked = currentMinute < 1;

  const selectInstruction = (label: string) => {
    setLocalSelectedInstruction(label);
    const selectedOption = USER_COACH_INSTRUCTION_OPTIONS.find(option => option.label === label);
    onInstructionSelect?.(selectedOption?.id ?? null);
  };

  const selectShout = (label: string) => {
    setLocalSelectedShout(label);
    const selectedOption = USER_COACH_SHOUT_OPTIONS.find(option => option.label === label);
    onShoutSelect?.(selectedOption?.id ?? null);
  };

  const persistPosition = (nextPosition: PanelPosition) => {
    try {
      window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(nextPosition));
    } catch {
      // Brak dostępu do localStorage nie powinien blokować działania panelu.
    }
  };

  const updatePosition = (nextPosition: PanelPosition, persist = false) => {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
    if (persist) persistPosition(nextPosition);
  };

  const keepPanelOnScreen = (persist = false) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const nextPosition = clampPosition(positionRef.current, rect.width, rect.height);
    updatePosition(nextPosition, persist);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => keepPanelOnScreen(true));
    const handleResize = () => keepPanelOnScreen(true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isMinimized, hidden, openMenu]);

  useEffect(() => {
    const closeMenuOutsidePanel = (event: globalThis.PointerEvent) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    };
    document.addEventListener('pointerdown', closeMenuOutsidePanel);
    return () => document.removeEventListener('pointerdown', closeMenuOutsidePanel);
  }, []);

  useEffect(() => {
    if (commandsLocked) setOpenMenu(null);
  }, [commandsLocked]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel || drag.pointerId !== event.pointerId) return;

    const rect = panel.getBoundingClientRect();
    updatePosition(clampPosition({
      x: event.clientX - drag.offsetX,
      y: event.clientY - drag.offsetY,
    }, rect.width, rect.height));
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    persistPosition(positionRef.current);
  };

  const resetPosition = () => {
    const panel = panelRef.current;
    const nextPosition = getDefaultPosition();
    if (!panel) {
      updatePosition(nextPosition, true);
      return;
    }
    const rect = panel.getBoundingClientRect();
    updatePosition(clampPosition(nextPosition, rect.width, rect.height), true);
  };

  const renderDropdown = (
    menu: CommandMenu,
    label: string,
    placeholder: string,
    options: string[],
    selected: string,
    accent: 'EMERALD' | 'YELLOW',
    onSelect: (option: string) => void,
    disabled = false
  ) => {
    const expanded = !disabled && openMenu === menu;
    const isEmerald = accent === 'EMERALD';

    return (
      <div className={`relative rounded-xl border p-2 ${isEmerald
        ? 'border-emerald-400/35 bg-emerald-950/45'
        : 'border-amber-400/35 bg-amber-950/45'}`}>
        <div className={`mb-2 flex h-6 items-center rounded-lg border px-2 text-[11px] font-black italic uppercase leading-none tracking-tighter ${isEmerald
          ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-200'
          : 'border-amber-300/30 bg-amber-400/15 text-amber-200'}`}>
          {label}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!disabled) setOpenMenu(current => current === menu ? null : menu);
          }}
          disabled={disabled}
          title={disabled ? 'Dostępne od 1. minuty' : undefined}
          className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white/[0.035] px-3 py-2 text-left text-[10px] leading-tight transition-all ${expanded
            ? isEmerald
              ? 'border-emerald-300/55 bg-emerald-500/10 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.12)]'
              : 'border-yellow-300/55 bg-yellow-500/10 text-yellow-100 shadow-[0_0_18px_rgba(234,179,8,0.12)]'
            : isEmerald
              ? 'border-emerald-300/20 bg-emerald-950/65 text-emerald-50 hover:border-emerald-300/45 hover:bg-emerald-900/65'
              : 'border-amber-300/20 bg-amber-950/65 text-amber-50 hover:border-amber-300/45 hover:bg-amber-900/65'} ${disabled ? 'cursor-not-allowed opacity-45 saturate-50' : ''}`}
          aria-expanded={expanded}
        >
          <span className="min-w-0 flex-1 whitespace-normal break-words">{selected || placeholder}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''} ${isEmerald ? 'text-emerald-300' : 'text-yellow-300'}`} />
        </button>

        {expanded && (
          <div className={`absolute left-0 right-0 top-[calc(100%+6px)] z-[60] rounded-xl border p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] ${isEmerald
            ? 'border-emerald-300/20 bg-emerald-950/90'
            : 'border-amber-300/20 bg-amber-950/90'}`}>
            {options.map(option => {
              const isSelected = selected === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setOpenMenu(null);
                  }}
                  className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] font-black italic uppercase tracking-tighter transition-colors ${isSelected
                    ? isEmerald
                      ? 'bg-emerald-500/18 text-emerald-100'
                      : 'bg-yellow-500/18 text-yellow-100'
                    : 'text-slate-200 hover:bg-white/[0.09] hover:text-white'}`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words leading-tight">{option}</span>
                  {isSelected && <Check className={`h-3.5 w-3.5 shrink-0 ${isEmerald ? 'text-emerald-300' : 'text-yellow-300'}`} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (hidden) return null;

  if (!isOpen) {
    return (
      <div
        ref={panelRef}
        className="fixed z-[450] select-none font-black italic uppercase tracking-tighter"
        style={{ left: position.x, top: position.y }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex h-11 items-center gap-2 rounded-xl border border-emerald-300/35 bg-slate-950/95 px-4 text-[11px] text-emerald-200 shadow-[0_12px_36px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl transition-all hover:border-emerald-300/65 hover:bg-emerald-950/95 hover:text-white"
        >
          <Megaphone className="h-4 w-4 text-yellow-300 transition-transform group-hover:-rotate-12" />
          Polecenia
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`fixed z-[450] w-[220px] max-w-[calc(100vw-24px)] select-none overflow-visible rounded-xl border border-emerald-300/25 bg-slate-950/95 font-black italic uppercase tracking-tighter shadow-[0_24px_70px_rgba(0,0,0,0.72),0_0_34px_rgba(16,185,129,0.13),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={`flex h-8 touch-none items-center gap-1 rounded-t-[11px] border-b border-white/10 bg-slate-900/95 px-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <div className="flex-1" />
        <button
          type="button"
          onClick={resetPosition}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
          title="Przywróć domyślne położenie"
          aria-label="Przywróć domyślne położenie"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => setIsMinimized(value => !value)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
          title={isMinimized ? 'Rozwiń' : 'Zwiń'}
          aria-label={isMinimized ? 'Rozwiń panel' : 'Zwiń panel'}
        >
          {isMinimized ? <Megaphone className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
          title="Zamknij"
          aria-label="Zamknij panel poleceń"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {!isMinimized && (
        <div className="overflow-visible rounded-b-[11px] bg-slate-950/95 p-2.5">
          <div className="mb-2.5 flex items-center gap-2 border-b border-emerald-300/10 pb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-yellow-300/20 bg-yellow-500/10">
              <Megaphone className="h-3.5 w-3.5 text-yellow-300" />
            </div>
            <div className="text-[10px] leading-tight text-white">Polecenia</div>
          </div>
          <div className="flex flex-col gap-3">
            {renderDropdown(
              'INSTRUCTIONS',
              'Instrukcje',
              'Wybierz instrukcję',
              INSTRUCTIONS,
              selectedInstruction,
              'EMERALD',
              selectInstruction,
              commandsLocked
            )}
            {instructionStatus && (
              <div className="-mt-2 rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-2 py-1 text-center text-[9px] font-black italic uppercase tracking-tighter text-emerald-200">
                {instructionStatus}
              </div>
            )}
            {renderDropdown(
              'SHOUTS',
              'Okrzyki',
              'Wybierz okrzyk',
              SHOUTS,
              selectedShout,
              'YELLOW',
              selectShout,
              commandsLocked
            )}
          </div>

        </div>
      )}
    </div>
  );
};
