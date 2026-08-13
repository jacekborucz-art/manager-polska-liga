import React from 'react';
import { PlayerPosition } from '../../types';

interface PlayerConversationIdentityProps {
  playerName: string;
  overall: number;
  position: PlayerPosition;
  age: number;
  kitColors?: string[];
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'Bramkarz',
  [PlayerPosition.DEF]: 'Obrońca',
  [PlayerPosition.MID]: 'Pomocnik',
  [PlayerPosition.FWD]: 'Napastnik',
};

const parseHexColor = (color?: string): [number, number, number] | null => {
  if (!color?.startsWith('#')) return null;
  const hex = color.slice(1);
  if (hex.length !== 3 && hex.length !== 6) return null;
  const normalized = hex.length === 3 ? hex.split('').map(character => character + character).join('') : hex;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const getRelativeLuminance = (color: string): number => {
  const rgb = parseHexColor(color);
  if (!rgb) return 0;
  const channels = rgb.map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const PlayerConversationIdentity: React.FC<PlayerConversationIdentityProps> = ({
  playerName,
  overall,
  position,
  age,
  kitColors = [],
}) => {
  const primaryColor = parseHexColor(kitColors[0]) ? kitColors[0] : '#F59E0B';
  const textColor = getRelativeLuminance(primaryColor) > 0.42 ? '#07111F' : '#FFFFFF';
  const displayedOverall = Number.isFinite(overall) ? Math.round(overall) : '—';

  return (
    <div className="relative -mx-3 mb-6 isolate flex min-h-[92px] items-center gap-5 overflow-hidden border-y border-white/10 px-4 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.28)]">
      <span className="absolute inset-0 -z-20 bg-[#061320]" />
      <span className="absolute inset-y-0 right-0 -z-10 w-24 bg-gradient-to-r from-transparent to-cyan-900/20" />
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: primaryColor }} />

      <span className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full opacity-35" style={{ backgroundColor: primaryColor }} />
        <span
          className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
          style={{
            backgroundColor: primaryColor,
            borderColor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.72)' : 'rgba(7,17,31,0.56)',
            color: textColor,
          }}
        >
          <strong className="text-[30px] font-extrabold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">{displayedOverall}</strong>
        </span>
      </span>

      <span className="relative min-w-0">
        <span className="block text-[12px] font-medium tracking-normal text-cyan-100/60">Zawodnik</span>
        <span className="mt-1 block break-words text-[21px] font-semibold leading-[1.15] tracking-[-0.015em] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]">
          {playerName}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-medium tracking-normal text-cyan-100/70">
          <span>{POSITION_LABELS[position]}</span>
          <span className="h-1 w-1 rounded-full bg-cyan-300/55" />
          <span>{age} lat</span>
        </span>
      </span>
    </div>
  );
};
