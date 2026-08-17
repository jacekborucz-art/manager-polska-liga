import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PortalScaleWrapper } from '../GameScaler';
import { useGame } from '../../context/GameContext';
import { ViewState, PlayerPosition, Player, HealthStatus, InjurySeverity, NationalTeam, CompetitionType, MatchStatus, Fixture, StaffRole, MailMessage, MailType, ManagerAchievement } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TacticRepository } from '../../resources/tactics_db';
import { LineupService } from '../../services/LineupService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { TeamAnalysisService } from '../../services/TeamAnalysisService';
import szatnia from '../../Graphic/themes/szatnia.png';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { TeamAnalysisModal } from './TeamAnalysisModal';
import { WeeklyMotivationModal } from '../modals/WeeklyMotivationModal';
import { MatchReportModal } from '../modals/MatchReportModal';
import { MatchReportModalPolishLeague } from '../modals/MatchReportModalPolishLeague';
import { WeeklyMotivationService } from '../../services/WeeklyMotivationService';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';
import { PlayerCareerService } from '../../services/PlayerCareerService';
import { MotivationTalkOption } from '../../data/weekly_motivation_talks_pl';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { MotivationTalkResult } from '../../services/WeeklyMotivationService';
import { PlayerMoraleService } from '../../services/PlayerMoraleService';
import { generatePlayerReport } from '../../services/TrainingAssistantService';
import { PlayerPositionFitService } from '../../services/PlayerPositionFitService';
import { ManagerExperienceService } from '../../services/ManagerExperienceService';
import { PlayerFormLevel, PlayerFormService } from '../../services/PlayerFormService';

const NATIONALITY_FLAG_MAP: Record<string, string> = {
  'Albania': '🇦🇱', 'Andora': '🇦🇩', 'Austria': '🇦🇹', 'Belgia': '🇧🇪',
  'Białoruś': '🇧🇾', 'Bośnia i Hercegowina': '🇧🇦', 'Bułgaria': '🇧🇬',
  'Chorwacja': '🇭🇷', 'Cypr': '🇨🇾', 'Czarnogóra': '🇲🇪', 'Czechy': '🇨🇿',
  'Dania': '🇩🇰', 'Estonia': '🇪🇪', 'Finlandia': '🇫🇮', 'Francja': '🇫🇷',
  'Grecja': '🇬🇷', 'Hiszpania': '🇪🇸', 'Holandia': '🇳🇱', 'Irlandia': '🇮🇪',
  'Islandia': '🇮🇸', 'Kosowo': '🇽🇰', 'Liechtenstein': '🇱🇮', 'Litwa': '🇱🇹',
  'Luksemburg': '🇱🇺', 'Łotwa': '🇱🇻', 'Macedonia Północna': '🇲🇰', 'Malta': '🇲🇹',
  'Mołdawia': '🇲🇩', 'Monako': '🇲🇨', 'Niemcy': '🇩🇪', 'Norwegia': '🇳🇴',
  'Polska': '🇵🇱', 'Portugalia': '🇵🇹', 'Rosja': '🇷🇺', 'Rumunia': '🇷🇴',
  'San Marino': '🇸🇲', 'Serbia': '🇷🇸', 'Słowacja': '🇸🇰', 'Słowenia': '🇸🇮',
  'Szwajcaria': '🇨🇭', 'Szwecja': '🇸🇪', 'Ukraina': '🇺🇦', 'Watykan': '🇻🇦',
  'Węgry': '🇭🇺', 'Wielka Brytania': '🇬🇧', 'Włochy': '🇮🇹',
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  'Albania': 'al', 'Andora': 'ad', 'Austria': 'at', 'Belgia': 'be',
  'Białoruś': 'by', 'Bośnia i Hercegowina': 'ba', 'Bułgaria': 'bg',
  'Chorwacja': 'hr', 'Cypr': 'cy', 'Czarnogóra': 'me', 'Czechy': 'cz',
  'Dania': 'dk', 'Estonia': 'ee', 'Finlandia': 'fi', 'Francja': 'fr',
  'Grecja': 'gr', 'Hiszpania': 'es', 'Holandia': 'nl', 'Irlandia': 'ie',
  'Islandia': 'is', 'Kosowo': 'xk', 'Liechtenstein': 'li', 'Litwa': 'lt',
  'Luksemburg': 'lu', 'Łotwa': 'lv', 'Macedonia Północna': 'mk', 'Malta': 'mt',
  'Mołdawia': 'md', 'Monako': 'mc', 'Niemcy': 'de', 'Norwegia': 'no',
  'Polska': 'pl', 'Portugalia': 'pt', 'Rosja': 'ru', 'Rumunia': 'ro',
  'San Marino': 'sm', 'Serbia': 'rs', 'Słowacja': 'sk', 'Słowenia': 'si',
  'Szwajcaria': 'ch', 'Szwecja': 'se', 'Ukraina': 'ua', 'Watykan': 'va',
  'Węgry': 'hu', 'Wielka Brytania': 'gb', 'Włochy': 'it',
};

const staffAttrColor = (v: number) =>
  v >= 17 ? '#34d399' : v >= 13 ? '#60a5fa' : v >= 9 ? '#facc15' : v >= 5 ? '#fb923c' : '#fb7185';

const CoachingStaffScene: React.FC<{ primaryColor: string; secondaryColor: string }> = ({ primaryColor, secondaryColor }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 920 690"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="staff-scene-base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#071827" />
        <stop offset="0.52" stopColor="#071321" />
        <stop offset="1" stopColor="#030914" />
      </linearGradient>
      <linearGradient id="staff-scene-club" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={primaryColor} stopOpacity="0.26" />
        <stop offset="0.55" stopColor={secondaryColor} stopOpacity="0.09" />
        <stop offset="1" stopColor="#020617" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="staff-scene-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#38bdf8" stopOpacity="0.16" />
        <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
      </radialGradient>
      <pattern id="staff-scene-grid" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1.3" cy="1.3" r="1.05" fill="#bae6fd" fillOpacity="0.09" />
      </pattern>
      <filter id="staff-scene-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>

    <rect width="920" height="690" rx="38" fill="url(#staff-scene-base)" />
    <rect width="920" height="690" rx="38" fill="url(#staff-scene-club)" />
    <rect x="18" y="18" width="884" height="654" rx="28" fill="url(#staff-scene-grid)" />
    <ellipse cx="710" cy="320" rx="300" ry="300" fill="url(#staff-scene-glow)" />

    <g transform="translate(570 102) rotate(-4)" opacity="0.12" fill="none" stroke="#a5f3fc">
      <rect x="0" y="0" width="290" height="190" rx="15" strokeWidth="3" />
      <rect x="14" y="14" width="262" height="162" rx="7" strokeWidth="2" />
      <line x1="145" y1="14" x2="145" y2="176" strokeWidth="2" />
      <circle cx="145" cy="95" r="29" strokeWidth="2" />
      <path d="M14 59h48v72H14M276 59h-48v72h48" strokeWidth="2" />
      <circle cx="61" cy="55" r="6" fill={primaryColor} stroke="none" />
      <circle cx="92" cy="87" r="6" fill={primaryColor} stroke="none" />
      <circle cx="115" cy="129" r="6" fill={primaryColor} stroke="none" />
      <circle cx="199" cy="51" r="6" fill={secondaryColor} stroke="none" />
      <circle cx="221" cy="96" r="6" fill={secondaryColor} stroke="none" />
      <circle cx="184" cy="139" r="6" fill={secondaryColor} stroke="none" />
      <path d="M67 61l21 19 20 40M194 58l21 29-25 43" stroke="#f8fafc" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="7 7" />
    </g>

    <g transform="translate(54 408)" opacity="0.105" fill="none" stroke="#f8fafc">
      <path d="M0 133h460l55 44H-32z" strokeWidth="3" />
      <path d="M34 133V18h365v115M69 18v-33h295v33" strokeWidth="3" />
      <path d="M36 177L18 254M444 177l18 77M2 254h58M420 254h72" strokeWidth="4" />
      <path d="M65 75h88l22-32 37 65 28-44 31 30h96" stroke={secondaryColor} strokeOpacity="0.75" strokeWidth="4" />
      <circle cx="175" cy="43" r="6" fill={secondaryColor} stroke="none" filter="url(#staff-scene-blur)" />
    </g>

    <g transform="translate(730 478)" opacity="0.14" fill="none" stroke="#f8fafc" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 75l38-67 38 67zM38 52h30M119 75l27-49 27 49zM136 56h21" strokeWidth="4" />
      <path d="M18 94h158" stroke={primaryColor} strokeWidth="5" strokeOpacity="0.8" />
      <path d="M48 130c0-22 17-39 39-39s39 17 39 39-17 39-39 39-39-17-39-39z" strokeWidth="3" />
      <path d="M87 91v-30c0-22 16-36 36-36h15" strokeWidth="3" />
      <circle cx="145" cy="25" r="12" strokeWidth="3" />
    </g>

    <g opacity="0.14" fill="none">
      <path d="M28 92h864M28 614h864" stroke="#e0f2fe" />
      <path d="M435 92v522" stroke="#bae6fd" strokeOpacity="0.32" />
      <path d="M28 39h220" stroke={primaryColor} strokeWidth="3" strokeOpacity="0.82" />
      <path d="M672 651h220" stroke={secondaryColor} strokeWidth="3" strokeOpacity="0.72" />
    </g>
  </svg>
);

const ManagerProfileScene: React.FC<{ primaryColor: string; secondaryColor: string }> = ({ primaryColor, secondaryColor }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1180 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="manager-profile-base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#071827" />
        <stop offset="0.5" stopColor="#061321" />
        <stop offset="1" stopColor="#020713" />
      </linearGradient>
      <radialGradient id="manager-profile-club" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={primaryColor} stopOpacity="0.22" />
        <stop offset="1" stopColor={primaryColor} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="manager-profile-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={secondaryColor} stopOpacity="0" />
        <stop offset="0.52" stopColor={secondaryColor} stopOpacity="0.25" />
        <stop offset="1" stopColor={secondaryColor} stopOpacity="0" />
      </linearGradient>
      <pattern id="manager-profile-dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1.4" cy="1.4" r="1" fill="#bae6fd" fillOpacity="0.095" />
      </pattern>
      <filter id="manager-profile-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>

    <rect width="1180" height="900" rx="40" fill="url(#manager-profile-base)" />
    <rect width="1180" height="900" rx="40" fill="url(#manager-profile-dots)" />
    <ellipse cx="170" cy="110" rx="310" ry="230" fill="url(#manager-profile-club)" />
    <ellipse cx="1030" cy="720" rx="350" ry="300" fill="url(#manager-profile-club)" opacity="0.52" />
    <path d="M0 176h1180" stroke="url(#manager-profile-beam)" strokeWidth="3" />

    <g transform="translate(846 36)" fill="none" opacity="0.18" stroke="#bae6fd">
      <circle cx="142" cy="112" r="92" strokeWidth="2" />
      <circle cx="142" cy="112" r="61" strokeWidth="1.5" strokeDasharray="6 8" />
      <circle cx="142" cy="112" r="30" strokeWidth="1.5" />
      <path d="M142 20v184M50 112h184M77 47l130 130M207 47L77 177" strokeWidth="1" />
      <path d="M142 42l48 44-18 61-61 17-33-54 28-48z" fill={primaryColor} fillOpacity="0.18" stroke={secondaryColor} strokeWidth="2.5" />
      <circle cx="142" cy="42" r="5" fill={secondaryColor} stroke="none" />
      <circle cx="190" cy="86" r="5" fill={secondaryColor} stroke="none" />
      <circle cx="172" cy="147" r="5" fill={secondaryColor} stroke="none" />
      <circle cx="111" cy="164" r="5" fill={secondaryColor} stroke="none" />
      <circle cx="78" cy="110" r="5" fill={secondaryColor} stroke="none" />
      <circle cx="106" cy="62" r="5" fill={secondaryColor} stroke="none" />
    </g>

    <g transform="translate(52 560) rotate(-3)" fill="none" opacity="0.17" stroke="#e0f2fe">
      <rect x="0" y="0" width="330" height="220" rx="16" strokeWidth="3" />
      <rect x="16" y="16" width="298" height="188" rx="8" strokeWidth="2" />
      <line x1="165" y1="16" x2="165" y2="204" strokeWidth="2" />
      <circle cx="165" cy="110" r="35" strokeWidth="2" />
      <path d="M16 70h60v80H16M314 70h-60v80h60" strokeWidth="2" />
      <circle cx="82" cy="64" r="6" fill={primaryColor} stroke="none" />
      <circle cx="113" cy="114" r="6" fill={primaryColor} stroke="none" />
      <circle cx="147" cy="166" r="6" fill={primaryColor} stroke="none" />
      <circle cx="224" cy="58" r="6" fill={secondaryColor} stroke="none" />
      <circle cx="205" cy="118" r="6" fill={secondaryColor} stroke="none" />
      <circle cx="250" cy="164" r="6" fill={secondaryColor} stroke="none" />
      <path d="M86 70l23 36 34 52M224 65l-15 45 36 45" stroke="#f8fafc" strokeOpacity="0.55" strokeDasharray="7 7" />
    </g>

    <g transform="translate(770 650)" fill="none" opacity="0.17">
      <path d="M0 150h352" stroke="#e0f2fe" strokeWidth="2" />
      <path d="M8 131l55-38 52 18 58-74 54 28 54-51 58 29" stroke={secondaryColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 131l55-38 52 18 58-74 54 28 54-51 58 29v107H8z" fill={secondaryColor} fillOpacity="0.08" />
      {[['63', '93'], ['115', '111'], ['173', '37'], ['227', '65'], ['281', '14'], ['339', '43']].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={primaryColor} stroke="#f8fafc" strokeWidth="2" />
      ))}
    </g>

    <g transform="translate(330 515)" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g opacity="0.18" stroke="#bae6fd">
        <path d="M14 282h518l52 48H-34z" fill="#061827" fillOpacity="0.72" strokeWidth="3" />
        <path d="M30 330L10 395M516 330l20 65M-14 395h72M490 395h76" strokeWidth="5" />
        <rect x="38" y="42" width="228" height="154" rx="14" fill="#041522" fillOpacity="0.84" strokeWidth="3" />
        <rect x="55" y="59" width="194" height="120" rx="7" strokeWidth="2" />
        <line x1="152" y1="59" x2="152" y2="179" strokeWidth="2" />
        <circle cx="152" cy="119" r="23" strokeWidth="2" />
        <path d="M55 91h40v56H55M249 91h-40v56h40" strokeWidth="2" />
        <circle cx="103" cy="89" r="5" fill={primaryColor} stroke="none" />
        <circle cx="124" cy="132" r="5" fill={primaryColor} stroke="none" />
        <circle cx="190" cy="86" r="5" fill={secondaryColor} stroke="none" />
        <circle cx="181" cy="139" r="5" fill={secondaryColor} stroke="none" />
        <path d="M102 96l19 29M189 93l-8 38" stroke="#f8fafc" strokeOpacity="0.65" strokeDasharray="5 6" />
        <path d="M128 196v31M176 196v31M104 227h96" strokeWidth="4" />

        <rect x="296" y="72" width="200" height="124" rx="14" fill="#041522" fillOpacity="0.84" strokeWidth="3" />
        <path d="M316 168h160M322 151l31-33 28 16 38-50 31 22 21-17" stroke={secondaryColor} strokeWidth="4" />
        <path d="M322 151l31-33 28 16 38-50 31 22 21-17v79H322z" fill={secondaryColor} fillOpacity="0.13" stroke="none" />
        <circle cx="353" cy="118" r="4" fill={primaryColor} stroke="none" />
        <circle cx="419" cy="84" r="4" fill={primaryColor} stroke="none" />
        <circle cx="471" cy="89" r="4" fill={primaryColor} stroke="none" />
        <path d="M374 196v31M418 196v31M350 227h92" strokeWidth="4" />

        <path d="M-8 16h556M20 16v-46h500v46" strokeWidth="3" />
        <path d="M52-9h72M155-9h72M258-9h72M361-9h72M464-9h32" strokeWidth="8" />
        <path d="M224 282v-37c0-15 12-27 27-27h57c15 0 27 12 27 27v37" strokeWidth="4" />
        <path d="M238 282v79M321 282v79M238 340h83" strokeWidth="4" />
      </g>

      <g transform="translate(535 190)" opacity="0.22" stroke="#f8fafc">
        <path d="M0 92h88M17 92V20h54v72" strokeWidth="3" />
        <path d="M31 20V4h26v16M25 46h38M25 65h38" strokeWidth="3" />
        <path d="M30 4h28l-7-23H37z" fill={primaryColor} fillOpacity="0.48" stroke={secondaryColor} strokeWidth="2" />
      </g>
    </g>

    <g opacity="0.1" fill="none">
      <path d="M34 32h248" stroke={primaryColor} strokeWidth="4" />
      <path d="M898 864h248" stroke={secondaryColor} strokeWidth="4" />
      <path d="M34 842h1112" stroke="#bae6fd" />
      <circle cx="1136" cy="32" r="5" fill={secondaryColor} filter="url(#manager-profile-soft-glow)" />
    </g>
  </svg>
);

const SquadPlayerFormArrow: React.FC<{ level: PlayerFormLevel; className?: string }> = ({ level, className = '' }) => {
  const config: Record<PlayerFormLevel, { line: [number, number, number, number]; head: string; stroke: string }> = {
    VERY_HIGH: { line: [13, 22, 13, 5], head: 'M8 10 L13 5 L18 10', stroke: '#34d399' },
    HIGH: { line: [20, 22, 6, 8], head: 'M6 8 L7 15 L13 9', stroke: '#84cc16' },
    RISING: { line: [20, 22, 6, 8], head: 'M6 8 L7 15 L13 9', stroke: '#a3e635' },
    STABLE: { line: [5, 13, 21, 13], head: 'M16 8 L21 13 L16 18', stroke: '#cbd5e1' },
    FALLING: { line: [6, 6, 20, 20], head: 'M13 20 L20 20 L20 13', stroke: '#fb923c' },
    VERY_LOW: { line: [13, 4, 13, 21], head: 'M8 16 L13 21 L18 16', stroke: '#f87171' },
  };
  const { line, head, stroke } = config[level];

  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <line
        x1={line[0]}
        y1={line[1]}
        x2={line[2]}
        y2={line[3]}
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d={head} fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

type ManagerAchievementBadgeTheme = {
  label: string;
  short: string;
  primary: string;
  secondary: string;
  glow: string;
  icon: 'star' | 'cup' | 'shield' | 'europe' | 'arrow';
};

const getManagerAchievementBadgeTheme = (entry: ManagerAchievement): ManagerAchievementBadgeTheme => {
  const text = `${entry.title} ${entry.competition}`.toLowerCase();

  if (text.includes('awans do ekstraklasy')) {
    return { label: 'Awans', short: 'EKS', primary: '#38bdf8', secondary: '#22c55e', glow: 'rgba(56,189,248,0.26)', icon: 'arrow' };
  }
  if (text.includes('awans do 1. ligi') || text.includes('awans do 1 ligi')) {
    return { label: 'Awans', short: '1L', primary: '#22d3ee', secondary: '#a3e635', glow: 'rgba(34,211,238,0.24)', icon: 'arrow' };
  }
  if (text.includes('mistrz polski')) {
    return { label: 'Mistrz Polski', short: 'MP', primary: '#facc15', secondary: '#ef4444', glow: 'rgba(250,204,21,0.3)', icon: 'star' };
  }
  if (text.includes('superpuchar polski')) {
    return { label: 'Superpuchar', short: 'SP', primary: '#fb7185', secondary: '#facc15', glow: 'rgba(251,113,133,0.28)', icon: 'shield' };
  }
  if (text.includes('puchar polski')) {
    return { label: 'Puchar Polski', short: 'PP', primary: '#f59e0b', secondary: '#e11d48', glow: 'rgba(245,158,11,0.26)', icon: 'cup' };
  }
  if (text.includes('liga mistrz')) {
    return { label: 'Liga Mistrzów', short: 'LM', primary: '#60a5fa', secondary: '#facc15', glow: 'rgba(96,165,250,0.28)', icon: 'europe' };
  }
  if (text.includes('liga europ')) {
    return { label: 'Liga Europy', short: 'LE', primary: '#fb923c', secondary: '#111827', glow: 'rgba(251,146,60,0.26)', icon: 'cup' };
  }
  if (text.includes('konferencji')) {
    return { label: 'Liga Konferencji', short: 'LK', primary: '#34d399', secondary: '#2563eb', glow: 'rgba(52,211,153,0.25)', icon: 'europe' };
  }
  return { label: 'Trofeum', short: '★', primary: '#facc15', secondary: '#64748b', glow: 'rgba(250,204,21,0.22)', icon: 'star' };
};

const ManagerAchievementBadgeSvg: React.FC<{ theme: ManagerAchievementBadgeTheme; id: string }> = ({ theme, id }) => {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '-');
  const gradientId = `manager-achievement-${safeId}`;
  const renderIcon = () => {
    if (theme.icon === 'arrow') {
      return <path d="M50 72V32M34 48l16-16 16 16M30 76h40" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />;
    }
    if (theme.icon === 'shield') {
      return <path d="M50 24l24 9v18c0 17-10 29-24 36-14-7-24-19-24-36V33l24-9z" fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />;
    }
    if (theme.icon === 'europe') {
      return (
        <g fill="#fff">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = -Math.PI / 2 + i * Math.PI / 4;
            return <circle key={i} cx={50 + Math.cos(angle) * 23} cy={48 + Math.sin(angle) * 23} r="3.4" />;
          })}
          <circle cx="50" cy="48" r="12" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="4" />
        </g>
      );
    }
    if (theme.icon === 'cup') {
      return <path d="M35 29h30v13c0 12-6 20-15 22-9-2-15-10-15-22V29zM35 35H24c1 12 6 19 15 21M65 35h11c-1 12-6 19-15 21M50 64v11M38 80h24" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />;
    }
    return <path d="M50 23l7.8 16 17.6 2.5-12.7 12.4 3 17.5L50 63.1 34.3 71.4l3-17.5L24.6 41.5 42.2 39 50 23z" fill="rgba(255,255,255,0.24)" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />;
  };

  return (
    <svg viewBox="0 0 100 112" className="h-20 w-20 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.secondary} />
        </linearGradient>
      </defs>
      <path d="M50 4l37 18v32c0 24-14 42-37 53C27 96 13 78 13 54V22L50 4z" fill={`url(#${gradientId})`} />
      <path d="M50 10l31 15v29c0 20-11 35-31 45-20-10-31-25-31-45V25L50 10z" fill="rgba(2,6,23,0.34)" stroke="rgba(255,255,255,0.32)" strokeWidth="2" />
      {renderIcon()}
      <rect x="29" y="82" width="42" height="18" rx="9" fill="rgba(2,6,23,0.72)" stroke="rgba(255,255,255,0.25)" />
      <text x="50" y="95" textAnchor="middle" fontSize="12" fontWeight="900" fontStyle="italic" fill="#fff">{theme.short}</text>
    </svg>
  );
};

const ManagerAchievementBadge: React.FC<{ entry: ManagerAchievement }> = ({ entry }) => {
  const theme = getManagerAchievementBadgeTheme(entry);

  return (
    <div
      className="group relative flex min-h-[104px] items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: `${theme.primary}55`,
        background: `linear-gradient(135deg, rgba(15,23,42,0.92), ${theme.primary}18)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 34px -24px ${theme.glow}`,
      }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 24% 20%, ${theme.glow}, transparent 44%)` }} />
      <ManagerAchievementBadgeSvg theme={theme} id={entry.id} />
      <div className="relative z-10 min-w-0">
        <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-400">{theme.label}</div>
        <div className="mt-1 text-[14px] font-black italic uppercase tracking-tighter text-white leading-tight">{entry.title}</div>
        <div className="mt-1 text-[11px] font-black italic uppercase tracking-tighter" style={{ color: theme.primary }}>{entry.competition}</div>
      </div>
    </div>
  );
};

const StaffChalkboardBackdrop: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700" aria-hidden>
    <defs>
      <radialGradient id="staff-board" cx="50%" cy="35%" r="90%">
        <stop offset="0%" stopColor="#10362a" />
        <stop offset="60%" stopColor="#0b2820" />
        <stop offset="100%" stopColor="#06160f" />
      </radialGradient>
      <filter id="staff-chalk" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
    </defs>
    <rect width="1000" height="700" fill="url(#staff-board)" />
    <g stroke="#e8f5e9" strokeOpacity="0.07" strokeWidth="3" fill="none" filter="url(#staff-chalk)">
      <rect x="60" y="40" width="880" height="620" rx="4" />
      <line x1="60" y1="350" x2="940" y2="350" />
      <circle cx="500" cy="350" r="95" />
      <rect x="330" y="40" width="340" height="120" />
      <rect x="330" y="540" width="340" height="120" />
      <rect x="410" y="40" width="180" height="50" />
      <rect x="410" y="610" width="180" height="50" />
    </g>
    <g stroke="#e8f5e9" strokeOpacity="0.05" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#staff-chalk)">
      <path d="M150 560 C 240 480, 300 470, 380 410" />
      <path d="M380 410 l -18 2 m 18 -2 l -6 17" />
      <path d="M820 180 C 740 240, 700 260, 640 330" />
      <path d="M640 330 l 17 -4 m -17 4 l 4 -17" />
      <path d="M200 160 l 26 26 m 0 -26 l -26 26" />
      <path d="M790 520 l 26 26 m 0 -26 l -26 26" />
      <circle cx="265" cy="300" r="14" />
      <circle cx="730" cy="430" r="14" />
    </g>
  </svg>
);

const StaffAttributeRadar: React.FC<{ values: { label: string; value: number }[] }> = ({ values }) => {
  const C = 100;
  const R = 78;
  const count = values.length || 1;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count;
  const pt = (i: number, r: number) => `${C + Math.cos(angle(i)) * r},${C + Math.sin(angle(i)) * r}`;
  const poly = values.map((v, i) => pt(i, (v.value / 20) * R)).join(' ');

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="staff-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon key={g} points={values.map((_, i) => pt(i, R * g)).join(' ')} fill="none" stroke="#e8f5e9" strokeOpacity="0.1" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, R).split(',').map(Number);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#e8f5e9" strokeOpacity="0.08" />;
      })}
      <polygon points={poly} fill="url(#staff-radar)" fillOpacity="0.25" stroke="url(#staff-radar)" strokeWidth="2.5" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, (v.value / 20) * R).split(',').map(Number);
        return <circle key={v.label} cx={x} cy={y} r="4.5" fill={staffAttrColor(v.value)} stroke="#06160f" strokeWidth="2" />;
      })}
    </svg>
  );
};

const PLAYER_ATTRIBUTE_RADAR_ITEMS: { key: keyof Player['attributes']; label: string; short: string }[] = [
  { key: 'strength', label: 'Siła', short: 'SIŁ' },
  { key: 'stamina', label: 'Kondycja', short: 'KON' },
  { key: 'pace', label: 'Szybkość', short: 'SZY' },
  { key: 'defending', label: 'Obrona', short: 'OBR' },
  { key: 'passing', label: 'Podania', short: 'POD' },
  { key: 'attacking', label: 'Atak', short: 'ATA' },
  { key: 'finishing', label: 'Wykończenie', short: 'WYK' },
  { key: 'technique', label: 'Technika', short: 'TEC' },
  { key: 'vision', label: 'Wizja', short: 'WIZ' },
  { key: 'dribbling', label: 'Drybling', short: 'DRY' },
  { key: 'heading', label: 'Gra głową', short: 'GŁO' },
  { key: 'positioning', label: 'Ustawianie', short: 'UST' },
  { key: 'goalkeeping', label: 'Bramkarstwo', short: 'BRM' },
  { key: 'freeKicks', label: 'Rzuty wolne', short: 'WOL' },
  { key: 'penalties', label: 'Jedenastki', short: 'KAR' },
  { key: 'corners', label: 'Rożne', short: 'ROŻ' },
  { key: 'aggression', label: 'Agresja', short: 'AGR' },
  { key: 'crossing', label: 'Dośrodkowania', short: 'DOŚ' },
  { key: 'leadership', label: 'Przywództwo', short: 'LID' },
  { key: 'mentality', label: 'Mentalność', short: 'MEN' },
  { key: 'workRate', label: 'Pracowitość', short: 'PRA' },
  { key: 'talent', label: 'Talent', short: 'TAL' },
];

const playerAttrColor = (v: number) =>
  v >= 80 ? '#34d399' : v >= 65 ? '#22d3ee' : v >= 50 ? '#facc15' : v >= 35 ? '#fb923c' : '#fb7185';

const PlayerAttributeRadar: React.FC<{ attributes: Player['attributes'] }> = ({ attributes }) => {
  const C = 140;
  const R = 88;
  const LABEL_R = 118;
  const count = PLAYER_ATTRIBUTE_RADAR_ITEMS.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count;
  const point = (i: number, r: number) => ({
    x: C + Math.cos(angle(i)) * r,
    y: C + Math.sin(angle(i)) * r,
  });
  const pointString = (i: number, r: number) => {
    const p = point(i, r);
    return `${p.x},${p.y}`;
  };
  const values = PLAYER_ATTRIBUTE_RADAR_ITEMS.map(item => ({
    ...item,
    value: attributes[item.key] ?? 0,
  }));
  const polygon = values.map((v, i) => pointString(i, Math.max(0, Math.min(100, v.value)) / 100 * R)).join(' ');

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="player-radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(level => (
        <polygon
          key={level}
          points={values.map((_, i) => pointString(i, R * level)).join(' ')}
          fill="none"
          stroke="#e8f5e9"
          strokeOpacity={level === 1 ? 0.13 : 0.08}
          strokeWidth="1"
        />
      ))}
      {values.map((_, i) => {
        const p = point(i, R);
        return <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="#e8f5e9" strokeOpacity="0.07" />;
      })}
      <polygon points={polygon} fill="url(#player-radar-fill)" fillOpacity="0.18" stroke="url(#player-radar-fill)" strokeWidth="2.4" strokeLinejoin="round" />
      {values.map((v, i) => {
        const p = point(i, Math.max(0, Math.min(100, v.value)) / 100 * R);
        return (
          <circle key={v.key} cx={p.x} cy={p.y} r="3.8" fill={playerAttrColor(v.value)} stroke="#06160f" strokeWidth="1.8">
            <title>{`${v.label}: ${v.value}`}</title>
          </circle>
        );
      })}
      {values.map((v, i) => {
        const p = point(i, LABEL_R);
        return (
          <text key={v.short} x={p.x} y={p.y + 2} textAnchor="middle" fontSize="7" fontWeight="900" fill="rgba(226,232,240,.58)">
            {v.short}
          </text>
        );
      })}
    </svg>
  );
};

export const SquadView: React.FC = () => {
  const { players, userTeamId, clubs, setClubs, navigateTo, lineups, updateLineup, viewPlayerDetails, currentDate,
          reserves, setReserves, setPlayers, applyWeeklyMotivation, sessionSeed, nationalTeams, fixtures, leagues,
          coaches, staffMembers, managerProfile, fireStaffMember, extendStaffContract, negotiateStaffContract,
          toggleTransferList, toggleLoanAvailability, terminateLoanEarly, toggleUntouchable, setSquadRole, setPendingOpenTalk, seasonNumber, viewCoachDetails, setMessages,
          managedReserveClubId, activeManagerContract } = useGame();
  
  const myClub = useMemo(() => clubs.find(c => c.id === userTeamId), [clubs, userTeamId]);
  const myPlayers = userTeamId ? players[userTeamId] : [];
  const myLineup = userTeamId ? lineups[userTeamId] : null;
  const allLeaguePlayers = useMemo(() => Object.values(players).flat(), [players]);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; playerId: string; loc: 'START' | 'BENCH' | 'RES' } | null>(null);
  const [reportPlayer, setReportPlayer] = useState<Player | null>(null);
  const [reportModalPos, setReportModalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [reportDragging, setReportDragging] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string | null, index?: number, loc: 'START' | 'BENCH' | 'RES' } | null>(null);
  const [draggedPitchSlot, setDraggedPitchSlot] = useState<{ id: string | null, index: number } | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isMotivationOpen, setIsMotivationOpen] = useState(false);
  const [roleSubmenuOpen, setRoleSubmenuOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isManagerProfileOpen, setIsManagerProfileOpen] = useState(false);
  const [managerExpFilter, setManagerExpFilter] = useState<'ALL' | 'DOMESTIC' | 'EUROPE' | 'SEASON'>('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [staffActionMsg, setStaffActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [staffFireConfirmOpen, setStaffFireConfirmOpen] = useState(false);
  const [staffNegotiationOpen, setStaffNegotiationOpen] = useState(false);
  const [staffNegPhase, setStaffNegPhase] = useState<'proposal' | 'counter' | 'result'>('proposal');
  const [staffNegProposedSalary, setStaffNegProposedSalary] = useState(0);
  const [staffNegProposedYears, setStaffNegProposedYears] = useState(1);
  const [staffNegCounterSalary, setStaffNegCounterSalary] = useState(0);
  const [staffNegCounterYears, setStaffNegCounterYears] = useState(1);
  const [staffNegResultMsg, setStaffNegResultMsg] = useState('');
  const [staffNegResultOk, setStaffNegResultOk] = useState(false);
  const [staffNegSalaryStr, setStaffNegSalaryStr] = useState('');
  const [activeTab, setActiveTab] = useState<'SQUAD' | 'CONTRACT' | 'MORALE' | 'SCHEDULE' | 'TABLE' | 'LOANS'>('SQUAD');
  const [selectedScheduleReportId, setSelectedScheduleReportId] = useState<string | null>(null);
  const [loanDetailsPlayerId, setLoanDetailsPlayerId] = useState<string | null>(null);
  const loanDetailsPlayer = useMemo(
    () => loanDetailsPlayerId ? allLeaguePlayers.find(player => player.id === loanDetailsPlayerId) ?? null : null,
    [allLeaguePlayers, loanDetailsPlayerId]
  );
  const [scheduleSeasonFilter, setScheduleSeasonFilter] = useState<number | null>(null);

  const REGION_LABELS: Record<string, string> = {
    POLAND: 'Polska', ENGLAND: 'Anglia', GERMANY: 'Niemcy', FRANCE: 'Francja',
    SPAIN: 'Hiszpania', ITALY: 'Włochy', BALKANS: 'Bałkany', CZ_SK: 'Czechy/Słowacja',
    SCANDINAVIA: 'Skandynawia', EX_USSR: 'WNP', BALTIC: 'Kraje bałtyckie', ROMANIA: 'Rumunia',
  };
  const cachedReport = useMemo(() => {
    if (!reportPlayer) return null;
    const getStaffQ = (role: StaffRole, keys: string[]) => {
      const ms = (myClub?.staffIds ?? []).map(id => staffMembers[id]).filter(s => s?.role === role);
      if (ms.length === 0) return 0;
      return Math.round(ms.reduce((sum, s) => sum + keys.reduce((ks, k) => ks + (((s?.attributes ?? {}) as Record<string, number>)[k] ?? 10), 0) / keys.length, 0) / ms.length);
    };
    const staffQuality = {
      assistantExists: (myClub?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.ASSISTANT_COACH),
      assistantAvg: getStaffQ(StaffRole.ASSISTANT_COACH, ['offensiveTactics', 'defensiveTactics', 'motivation']),
      fitnessExists: (myClub?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.FITNESS_COACH),
      fitnessAvg: getStaffQ(StaffRole.FITNESS_COACH, ['periodization', 'fitnessTests', 'nutrition']),
      goalkeeperExists: (myClub?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.GOALKEEPER_COACH),
      goalkeeperAvg: getStaffQ(StaffRole.GOALKEEPER_COACH, ['gkTechnique', 'positioning', 'footwork'])
    };
    return generatePlayerReport(reportPlayer, myPlayers, allLeaguePlayers, staffQuality);
  }, [reportPlayer, myClub, staffMembers, myPlayers, allLeaguePlayers]);

  const assistants = useMemo(() =>
    (myClub?.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter(s => !!s && s.role === StaffRole.ASSISTANT_COACH),
    [myClub, staffMembers]
  );
  const hasAssistant = assistants.length > 0;

  const getAverageRatingBadgeClass = (rating: number | null): string => {
    if (rating === null) return 'bg-slate-700 border-slate-500 text-slate-200';
    if (rating < 6.0) return 'bg-red-600 border-red-400 text-white';
    if (rating <= 6.9) return 'bg-orange-500 border-orange-300 text-white';
    return 'bg-emerald-600 border-emerald-400 text-white';
  };

  const getOverallBadgeClass = (overall: number): string => {
    if (overall >= 75) return 'border-emerald-300 bg-emerald-500 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.35)]';
    if (overall >= 65) return 'border-yellow-300 bg-yellow-400 text-slate-950 shadow-[0_0_14px_rgba(250,204,21,0.32)]';
    if (overall >= 55) return 'border-blue-300 bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.32)]';
    return 'border-red-300 bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,0.32)]';
  };

  const getMoraleIcon = (morale: number = 50): string => {
    if (morale <= 19) return '⭐';
    if (morale <= 39) return '⭐⭐';
    if (morale <= 59) return '⭐⭐⭐';
    if (morale <= 79) return '⭐⭐⭐⭐';
    return '⭐⭐⭐⭐⭐';
  };

  const formatContractSalary = (salary?: number | null): string => {
    if (!salary || salary <= 0) return '-';
    return `${salary.toLocaleString('pl-PL')} PLN`;
  };

  const formatMarketValue = (value?: number | null): string => {
    if (!value || value <= 0) return '-';
    return `${value.toLocaleString('pl-PL')} PLN`;
  };

  const formatContractEnd = (contractEndDate?: string | null): string => {
    if (!contractEndDate) return '-';
    const date = new Date(contractEndDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatLoanEnd = (player: Player): string => {
    if (!player.loan) return '-';
    const date = new Date(player.loan.endDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatLoanDate = (isoDate?: string): string => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getLoanDaysLeft = (isoDate?: string): number | null => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return Math.max(0, Math.ceil((date.getTime() - currentDate.getTime()) / 86_400_000));
  };

  const getLoanMatches = (player: Player): number => {
    return Math.max(0, (player.stats.matchesPlayed ?? 0) - (player.loan?.reportBaselineMatches ?? player.stats.matchesPlayed ?? 0));
  };

  const getLoanMinutes = (player: Player): number => {
    return Math.max(0, (player.stats.minutesPlayed ?? 0) - (player.loan?.reportBaselineMinutes ?? player.stats.minutesPlayed ?? 0));
  };

  const getLoanAverageRating = (player: Player): string => {
    const baseline = player.loan?.reportBaselineRatingCount ?? (player.stats.ratingHistory?.length ?? 0);
    const ratings = (player.stats.ratingHistory || []).slice(baseline);
    if (ratings.length === 0) return '-';
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
  };

  const getContractRemainingInfo = (contractEndDate?: string | null): { label: string; className: string } => {
    if (!contractEndDate) return { label: 'Brak danych', className: 'text-slate-500' };
    const end = new Date(contractEndDate);
    if (Number.isNaN(end.getTime())) return { label: 'Brak danych', className: 'text-slate-500' };
    const today = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft < 0) return { label: 'Wygasł', className: 'text-red-400' };
    if (daysLeft <= 180) return { label: `${daysLeft} dni`, className: 'text-red-400' };
    if (daysLeft <= 365) return { label: `${Math.ceil(daysLeft / 30)} mies.`, className: 'text-amber-400' };
    return { label: `${Math.ceil(daysLeft / 365)} lata`, className: 'text-emerald-400' };
  };

  const getSquadRoleInfo = (role?: Player['squadRole']): { label: string; className: string } => {
    if (role === 'KEY_PLAYER') return { label: 'Kluczowy', className: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300' };
    if (role === 'STARTER') return { label: 'Podstawowa 11', className: 'border-blue-400/30 bg-blue-500/10 text-blue-300' };
    return { label: 'Brak', className: 'border-slate-500/20 bg-slate-500/10 text-slate-500' };
  };

  const getPositionBadgeClass = (position: string): string => {
    if (position === 'GK') return 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-[0_0_16px_rgba(250,204,21,0.28)]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position) || position.startsWith('DEF')) {
      return 'bg-blue-600 border-blue-300 text-white shadow-[0_0_16px_rgba(59,130,246,0.28)]';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position) || position.startsWith('MID')) {
      return 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_16px_rgba(16,185,129,0.28)]';
    }
    return 'bg-red-600 border-red-300 text-white shadow-[0_0_16px_rgba(239,68,68,0.28)]';
  };

  const getPositionRowTintClass = (position: string): string => {
    if (position === 'GK') return 'bg-yellow-500/[0.08] hover:bg-yellow-500/[0.12]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position) || position.startsWith('DEF')) {
      return 'bg-blue-500/[0.08] hover:bg-blue-500/[0.12]';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position) || position.startsWith('MID')) {
      return 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]';
    }
    return 'bg-red-500/[0.08] hover:bg-red-500/[0.12]';
  };

  const getPositionLabelClass = (label: string): string => {
    if (label === 'SUB' || label === 'RES') return 'bg-slate-700/70 border-slate-500/50 text-slate-200';
    if (label === 'GK') return 'bg-yellow-500/25 border-yellow-300/40 text-yellow-200';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(label) || label.startsWith('DEF')) {
      return 'bg-blue-500/25 border-blue-300/40 text-blue-200';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(label) || label.startsWith('MID')) {
      return 'bg-emerald-500/25 border-emerald-300/40 text-emerald-200';
    }
    return 'bg-red-500/25 border-red-300/40 text-red-200';
  };

  const getMoraleInfo = (morale: number): { label: string; color: string; barColor: string; bg: string; border: string; description: string } => {
    if (morale <= 20) return { label: 'BARDZO NISKIE', color: 'text-red-500', barColor: 'bg-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', description: 'Szatnia podzielona. Brak wiary w sukces.' };
    if (morale <= 35) return { label: 'NISKIE', color: 'text-orange-400', barColor: 'bg-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', description: 'Nastroje wyraźnie przygnębione. Drużyna potrzebuje pozytywnego impulsu, aby odwrócić trend.' };
    if (morale <= 64) return { label: 'NEUTRALNE', color: 'text-white', barColor: 'bg-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', description: 'Stabilna atmosfera w szatni.' };
    if (morale <= 79) return { label: 'WYSOKIE', color: 'text-green-400', barColor: 'bg-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', description: 'Pozytywna atmosfera w szatni.' };
    return { label: 'BARDZO WYSOKIE', color: 'text-yellow-400', barColor: 'bg-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', description: 'Znakomite morale! Drużyna jest w stanie szczytowej gotowości.' };
  };

  const leagueClubs = useMemo(() => myClub ? clubs.filter(c => c.leagueId === myClub.leagueId) : [], [clubs, myClub]);
  const leaguePosition = useMemo(() => {
    if (!myClub) return 0;
    const sorted = [...leagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    return sorted.findIndex(c => c.id === myClub.id) + 1;
  }, [leagueClubs, myClub]);

  const mySchedule = useMemo(() => {
    if (!userTeamId) return [];
    return [...fixtures]
      .filter(f =>
        (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
        !String(f.leagueId).endsWith('_DRAW')
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fixtures, userTeamId]);

  const lineupCompetitionId = useMemo(() => {
    const currentTime = new Date(currentDate).getTime();
    const nextFixture = mySchedule.find(f =>
      f.status === MatchStatus.SCHEDULED &&
      new Date(f.date).getTime() >= currentTime
    );
    return nextFixture?.leagueId as string | undefined;
  }, [currentDate, mySchedule]);

  const isSuspendedForLineup = (player: Player): boolean =>
    LineupService.getSuspensionMatchesForCompetition(player, lineupCompetitionId) > 0;

  const isUnavailableForLineup = (player: Player): boolean =>
    LineupService.isUnavailableForLineup(player, { competitionId: lineupCompetitionId });

  const allMatchHistory = useMemo(() => MatchHistoryService.getAll(), [seasonNumber, fixtures]);
  const selectedScheduleReportSeason = scheduleSeasonFilter ?? seasonNumber;
  const selectedScheduleReport = useMemo(
    () => selectedScheduleReportId
      ? [...allMatchHistory].reverse().find(match =>
          match.matchId === selectedScheduleReportId &&
          match.season === selectedScheduleReportSeason
        ) ?? null
      : null,
    [selectedScheduleReportId, selectedScheduleReportSeason, allMatchHistory]
  );
  const isSelectedScheduleReportEuropean = !!selectedScheduleReport && (
    selectedScheduleReport.competition.startsWith('CL_') ||
    selectedScheduleReport.competition.startsWith('EL_') ||
    selectedScheduleReport.competition.startsWith('CONF_') ||
    selectedScheduleReport.competition === CompetitionType.UEFA_SUPER_CUP
  );

  const pastScheduleSeasons = useMemo(() => {
    if (!userTeamId) return [];
    const seasonMap = new Map<number, number>();
    allMatchHistory.forEach(m => {
      if (m.season >= seasonNumber) return;
      if (m.homeTeamId !== userTeamId && m.awayTeamId !== userTeamId) return;
      const year = new Date(m.date).getFullYear();
      const existing = seasonMap.get(m.season);
      if (existing === undefined || year < existing) seasonMap.set(m.season, year);
    });
    return [...seasonMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([season, minYear]) => ({ season, label: `${minYear}/${String(minYear + 1).slice(-2)}` }));
  }, [allMatchHistory, userTeamId, seasonNumber]);

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

  const neutralTypes: string[] = [
    CompetitionType.SUPER_CUP, CompetitionType.UEFA_SUPER_CUP,
    CompetitionType.CL_FINAL, CompetitionType.EL_FINAL, CompetitionType.CONF_FINAL,
  ];

  const getVenueInfo = (f: Fixture): { label: string; color: string } => {
    if (f.neutralVenue || neutralTypes.includes(f.leagueId as string)) {
      return { label: 'NEUTRALNY', color: 'text-amber-400' };
    }
    if (f.homeTeamId === userTeamId) return { label: 'DOM', color: 'text-emerald-400' };
    return { label: 'WYJAZD', color: 'text-sky-400' };
  };

  const nationalTeamByPlayerId = useMemo(() => {
    const map = new Map<string, NationalTeam>();
    nationalTeams.forEach(nt => {
      nt.squadPlayerIds.forEach(id => map.set(id, nt));
    });
    return map;
  }, [nationalTeams]);

  const canMotivate = useMemo(() => myClub ? WeeklyMotivationService.canMotivate(myClub, currentDate) : false, [myClub, currentDate]);
  const teamMoraleSnapshot = useMemo(() => {
    const clubMorale = PlayerMoraleService.clamp(myClub?.morale ?? 50);
    const moralePlayers = myPlayers.map(player => PlayerMoraleService.ensurePlayerState(player));
    const playerAverageMorale = moralePlayers.length > 0
      ? Math.round(moralePlayers.reduce((sum, player) => sum + (player.morale ?? 50), 0) / moralePlayers.length)
      : clubMorale;
    const effectiveMorale = PlayerMoraleService.clamp((clubMorale * 0.6) + (playerAverageMorale * 0.4));

    return {
      clubMorale,
      playerAverageMorale,
      effectiveMorale,
    };
  }, [myClub?.morale, myPlayers]);
  const motivationPanelText = canMotivate
    ? 'Druzyna jest gotowa na kolejna rozmowe motywacyjna.'
    : 'Regularny kontakt z szatnia ma znaczenie. Jesli atmosfera zacznie sie psuc, kapitan da Ci o tym znac w wiadomosci.';

  const handleMotivationConfirm = (talk: MotivationTalkOption, result: MotivationTalkResult) => {
    applyWeeklyMotivation(result.moraleDelta);
    setIsMotivationOpen(false);
  };

  const moveToReserves = (player: Player) => {
    if (!userTeamId || !myLineup) return;

    const slotIndex = myLineup.startingXI.indexOf(player.id);
    const firstTeamAverage = myPlayers.length > 0
      ? myPlayers.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / myPlayers.length
      : player.overallRating;
    const isAboveFirstTeamLevel = player.overallRating >= firstTeamAverage + 2;

    // Jeśli zawodnik był w XI — szukamy zastępcy z rezerw taktycznych
    let replacementId: string | null = null;
    if (slotIndex >= 0) {
      const slotRole = currentTactic.slots[slotIndex]?.role;
      const availableReserves = myLineup.reserves
        .map(id => myPlayers.find(p => p.id === id))
        .filter((p): p is Player =>
          !!p &&
          !isUnavailableForLineup(p) &&
          !(p.health.status === HealthStatus.INJURED &&
            (p.health.injury?.severity === InjurySeverity.SEVERE ||
              (p.health.injury?.daysRemaining ?? 0) > 2)) &&
          p.condition >= 60
        );
      replacementId = (
        availableReserves.find(p => p.position === slotRole) ??
        availableReserves[0] ??
        null
      )?.id ?? null;
    }

    const removedFromReserves = new Set([player.id, ...(replacementId ? [replacementId] : [])]);

    const newLineup = {
      ...myLineup,
      startingXI: myLineup.startingXI.map(id => (id === player.id ? replacementId : id)),
      bench: myLineup.bench.filter(id => id !== player.id),
      reserves: myLineup.reserves.filter(id => !removedFromReserves.has(id)),
    };

    updateLineup(userTeamId, newLineup);
    setPlayers(prev => ({ ...prev, [userTeamId]: prev[userTeamId].filter(p => p.id !== player.id) }));
    const clubData = clubs.find(c => c.id === userTeamId);
    let updatedPlayer = player;
    if (clubData) {
      const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
      const reserveClub = managedReserveClubId
        ? clubs.find(candidate => candidate.id === managedReserveClubId)
        : null;
      const newHistory = PlayerCareerService.reopenOrCreateEntry(
        player.history || [],
        player,
        {
          clubId: managedReserveClubId ?? userTeamId,
          clubName: reserveClub?.name ?? `${clubData.name} II`,
        },
        d.getFullYear(),
        d.getMonth() + 1
      );
      updatedPlayer = {
        ...player,
        clubId: managedReserveClubId ?? userTeamId,
        history: newHistory,
        // Keep manual and AI internal moves on one audit/cooldown model. No
        // market transaction is created for this registration change.
        lastInternalSquadMoveDate: currentDate.toISOString(),
        lastInternalSquadMoveDirection: 'TO_RESERVES',
        firstTeamSurplusSince: null,
      };
    }
    if (isAboveFirstTeamLevel) {
      const moralePlayer = PlayerMoraleService.ensurePlayerState(updatedPlayer);
      const protestDeadline = new Date(currentDate);
      protestDeadline.setDate(protestDeadline.getDate() + 14);
      const protestDeadlineKey = protestDeadline.toISOString().split('T')[0];
      const protestTargetMorale = player.overallRating >= firstTeamAverage + 7 || player.squadRole === 'KEY_PLAYER' || player.squadRole === 'STARTER'
        ? 10
        : 16;
      const targetMorale = Math.min(moralePlayer.morale ?? 50, protestTargetMorale);
      updatedPlayer = {
        ...PlayerMoraleService.withMoraleChange(
          moralePlayer,
          targetMorale - (moralePlayer.morale ?? 50),
          'Zesłanie ponadprzeciętnego zawodnika do rezerw',
          currentDate
        ),
        squadRole: null,
        reserveProtestUntil: protestDeadlineKey,
      };

      const playerName = `${player.firstName} ${player.lastName}`;
      const protestMail: MailMessage = {
        id: `PLAYER_RESERVE_PROTEST_${player.id}_${new Date(currentDate).toISOString().split('T')[0]}`,
        sender: playerName,
        role: 'Zawodnik',
        subject: `Protest po zesłaniu do rezerw: ${player.lastName}`,
        body: [
          'Trenerze,',
          '',
          'Nie zgadzam się z decyzją o przesunięciu mnie do rezerw. Uważam, że sportowo jestem ponad przeciętną tej drużyny i taka decyzja wygląda dla mnie jak odsunięcie bez jasnego uzasadnienia.',
          '',
          'Potrzebuję rozmowy i konkretnego wyjaśnienia, co muszę zrobić, żeby wrócić do pierwszego zespołu. W obecnej sytuacji bardzo trudno mi utrzymać normalne nastawienie do pracy.',
          '',
          `Jeśli do ${protestDeadline.toLocaleDateString('pl-PL')} sytuacja pozostanie bez reakcji, będę chciał porozmawiać o odejściu z klubu.`,
          '',
          playerName,
        ].join('\n'),
        date: new Date(currentDate),
        isRead: false,
        type: MailType.STAFF,
        priority: player.squadRole === 'KEY_PLAYER' || player.squadRole === 'STARTER' ? 5 : 4,
      };
      setMessages(prev => prev.some(mail => mail.id === protestMail.id) ? prev : [protestMail, ...prev]);
    }
    setReserves(prev => [...prev, updatedPlayer]);
    if (managedReserveClubId) {
      // Club.rosterIds is a lightweight index used by several AI and editor
      // paths. Keep it synchronized with the canonical players map whenever a
      // manager performs an internal registration change.
      setClubs(previousClubs => previousClubs.map(club => {
        if (club.id === userTeamId) {
          return { ...club, rosterIds: club.rosterIds.filter(id => id !== updatedPlayer.id) };
        }
        if (club.id === managedReserveClubId) {
          return { ...club, rosterIds: Array.from(new Set([...club.rosterIds, updatedPlayer.id])) };
        }
        return club;
      }));
      const linkedLineup = lineups[managedReserveClubId];
      if (linkedLineup) {
        updateLineup(managedReserveClubId, {
          ...linkedLineup,
          reserves: Array.from(new Set([...linkedLineup.reserves, updatedPlayer.id])),
        });
      }
    }
  };

  const currentTactic = useMemo(() => {
    return myLineup ? TacticRepository.getById(myLineup.tacticId) : TacticRepository.getDefault();
  }, [myLineup]);

  const getPlayerById = (id: string | null) => id ? myPlayers.find(p => p.id === id) : null;

  const formatPitchPlayerName = (player: Player) => {
    const firstInitial = player.firstName.trim().charAt(0);
    return firstInitial ? `${firstInitial}. ${player.lastName}` : player.lastName;
  };

  const handlePlayerClick = (pId: string | null, loc: 'START' | 'BENCH' | 'RES', index?: number) => {
    if (!myLineup || !userTeamId) return;

    if (selectedSlot === null) {
      const clickedPlayer = pId ? myPlayers.find(p => p.id === pId) : null;
      if (clickedPlayer && loc === 'RES') {
         // Sprawdź zawieszenia
         if (isSuspendedForLineup(clickedPlayer)) {
            return;
         }
         // Sprawdź kontuzje (SEVERE lub daysRemaining > 2)
         if (clickedPlayer.health.status === HealthStatus.INJURED && (clickedPlayer.health.injury?.severity === InjurySeverity.SEVERE || (clickedPlayer.health.injury?.daysRemaining ?? 0) > 2)) {
            return;
         }
         // Sprawdź przemęczenie (kondycja < 60)
         if (clickedPlayer.condition < 60) {
            return;
         }
      }
      setSelectedSlot({ id: pId, index, loc });
    } else {
      const sourcePlayer = selectedSlot.id ? myPlayers.find(p => p.id === selectedSlot.id) : null;
      
      // Walidacja przy wstawianiu zawodnika z Rezerw do składu
      if (sourcePlayer && selectedSlot.loc === 'RES' && loc !== 'RES') {
         if (isSuspendedForLineup(sourcePlayer)) {
            setSelectedSlot(null);
            return;
         }
         if (sourcePlayer.health.status === HealthStatus.INJURED && (sourcePlayer.health.injury?.severity === InjurySeverity.SEVERE || (sourcePlayer.health.injury?.daysRemaining ?? 0) > 2)) {
            setSelectedSlot(null);
            return;
         }
         // Sprawdź przemęczenie (kondycja < 60)
         if (sourcePlayer.condition < 60) {
            setSelectedSlot(null);
            return;
         }
      }
      // Walidacja klikniętego zawodnika z Rezerw wstawianego do XI/ławki (slot wybrany wcześniej)
      if (loc === 'RES' && selectedSlot.loc !== 'RES') {
         const clickedTarget = pId ? myPlayers.find(p => p.id === pId) : null;
         if (clickedTarget) {
            if (isSuspendedForLineup(clickedTarget)) {
               setSelectedSlot(null);
               return;
            }
            if (clickedTarget.health.status === HealthStatus.INJURED && (clickedTarget.health.injury?.severity === InjurySeverity.SEVERE || (clickedTarget.health.injury?.daysRemaining ?? 0) > 2)) {
               setSelectedSlot(null);
               return;
            }
            if (clickedTarget.condition < 60) {
               setSelectedSlot(null);
               return;
            }
         }
      }

      // Wykonaj uniwersalną zamianę
      const newLineup = LineupService.swapPlayers(
        myLineup, 
        selectedSlot.id, 
        pId, 
        selectedSlot.loc === 'START' ? selectedSlot.index : undefined, 
        loc === 'START' ? index : undefined
      );
      updateLineup(userTeamId, newLineup);
      fixSpecialRoles(newLineup.startingXI);
      setSelectedSlot(null);
    }
  };

  const handlePlayerDoubleClick = (playerId: string) => {
    viewPlayerDetails(playerId);
  };

  const handlePitchDragStart = (playerId: string | null, index: number) => {
    if (!playerId) return;
    setDraggedPitchSlot({ id: playerId, index });
  };

  const handlePitchDrop = (targetPlayerId: string | null, targetIndex: number) => {
    if (!myLineup || !userTeamId || !draggedPitchSlot || draggedPitchSlot.index === targetIndex) {
      setDraggedPitchSlot(null);
      return;
    }

    const newLineup = LineupService.swapPlayers(
      myLineup,
      draggedPitchSlot.id,
      targetPlayerId,
      draggedPitchSlot.index,
      targetIndex
    );
    updateLineup(userTeamId, newLineup);
    fixSpecialRoles(newLineup.startingXI);
    setDraggedPitchSlot(null);
    setSelectedSlot(null);
  };

  const handleTacticChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!myLineup || !userTeamId) return;
    const newLineup = { ...myLineup, tacticId: e.target.value };
    updateLineup(userTeamId, newLineup);
  };

  const fixSpecialRoles = (newStartingXI: (string | null)[]) => {
    if (!userTeamId || !myClub) return;
    const xiIds = newStartingXI.filter((id): id is string => id !== null);
    const xiPlayers = myPlayers.filter(p => xiIds.includes(p.id));
    if (xiPlayers.length === 0) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      const captainId = c.captainId && xiIds.includes(c.captainId)
        ? c.captainId
        : [...xiPlayers].sort((a, b) => b.attributes.leadership - a.attributes.leadership)[0]?.id ?? null;
      const penaltyTakerId = c.penaltyTakerId && xiIds.includes(c.penaltyTakerId)
        ? c.penaltyTakerId
        : [...xiPlayers].sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0]?.id ?? null;
      const freeKickTakerId = c.freeKickTakerId && xiIds.includes(c.freeKickTakerId)
        ? c.freeKickTakerId
        : [...xiPlayers].sort((a, b) => b.attributes.freeKicks - a.attributes.freeKicks)[0]?.id ?? null;
      return { ...c, captainId, penaltyTakerId, freeKickTakerId };
    }));
  };

  const handleAutoPick = () => {
    if(!userTeamId) return;
    if (!hasAssistant) return;
    const newLineup = { ...LineupService.autoPickLineup(userTeamId, myPlayers, currentTactic.id, null, { useSecondaryPositions: true, competitionId: lineupCompetitionId }) };
    updateLineup(userTeamId, newLineup);
    fixSpecialRoles(newLineup.startingXI);
  };

  const benchPlayers = useMemo(() => {
    if (!myLineup) return [];
    const pObjs = myLineup.bench.map(id => getPlayerById(id)).filter(Boolean) as Player[];
    return PlayerPresentationService.sortPlayers(pObjs).map(p => p.id);
  }, [myLineup?.bench, myPlayers]);

  const reservePlayersSorted = useMemo(() => {
    if (!myLineup) return [];
    const pObjs = myLineup.reserves.map(id => getPlayerById(id)).filter(Boolean) as Player[];
    return PlayerPresentationService.sortPlayers(pObjs).map(p => p.id);
  }, [myLineup?.reserves, myPlayers]);

  const teamAnalysisReport = useMemo(() => {
    if (!myClub || myPlayers.length === 0) return null;
    return TeamAnalysisService.analyzeSquad(myClub, myPlayers, currentDate);
  }, [myClub, myPlayers, currentDate]);

  if (!myLineup || !userTeamId || !myClub) return null;

  const getPositionGroup = (role: string): string => {
    if (role === 'GK') return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(role) || role.startsWith('DEF')) return 'DEF';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(role) || role.startsWith('MID')) return 'MID';
    return 'FWD';
  };

  const renderPlayerRow = (pId: string | null, label: string, loc: 'START' | 'BENCH' | 'RES', index?: number) => {
    const isContractTab = activeTab === 'CONTRACT';
    const player = pId ? getPlayerById(pId) : null;
    const isSelected = selectedSlot?.loc === loc && (loc === 'START' ? selectedSlot.index === index : selectedSlot.id === pId);
    const selectedRole = selectedSlot?.loc === 'START' && selectedSlot.index !== undefined ? currentTactic.slots[selectedSlot.index]?.role : null;
    const isHighlighted = !isSelected && selectedRole && (loc === 'BENCH' || loc === 'RES') && player
      && !isSuspendedForLineup(player)
      && !(player.health.status === HealthStatus.INJURED && (player.health.injury?.severity === InjurySeverity.SEVERE || (player.health.injury?.daysRemaining ?? 0) > 2))
      && !(player.condition < 60)
      && PlayerPositionFitService.matchesRole(player, selectedRole, true);

    if (!player && loc === 'START') {
      return (
        <tr 
          key={`empty-${index}`}
          onClick={() => handlePlayerClick(null, 'START', index)}
          className={`group h-16 border-b border-white/5 cursor-pointer transition-all animate-pulse
            ${isSelected ? 'bg-red-500/30 ring-2 ring-inset ring-red-500' : 'bg-red-500/5 hover:bg-red-500/10'}`}
        >
          <td className="pl-6 w-12 text-[10px] font-black text-red-500/50 uppercase tracking-tighter">{label}</td>
          <td className="w-6 text-center text-slate-700">
            <span className="inline-flex items-center justify-center text-[10px] font-black">→</span>
          </td>
          <td colSpan={isContractTab ? 9 : 9} className="px-4 text-[11px] font-black text-red-500 italic uppercase tracking-widest">
            &gt; WSTAW ZAWODNIKA &lt;
          </td>
        </tr>
      );
    }

    if (!player) return null;

    const healthInfo = PlayerPresentationService.getHealthDisplay(player);
    const condColor = PlayerPresentationService.getConditionColorClass(player.condition);
    const pendingTransferClub = player.transferPendingClubId
      ? clubs.find(c => c.id === player.transferPendingClubId)
      : null;
    const hasPendingTransfer = !!player.transferPendingClubId && !!player.transferReportDate;
    const pendingTransferFeeLabel = player.transferPendingFee === 0
      ? 'Wolny transfer po wygaśnięciu kontraktu'
      : player.transferPendingFee
        ? `Kwota: ${player.transferPendingFee.toLocaleString('pl-PL')} PLN`
        : 'Transfer uzgodniony';
    const isSuspended = isSuspendedForLineup(player);
    const isSevereInjured = player.health.status === HealthStatus.INJURED && player.health.injury?.severity === InjurySeverity.SEVERE;
    const isOverfatigued = player.condition < 60;
    const slotRole = loc === 'START' && index !== undefined ? currentTactic.slots[index]?.role : null;
    const positionPenaltyFactor = player && slotRole ? PlayerPositionFitService.getPenaltyFactor(player, slotRole, true) : 0;
    const isSecondaryPosition = !!player && !!slotRole && PlayerPositionFitService.hasSecondaryPosition(player, slotRole) && positionPenaltyFactor > 0;
    // The penalty curve is no longer binary, so the UI marks only heavy mismatches as clearly
    // out of position. Mild role conversions can stay playable without a red warning.
    const isOutOfPosition = !!player && !!slotRole && positionPenaltyFactor >= 0.55;
    const averageRating = player.stats?.ratingHistory?.length
      ? player.stats.ratingHistory.reduce((a, b) => a + b, 0) / player.stats.ratingHistory.length
      : null;
    const moralePlayer = PlayerMoraleService.ensurePlayerState(player);
    const playerMoraleInfo = PlayerMoraleService.getInfo(moralePlayer.morale);
    const playerFormInfo = PlayerFormService.getInfo(player.form ?? PlayerFormService.calculate(player).score);
    const effectiveOverall = PlayerMoraleService.getEffectiveOverall(moralePlayer);
    const contractRemaining = getContractRemainingInfo(player.contractEndDate);
    const squadRoleInfo = getSquadRoleInfo(player.squadRole);

    return (
      <tr
        key={`${loc}-${player.id}-${index ?? 0}`}
        onClick={() => handlePlayerClick(player.id, loc, index)}
        onDoubleClick={() => handlePlayerDoubleClick(player.id)}
        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, playerId: player.id, loc }); }}
        className={`group relative h-14 border-b border-white/5 transition-all cursor-pointer
          ${isSelected ? 'bg-blue-600/20 ring-1 ring-inset ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : isHighlighted ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/60 shadow-[0_0_16px_rgba(52,211,153,0.15)]' : isSecondaryPosition ? 'bg-amber-950/25 ring-1 ring-inset ring-amber-400/60 shadow-[0_0_14px_rgba(251,191,36,0.14)]' : isOutOfPosition ? 'bg-red-950/30 ring-2 ring-inset ring-red-500 shadow-[0_0_18px_rgba(239,68,68,0.2)]' : getPositionRowTintClass(player.position)}
          ${(isSuspended || isSevereInjured || isOverfatigued) ? 'opacity-30 grayscale' : ''}`}
      >
        <td className="w-12 relative z-10 overflow-hidden">
           <span className={`absolute inset-y-0 left-0 inline-flex w-10 items-center justify-center rounded-r-md border text-[8px] font-black uppercase tracking-tight ${getPositionLabelClass(label)}`}>
             {label}
           </span>
        </td>
        <td className="w-6 relative z-10 text-center">
          <span className="inline-flex items-center justify-center text-slate-500/80">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M3 8h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </td>
        <td className="w-14 relative z-10">
          <span
            title={player.secondaryPosition && player.secondaryPosition !== player.position ? `Druga pozycja: ${player.secondaryPosition}` : undefined}
            className={`relative inline-flex h-8 min-w-[32px] items-center justify-center rounded-full border px-1.5 font-mono text-[9px] font-black leading-none tracking-tight ${getPositionBadgeClass(player.position)}`}
          >
            {player.position}
            {player.secondaryPosition && player.secondaryPosition !== player.position && (
              <span className={`absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border px-0.5 text-[7px] font-black leading-none ${getPositionBadgeClass(player.secondaryPosition)}`}>
                +1
              </span>
            )}
          </span>
        </td>
        <td className="relative z-10 w-52">
           <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className={`text-sm font-black uppercase italic tracking-tight transition-colors ${(isSuspended || isSevereInjured || isOverfatigued) ? 'text-slate-500' : 'text-white group-hover:text-blue-400'}`}>
                  {player.lastName}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${(isSuspended || isSevereInjured || isOverfatigued) ? 'text-slate-400' : 'text-white'}`}>{player.firstName}</span>
              </div>
              {myClub?.captainId === player.id && (
                <span className="w-5 h-5 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center text-[9px] font-black text-white shrink-0" title="Kapitan">C</span>
              )}
              {myClub?.penaltyTakerId === player.id && (
                <span className="px-1.5 py-0.5 bg-emerald-900/60 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/40 shrink-0 leading-none" title="Egzekutor karnych">PK</span>
              )}
              {myClub?.freeKickTakerId === player.id && (
                <span className="px-1.5 py-0.5 bg-amber-900/60 text-amber-400 text-[8px] font-black rounded border border-amber-500/40 shrink-0 leading-none" title="Egzekutor wolnych">FK</span>
              )}
              {player.isOnTransferList && !hasPendingTransfer && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] font-black rounded border border-amber-500/30 shadow-sm shrink-0 leading-none">
                     LISTA
                </span>
              )}
              {player.isAvailableForLoan && !player.loan && (
                <span
                  title="Dostępny do wypożyczenia"
                  className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[8px] font-black italic uppercase tracking-tighter rounded border border-cyan-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  LOAN
                </span>
              )}
              {hasPendingTransfer && (
                <span
                  title={`Transfer do ${pendingTransferClub?.name ?? player.transferPendingClubId}${player.transferReportDate ? `\nData przejścia: ${new Date(player.transferReportDate).toLocaleDateString('pl-PL')}` : ''}\n${pendingTransferFeeLabel}`}
                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  TRS
                </span>
              )}
              {/* Badge zainteresowania transferowego — pojawia się gdy ≥1 klub AI obserwuje zawodnika */}
              {player.loan && (
                <span
                  title={`Wypożyczony z ${player.loan.parentClubName} do ${player.loan.destinationClubName}\nDo: ${formatLoanEnd(player)}`}
                  className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[8px] font-black italic uppercase tracking-tighter rounded border border-cyan-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  WYP
                </span>
              )}
              {player.interestedClubs && player.interestedClubs.filter(id => id !== player.clubId).length > 0 && (
                <span
                  title={`Zainteresowane kluby:\n${player.interestedClubs.filter(id => id !== player.clubId).map(id => clubs.find(c => c.id === id)?.name ?? id).join('\n')}`}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded border border-blue-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  INT
                </span>
              )}
              {nationalTeamByPlayerId.has(player.id) && (
                <span
                  title={`Powołany do reprezentacji: ${nationalTeamByPlayerId.get(player.id)?.name ?? ''}`}
                  className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-black rounded border border-purple-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  REP
                </span>
              )}
           </div>
        </td>
        {isContractTab ? (
          <>
            <td className="relative z-10 px-3 w-16 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-slate-200 whitespace-nowrap">{player.age}</span>
            </td>
            <td className="relative z-10 px-4 w-44 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-yellow-300 whitespace-nowrap">{formatContractSalary(player.annualSalary)}</span>
            </td>
            <td className="relative z-10 px-4 w-32 text-center">
              <span className="text-[12px] font-black italic tracking-tighter text-slate-200 whitespace-nowrap">{formatContractEnd(player.contractEndDate)}</span>
            </td>
            <td className="relative z-10 px-4 w-32 text-center">
              <span className={`inline-flex min-w-[80px] items-center justify-center rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${contractRemaining.className}`}>
                {contractRemaining.label}
              </span>
            </td>
            <td className="relative z-10 px-4 w-36 text-center">
              <span className={`inline-flex min-w-[108px] items-center justify-center rounded-md border px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${squadRoleInfo.className}`}>
                {squadRoleInfo.label}
              </span>
            </td>
            <td className="relative z-10 px-4 w-36 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-emerald-300 whitespace-nowrap">{formatMarketValue(player.marketValue)}</span>
            </td>
            <td className="relative z-10 pr-6 w-20 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-black italic tracking-tighter leading-none ${getOverallBadgeClass(player.overallRating)}`}>
                {player.overallRating}
              </span>
            </td>
          </>
        ) : (
          <>
        <td className="relative z-10 px-2 w-36">
          <div className="flex gap-[6px]">
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-slate-300 leading-none">{player.stats.matchesPlayed}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-emerald-400 leading-none">{player.stats.goals}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-blue-400 leading-none">{player.stats.assists}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-yellow-400 leading-none">{player.stats.yellowCards}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-red-500 leading-none">{player.stats.redCards}</span>
            </div>
          </div>
        </td>
        <td className="relative z-10 px-3">
          <div className="flex gap-[6px]">
            {([
              player.attributes.pace,
              player.attributes.passing,
              player.attributes.defending,
              player.attributes.attacking,
              player.attributes.leadership,
              player.attributes.aggression,
            ] as number[]).map((val, i) => (
              <div key={i} className="flex items-center justify-center w-[22px]">
                <span className={`text-[12px] font-black font-mono leading-none ${val >= 75 ? 'text-emerald-400' : val >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{val}</span>
              </div>
            ))}
          </div>
        </td>
        <td className="w-12 text-center relative z-10">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/10 bg-black/20"
            title={`Forma: ${playerFormInfo.label}`}
          >
            <SquadPlayerFormArrow level={playerFormInfo.level} className="h-5 w-5 drop-shadow" />
          </span>
        </td>
        <td className="w-20 text-center relative z-10">
           <span
             className={`inline-flex min-w-[54px] items-center justify-center text-[11px] leading-none ${playerMoraleInfo.colorClass}`}
             title={`Morale: ${playerMoraleInfo.label}${effectiveOverall !== player.overallRating ? ` / Gotowość: ${effectiveOverall}` : ''}`}
           >
             {getMoraleIcon(moralePlayer.morale)}
           </span>
        </td>
        <td className="w-24 text-center relative z-10">
           <span className={`text-[10px] font-black uppercase tracking-widest ${healthInfo.colorClass}`}>{healthInfo.text}</span>
        </td>

{/* TUTAJ WSTAW TEN KOD - Kolumna średniej oceny w wierszu */}
     <td className="w-16 text-center relative z-10">
           <span className={`inline-flex min-w-[44px] items-center justify-center rounded-md border px-2 py-1 text-sm font-black font-mono italic ${getAverageRatingBadgeClass(averageRating)}`}>
              {averageRating !== null ? averageRating.toFixed(1) : '-'}
           </span>
        </td>

        <td className="pr-6 w-32 relative z-10">
           <div className="flex items-center gap-3">
             <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
               {/* Warstwa długu przemęczenia - czerwony sufit */}
                <div className="absolute inset-0 bg-red-600/40" style={{ left: `${100 - (player.fatigueDebt || 0)}%` }} />
                {/* Pasek kondycji */}
                <div className={`h-full ${condColor} transition-all duration-1000 relative z-10`} style={{ width: `${player.condition}%` }} />
             </div>
             <div className="flex flex-col items-end min-w-[32px]">
                <span className="text-[10px] font-black font-mono text-white leading-none">{Math.round(player.condition)}%</span>
                {player.fatigueDebt > 5 && (
                  <span className="text-[7px] font-black text-red-500 leading-none mt-0.5">-{Math.round(player.fatigueDebt)}</span>
                )}
             </div>
           </div>
        </td>
          </>
        )}

      </tr>
    );
  };

  const handleContextAction = (action: 'captain' | 'penalty' | 'freekick' | 'reserves' | 'talk' | 'transferList' | 'loanAvailable' | 'untouchable' | 'roleNone' | 'roleStarter' | 'roleKey') => {
    if (!contextMenu || !userTeamId || !myClub) return;
    if (action === 'talk') {
      setPendingOpenTalk(true);
      viewPlayerDetails(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'transferList') {
      toggleTransferList(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'loanAvailable') {
      toggleLoanAvailability(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'untouchable') {
      toggleUntouchable(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'roleNone') { setSquadRole(contextMenu.playerId, null); setContextMenu(null); return; }
    if (action === 'roleStarter') { setSquadRole(contextMenu.playerId, 'STARTER'); setContextMenu(null); return; }
    if (action === 'roleKey') { setSquadRole(contextMenu.playerId, 'KEY_PLAYER'); setContextMenu(null); return; }
    if (action === 'reserves') {
      const player = myPlayers.find(p => p.id === contextMenu.playerId);
      if (player) moveToReserves(player);
      setContextMenu(null);
      return;
    }
    setClubs(prev => prev.map(c => c.id !== userTeamId ? c : {
      ...c,
      captainId:       action === 'captain'   ? contextMenu.playerId : c.captainId,
      penaltyTakerId:  action === 'penalty'   ? contextMenu.playerId : c.penaltyTakerId,
      freeKickTakerId: action === 'freekick'  ? contextMenu.playerId : c.freeKickTakerId,
    }));
    setContextMenu(null);
  };

  const handleOpenAssistantReport = () => {
    if (!contextMenu) return;
    const player = myPlayers.find(p => p.id === contextMenu.playerId);
    if (!player) return;

    setReportPlayer(player);
    setReportModalPos({ x: 0, y: 0 });
    setContextMenu(null);
  };

  return (
    <div className="h-screen w-full flex flex-col pt-9 px-6 pb-3 animate-fade-in overflow-hidden relative font-sans text-slate-100">
      
      {/* 1. KINETYCZNE TŁO (BEZ ZMIAN URL) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
       <div 
  className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-screen scale-110"
  style={{ backgroundImage: `url(${szatnia})` }}
/>
        <div 
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[180px] opacity-25 animate-pulse-slow transition-all duration-[3000ms]" 
          style={{ background: myClub.colorsHex[0] }} 
        />
        <div className="absolute left-[-5%] bottom-[-5%] text-[30rem] font-black italic text-white/[0.015] select-none pointer-events-none tracking-tighter">{myClub.shortName}</div>
      </div>

      {/* 2. BROADCAST HEADER */}
      <header className="relative overflow-visible flex items-center justify-between px-10 py-[4px] bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shrink-0 shadow-2xl mb-6">
         {/* Club logo / colors — floats over everything */}
         {getClubLogo(myClub.id) ? (
           <div className="absolute left-6 top-1/2 -translate-y-1/2" style={{ zIndex: 9999, pointerEvents: 'none' }}>
             <div className="absolute inset-[-10px] rounded-3xl blur-xl opacity-20" style={{ backgroundColor: myClub.colorsHex[0] }} />
             <img
               src={getClubLogo(myClub.id)}
               alt={myClub.name}
               className="w-[172px] h-[172px] object-contain drop-shadow-2xl relative"
               style={{ transform: 'rotate(-12deg)' }}
             />
           </div>
         ) : (
           <div className="absolute left-6 top-1/2 -translate-y-1/2 group" style={{ zIndex: 9999 }}>
             <div className="absolute inset-[-10px] rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: myClub.colorsHex[0] }} />
             <div className="w-20 h-20 rounded-[28px] flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl transform group-hover:rotate-6 transition-transform duration-500 relative">
               <div style={{ backgroundColor: myClub.colorsHex[0] }} className="flex-1" />
               <div style={{ backgroundColor: myClub.colorsHex[1] || myClub.colorsHex[0] }} className="flex-1" />
             </div>
           </div>
         )}
         <div className="flex items-center gap-8">
            <div className="w-[140px] shrink-0" />
            <div>
               <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">Zarządzanie <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Kadrą</span></h1>
               <div className="flex items-center gap-8 mt-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] px-4 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: myClub.colorsHex[0] }}>{myClub.name.toUpperCase()}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">TAKTYKI</span>
                    <select 
                      value={currentTactic.id} 
                      onChange={handleTacticChange} 
                      className="bg-black/60 border border-white/10 text-white text-[13px] font-black uppercase rounded-2xl px-8 py-3 hover:border-blue-500/50 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-500/10 shadow-2xl min-w-[240px] appearance-none italic"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1rem' }}
                    >
                      {TacticRepository.getAll().map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name}</option>)}
                    </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-5">
            <button
              onClick={() => canMotivate && setIsMotivationOpen(true)}
              className={`relative group px-8 py-5 rounded-[24px] text-[11px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] overflow-hidden border-t border-x border-b ${
                canMotivate
                  ? 'bg-violet-600/10 border-t-violet-400/40 border-x-violet-500/20 border-b-black/60 text-violet-300 hover:bg-violet-600/20 cursor-pointer'
                  : 'bg-white/[0.02] border-t-white/10 border-x-white/5 border-b-black/40 text-slate-600 cursor-not-allowed'
              }`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              title={canMotivate ? 'Przeprowadź tygodniową rozmowę motywacyjną' : 'Dostępne raz na tydzień'}
            >
              <span className="relative z-10 flex items-center gap-2">💬 MOTYWACJA{!canMotivate && <span className="text-[8px] normal-case not-italic font-bold text-slate-600">· użyta</span>}</span>
              {canMotivate && <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
            <button
              onClick={() => setIsStaffOpen(true)}
              className="relative group px-8 py-5 rounded-[24px] bg-cyan-600/10 border-t border-x border-b border-t-cyan-400/40 border-x-cyan-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-cyan-300 hover:bg-cyan-600/20 transition-all active:translate-y-[2px] overflow-hidden"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="relative z-10 flex items-center gap-2">👥 SZTAB</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => setIsAnalysisOpen(true)}
              disabled={!hasAssistant}
              className="relative group px-8 py-5 rounded-[24px] bg-emerald-600/10 border-t border-x border-b border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-emerald-300 hover:bg-emerald-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:translate-y-[2px] overflow-hidden"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
               <span className="relative z-10 flex items-center gap-3">ANALIZA DRUŻYNY</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={handleAutoPick} disabled={!hasAssistant} className="relative group px-10 py-5 rounded-[24px] bg-blue-600/10 border-t border-x border-b border-t-blue-400/40 border-x-blue-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-blue-400 hover:bg-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:translate-y-[2px] overflow-hidden" style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
               <span className="relative z-10 flex items-center gap-3">🪄 AUTO WYBÓR</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-px h-12 bg-white/10 mx-2" />
            <button onClick={() => navigateTo(ViewState.DASHBOARD)} className="px-10 py-5 rounded-[24px] bg-white text-slate-900 font-black uppercase italic tracking-widest text-xs hover:scale-105 transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/80 border-x-white/40 border-b-slate-400/60" style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}>&larr; POWRÓT</button>
         </div>
      </header>

      {/* 3. MAIN TACTICAL WORKSPACE */}
      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* LEFT: THE PITCH (LEVEL PRO VIZ) */}
        <div className="w-[45%] bg-slate-900/40 rounded-[50px] border border-white/10 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden flex items-center justify-center p-12 shrink-0 group">
           {/* Internal Pitch Lighting */}
           <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

           <div className="w-full h-full max-w-[550px] aspect-[2/3.2] relative rounded-none border-0 overflow-hidden shadow-[0_100px_150px_rgba(0,0,0,0.8)] transform perspective-[1500px] rotateX(15deg)" style={{ backgroundColor: 'rgba(5, 61, 1, 0.65)' }}>
              {/* Pitch Markings SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 150" fill="none" stroke="white" strokeWidth="0.8">
                 <rect x="2" y="2" width="96" height="146" />
                 <line x1="2" y1="75" x2="98" y2="75" />
                 <circle cx="50" cy="75" r="15" />
                 <circle cx="50" cy="75" r="1" fill="white" />
                 {/* Top Box */}
                 <rect x="20" y="2" width="60" height="25" />
                 <rect x="35" y="2" width="30" height="10" />
                 <path d="M 35 27 Q 50 35 65 27" />
                 {/* Bottom Box */}
                 <rect x="20" y="123" width="60" height="25" />
                 <rect x="35" y="138" width="30" height="10" />
                 <path d="M 35 123 Q 50 115 65 123" />
              </svg>

              {currentTactic.slots.map((slot, idx) => {
                const playerId = myLineup.startingXI[idx];
                const player = getPlayerById(playerId);
                const isSelected = selectedSlot?.loc === 'START' && selectedSlot.index === idx;
                const isDragged = draggedPitchSlot?.index === idx;
                const isDropTarget = draggedPitchSlot !== null && draggedPitchSlot.index !== idx;
                const positionPenaltyFactor = player ? PlayerPositionFitService.getPenaltyFactor(player, slot.role, true) : 0;
                const isSecondaryPosition = !!player && PlayerPositionFitService.hasSecondaryPosition(player, slot.role) && positionPenaltyFactor > 0;
                // Keep the pitch warning aligned with the progressive role-fit penalty curve.
                const isOutOfPosition = !!player && positionPenaltyFactor >= 0.55;
                
                return (
                  <div 
                     key={idx}
                     draggable={!!playerId}
                     onClick={() => handlePlayerClick(playerId, 'START', idx)}
                     onDragStart={() => handlePitchDragStart(playerId, idx)}
                     onDragOver={(e) => { if (draggedPitchSlot) e.preventDefault(); }}
                     onDrop={() => handlePitchDrop(playerId, idx)}
                     onDragEnd={() => setDraggedPitchSlot(null)}
                     className={`pitch-player-token absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-700 z-20
                       ${isDragged ? 'opacity-40' : ''}
                     `}
                     style={{ 
                        left: `${slot.x * 100}%`, 
                        top: `${slot.y * 100}%`, 
                        transform: 'translate(-50%, -50%) rotateX(-15deg)',
                        filter: isSelected ? 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' : 'none'
                     }}
                  >
                    {/* Role Tag */}
                    <div className={`absolute -top-[20px] whitespace-nowrap px-[10px] py-[2px] rounded-none shadow-2xl text-[9px] font-black border transition-all duration-500
                       ${!player ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : `bg-black/80 border-white/20 ${
                         slot.role === PlayerPosition.GK ? 'text-yellow-400' :
                         slot.role === PlayerPosition.DEF ? 'text-blue-400' :
                         slot.role === PlayerPosition.MID ? 'text-emerald-400' :
                         'text-red-400'
                       }`}`}>
                       {!player ? 'WSTAW' : slot.role}
                    </div>
                    
                    {/* Position Warning Glow */}
                    {(isOutOfPosition || isSecondaryPosition) && (
                      <div className={`absolute inset-0 w-24 h-24 rounded-full border-2 blur-md animate-pulse -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 ${isSecondaryPosition ? 'bg-amber-400/10 border-amber-300/25' : 'bg-amber-500/10 border-amber-500/30'}`} />
                    )}

                    {/* Tactical Node */}
                    <div
                       className={`pitch-player-node relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-[3px] transition-all duration-500 overflow-hidden
                         ${isSelected ? 'scale-110' : ''}
                         ${isDropTarget ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent' : ''}
                         ${!player ? 'border-dashed border-rose-500/40 bg-rose-950/20' : ''}
                         ${isSecondaryPosition && !isSelected ? 'border-amber-300/60 shadow-[0_0_18px_rgba(251,191,36,0.24)]' : ''}
                         ${isOutOfPosition && !isSelected ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : ''}
                       `}
                       style={isSelected ? { background: '#ffffff', borderColor: '#ffffff' } : player ? { borderColor: myClub.colorsHex[1] || myClub.colorsHex[0] } : {}}
                    >
                       {/* Kit layers: shirt (top 3/4) + shorts (bottom 1/4) */}
                       {player && !isSelected && (
                         <>
                           <div className="absolute inset-0" style={{ backgroundColor: myClub.colorsHex[0], bottom: '25%' }} />
                           <div className="absolute left-0 right-0 bottom-0 h-[25%]" style={{ backgroundColor: myClub.colorsHex[1] || myClub.colorsHex[0] }} />
                         </>
                       )}

                       <span
                         className={`text-xl font-black italic relative z-10 ${isSelected ? 'text-slate-900' : (player ? 'text-white' : 'text-rose-500')}`}
                         style={player && !isSelected ? { textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' } : {}}
                       >
                         {player ? player.overallRating : '!'}
                       </span>

                       {/* Mini Energy Bar inside Node */}
                       {player && (
                         <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40 z-10">
                            <div className={`h-full ${PlayerPresentationService.getConditionColorClass(player.condition)}`} style={{ width: `${player.condition}%` }} />
                         </div>
                       )}
                    </div>

                    {/* Name Label */}
                    <div className="-mt-[7px]">
                       <span className={`text-[10px] font-black uppercase italic tracking-widest whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${!player ? 'text-rose-400' : (isOutOfPosition ? 'text-amber-200' : 'text-white')}`}>
                          {player ? formatPitchPlayerName(player) : 'ZAWODNIKA'}
                       </span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

{/* RIGHT: SQUAD MANAGEMENT (GLASS LISTS) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto custom-scrollbar">

          {/* TABS */}
          <div className="shrink-0 flex gap-2 px-1">
            <button
              onClick={() => setActiveTab('SQUAD')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'SQUAD' ? 'bg-blue-500/20 border-t-blue-400/50 border-x-blue-500/25 border-b-black/60 text-blue-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >SKŁAD</button>
            <button
              onClick={() => setActiveTab('CONTRACT')}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'CONTRACT' ? 'bg-yellow-500/20 border-t-yellow-400/50 border-x-yellow-500/25 border-b-black/60 text-yellow-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >STATUS KONTRAKTU</button>
            <button
              onClick={() => setActiveTab('MORALE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'MORALE' ? `${getMoraleInfo(teamMoraleSnapshot.effectiveMorale).bg} border-t-white/30 border-x-white/15 border-b-black/60 ${getMoraleInfo(teamMoraleSnapshot.effectiveMorale).color}` : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >MORALE</button>
            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'SCHEDULE' ? 'bg-amber-500/20 border-t-amber-400/50 border-x-amber-500/25 border-b-black/60 text-amber-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >TERMINARZ</button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'TABLE' ? 'bg-white/15 border-t-white/40 border-x-white/20 border-b-black/60 text-white' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >TABELA</button>
            <button
              onClick={() => setActiveTab('LOANS')}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'LOANS' ? 'bg-cyan-500/20 border-t-cyan-400/50 border-x-cyan-500/25 border-b-black/60 text-cyan-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >WYPOŻYCZENIA</button>
          </div>

          {activeTab === 'MORALE' && (() => {
            const morale = teamMoraleSnapshot.effectiveMorale;
            const clubBaseMorale = teamMoraleSnapshot.clubMorale;
            const playerAverageMorale = teamMoraleSnapshot.playerAverageMorale;
            const info = getMoraleInfo(morale);
            const form = myClub.stats.form || [];
            const moraleRows = [...myPlayers]
              .map(player => {
                const moralePlayer = PlayerMoraleService.ensurePlayerState(player);
                const moraleInfo = PlayerMoraleService.getInfo(moralePlayer.morale);
                const canTalkPlayer = PlayerMoraleService.canTalk(moralePlayer, currentDate);
                const nextTalkDate = PlayerMoraleService.getNextTalkDate(moralePlayer);
                const promisedMinutesUntil = moralePlayer.promisedMinutesUntil ? new Date(moralePlayer.promisedMinutesUntil) : null;
                const minutesDemandUntil = moralePlayer.minutesDemandUntil ? new Date(moralePlayer.minutesDemandUntil) : null;
                const roleDemandUntil = moralePlayer.roleDemandUntil ? new Date(moralePlayer.roleDemandUntil) : null;
                const transferListDemandUntil = moralePlayer.transferListDemandUntil ? new Date(moralePlayer.transferListDemandUntil) : null;
                const developmentExitDemandUntil = moralePlayer.developmentExitDemandUntil ? new Date(moralePlayer.developmentExitDemandUntil) : null;
                return {
                  player: moralePlayer,
                  moraleInfo,
                  canTalkPlayer,
                  nextTalkDate,
                  promisedMinutesUntil,
                  minutesDemandUntil,
                  roleDemandUntil,
                  transferListDemandUntil,
                  developmentExitDemandUntil,
                  effectiveOverall: PlayerMoraleService.getEffectiveOverall(moralePlayer),
                  personalityLabel: PlayerMoraleService.getPersonalityLabel(moralePlayer.moralePersonality),
                };
              })
              .sort((a, b) => (a.player.morale ?? 50) - (b.player.morale ?? 50) || b.effectiveOverall - a.effectiveOverall);
            const lowMoraleCount = moraleRows.filter(row => (row.player.morale ?? 50) < 40).length;
            const talksReadyCount = moraleRows.filter(row => row.canTalkPlayer).length;
            const activePromisesCount = moraleRows.filter(row => !!row.promisedMinutesUntil || !!row.minutesDemandUntil || !!row.roleDemandUntil || !!row.transferListDemandUntil || !!row.developmentExitDemandUntil).length;
            return (
              <div className="shrink-0 flex flex-col gap-4">

                {/* MAIN MORALE CARD */}
                <div className={`rounded-[40px] border ${info.border} ${info.bg} backdrop-blur-3xl p-10 flex flex-col gap-6`}>
                  <div className="flex items-start justify-between gap-8">
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">MORALE DRUŻYNY</div>
                      <div className={`text-4xl font-black italic uppercase tracking-tight ${info.color}`}>{info.label}</div>
                    </div>

                    <div className="grid min-w-[420px] grid-cols-3 gap-4 text-right">
                      <div>
                        <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Baza klubu</div>
                        <div className="text-sm font-black italic uppercase tracking-tighter text-slate-200">{clubBaseMorale}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Średnia kadry</div>
                        <div className="text-sm font-black italic uppercase tracking-tighter text-slate-200">{playerAverageMorale}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wynik</div>
                        <div className={`text-sm font-black italic uppercase tracking-tighter ${info.color}`}>{morale}</div>
                      </div>
                    </div>
                  </div>

                  {/* BAR */}
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full ${info.barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${morale}%` }}
                    />
                  </div>

                  {/* LEVELS LEGEND */}
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-red-500">Bardzo niskie</span>
                    <span className="text-orange-400">Niskie</span>
                    <span className="text-white">Neutralne</span>
                    <span className="text-green-400">Wysokie</span>
                    <span className="text-yellow-400">Bardzo wysokie</span>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-4">{info.description}</p>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-slate-950/35 backdrop-blur-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Indywidualne morale</div>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mt-1">
                        Niskie morale: <span className={lowMoraleCount > 0 ? 'text-orange-400' : 'text-emerald-400'}>{lowMoraleCount}</span> / rozmowy dostępne: <span className="text-violet-300">{talksReadyCount}</span> / obietnice minut: <span className="text-yellow-300">{activePromisesCount}</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kliknij zawodnika, aby otworzyć kartę i rozmowę</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl">
                        <tr className="border-b border-white/10">
                          <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Zawodnik</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pozycja</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Got.</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Morale</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Charakter</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Rozmowa</th>
                          <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Obietnica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {moraleRows.map(row => {
                          const moraleValue = row.player.morale ?? 50;
                          const moraleBarWidth = `${moraleValue}%`;
                          const nextTalkText = row.nextTalkDate ? row.nextTalkDate.toLocaleDateString('pl-PL') : '-';
                          const promiseText = row.roleDemandUntil && row.player.requestedSquadRole
                            ? `Status: ${row.player.requestedSquadRole === 'KEY_PLAYER' ? 'kluczowy' : 'starter'} do ${row.roleDemandUntil.toLocaleDateString('pl-PL')}`
                            : row.minutesDemandUntil
                              ? `Minuty do ${row.minutesDemandUntil.toLocaleDateString('pl-PL')}`
                              : row.developmentExitDemandUntil
                                ? `Odejście/wyp. do ${row.developmentExitDemandUntil.toLocaleDateString('pl-PL')}`
                              : row.transferListDemandUntil
                                ? `Transfer do ${row.transferListDemandUntil.toLocaleDateString('pl-PL')}`
                              : row.promisedMinutesUntil
                                ? `Obietnica do ${row.promisedMinutesUntil.toLocaleDateString('pl-PL')}`
                                : 'Brak';
                          return (
                            <tr
                              key={row.player.id}
                              onClick={() => viewPlayerDetails(row.player.id)}
                              className="group cursor-pointer bg-white/[0.015] hover:bg-white/[0.05] transition-colors"
                            >
                              <td className="px-5 py-3">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black italic uppercase tracking-tighter text-white group-hover:text-blue-300">{row.player.lastName}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{row.player.firstName}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${getPositionBadgeClass(row.player.position)}`}>{row.player.position}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="text-[12px] font-black italic tracking-tighter text-slate-300">{row.player.overallRating}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`text-[12px] font-black italic tracking-tighter ${row.effectiveOverall > row.player.overallRating ? 'text-emerald-400' : row.effectiveOverall < row.player.overallRating ? 'text-red-400' : 'text-slate-300'}`}>{row.effectiveOverall}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className={`text-[9px] font-black italic uppercase tracking-tighter ${row.moraleInfo.colorClass}`}>{row.moraleInfo.label}</span>
                                    <span className="text-[9px] font-black italic tracking-tighter text-slate-400">{moraleValue}</span>
                                  </div>
                                  <div className="h-1.5 w-32 rounded-full bg-black/40 overflow-hidden border border-white/5">
                                    <div className={`h-full ${row.moraleInfo.barClass}`} style={{ width: moraleBarWidth }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-300">{row.personalityLabel}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${row.canTalkPlayer ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-slate-500/20 bg-slate-500/10 text-slate-500'}`}>
                                  {row.canTalkPlayer ? 'Dostępna' : `Od ${nextTalkText}`}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-[9px] font-black italic uppercase tracking-tighter ${row.promisedMinutesUntil || row.minutesDemandUntil || row.roleDemandUntil || row.transferListDemandUntil || row.developmentExitDemandUntil ? 'text-yellow-300' : 'text-slate-600'}`}>{promiseText}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FORMA CONTEXT */}
                <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex flex-col gap-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Ostatnie wyniki</div>
                  <div className="flex gap-2">
                    {form.length === 0 && <span className="text-[10px] text-slate-600 italic">Brak rozegranych meczów</span>}
                    {form.map((r, i) => (
                      <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black border
                        ${r === 'W' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' :
                          r === 'R' ? 'bg-slate-500/20 border-slate-500/30 text-slate-400' :
                          'bg-red-500/20 border-red-500/30 text-red-400'}`}
                      >{r === 'W' ? 'W' : r === 'R' ? 'R' : 'P'}</div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Rozmowy motywacyjne</div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${canMotivate ? 'text-violet-300' : 'text-slate-500'}`}>
                      {canMotivate ? 'Dostępna rozmowa' : 'Rozmowa w cooldownie'}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Status: <span className="text-slate-300">Szatnia obserwuje reakcje sztabu</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {motivationPanelText}
                  </p>
                </div>


              </div>
            );
          })()}

          {activeTab === 'TABLE' && (() => {
            const sorted = [...leagueClubs].sort((a, b) =>
              b.stats.points - a.stats.points ||
              b.stats.goalDifference - a.stats.goalDifference ||
              b.stats.goalsFor - a.stats.goalsFor
            );
            const leagueName = getCompLabel(myClub.leagueId);
            const total = sorted.length;
            const isEkstraklasa = myClub.leagueId === 'L_PL_1';
            const isL3 = myClub.leagueId === 'L_PL_3';
            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Tabela</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md border text-[9px] font-black italic uppercase tracking-tighter text-white bg-red-600 border-red-600">{leagueName}</span>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-4 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-8">#</th>
                      <th className="px-4 py-2 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Klub</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">M</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">W</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">R</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">P</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-16">G</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-12">+/-</th>
                      <th className="px-4 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-14">PKT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((club, idx) => {
                      const pos = idx + 1;
                      const isUser = club.id === userTeamId;
                      const logo = getClubLogo(club.id);
                      const gd = club.stats.goalDifference;

                      const isCL              = isEkstraklasa && pos === 1;
                      const isConf            = isEkstraklasa && pos >= 2 && pos <= 3;
                      const isPromotion       = !isEkstraklasa && pos <= 2;
                      const isPlayoff         = !isEkstraklasa && pos >= 3 && pos <= 6;
                      const isRelegationPO    = isL3 && pos >= 13 && pos <= 14;
                      const isRelegation      = isL3 ? pos > total - 4 : pos > total - 3;

                      const blue  = 'inset 0 1px 0 rgba(96,165,250,0.3)';
                      const red   = 'inset 0 1px 0 rgba(248,113,113,0.3)';
                      const orange = 'inset 0 1px 0 rgba(251,146,60,0.35)';
                      const separatorStyle: React.CSSProperties = isEkstraklasa
                        ? (pos === 2 || pos === 4 ? { boxShadow: blue } : pos === total - 2 ? { boxShadow: red } : {})
                        : isL3
                          ? (pos === 3 || pos === 7 ? { boxShadow: blue } : pos === 13 ? { boxShadow: orange } : pos === 15 ? { boxShadow: red } : {})
                          : (pos === 3 || pos === 7 ? { boxShadow: blue } : pos === total - 2 ? { boxShadow: red } : {});

                      const rowBg = isUser
                        ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                        : isCL
                          ? 'bg-cyan-500/[0.07] border-l-2 border-l-cyan-400/60'
                          : isConf
                            ? 'bg-green-500/[0.07] border-l-2 border-l-green-400/60'
                            : isPromotion
                              ? 'bg-yellow-500/[0.07] border-l-2 border-l-yellow-400/60'
                              : isPlayoff
                                ? 'bg-cyan-500/[0.07] border-l-2 border-l-cyan-400/60'
                                : isRelegationPO
                                  ? 'bg-orange-500/[0.07] border-l-2 border-l-orange-400/60'
                                  : isRelegation
                                    ? 'bg-red-500/[0.07] border-l-2 border-l-red-400/60'
                                    : 'hover:bg-white/[0.02]';

                      const posColor = 'text-white';
                      return (
                        <tr key={club.id} className={`border-b border-white/[0.04] transition-colors ${rowBg}`} style={separatorStyle}>
                          <td className="px-4 py-2.5 text-center align-middle">
                            <span className={`text-[11px] font-black italic tracking-tighter ${posColor}`}>{pos}.</span>
                          </td>
                          <td className="px-4 py-2.5 align-middle">
                            <div className="flex items-center gap-3">
                              {logo ? (
                                <img src={logo} alt={club.shortName} className="w-5 h-5 object-contain shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0 flex flex-col">
                                  <div className="flex-1" style={{ backgroundColor: club.colorsHex[0] }} />
                                  <div className="flex-1" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
                                </div>
                              )}
                              <span className={`text-[11px] font-black italic uppercase tracking-tighter ${isUser ? 'text-yellow-400' : 'text-white'}`}>{club.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-300">{club.stats.played}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-emerald-400">{club.stats.wins}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-400">{club.stats.draws}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-red-400">{club.stats.losses}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-300">{club.stats.goalsFor}:{club.stats.goalsAgainst}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className={`text-[11px] font-black italic tracking-tighter ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-slate-500'}`}>{gd > 0 ? `+${gd}` : gd}</span></td>
                          <td className="px-4 py-2.5 text-center align-middle"><span className={`text-[13px] font-black italic tracking-tighter ${isUser ? 'text-emerald-300' : 'text-white'}`}>{club.stats.points}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-white/5 flex items-center gap-6">
                  {isEkstraklasa ? (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Liga Mistrzów</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-green-400"><span className="w-2 h-2 rounded-full bg-green-400" />Puchar Konferencji</span>
                    </>
                  ) : isL3 ? (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" />Awans bezpośredni</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Baraże awansowe</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-400" />Baraże o utrzymanie</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" />Awans bezpośredni</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Baraże</span>
                    </>
                  )}
                  <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-red-400"><span className="w-2 h-2 rounded-full bg-red-400" />Spadek</span>
                </div>
              </div>
            );
          })()}

          {activeTab === 'LOANS' && (() => {
            const loanedOutPlayers = allLeaguePlayers
              .filter(player => player.loan?.parentClubId === userTeamId)
              .sort((a, b) => {
                const aDays = getLoanDaysLeft(a.loan?.endDate) ?? 9999;
                const bDays = getLoanDaysLeft(b.loan?.endDate) ?? 9999;
                return aDays - bDays || b.overallRating - a.overallRating || a.lastName.localeCompare(b.lastName);
              });

            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Wypożyczeni zawodnicy</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md border text-[9px] font-black italic uppercase tracking-tighter text-cyan-200 bg-cyan-500/10 border-cyan-500/30">
                    {loanedOutPlayers.length}
                  </span>
                </div>

                {loanedOutPlayers.length === 0 ? (
                  <div className="min-h-[260px] flex items-center justify-center">
                    <span className="text-[13px] font-black italic uppercase tracking-tighter text-slate-500">
                      BRAK ZAWODNIKÓW NA WYPOŻYCZENIU.
                    </span>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Zawodnik</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Poz.</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">M</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Min</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Śr.</th>
                        <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Klub</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Od</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Do</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Dni</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pensja</th>
                        <th className="px-5 py-3 text-right text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Opłata</th>
                        <th className="px-5 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Status</th>
                        <th className="px-5 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Akcja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanedOutPlayers.map(player => {
                        const destinationClub = clubs.find(club => club.id === player.loan?.destinationClubId);
                        const destinationLogo = destinationClub ? getClubLogo(destinationClub.id) : null;
                        const daysLeft = getLoanDaysLeft(player.loan?.endDate);
                        const isReturningSoon = daysLeft !== null && daysLeft <= 30;
                        const loanFee = player.loan?.loanFee ?? 0;
                        const loanMatches = getLoanMatches(player);
                        const loanMinutes = getLoanMinutes(player);
                        const loanAverageRating = getLoanAverageRating(player);
                        return (
                          <tr
                            key={player.id}
                            onClick={() => viewPlayerDetails(player.id)}
                            className="group cursor-pointer border-b border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.05] transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-300">{player.lastName}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{player.firstName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${getPositionBadgeClass(player.position)}`}>{player.position}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${getOverallBadgeClass(player.overallRating)}`}>{player.overallRating}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{loanMatches}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`text-[10px] font-black italic tracking-tighter ${loanMinutes < 90 ? 'text-orange-300' : 'text-cyan-300'}`}>{loanMinutes}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{loanAverageRating}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                {destinationLogo ? (
                                  <img src={destinationLogo} alt={destinationClub?.name ?? player.loan?.destinationClubName ?? ''} className="w-6 h-6 object-contain shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 shrink-0" />
                                )}
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-200">{player.loan?.destinationClubName ?? destinationClub?.name ?? '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{formatLoanDate(player.loan?.startDate)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{formatLoanDate(player.loan?.endDate)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[11px] font-black italic tracking-tighter ${isReturningSoon ? 'text-amber-300' : 'text-cyan-300'}`}>{daysLeft ?? '-'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{player.loan?.wageCoveragePercent ?? 0}%</span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-[10px] font-black italic tracking-tighter text-emerald-300">{loanFee.toLocaleString('pl-PL')} PLN</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${
                                player.loan?.forcedByClub
                                  ? 'border-orange-400/40 bg-orange-500/15 text-orange-200'
                                  : isReturningSoon
                                    ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                                    : 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                              }`}>
                                {player.loan?.forcedByClub ? 'Wymuszone' : isReturningSoon ? 'Wraca wkrótce' : 'Aktywne'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setLoanDetailsPlayerId(player.id);
                                  }}
                                  className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-[8px] font-black italic uppercase tracking-tighter text-cyan-200 transition-colors hover:bg-cyan-500/20 hover:text-cyan-100"
                                >
                                  Szczegóły
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (window.confirm(`Skrócić wypożyczenie zawodnika ${player.firstName} ${player.lastName}? Zawodnik wróci natychmiast do kadry.`)) {
                                      terminateLoanEarly(player.id);
                                    }
                                  }}
                                  className="rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-[8px] font-black italic uppercase tracking-tighter text-amber-200 transition-colors hover:bg-amber-500/20 hover:text-amber-100"
                                >
                                  Skróć
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}

          {activeTab === 'SCHEDULE' && (() => {
            const isLeagueBadge = (label: string) =>
              !['PUCHAR POLSKI','SUPERPUCHAR','UEFA SUPER','LM','LE','KONF','SPARINGI','BARAŻE','MŚ'].includes(label);
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
            const pastMatches = scheduleSeasonFilter !== null
              ? allMatchHistory
                  .filter(m => m.season === scheduleSeasonFilter && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              : [];
            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                {pastScheduleSeasons.length > 0 && (
                  <div className="flex gap-2 px-6 py-3 border-b border-white/10">
                    <button
                      onClick={() => setScheduleSeasonFilter(null)}
                      className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${scheduleSeasonFilter === null ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
                    >BIEŻĄCY</button>
                    {pastScheduleSeasons.map(({ season, label }) => (
                      <button
                        key={season}
                        onClick={() => setScheduleSeasonFilter(season)}
                        className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${scheduleSeasonFilter === season ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
                      >{label}</button>
                    ))}
                  </div>
                )}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-6 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-28">Data</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-28">Miejsce</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-36">Rozgrywki</th>
                      <th className="px-6 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-20">Wynik</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Przeciwnik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleSeasonFilter === null ? (
                      <>
                        {mySchedule.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-[10px] font-black italic uppercase tracking-tighter opacity-20">Brak meczów w terminarzu</td></tr>
                        )}
                        {mySchedule.map((f, i) => {
                          const isHome = f.homeTeamId === userTeamId;
                          const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
                          const opponent = clubs.find(c => c.id === opponentId);
                          const venue = getVenueInfo(f);
                          const compLabel = getCompLabel(f.leagueId as string);
                          const isLeague = isLeagueBadge(compLabel);
                          const compCls = isLeague
                            ? 'text-white bg-red-600 border-red-600'
                            : (compCupColors[compLabel] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');
                          const isFinished = f.status === MatchStatus.FINISHED;
                          const isPast = new Date(f.date) < currentDate;
                          const reportEntry = allMatchHistory.find(e => e.matchId === f.id && e.season === seasonNumber);
                          const isDisplayFinished = isFinished || !!reportEntry;
                          const myScore = isHome
                            ? (f.homeScore ?? reportEntry?.homeScore ?? null)
                            : (f.awayScore ?? reportEntry?.awayScore ?? null);
                          const oppScore = isHome
                            ? (f.awayScore ?? reportEntry?.awayScore ?? null)
                            : (f.homeScore ?? reportEntry?.homeScore ?? null);
                          const resultColor = isDisplayFinished
                            ? myScore! > oppScore! ? 'text-emerald-400' : myScore! < oppScore! ? 'text-red-400' : 'text-slate-300'
                            : 'text-slate-600';
                          const logo = opponent ? getClubLogo(opponent.id) : null;
                          const d = new Date(f.date);
                          const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                          const isNext = !isPast && (i === 0 || new Date(mySchedule[i-1].date) < currentDate);
                          return (
                            <tr
                              key={f.id}
                              className={`border-b border-white/[0.04] transition-colors ${isNext ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500/50' : isPast ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}
                            >
                              <td className="px-6 py-2.5 align-middle whitespace-nowrap">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter font-mono text-slate-300">{dateStr}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`text-[10px] font-black italic uppercase tracking-tighter ${venue.color}`}>{venue.label}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[8px] font-black italic uppercase tracking-tighter ${compCls}`}>
                                  {compLabel}
                                </span>
                              </td>
                              <td className="px-6 py-2.5 text-center align-middle">
                                {isDisplayFinished && reportEntry ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedScheduleReportId(reportEntry.matchId)}
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
                              </td>
                              <td className="px-4 py-2.5 align-middle">
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
                            </tr>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {pastMatches.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-[10px] font-black italic uppercase tracking-tighter opacity-20">Brak meczów w historii</td></tr>
                        )}
                        {pastMatches.map((m) => {
                          const isHome = m.homeTeamId === userTeamId;
                          const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                          const opponent = clubs.find(c => c.id === opponentId);
                          const compLabel = getCompLabel(m.competition);
                          const isLeague = isLeagueBadge(compLabel);
                          const compCls = isLeague
                            ? 'text-white bg-red-600 border-red-600'
                            : (compCupColors[compLabel] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');
                          const myScore = isHome ? m.homeScore : m.awayScore;
                          const oppScore = isHome ? m.awayScore : m.homeScore;
                          const resultColor = myScore > oppScore ? 'text-emerald-400' : myScore < oppScore ? 'text-red-400' : 'text-slate-300';
                          const isNeutral = neutralTypes.includes(m.competition);
                          const venueLabel = isNeutral ? 'NEUTRALNY' : (isHome ? 'DOM' : 'WYJAZD');
                          const venueColor = isNeutral ? 'text-amber-400' : (isHome ? 'text-emerald-400' : 'text-sky-400');
                          const logo = opponent ? getClubLogo(opponent.id) : null;
                          const d = new Date(m.date);
                          const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                          return (
                            <tr key={m.matchId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-2.5 align-middle whitespace-nowrap">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter font-mono text-slate-300">{dateStr}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`text-[10px] font-black italic uppercase tracking-tighter ${venueColor}`}>{venueLabel}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[8px] font-black italic uppercase tracking-tighter ${compCls}`}>
                                  {compLabel}
                                </span>
                              </td>
                              <td className="px-6 py-2.5 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => setSelectedScheduleReportId(m.matchId)}
                                  className={`rounded-md px-2 py-1 text-[13px] font-black italic tracking-tighter font-mono transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/30 ${resultColor}`}
                                  title="Otwórz raport meczowy"
                                >
                                  {myScore}:{oppScore}
                                </button>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
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
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {(activeTab === 'SQUAD' || activeTab === 'CONTRACT') && <>

           {/* STARTING XI LIST */}
           <div className="shrink-0 bg-slate-900/40 rounded-[50px] border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-8 py-3 border-b border-white/10 flex items-center bg-white/5 relative z-10">
                 <div className="w-1.5 h-5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="pl-6 w-12 py-2" />
                        <th className="w-6 py-2" />
                        <th className="w-14 py-2" />
                        <th className="w-52 py-2 align-middle">
                          <span className="inline-flex h-5 items-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Zawodnik</span>
                        </th>
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36 py-2 align-middle">
                              <div className="flex h-5 items-center gap-[6px]">
                                {([['M','text-slate-400'],['G','text-emerald-600'],['A','text-blue-600'],['ŻK','text-yellow-600'],['CK','text-red-700']] as [string,string][]).map(([lbl,cls]) => (
                                  <div key={lbl} className={`inline-flex h-5 w-[22px] items-center justify-center text-center text-[8px] font-black uppercase tracking-tighter ${cls}`}>{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="px-3 py-2 align-middle">
                              <div className="flex h-5 items-center gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="inline-flex h-5 w-[22px] items-center justify-center text-center text-[8px] font-black uppercase tracking-tighter text-slate-400">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-12 text-center py-2 align-middle">
                              <span className="inline-flex h-5 items-center justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Forma</span>
                            </th>
                            <th className="w-20 text-center py-2 align-middle">
                              <span className="inline-flex h-5 items-center justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Morale</span>
                            </th>
                            <th className="w-24 text-center py-2 align-middle">
                              <span className="inline-flex h-5 items-center justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Zdrowie</span>
                            </th>
                            <th className="w-16 text-center py-2 align-middle">
                              <span className="inline-flex h-5 items-center justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Ocena</span>
                            </th>
                            <th className="pr-6 w-32 py-2 align-middle">
                              <span className="inline-flex h-5 items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Kondycja</span>
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {myLineup.startingXI.map((pid, idx) => renderPlayerRow(pid, currentTactic.slots[idx].role, 'START', idx))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           {/* BENCH */}
           <div className="shrink-0 bg-slate-800/60 rounded-[45px] border border-white/[0.07] backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Ławka</h3>
                 <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                    <span className="text-[10px] font-black font-mono text-blue-400">{benchPlayers.length} / 9</span>
                 </div>
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="pl-6 w-12" />
                        <th className="w-6" />
                        <th className="w-14" />
                        <th className="w-52" />
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36" />
                            <th className="px-3 py-1">
                              <div className="flex gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="w-[22px] text-center text-[8px] font-black uppercase tracking-tighter text-slate-600">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-12" />
                            <th className="w-20" />
                            <th className="w-24" />
                            <th className="w-16" />
                            <th className="pr-6 w-32" />
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {benchPlayers.map((pid, index) => renderPlayerRow(pid, 'SUB', 'BENCH', index))}
                      {benchPlayers.length === 0 && (
                        <tr><td colSpan={11} className="py-10 text-center opacity-10 font-black uppercase italic text-xs tracking-widest">Pusta Ławka</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* RESERVES */}
           <div className="shrink-0 bg-slate-900/40 rounded-[45px] border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rezerwy</h3>
                 <span className="text-[10px] font-black font-mono text-slate-700 uppercase tracking-widest">KADRA: {reservePlayersSorted.length}</span>
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="pl-6 w-12" />
                        <th className="w-6" />
                        <th className="w-14" />
                        <th className="w-52" />
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36" />
                            <th className="px-3 py-1">
                              <div className="flex gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="w-[22px] text-center text-[8px] font-black uppercase tracking-tighter text-slate-600">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-12" />
                            <th className="w-20" />
                            <th className="w-24" />
                            <th className="w-16" />
                            <th className="pr-6 w-32" />
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {reservePlayersSorted.map((pid, index) => renderPlayerRow(pid, 'RES', 'RES', index))}
                      {reservePlayersSorted.length === 0 && (
                        <tr><td colSpan={11} className="py-10 text-center opacity-10 font-black uppercase italic text-xs tracking-widest">Brak zawodników</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

          </>}

        </div>
</div>

      {/* FOOTER DIAGNOSTIC BAR */}
      <footer className="mt-6 h-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl flex items-center justify-between px-12 shrink-0 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.03] animate-ticker" style={{ backgroundImage: 'linear-gradient(90deg, transparent, white, transparent)', backgroundSize: '200% 100%' }} />
         <div className="flex gap-12 text-[7px] font-black text-slate-600 uppercase tracking-[0.6em] relative z-10">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Taktyki gotowe</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Optymalizacja składu</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Gotowi do gry</span>
         </div>
         <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest relative z-10 italic">PZPN</div>
      </footer>

      {contextMenu && (
        <div
          className="fixed z-[9999] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 min-w-[220px]"
          style={{ top: contextMenu.y + 320 > window.innerHeight ? Math.max(0, contextMenu.y - 320) : contextMenu.y, left: contextMenu.x + 240 > window.innerWidth ? Math.max(0, contextMenu.x - 240) : contextMenu.x }}
          onMouseLeave={() => { setContextMenu(null); setRoleSubmenuOpen(false); }}
        >
          <button onClick={() => handleContextAction('talk')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/10 transition-colors">
            Rozmowa z zawodnikiem
          </button>
          <div className="my-1 border-t border-white/10" />
          {contextMenu.loc === 'START' && (
            <button onClick={() => handleContextAction('captain')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
              Mianuj Kapitana
            </button>
          )}
          <button onClick={() => handleContextAction('penalty')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Wyznacz do karnych
          </button>
          <button onClick={() => handleContextAction('freekick')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Wyznacz do wolnych
          </button>
          <div className="my-1 border-t border-white/10" />
          <button onClick={handleOpenAssistantReport} disabled={!hasAssistant} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed text-blue-300 hover:bg-blue-500/10 transition-colors">
            Raport Asystenta
          </button>
          <div className="my-1 border-t border-white/10" />
          <div
            onMouseEnter={() => setRoleSubmenuOpen(true)}
            onMouseLeave={() => setRoleSubmenuOpen(false)}
          >
            <button className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors flex items-center justify-between">
              Rola w zespole
              <span className="text-[9px] text-slate-500">▶</span>
            </button>
            {roleSubmenuOpen && (
              <div className="bg-slate-800/50">
                <button onClick={() => handleContextAction('roleNone')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Brak
                </button>
                <button onClick={() => handleContextAction('roleStarter')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Podstawowa
                </button>
                <button onClick={() => handleContextAction('roleKey')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Kluczowy
                </button>
              </div>
            )}
          </div>
          <div className="my-1 border-t border-white/10" />
          {(() => { const cp = myPlayers.find(p => p.id === contextMenu.playerId); return (
          <>
          <button onClick={() => handleContextAction('transferList')} disabled={!!cp?.isUntouchable || !!cp?.loan || !!cp?.transferPendingClubId} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {cp?.isOnTransferList ? 'Usuń z listy' : 'Wystaw na listę'}
          </button>
          <button onClick={() => handleContextAction('loanAvailable')} disabled={!!cp?.isUntouchable || !!cp?.loan || !!cp?.transferPendingClubId} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {cp?.isAvailableForLoan ? 'Zdejmij z wypożyczeń' : 'Dostępny do wypożyczenia'}
          </button>
          </>
          ); })()}
          <button onClick={() => handleContextAction('untouchable')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Nie na sprzedaż
          </button>
          <div className="my-1 border-t border-white/10" />
          <button onClick={() => handleContextAction('reserves')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-colors">
            Przenieś do rezerw
          </button>
        </div>
      )}

      {reportPlayer && cachedReport && createPortal(<PortalScaleWrapper>{(() => {
        const report = cachedReport;
        const posColor = reportPlayer.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          : reportPlayer.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          : reportPlayer.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
        const reportPositionLabel: Record<PlayerPosition, string> = {
          [PlayerPosition.GK]: 'BRAMKARZ',
          [PlayerPosition.DEF]: 'OBROŃCA',
          [PlayerPosition.MID]: 'POMOCNIK',
          [PlayerPosition.FWD]: 'NAPASTNIK',
        };
        const effColor = report.positionEffectivenessScore >= 78 ? 'text-emerald-400' : report.positionEffectivenessScore >= 68 ? 'text-amber-400' : 'text-rose-400';
        const seasonStats = [
          { label: 'Mecze', value: String(reportPlayer.stats.matchesPlayed), color: 'text-white', cardClass: '' },
          { label: 'Minuty', value: String(reportPlayer.stats.minutesPlayed), color: 'text-white', cardClass: '' },
          { label: 'Bramki', value: String(reportPlayer.stats.goals), color: 'text-white', cardClass: '' },
          { label: 'Asysty', value: String(reportPlayer.stats.assists), color: 'text-white', cardClass: '' },
          { label: 'Żółta kartka', value: String(reportPlayer.stats.yellowCards), color: 'text-amber-400', cardClass: 'bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.4)]' },
          { label: 'Czerwona kartka', value: String(reportPlayer.stats.redCards), color: 'text-rose-400', cardClass: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.4)]' },
          ...(reportPlayer.position === 'GK' ? [{ label: 'Czyste konta', value: String(reportPlayer.stats.cleanSheets), color: 'text-emerald-400', cardClass: '' }] : []),
        ];

        return (
          <div
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm font-black italic uppercase tracking-tighter"
            onClick={() => { if (!reportDragging) setReportPlayer(null); }}
            onMouseMove={e => {
              if (!reportDragging) return;
              setReportModalPos({
                x: reportDragging.originX + (e.clientX - reportDragging.startX),
                y: reportDragging.originY + (e.clientY - reportDragging.startY),
              });
            }}
            onMouseUp={() => setReportDragging(null)}
            onMouseLeave={() => setReportDragging(null)}
          >
            <div
              className="assistant-report fixed flex flex-col w-[1780px] max-w-[calc(100vw-20px)] rounded-[40px] border border-emerald-400/15 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.15),0_40px_120px_rgba(0,0,0,0.95)] overflow-hidden [font-family:Archive,Archivo,Inter,sans-serif]"
              style={{
                left: reportModalPos.x || '50%',
                top: reportModalPos.y || '50%',
                transform: reportModalPos.x || reportModalPos.y ? 'none' : 'translate(-50%, -50%)',
                maxHeight: 'calc(100vh - 20px)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <style>{`
                @keyframes report-rise { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes report-shine-sweep { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(220%) skewX(-20deg); } }
                .report-rise { animation: report-rise 600ms cubic-bezier(.2,.9,.3,1) both; }
                .report-shine { background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); transform: translateX(-120%) skewX(-20deg); }
                .group\\/report-card:hover .report-shine { animation: report-shine-sweep 900ms ease; }
                .report-card { transition: border-color 220ms ease, background 220ms ease, transform 220ms ease, box-shadow 220ms ease; }
                .report-card:hover { border-color: rgba(52,211,153,.34); background: rgba(255,255,255,.055); box-shadow: 0 16px 40px -28px rgba(52,211,153,.8); transform: translateY(-2px); }
                .assistant-report [class*="rounded-2xl"][class*="border"] {
                  border-color: rgba(255,255,255,.1);
                  background: rgba(0,0,0,.34);
                  box-shadow: inset 0 1px 0 rgba(255,255,255,.045);
                  transition: transform 220ms ease, border-color 220ms ease, background 220ms ease, box-shadow 220ms ease;
                }
                .assistant-report [class*="rounded-2xl"][class*="border"]:hover {
                  border-color: rgba(52,211,153,.3);
                  background: rgba(255,255,255,.055);
                  box-shadow: 0 18px 44px -34px rgba(52,211,153,.9), inset 0 1px 0 rgba(255,255,255,.08);
                  transform: translateY(-2px);
                }
                .assistant-report [class*="tracking-[0.4em]"],
                .assistant-report [class*="tracking-[0.35em]"] {
                  color: #eab308;
                  position: relative;
                  display: inline-flex;
                  padding-bottom: .45rem;
                }
                .assistant-report [class*="tracking-[0.4em]"]::after,
                .assistant-report [class*="tracking-[0.35em]"]::after {
                  content: "";
                  position: absolute;
                  left: 0;
                  bottom: .12rem;
                  width: min(104px, 100%);
                  height: 1px;
                  background: linear-gradient(90deg, rgba(234,179,8,.82), rgba(234,179,8,.22), transparent);
                  box-shadow: 0 0 10px rgba(234,179,8,.22);
                  pointer-events: none;
                }
                .assistant-report [class*="bg-blue-950"] {
                  background: rgba(8,47,73,.32);
                  border-color: rgba(96,165,250,.22);
                }
                .assistant-report [class*="bg-amber-950"] {
                  background: rgba(69,39,7,.32);
                  border-color: rgba(245,158,11,.22);
                }
                .assistant-report [class*="bg-emerald-950"] {
                  background: rgba(6,78,59,.28);
                  border-color: rgba(52,211,153,.22);
                }
                .assistant-report [class*="bg-rose-950"] {
                  background: rgba(76,5,25,.28);
                  border-color: rgba(251,113,133,.22);
                }
                .assistant-report [class~="text-[7px]"] { font-size: 10px !important; }
                .assistant-report [class~="text-[8px]"] { font-size: 11px !important; }
                .assistant-report [class~="text-[9px]"] { font-size: 12px !important; }
                .assistant-report [class~="text-[10px]"] { font-size: 13px !important; }
                .assistant-report [class~="text-[11px]"] { font-size: 14px !important; }
                .assistant-report [class~="text-[12px]"] { font-size: 15px !important; }
                .assistant-report [class~="text-[13px]"] { font-size: 16px !important; }
                .assistant-report [class~="text-[14px]"] { font-size: 17px !important; }
                .assistant-report [class~="text-xl"] { font-size: 28px !important; }
                .assistant-report p {
                  line-height: 1.55 !important;
                }
                .report-soft-panels span,
                .report-soft-panels p {
                  font-weight: 400 !important;
                }
                .assistant-report [class~="p-2"] {
                  padding: .72rem !important;
                }
                .assistant-report [class~="p-3"] {
                  padding: 1rem !important;
                }
                @media (prefers-reduced-motion: reduce) {
                  .report-rise { animation: none !important; }
                }
              `}</style>
              <StaffChalkboardBackdrop />
              {/* GLOSS */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none z-0" />
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/[0.035] to-transparent pointer-events-none z-0" />
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.025] to-transparent rotate-45 pointer-events-none z-0" />
              {/* ZNAK WODNY */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                <span className="text-[160px] font-black italic uppercase tracking-tighter text-white/[0.025] whitespace-nowrap leading-none">{reportPlayer.firstName} {reportPlayer.lastName}</span>
              </div>

              {/* HEADER */}
              <div
                className="relative z-10 flex items-center justify-between select-none border-b border-white/10 bg-black/35 px-7 py-4 shrink-0"
                style={{ cursor: reportDragging ? 'grabbing' : 'grab' }}
                onMouseDown={e => {
                  e.preventDefault();
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  setReportDragging({
                    startX: e.clientX,
                    startY: e.clientY,
                    originX: rect?.left ?? reportModalPos.x,
                    originY: rect?.top ?? reportModalPos.y,
                  });
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black italic uppercase tracking-tighter px-2 py-0.5 rounded-full border ${posColor}`}>{reportPositionLabel[reportPlayer.position]}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OVR {reportPlayer.overallRating}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{reportPlayer.age} lat</span>
                      <span className="text-slate-700">•</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${reportPlayer.attributes.talent >= 75 ? 'text-emerald-400' : reportPlayer.attributes.talent >= 60 ? 'text-amber-400' : 'text-slate-500'}`}>Talent {reportPlayer.attributes.talent}</span>
                    </div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">{reportPlayer.firstName} {reportPlayer.lastName}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-blue-400/50 uppercase tracking-widest">Raport Indywidualny • {assistants[0] ? `${assistants[0].firstName} ${assistants[0].lastName}` : 'Asystent'}</span>
                  <button onClick={() => setReportPlayer(null)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black active:translate-y-[2px]">✕</button>
                </div>
              </div>

              {/* BODY — 4 kolumny */}
              <div className="report-rise relative z-10 flex-1 grid grid-cols-[360px_minmax(0,1.35fr)_minmax(0,1.35fr)_330px] gap-5 p-6 overflow-hidden min-h-0" style={{ animationDelay: '120ms' }}>

                {/* KOL 1: Statystyki + Słabe/Mocne */}
                <div className="report-soft-panels flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2">Statystyki Sezonowe</span>
                    <div className="relative grid grid-cols-2 gap-1.5">
                      {seasonStats.map((s, i) => (
                        <div key={i} className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 min-w-0">
                          {s.cardClass ? (
                            <span
                              className={`w-3 h-4 shrink-0 rounded-[2px] border border-white/20 rotate-[-7deg] ${s.cardClass}`}
                              title={s.label}
                              aria-label={s.label}
                            />
                          ) : (
                            <span className="min-w-0 truncate text-[8px] font-black text-slate-500 uppercase tracking-widest leading-tight">{s.label}</span>
                          )}
                          <span className={`shrink-0 text-[12px] font-black tabular-nums ${s.color}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(() => {
                    const SQ_ATTR_LABELS: Record<string, string> = { strength: 'Siła', stamina: 'Kondycja', pace: 'Szybkość', defending: 'Obrona', passing: 'Podania', attacking: 'Atak', finishing: 'Wykończenie', technique: 'Technika', vision: 'Wizja', dribbling: 'Drybling', heading: 'Gra głową', positioning: 'Ustawianie', goalkeeping: 'Bramkarstwo', freeKicks: 'Rzuty wolne', penalties: 'Jedenastki', corners: 'Rożne', aggression: 'Agresja', crossing: 'Dośrodkowania', leadership: 'Przywództwo', mentality: 'Mentalność', workRate: 'Pracowitość', talent: 'Talent' };
                    const sc = reportPlayer.stats.seasonalChanges ?? {};
                    const dropping = Object.entries(sc).filter(([, v]) => v < 0).sort(([, a], [, b]) => a - b);
                    const rising = Object.entries(sc).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
                    if (dropping.length === 0 && rising.length === 0) return null;
                    return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2">Trend Sezonu</span>
                        <div className="relative flex flex-col gap-0.5">
                          {dropping.map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between rounded-lg bg-rose-950/40 border border-rose-500/20 px-2 py-1">
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-rose-300">{SQ_ATTR_LABELS[key] ?? key}</span>
                              <span className="text-[11px] font-black tabular-nums text-rose-400">▼ {val}</span>
                            </div>
                          ))}
                          {rising.map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between rounded-lg bg-emerald-950/40 border border-emerald-500/20 px-2 py-1">
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">{SQ_ATTR_LABELS[key] ?? key}</span>
                              <span className="text-[11px] font-black tabular-nums text-emerald-400">▲ +{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-950/30 p-3 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-rose-400 uppercase tracking-[0.4em] block mb-1.5">Słabe Strony</span>
                    <div className="relative flex flex-col gap-1">
                      {report.weakAttributes.length > 0 ? report.weakAttributes.map(a => (
                        <div key={a.attr} className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-[11px] font-black italic uppercase tracking-tighter text-rose-300">{a.label}</span>
                          <span className="shrink-0 text-[12px] font-black tabular-nums text-rose-400">{a.value}</span>
                        </div>
                      )) : <p className="text-[9px] font-normal italic uppercase tracking-tighter text-rose-300/50">Brak wyraźnych słabości</p>}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] block mb-1.5">Mocne Strony</span>
                    <div className="relative flex flex-col gap-1">
                      {report.strongAttributes.length > 0 ? report.strongAttributes.map(a => (
                        <div key={a.attr} className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-[11px] font-black italic uppercase tracking-tighter text-emerald-300">{a.label}</span>
                          <span className="shrink-0 text-[12px] font-black tabular-nums text-emerald-400">{a.value}</span>
                        </div>
                      )) : <p className="text-[9px] font-normal italic uppercase tracking-tighter text-emerald-300/50">Brak wyraźnych atutów</p>}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-black/30 p-3 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-amber-400 uppercase tracking-[0.4em] block mb-2">Atrybuty</span>
                    <div className="relative h-[220px]">
                      <PlayerAttributeRadar attributes={reportPlayer.attributes} />
                    </div>
                    <div className="relative mt-2 grid grid-cols-2 gap-1">
                      {PLAYER_ATTRIBUTE_RADAR_ITEMS.map(attr => {
                        const value = reportPlayer.attributes[attr.key] ?? 0;
                        return (
                          <div key={attr.key} className="flex items-center justify-between px-1 py-0.5">
                            <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-400 truncate">{attr.label}</span>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: playerAttrColor(value) }}>{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* KOL 2: Wykres formy + Ocena ogólna + Skuteczność */}
                <div className="flex flex-col gap-3 min-h-0">
                  {(() => {
                    const ratings = (reportPlayer.stats.ratingHistory || []).slice(-15);
                    if (ratings.length < 2) return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center h-[108px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">Brak danych meczowych</span>
                      </div>
                    );
                    const W = 500, H = 94;
                    const PAD = { top: 10, right: 10, bottom: 20, left: 28 };
                    const innerW = W - PAD.left - PAD.right;
                    const innerH = H - PAD.top - PAD.bottom;
                    const minVal = Math.max(0, Math.min(...ratings) - 0.5);
                    const maxVal = Math.min(10, Math.max(...ratings) + 0.5);
                    const range = maxVal - minVal || 1;
                    const toX = (i: number) => PAD.left + (i / (ratings.length - 1)) * innerW;
                    const toY = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH;
                    const pts = ratings.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
                    const area = `${toX(0)},${PAD.top + innerH} ${pts} ${toX(ratings.length - 1)},${PAD.top + innerH}`;
                    const last = ratings[ratings.length - 1];
                    const lc = last >= 7.5 ? '#10b981' : last >= 6.5 ? '#f59e0b' : '#f43f5e';
                    return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <div className="relative flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Forma — Ostatnie Mecze</span>
                          <span className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: lc }}>{last.toFixed(1)}</span>
                        </div>
                        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="relative block">
                          <defs>
                            <linearGradient id="sqrfg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={lc} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={lc} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0, 0.5, 1].map((t, i) => { const y = PAD.top + innerH * (1 - t); return (<g key={i}><line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" /><text x={PAD.left - 4} y={y + 3} fill="rgba(148,163,184,0.55)" fontSize="8" textAnchor="end" fontWeight="bold">{(minVal + range * t).toFixed(1)}</text></g>); })}
                          <polygon points={area} fill="url(#sqrfg)" />
                          <polyline points={pts} fill="none" stroke={lc} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          {ratings.map((v, i) => { const pc = v >= 7.5 ? '#10b981' : v >= 6.5 ? '#f59e0b' : '#f43f5e'; return <circle key={i} cx={toX(i)} cy={toY(v)} r={i === ratings.length - 1 ? 4 : 2.5} fill={pc} stroke="#0f172a" strokeWidth="1.5" />; })}
                          <text x={toX(ratings.length - 1)} y={toY(last) - 7} fill={lc} fontSize="9" textAnchor="middle" fontWeight="bold">{last.toFixed(1)}</text>
                          {ratings.map((_, i) => (<text key={i} x={toX(i)} y={H - 1} fill="rgba(148,163,184,0.3)" fontSize="7" textAnchor="middle">{i + 1}</text>))}
                        </svg>
                      </div>
                    );
                  })()}
                  <div className="relative rounded-2xl border border-white/10 bg-black/30 p-4 min-h-[230px] overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3">Ocena Ogólna</span>
                    <p className="relative text-[12px] font-normal not-italic normal-case tracking-normal text-white leading-relaxed">{report.overallAssessment}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-1.5">Skuteczność na Pozycji</span>
                    <p className="relative text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.positionEffectivenessText}</p>
                  </div>
                </div>

                {/* KOL 3: Sztab szkoleniowy */}
                <div className="flex flex-col gap-3 min-h-0">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 flex flex-col gap-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">Asystent Trenera</span>
                    {report.staffProgressReport.assistantCoach.hasCoach ? (<>
                      <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Obserwacje Treningowe</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.assistantCoach.observations}</p></div>
                      {report.staffProgressReport.assistantCoach.formAssessment && <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Ocena Formy</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.assistantCoach.formAssessment}</p></div>}
                      <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Zalecenia</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-emerald-300 leading-relaxed">{report.staffProgressReport.assistantCoach.recommendations}</p></div>
                    </>) : <p className="relative text-[10px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.assistantCoach.observations}</p>}
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 flex flex-col gap-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em]">Trener Przygotowania Motorycznego</span>
                    <div className="relative flex gap-1.5">
                      {report.staffProgressReport.fitnessCoach.physicalMetrics.map((m, i) => (
                        <div key={i} className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl p-2 ${m.change > 0 ? 'border border-emerald-500/20 bg-emerald-950/40' : m.change < 0 ? 'border border-rose-500/20 bg-rose-950/40' : 'border border-white/10 bg-black/30'}`}>
                          <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                          <span className={`text-[11px] font-black ${m.change > 0 ? 'text-emerald-400' : m.change < 0 ? 'text-rose-400' : 'text-slate-500'}`}>{m.change > 0 ? `▲ +${m.change}` : m.change < 0 ? `▼ ${m.change}` : '—'}</span>
                        </div>
                      ))}
                    </div>
                    {report.staffProgressReport.fitnessCoach.hasCoach ? (<>
                      <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Ocena</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.fitnessCoach.assessment}</p></div>
                      <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Zalecenia</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-emerald-300 leading-relaxed">{report.staffProgressReport.fitnessCoach.recommendations}</p></div>
                    </>) : <p className="relative text-[10px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.fitnessCoach.assessment}</p>}
                  </div>
                  {reportPlayer.position === 'GK' && (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 flex flex-col gap-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                      <span className="relative text-[9px] font-black text-amber-400 uppercase tracking-[0.4em]">Trener Bramkarzy</span>
                      {report.staffProgressReport.goalkeeperCoach.hasCoach ? (<>
                        <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Obserwacje Treningowe</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.goalkeeperCoach.observations}</p></div>
                        {report.staffProgressReport.goalkeeperCoach.assessment && <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Ocena</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.goalkeeperCoach.assessment}</p></div>}
                        <div className="relative"><span className="block text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Zalecenia</span><p className="text-[10px] font-normal italic uppercase tracking-tighter text-amber-300 leading-relaxed">{report.staffProgressReport.goalkeeperCoach.recommendations}</p></div>
                      </>) : <p className="relative text-[10px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.goalkeeperCoach.observations}</p>}
                    </div>
                  )}
                </div>

                {/* KOL 4: KPIs + Ocena Asystenta + Rekomendacje + Opłacalność */}
                <div className="flex flex-col gap-3 min-h-0">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Wartość', value: report.valueForTeam, color: report.valueColor },
                      { label: 'Potencjał', value: report.developmentPotential, color: report.potentialColor },
                      { label: 'Poz. Eff.', value: String(report.positionEffectivenessScore), color: effColor },
                    ].map((kpi, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 flex flex-col items-center gap-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />
                        <span className="relative text-center text-[8px] font-black uppercase tracking-widest leading-tight text-slate-500">{kpi.label}</span>
                        <span className={`relative text-[11px] font-black italic uppercase tracking-tighter ${kpi.color}`}>{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-1.5">Ocena Asystenta</span>
                    <p className="relative text-[11px] font-normal not-italic normal-case tracking-normal text-white leading-relaxed">{report.trainingRecommendationText}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/30 p-3 flex flex-col gap-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">Rekomendacje</span>
                    <div className="relative bg-black/30 rounded-xl p-2 flex flex-col gap-0.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fokus Indywidualny</span>
                      <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedFocusLabel}</span>
                    </div>
                    <div className="relative bg-black/30 rounded-xl p-2 flex flex-col gap-0.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Program Drużynowy</span>
                      <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedCycleName}</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-amber-400 uppercase tracking-[0.4em] block mb-1.5">Opłacalność Inwestycji</span>
                    <p className="relative text-[11px] font-normal italic uppercase tracking-tighter text-amber-200 leading-relaxed">{report.investmentText}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}</PortalScaleWrapper>, document.body)}

      {isAnalysisOpen && myClub && teamAnalysisReport && (
        <TeamAnalysisModal
          club={myClub}
          report={teamAnalysisReport}
          onClose={() => setIsAnalysisOpen(false)}
          assistantName={assistants[0] ? `${assistants[0].firstName} ${assistants[0].lastName}` : undefined}
        />
      )}

      {isMotivationOpen && myClub && (
        <WeeklyMotivationModal
          club={myClub}
          leaguePosition={leaguePosition}
          teamCount={leagueClubs.length}
          seed={(sessionSeed ?? 1) + (myClub.stats.played ?? 0) * 37 + currentDate.getTime()}
          onConfirm={handleMotivationConfirm}
          onClose={() => setIsMotivationOpen(false)}
        />
      )}

      {selectedScheduleReportId && (
        isSelectedScheduleReportEuropean ? (
          <MatchReportModal matchId={selectedScheduleReportId} seasonNumber={selectedScheduleReportSeason} onClose={() => setSelectedScheduleReportId(null)} />
        ) : (
          <MatchReportModalPolishLeague matchId={selectedScheduleReportId} seasonNumber={selectedScheduleReportSeason} onClose={() => setSelectedScheduleReportId(null)} />
        )
      )}

      {isStaffOpen && myClub && (() => {
        const isUserClub = myClub.id === userTeamId;
        const coachName = isUserClub && managerProfile
          ? `${managerProfile.firstName} ${managerProfile.lastName}`
          : myClub.coachId && coaches[myClub.coachId]
            ? `${coaches[myClub.coachId].firstName} ${coaches[myClub.coachId].lastName}`
            : null;
        const clubStaff = (myClub.staffIds ?? []).map(id => staffMembers[id]).filter(Boolean);
        const grouped: Partial<Record<StaffRole, typeof clubStaff>> = {};
        clubStaff.forEach(s => {
          if (!grouped[s.role]) grouped[s.role] = [];
          grouped[s.role]!.push(s);
        });
        const assistants = grouped[StaffRole.ASSISTANT_COACH] ?? [];
        const gkCoaches  = grouped[StaffRole.GOALKEEPER_COACH] ?? [];
        const fitness    = grouped[StaffRole.FITNESS_COACH] ?? [];
        const analysts   = grouped[StaffRole.VIDEO_ANALYST] ?? [];
        const physios    = grouped[StaffRole.PHYSIOTHERAPIST] ?? [];
        const doctors    = grouped[StaffRole.CLUB_DOCTOR] ?? [];

        const ROLE_LABELS: Record<StaffRole, string> = {
          [StaffRole.ASSISTANT_COACH]: 'Asystent trenera',
          [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
          [StaffRole.FITNESS_COACH]: 'Trener przygotowania motorycznego',
          [StaffRole.VIDEO_ANALYST]: 'Analityk video',
          [StaffRole.PHYSIOTHERAPIST]: 'Fizjoterapeuta',
          [StaffRole.CLUB_DOCTOR]: 'Lekarz klubowy',
        };
        const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

        const selectedMember = selectedStaffId ? clubStaff.find(s => s.id === selectedStaffId) ?? null : null;
        const safeManagerProfile = ManagerExperienceService.ensureManagerExperience(managerProfile);
        const managerExperienceProgress = safeManagerProfile
          ? ManagerExperienceService.getExperienceProgress(safeManagerProfile.expPoints)
          : null;
        const formatManagerExp = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
        const formatManagerExpText = (value: string) => {
          const normalized = value.trim().toLocaleLowerCase('pl-PL');
          return normalized.length > 0
            ? normalized.charAt(0).toLocaleUpperCase('pl-PL') + normalized.slice(1)
            : normalized;
        };
        const managerCareerTotals = safeManagerProfile?.careerHistory.reduce((acc, entry) => ({
          wins: acc.wins + entry.wins,
          draws: acc.draws + entry.draws,
          losses: acc.losses + entry.losses,
          points: acc.points + (entry.points ?? 0),
        }), { wins: 0, draws: 0, losses: 0, points: 0 });
        const managerExpFilterOptions: Array<{ id: 'ALL' | 'DOMESTIC' | 'EUROPE' | 'SEASON'; label: string }> = [
          { id: 'ALL', label: 'Wszystko' },
          { id: 'DOMESTIC', label: 'Kraj' },
          { id: 'EUROPE', label: 'Europa' },
          { id: 'SEASON', label: 'Sezon' },
        ];
        const filteredManagerExpHistory = safeManagerProfile?.expHistory.filter(entry => {
          if (managerExpFilter === 'ALL') return true;
          if (managerExpFilter === 'DOMESTIC') return ['Liga Polska', 'Puchar Polski', 'Ekstraklasa'].includes(entry.competition);
          if (managerExpFilter === 'EUROPE') return ['Liga Mistrzów', 'Liga Europy', 'Liga Konferencji'].includes(entry.competition);
          return entry.sourceKey.startsWith('season:');
        }) ?? [];

        const managerFlag = NATIONALITY_FLAG_MAP[safeManagerProfile?.nationality ?? ''] ?? safeManagerProfile?.nationalityFlag ?? '';
        const managerCountryCode = COUNTRY_CODE_MAP[safeManagerProfile?.nationality ?? ''];
        const managerFlagUrl = managerCountryCode ? `https://flagcdn.com/w160/${managerCountryCode}.png` : null;
        const managerAccentPrimary = myClub.colorsHex?.[0] ?? '#eab308';
        const managerAccentSecondary = myClub.colorsHex?.[1] ?? managerAccentPrimary;
        const managerClubContract = isUserClub && activeManagerContract?.clubId === myClub.id && activeManagerContract.status === 'ACTIVE'
          ? activeManagerContract
          : null;
        const managerContractEndDate = managerClubContract ? new Date(managerClubContract.terms.endDate) : null;
        const managerContractDaysLeft = managerContractEndDate
          ? Math.max(0, Math.ceil((managerContractEndDate.getTime() - currentDate.getTime()) / 86_400_000))
          : 0;
        const managerContractMonthsLeft = Math.max(0, Math.ceil(managerContractDaysLeft / 30.44));
        const managerContractYearsPart = Math.floor(managerContractMonthsLeft / 12);
        const managerContractMonthsPart = managerContractMonthsLeft % 12;
        const managerContractTimeLabel = managerClubContract
          ? [
              managerContractYearsPart > 0 ? `${managerContractYearsPart} ${managerContractYearsPart === 1 ? 'rok' : managerContractYearsPart < 5 ? 'lata' : 'lat'}` : '',
              managerContractMonthsPart > 0 ? `${managerContractMonthsPart} mies.` : '',
            ].filter(Boolean).join(' ') || 'mniej niż miesiąc'
          : 'Brak umowy';
        const managerContractAnnualValue = managerClubContract
          ? `${managerClubContract.terms.annualSalary.toLocaleString('pl-PL')} PLN`
          : '—';

        const currentYear = currentDate.getFullYear();
        const seasonStartYear = currentDate.getMonth() >= 6 ? currentYear : currentYear - 1;
        const currentSeasonLabel = `${seasonStartYear}/${seasonStartYear + 1}`;

        const userLeagueClubs = clubs.filter(c => c.leagueId === myClub.leagueId);
        const sortedLeague = [...userLeagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
        const currentRank = isUserClub ? sortedLeague.findIndex(c => c.id === userTeamId) + 1 : 0;

        const allCareerTotals = {
          wins: (managerCareerTotals?.wins ?? 0) + (isUserClub ? myClub.stats.wins : 0),
          draws: (managerCareerTotals?.draws ?? 0) + (isUserClub ? myClub.stats.draws : 0),
          losses: (managerCareerTotals?.losses ?? 0) + (isUserClub ? myClub.stats.losses : 0),
          points: (managerCareerTotals?.points ?? 0) + (isUserClub ? myClub.stats.points : 0),
        };
        const managerCareerMatches = allCareerTotals.wins + allCareerTotals.draws + allCareerTotals.losses;
        const managerWinRate = managerCareerMatches > 0
          ? Math.round((allCareerTotals.wins / managerCareerMatches) * 100)
          : 0;
        const managerExpTrendEntries = [...(safeManagerProfile?.expHistory ?? [])].slice(0, 12).reverse();
        const managerExpTrendValues = managerExpTrendEntries.map(entry => entry.totalAfter);
        const managerExpTrendMin = Math.min(...managerExpTrendValues, 0);
        const managerExpTrendMax = Math.max(...managerExpTrendValues, 1);
        const managerExpTrendRange = Math.max(1, managerExpTrendMax - managerExpTrendMin);
        const managerExpTrendPoints = managerExpTrendEntries.length > 0
          ? managerExpTrendEntries.map((entry, index) => {
              const x = managerExpTrendEntries.length === 1 ? 260 : 18 + (index / (managerExpTrendEntries.length - 1)) * 484;
              const y = 126 - ((entry.totalAfter - managerExpTrendMin) / managerExpTrendRange) * 96;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ')
          : '18,126 502,126';
        const managerResultSegments = [
          { label: 'Zwycięstwa', value: allCareerTotals.wins, color: '#34d399' },
          { label: 'Remisy', value: allCareerTotals.draws, color: '#38bdf8' },
          { label: 'Porażki', value: allCareerTotals.losses, color: '#fb7185' },
        ].map(item => ({
          ...item,
          fraction: managerCareerMatches > 0 ? item.value / managerCareerMatches : 0,
        }));
        const managerProgressPercent = managerExperienceProgress?.progressPercent ?? 0;
        const managerProgressStops: Array<{ at: number; rgb: [number, number, number] }> = [
          { at: 0, rgb: [239, 68, 68] },
          { at: 25, rgb: [249, 115, 22] },
          { at: 50, rgb: [250, 204, 21] },
          { at: 75, rgb: [132, 204, 22] },
          { at: 100, rgb: [34, 197, 94] },
        ];
        const getManagerProgressColor = (percent: number) => {
          const safePercent = Math.max(0, Math.min(100, percent));
          const upperIndex = Math.min(
            managerProgressStops.length - 1,
            Math.max(1, managerProgressStops.findIndex(stop => safePercent <= stop.at)),
          );
          const lower = managerProgressStops[upperIndex - 1];
          const upper = managerProgressStops[upperIndex];
          const ratio = (safePercent - lower.at) / Math.max(1, upper.at - lower.at);
          const rgb = lower.rgb.map((channel, index) => Math.round(channel + (upper.rgb[index] - channel) * ratio));
          return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        };
        const managerProgressColor = getManagerProgressColor(managerProgressPercent);
        const managerProgressSlices = Array.from({ length: Math.ceil(managerProgressPercent) }, (_, index) => {
          const slicePercent = Math.min(1, managerProgressPercent - index);
          return {
            offset: index,
            length: slicePercent,
            color: getManagerProgressColor(index + slicePercent / 2),
          };
        });
        const managerProgressAngle = (managerProgressPercent / 100) * Math.PI * 2 - Math.PI / 2;
        const managerProgressMarkerX = 75 + Math.cos(managerProgressAngle) * 55;
        const managerProgressMarkerY = 75 + Math.sin(managerProgressAngle) * 55;

        const ManagerRingMetric = ({ label, value, percent, color }: { label: string; value: string | number; percent: number; color: string }) => {
          const safePercent = Math.max(0, Math.min(100, percent));
          const circumference = 232.48;
          const endAngle = (safePercent / 100) * Math.PI * 2;
          const endX = 46 + Math.cos(endAngle) * 37;
          const endY = 46 + Math.sin(endAngle) * 37;
          return (
            <div className="relative flex w-[118px] flex-col items-center">
              <div
                className="relative h-[102px] w-[102px] rounded-full"
                style={{ background: `radial-gradient(circle, ${color}1f 0%, ${color}09 48%, transparent 70%)` }}
              >
                <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90" aria-hidden="true">
                  <circle cx="46" cy="46" r="44" fill="none" stroke={color} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 5" />
                  <circle cx="46" cy="46" r="37" fill={color} fillOpacity="0.075" stroke={color} strokeOpacity="0.2" strokeWidth="8" />
                  <circle cx="46" cy="46" r="37" fill="none" stroke={color} strokeOpacity="0.16" strokeWidth="16" filter="url(#manager-profile-soft-glow)" />
                  <circle
                    cx="46"
                    cy="46"
                    r="37"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - safePercent / 100)}
                  />
                  <circle cx={endX} cy={endY} r="3.3" fill="#f8fafc" stroke={color} strokeWidth="2" className="manager-profile-pulse" />
                </svg>
                <div
                  className="absolute inset-0 flex items-center justify-center text-[24px] font-black italic uppercase tracking-tighter text-white"
                  style={{ textShadow: `0 0 18px ${color}99` }}
                >
                  {value}
                </div>
              </div>
              <div className="mt-1 text-[9px] font-black italic uppercase tracking-tighter" style={{ color, textShadow: `0 0 10px ${color}55` }}>{label}</div>
            </div>
          );
        };

        const StaffCard = ({ m, accent }: { m: typeof clubStaff[0]; accent: string }) => (
          <button
            type="button"
            className="group flex min-w-[190px] items-center gap-3 rounded-[14px] border border-white/10 bg-[#06111e]/82 px-4 py-3 text-left shadow-[0_7px_18px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
            style={{ boxShadow: `inset 2px 0 0 ${accent}9e, 0 7px 18px rgba(0,0,0,0.2)` }}
            onClick={() => { setSelectedStaffId(m.id); setIsStaffMenuOpen(false); setStaffActionMsg(null); setStaffFireConfirmOpen(false); setStaffNegotiationOpen(false); }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
              style={{ backgroundColor: accent, boxShadow: `0 0 11px ${accent}` }}
            />
            <span className="whitespace-nowrap text-[15px] font-semibold tracking-normal text-slate-100">{m.firstName} {m.lastName}</span>
          </button>
        );

        const StaffGroup = ({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) => (
          <section className="relative rounded-[20px] border border-white/[0.085] bg-[#071321]/74 px-5 py-4 backdrop-blur-[3px]">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 9px ${accent}` }} />
              <span className="text-[10px] font-black italic uppercase tracking-tighter" style={{ color: accent }}>{label}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">{children}</div>
          </section>
        );

        return createPortal(
          <PortalScaleWrapper>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => { setIsStaffOpen(false); setSelectedStaffId(null); setIsManagerProfileOpen(false); }}>

            {/* KARTA SZCZEGÓŁÓW */}
            {isManagerProfileOpen && safeManagerProfile && (
              <div
                className="relative w-[1180px] max-h-[92vh] overflow-hidden rounded-[40px] border border-cyan-100/15 bg-[#04101d] shadow-[0_55px_140px_rgba(0,0,0,0.96)]"
                onClick={e => e.stopPropagation()}
              >
                <style>{`
                  @keyframes manager-profile-in { from { opacity: 0; transform: translateY(20px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                  @keyframes manager-profile-pulse { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .9; transform: scale(1.08); } }
                  @keyframes manager-profile-draw { from { stroke-dashoffset: 700; } to { stroke-dashoffset: 0; } }
                  .manager-profile-shell { animation: manager-profile-in 500ms cubic-bezier(.2,.9,.3,1) both; }
                  .manager-profile-pulse { animation: manager-profile-pulse 2.6s ease-in-out infinite; transform-origin: center; }
                  .manager-profile-trend { stroke-dasharray: 700; animation: manager-profile-draw 1.2s ease-out both; }
                  .manager-profile-row { transition: background 180ms ease, transform 180ms ease; }
                  .manager-profile-row:hover { background: rgba(255,255,255,.065) !important; transform: translateX(3px); }
                  @media (prefers-reduced-motion: reduce) {
                    .manager-profile-shell, .manager-profile-pulse, .manager-profile-trend { animation: none !important; }
                  }
                `}</style>
                <ManagerProfileScene primaryColor={managerAccentPrimary} secondaryColor={managerAccentSecondary} />
                <div
                  className="manager-profile-shell relative z-10 flex min-h-[188px] items-center gap-7 overflow-hidden border-b border-cyan-100/10 px-9 pr-24"
                >
                  <div
                    className="manager-profile-pulse absolute left-[-70px] top-[-120px] h-[280px] w-[280px] rounded-full blur-3xl"
                    style={{ backgroundColor: `${managerAccentPrimary}30` }}
                  />
                  <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-[30px] border border-white/15 bg-[#061321]/90 shadow-[0_20px_55px_rgba(0,0,0,.42)]">
                    <div className="absolute inset-2 rounded-[23px] border border-white/[0.07]" />
                    {getClubLogo(myClub.id) ? (
                      <img src={getClubLogo(myClub.id)!} alt={myClub.name} className="relative z-10 h-[76px] w-[76px] object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,.5)]" />
                    ) : (
                      <span className="relative z-10 text-[34px] font-black italic uppercase tracking-tighter text-white">{myClub.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentSecondary }}>Centrum analityczne</div>
                    <div className="mt-1 text-[15px] font-medium tracking-normal text-cyan-100/60">{myClub.name} · profil trenera</div>
                    <div className="mt-3 truncate text-[40px] font-black italic uppercase tracking-tighter leading-none text-white">
                        {safeManagerProfile.firstName} {safeManagerProfile.lastName}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-[14px] font-black italic uppercase tracking-tighter text-slate-200">{safeManagerProfile.nationality}</span>
                      {managerFlagUrl ? (
                        <img src={managerFlagUrl} alt={safeManagerProfile.nationality} className="h-4 w-7 rounded-sm border border-white/15 object-cover" />
                      ) : (
                        <span className="text-[16px] leading-none">{managerFlag}</span>
                      )}
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: managerAccentSecondary }} />
                      <span className="text-[14px] font-black italic uppercase tracking-tighter text-slate-200">{safeManagerProfile.age} lat</span>
                    </div>
                  </div>
                  <div className="grid w-[218px] shrink-0 gap-2 border-l border-cyan-100/10 pl-5">
                    <div className="group relative overflow-hidden rounded-[16px] border border-cyan-200/15 bg-[#04111e]/80 px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,.26)]">
                      <svg className="absolute -right-2 -top-3 h-16 w-16 opacity-[0.09]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                        <rect x="10" y="14" width="44" height="40" rx="8" stroke={managerAccentSecondary} strokeWidth="4" />
                        <path d="M20 9v12M44 9v12M11 27h42" stroke={managerAccentSecondary} strokeWidth="4" strokeLinecap="round" />
                        <path d="M22 37h8M36 37h7M22 45h8" stroke={managerAccentSecondary} strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <div className="relative text-[9px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentSecondary }}>Czas kontraktu</div>
                      <div className="relative mt-1 truncate text-[17px] font-semibold tracking-normal text-white">{managerContractTimeLabel}</div>
                      <div className="relative mt-0.5 text-[10px] font-normal tracking-normal text-slate-500">
                        {managerContractEndDate ? `do ${managerContractEndDate.toLocaleDateString('pl-PL')}` : 'brak aktywnego kontraktu'}
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-[16px] border border-emerald-200/15 bg-[#04151b]/78 px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,.26)]">
                      <svg className="absolute -right-2 -top-3 h-16 w-16 opacity-[0.09]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                        <path d="M12 17h40v34H12z" stroke={managerAccentPrimary} strokeWidth="4" strokeLinejoin="round" />
                        <path d="M18 25h28M18 33h18M18 41h13" stroke={managerAccentPrimary} strokeWidth="3" strokeLinecap="round" />
                        <circle cx="46" cy="44" r="10" fill={managerAccentPrimary} fillOpacity="0.45" stroke={managerAccentPrimary} strokeWidth="3" />
                      </svg>
                      <div className="relative text-[9px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentPrimary }}>Wartość kontraktu</div>
                      <div className="relative mt-1 truncate text-[17px] font-semibold tracking-normal text-white">{managerContractAnnualValue}</div>
                      <div className="relative mt-0.5 text-[10px] font-normal tracking-normal text-slate-500">wynagrodzenie roczne</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 border-l border-cyan-100/10 pl-5">
                    <ManagerRingMetric
                      label="Poziom"
                      value={safeManagerProfile.experience}
                      percent={(safeManagerProfile.experience / 99) * 100}
                      color="#fbbf24"
                    />
                    <ManagerRingMetric
                      label="Punkty EXP"
                      value={formatManagerExp(safeManagerProfile.expPoints)}
                      percent={managerExperienceProgress?.progressPercent ?? 0}
                      color="#a78bfa"
                    />
                    <ManagerRingMetric
                      label="Skuteczność"
                      value={`${managerWinRate}%`}
                      percent={managerWinRate}
                      color="#34d399"
                    />
                  </div>
                  <button onClick={() => setIsManagerProfileOpen(false)} className="absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-lg text-slate-400 transition-colors hover:border-white/30 hover:text-white">✕</button>
                </div>

                <div
                  className="relative z-10 max-h-[72vh] overflow-y-auto px-9 py-7 custom-scrollbar"
                >
                  <section className="relative mb-5 border-y border-cyan-100/10 bg-[#03101b]/38 px-1 py-5 backdrop-blur-[1px]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black italic uppercase tracking-tighter text-cyan-300">Analiza wyników</div>
                        <div className="mt-1 text-[20px] font-semibold tracking-normal text-white">Ogólny bilans kariery</div>
                      </div>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Wyniki wszystkich spotkań</div>
                    </div>
                    <div className="grid min-h-[270px] grid-cols-[330px_1fr] divide-x divide-cyan-100/10">
                      <div className="relative flex items-center justify-center overflow-hidden">
                        <div className="absolute h-[245px] w-[245px] rounded-full border border-cyan-100/[0.06]" />
                        <div className="absolute h-[214px] w-[214px] rounded-full border border-dashed border-cyan-100/[0.08]" />
                        <svg viewBox="0 0 210 210" className="h-[250px] w-[250px] -rotate-90 drop-shadow-[0_18px_25px_rgba(0,0,0,.4)]" aria-label="Wykres wyników kariery">
                          <circle cx="105" cy="105" r="76" fill="#03101b" fillOpacity="0.78" stroke="#173047" strokeWidth="34" />
                          {managerResultSegments.map((segment, index) => {
                            if (segment.fraction <= 0) return null;
                            const circumference = 477.52;
                            const previousFraction = managerResultSegments
                              .slice(0, index)
                              .reduce((sum, item) => sum + item.fraction, 0);
                            const segmentLength = segment.fraction * circumference;
                            return (
                              <circle
                                key={segment.label}
                                cx="105"
                                cy="105"
                                r="76"
                                fill="none"
                                stroke={segment.color}
                                strokeWidth="34"
                                strokeDasharray={`${Math.max(0, segmentLength - 5)} ${circumference}`}
                                strokeDashoffset={-(previousFraction * circumference + 2.5)}
                              />
                            );
                          })}
                          <circle cx="105" cy="105" r="54" fill="#041522" stroke="#bae6fd" strokeOpacity="0.08" />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-[43px] font-black italic uppercase tracking-tighter leading-none text-white">{managerCareerMatches}</div>
                          <div className="mt-2 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Spotkań</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-[1fr_180px] items-center gap-8 px-9 py-3">
                        <div className="divide-y divide-cyan-100/[0.08]">
                          {managerResultSegments.map(segment => (
                            <div key={segment.label} className="flex items-center justify-between py-4">
                              <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color, boxShadow: `0 0 12px ${segment.color}` }} />
                                <span className="text-[13px] font-medium tracking-normal text-slate-300">{segment.label}</span>
                              </div>
                              <div className="flex items-baseline gap-3">
                                <span className="text-[25px] font-black italic uppercase tracking-tighter text-white">{segment.value}</span>
                                <span className="w-10 text-right text-[11px] font-normal tracking-normal text-slate-500">{Math.round(segment.fraction * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-l border-cyan-100/10 pl-8">
                          <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300">Punkty</div>
                          <div className="mt-2 text-[48px] font-black italic uppercase tracking-tighter leading-none text-white">{allCareerTotals.points}</div>
                          <div className="mt-4 text-[11px] font-normal leading-relaxed tracking-normal text-slate-500">
                            {managerCareerMatches > 0 ? (allCareerTotals.points / managerCareerMatches).toFixed(2) : '0.00'} pkt na mecz
                          </div>
                          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/55">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{
                                width: `${Math.min(100, managerCareerMatches ? (allCareerTotals.points / (managerCareerMatches * 3)) * 100 : 0)}%`,
                                boxShadow: '0 0 13px #facc15',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {managerExperienceProgress && (
                    <section
                      className="relative mb-5 overflow-hidden rounded-[26px] border border-cyan-100/10 px-6 py-6 shadow-[0_24px_55px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.035)]"
                      style={{
                        background: `radial-gradient(circle at 12% 48%, ${managerProgressColor}12 0%, transparent 30%), linear-gradient(135deg, rgba(1,8,18,.97), rgba(3,13,25,.94))`,
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(186,230,253,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(186,230,253,.18) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentSecondary }}>Rozwój trenera</div>
                          <div className="mt-1 text-[20px] font-semibold tracking-normal text-white">Postęp doświadczenia</div>
                        </div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
                          {managerExperienceProgress.nextRating
                            ? `${formatManagerExp(managerExperienceProgress.pointsToNext)} EXP do poziomu ${managerExperienceProgress.nextRating}`
                            : 'Maksymalny poziom'}
                        </div>
                      </div>

                      <div className="grid grid-cols-[260px_1fr] divide-x divide-cyan-100/10">
                        <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden">
                          <svg viewBox="0 0 150 150" className="h-[156px] w-[156px]" aria-hidden="true">
                            <circle cx="75" cy="75" r="67" fill="none" stroke="#bae6fd" strokeOpacity="0.08" strokeDasharray="2 7" />
                            <circle cx="75" cy="75" r="55" fill="#020812" stroke="#64748b" strokeOpacity="0.28" strokeWidth="26" />
                            <circle cx="75" cy="75" r="55" fill="none" stroke="#27384b" strokeWidth="22" />
                            <circle cx="75" cy="75" r="43" fill="none" stroke="#cbd5e1" strokeOpacity="0.08" strokeWidth="1.5" />
                            {managerProgressSlices.map(slice => (
                              <circle
                                key={slice.offset}
                                cx="75"
                                cy="75"
                                r="55"
                                fill="none"
                                stroke={slice.color}
                                strokeWidth="18"
                                strokeLinecap="butt"
                                strokeDasharray={`${(slice.length / 100) * 345.6 + 0.45} 345.6`}
                                strokeDashoffset={-(slice.offset / 100) * 345.6}
                                transform="rotate(-90 75 75)"
                              />
                            ))}
                            <circle
                              cx={managerProgressMarkerX}
                              cy={managerProgressMarkerY}
                              r="5.2"
                              fill="#f8fafc"
                              stroke={managerProgressColor}
                              strokeWidth="3"
                              className="manager-profile-pulse"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Poziom</div>
                            <div className="mt-1 text-[38px] font-black italic uppercase tracking-tighter leading-none text-white">{managerExperienceProgress.rating}</div>
                            <div className="mt-2 text-[12px] font-black italic uppercase tracking-tighter" style={{ color: managerProgressColor, textShadow: `0 0 12px ${managerProgressColor}77` }}>{Math.round(managerExperienceProgress.progressPercent)}%</div>
                          </div>
                        </div>

                        <div className="relative min-h-[190px] overflow-hidden px-7 pb-4 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-400">Historia punktów EXP</div>
                            <div className="text-[12px] font-black italic uppercase tracking-tighter text-white">{formatManagerExp(safeManagerProfile.expPoints)} EXP</div>
                          </div>
                          <svg viewBox="0 0 520 145" preserveAspectRatio="none" className="mt-2 h-[132px] w-full" aria-hidden="true">
                            <defs>
                              <linearGradient id="manager-exp-area" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor={managerAccentSecondary} stopOpacity="0.34" />
                                <stop offset="1" stopColor={managerAccentSecondary} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {[30, 62, 94, 126].map(y => <line key={y} x1="18" y1={y} x2="502" y2={y} stroke="#bae6fd" strokeOpacity="0.09" />)}
                            {managerExpTrendEntries.length > 1 && (
                              <polygon points={`18,136 ${managerExpTrendPoints} 502,136`} fill="url(#manager-exp-area)" />
                            )}
                            <polyline className="manager-profile-trend" points={managerExpTrendPoints} fill="none" stroke={managerAccentSecondary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            {managerExpTrendEntries.map((entry, index) => {
                              const x = managerExpTrendEntries.length === 1 ? 260 : 18 + (index / (managerExpTrendEntries.length - 1)) * 484;
                              const y = 126 - ((entry.totalAfter - managerExpTrendMin) / managerExpTrendRange) * 96;
                              return <circle key={entry.id} cx={x} cy={y} r="4.5" fill={managerAccentPrimary} stroke="#f8fafc" strokeWidth="2" />;
                            })}
                          </svg>
                        </div>
                      </div>

                      <div className="relative mt-4 h-5 rounded-full border border-white/[0.08] bg-black/65 p-[3px]">
                        <div
                          className="h-full w-full rounded-full opacity-90"
                          style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 25%, #f97316 25%, #fb923c 50%, #eab308 50%, #facc15 75%, #16a34a 75%, #22c55e 100%)' }}
                        />
                        <div className="pointer-events-none absolute inset-y-[2px] left-1/4 w-px bg-black/40" />
                        <div className="pointer-events-none absolute inset-y-[2px] left-1/2 w-px bg-black/40" />
                        <div className="pointer-events-none absolute inset-y-[2px] left-3/4 w-px bg-black/40" />
                        <div
                          className="manager-profile-pulse absolute top-1/2 h-7 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white"
                          style={{ left: `${Math.max(1, Math.min(99, managerExperienceProgress.progressPercent))}%`, boxShadow: `0 0 14px ${managerProgressColor}` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">{formatManagerExp(managerExperienceProgress.currentPoints)} EXP</span>
                        <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
                          {managerExperienceProgress.nextRatingPoints
                            ? `${formatManagerExp(managerExperienceProgress.nextRatingPoints)} EXP`
                            : 'Poziom maksymalny'}
                        </span>
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 gap-5">
                    <div className="relative border-y border-cyan-100/10 bg-[#03101b]/40 px-5 py-6 backdrop-blur-[1px]">
                      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
                      <div className="relative z-10">
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-black italic uppercase tracking-tighter text-cyan-300">Przebieg pracy</div>
                          <div className="mt-1 text-[20px] font-semibold tracking-normal text-white">Historia kariery</div>
                        </div>
                        <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Sezony i wyniki ligowe</div>
                      </div>
                      {safeManagerProfile.careerHistory.length === 0 && !isUserClub ? (
                        <div className="text-[14px] font-black uppercase tracking-tighter text-slate-600 text-center py-5">Brak zakończonych sezonów</div>
                      ) : (
                        <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#020a14]/72">
                          <table className="w-full border-collapse">
                            <thead className="bg-cyan-950/35">
                              <tr className="border-b border-white/10">
                                <th className="text-center px-4 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400">Sezon</th>
                                <th className="text-center px-4 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400 border-l border-white/10">Klub</th>
                                <th className="text-center px-4 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400 border-l border-white/10">Miejsce</th>
                                <th className="text-center px-3 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400 border-l border-white/10">ZW</th>
                                <th className="text-center px-3 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400 border-l border-white/10">RE</th>
                                <th className="text-center px-3 py-3 text-[12px] font-semibold uppercase tracking-tighter text-slate-400 border-l border-white/10">PO</th>
                                <th className="text-center px-4 py-3 text-[12px] font-semibold uppercase tracking-tighter text-yellow-400 border-l border-white/10">Pkt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                              {isUserClub && (
                                <tr className="manager-profile-row bg-yellow-950/25">
                                  <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-yellow-200 whitespace-nowrap">
                                    {currentSeasonLabel}
                                    <span className="ml-2 text-[10px] text-yellow-500">obecnie</span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-white border-l border-white/10">
                                    <div className="flex items-center justify-center gap-2">
                                      {getClubLogo(myClub.id) && (
                                        <img src={getClubLogo(myClub.id)!} alt={myClub.name} className="w-5 h-5 object-contain shrink-0" />
                                      )}
                                      <span>{myClub.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-200 border-l border-white/10">{currentRank > 0 ? currentRank : 'N/d'}</td>
                                  <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-200 border-l border-white/10">{myClub.stats.wins}</td>
                                  <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-200 border-l border-white/10">{myClub.stats.draws}</td>
                                  <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-200 border-l border-white/10">{myClub.stats.losses}</td>
                                  <td className="px-4 py-3 text-center text-[17px] font-semibold uppercase tracking-tighter text-yellow-300 border-l border-white/10">{myClub.stats.points}</td>
                                </tr>
                              )}
                              {safeManagerProfile.careerHistory.map(entry => {
                                const entryClubLogo = getClubLogo(entry.clubId);
                                return (
                                  <tr key={entry.id} className="manager-profile-row bg-slate-950/35">
                                    <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-200 whitespace-nowrap">{entry.seasonLabel}</td>
                                    <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-white border-l border-white/10">
                                      <div className="flex items-center justify-center gap-2">
                                        {entryClubLogo && (
                                          <img src={entryClubLogo} alt={entry.clubName} className="w-5 h-5 object-contain shrink-0" />
                                        )}
                                        <span>{entry.clubName}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-300 border-l border-white/10">{entry.finalRank ? entry.finalRank : 'N/d'}</td>
                                    <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-300 border-l border-white/10">{entry.wins}</td>
                                    <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-300 border-l border-white/10">{entry.draws}</td>
                                    <td className="px-3 py-3 text-center text-[15px] font-semibold uppercase tracking-tighter text-slate-300 border-l border-white/10">{entry.losses}</td>
                                    <td className="px-4 py-3 text-center text-[17px] font-semibold uppercase tracking-tighter text-yellow-300 border-l border-white/10">{entry.points ?? 0}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      </div>
                    </div>

                    <div className="relative border-y border-cyan-100/10 bg-[#03101b]/36 px-5 py-6 backdrop-blur-[1px]">
                      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
                      <div className="relative z-10">
                      <div className="mb-4">
                        <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300">Gabloty i sukcesy</div>
                        <div className="mt-1 text-[20px] font-semibold tracking-normal text-white">Osiągnięcia</div>
                      </div>
                      {safeManagerProfile.achievements.length === 0 ? (
                        <div className="text-[14px] font-black uppercase tracking-tighter text-slate-600 text-center py-5">Brak osiągnięć</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {safeManagerProfile.achievements.map(entry => (
                            <ManagerAchievementBadge key={entry.id} entry={entry} />
                          ))}
                        </div>
                      )}
                      </div>
                    </div>

                    <div className="relative border-y border-cyan-100/10 bg-[#03101b]/40 px-5 py-6 backdrop-blur-[1px]">
                      <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">Dziennik rozwoju</div>
                          <div className="mt-1 text-[16px] font-normal tracking-normal text-white">Historia EXP</div>
                        </div>
                        <div className="flex items-center gap-5 border-b border-white/10 px-1">
                          {managerExpFilterOptions.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setManagerExpFilter(option.id)}
                              className={`border-b-2 px-1 pb-2 text-[11px] font-normal normal-case tracking-normal transition-colors ${
                                managerExpFilter === option.id
                                  ? 'border-yellow-400 text-yellow-200'
                                  : 'border-transparent text-slate-500 hover:text-slate-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {safeManagerProfile.expHistory.length === 0 ? (
                        <div className="py-5 text-center text-[13px] font-normal normal-case tracking-normal text-slate-600">Brak wpisów</div>
                      ) : filteredManagerExpHistory.length === 0 ? (
                        <div className="py-5 text-center text-[13px] font-normal normal-case tracking-normal text-slate-600">Brak wpisów dla filtra</div>
                      ) : (
                        <>
                          <div className="overflow-hidden border-y border-white/[0.07]">
                            <table className="w-full border-collapse">
                              <thead className="bg-white/[0.018]">
                                <tr className="border-b border-white/[0.07]">
                                  <th className="px-4 py-2.5 text-left text-[11px] font-normal normal-case tracking-normal text-slate-500">Data</th>
                                  <th className="px-4 py-2.5 text-left text-[11px] font-normal normal-case tracking-normal text-slate-500">Zdarzenie</th>
                                  <th className="px-4 py-2.5 text-left text-[11px] font-normal normal-case tracking-normal text-slate-500">Rozgrywki</th>
                                  <th className="px-4 py-2.5 text-right text-[11px] font-normal normal-case tracking-normal text-slate-500">Zmiana</th>
                                  <th className="px-4 py-2.5 text-right text-[11px] font-normal normal-case tracking-normal text-slate-500">Razem</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.055]">
                                {filteredManagerExpHistory.slice(0, 24).map(entry => (
                                  <tr key={entry.id} className="bg-transparent transition-colors hover:bg-white/[0.025]">
                                    <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-normal normal-case tracking-normal text-slate-500">{entry.date}</td>
                                    <td className="px-4 py-2.5 text-[13px] font-normal normal-case tracking-normal text-slate-200">{formatManagerExpText(entry.label)}</td>
                                    <td className="px-4 py-2.5 text-[12px] font-normal normal-case tracking-normal text-slate-400">{formatManagerExpText(entry.competition)}</td>
                                    <td className={`whitespace-nowrap px-4 py-2.5 text-right text-[13px] font-normal normal-case tracking-normal ${entry.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                      {entry.delta > 0 ? `+${formatManagerExp(entry.delta)}` : formatManagerExp(entry.delta)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-[13px] font-normal normal-case tracking-normal text-slate-300">{formatManagerExp(entry.totalAfter)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {filteredManagerExpHistory.length > 24 && (
                            <div className="pt-3 text-center text-[11px] font-normal normal-case tracking-normal text-slate-600">
                              Pokazano 24 z {filteredManagerExpHistory.length} wpisów
                            </div>
                          )}
                        </>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMember && (
              <div
                className="relative w-full max-w-4xl h-[860px] max-h-[92vh] rounded-[40px] border border-emerald-400/15 shadow-[0_0_80px_rgba(16,185,129,0.15)] flex overflow-hidden bg-slate-950/90 font-black italic uppercase tracking-tighter"
                onClick={e => e.stopPropagation()}
              >
                <style>{`
                  @keyframes staff-card-in { from { transform: scale(.94) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                  @keyframes staff-rise { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                  @keyframes staff-spin { to { transform: rotate(360deg); } }
                  @keyframes staff-shine-sweep { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(220%) skewX(-20deg); } }
                  .staff-rise { animation: staff-rise 600ms cubic-bezier(.2,.9,.3,1) both; }
                  .staff-ring { animation: staff-spin 24s linear infinite; transform-origin: center; }
                  .staff-shine { background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); transform: translateX(-120%) skewX(-20deg); }
                  .group\\/staff-stat:hover .staff-shine, .staff-info-card:hover .staff-shine { animation: staff-shine-sweep 900ms ease; }
                  .staff-row { transition: background 200ms ease, transform 200ms ease; }
                  .staff-row:hover { background: rgba(255,255,255,.06) !important; transform: translateX(3px); }
                  @media (prefers-reduced-motion: reduce) {
                    .staff-rise, .staff-ring { animation: none !important; }
                  }
                `}</style>
                <StaffChalkboardBackdrop />
                <button onClick={() => { setSelectedStaffId(null); setIsStaffMenuOpen(false); setStaffActionMsg(null); setStaffFireConfirmOpen(false); setStaffNegotiationOpen(false); }} className="absolute right-6 top-6 z-20 text-slate-600 hover:text-white transition-colors text-lg">✕</button>
                {/* nagłówek karty */}
                <div className="w-1/3 relative z-10 bg-black/35 backdrop-blur-sm p-8 flex flex-col items-center border-r border-white/10">
                  {/* dropdown menu */}
                  <div className="absolute left-6 top-6">
                    <button
                      onClick={e => { e.stopPropagation(); setIsStaffMenuOpen(p => !p); setStaffActionMsg(null); }}
                      className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] active:shadow-[0_1px_4px_rgba(0,0,0,0.6)] active:translate-y-px select-none"
                    >
                      ⚙ Akcje
                    </button>
                    {isStaffMenuOpen && (
                      <div className="absolute left-0 top-9 z-50 w-52 rounded-xl border border-white/10 bg-slate-900/95 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
                        {/* Przedłuż kontrakt */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setIsStaffMenuOpen(false);
                            if (selectedMember.lastNegotiationDate) {
                              const lastNeg = new Date(selectedMember.lastNegotiationDate);
                              const unlockDate = new Date(lastNeg);
                              unlockDate.setMonth(unlockDate.getMonth() + 6);
                              const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
                              if (now < unlockDate) {
                                const uf = `${String(unlockDate.getDate()).padStart(2,'0')}.${String(unlockDate.getMonth()+1).padStart(2,'0')}.${unlockDate.getFullYear()}`;
                                setStaffActionMsg({ text: `Negocjacje zablokowane do ${uf}.`, ok: false });
                                return;
                              }
                            }
                            const attrVals = Object.values(selectedMember.attributes);
                            const avg = attrVals.length > 0 ? attrVals.reduce((a, b) => a + b, 0) / attrVals.length : 8;
                            const raise = 1.08 + (avg / 20) * 0.12 + (Math.random() - 0.5) * 0.06;
                            const propSalary = Math.round((selectedMember.salary * raise) / 10_000) * 10_000;
                            const propYears = avg >= 15 ? 3 : avg >= 10 ? 2 : Math.random() < 0.5 ? 2 : 1;
                            setStaffNegProposedSalary(propSalary);
                            setStaffNegProposedYears(propYears);
                            setStaffNegCounterSalary(propSalary);
                            setStaffNegCounterYears(propYears);
                            setStaffNegPhase('proposal');
                            setStaffNegotiationOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-black italic uppercase tracking-tighter text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                        >
                          Przedłuż kontrakt
                        </button>
                        {/* Zwolnij */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setIsStaffMenuOpen(false);
                            setStaffFireConfirmOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-black italic uppercase tracking-tighter text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors border-t border-white/6"
                        >
                          Zwolnij
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="staff-rise relative w-36 h-36 flex items-center justify-center mt-10" style={{ animationDelay: '80ms' }}>
                    <svg viewBox="0 0 144 144" className="absolute inset-0 staff-ring" aria-hidden>
                      <circle cx="72" cy="72" r="66" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="10 14" strokeLinecap="round" />
                    </svg>
                    <svg viewBox="0 0 144 144" className="absolute inset-0" aria-hidden>
                      <circle cx="72" cy="72" r="58" fill="none" stroke="#facc15" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
                    </svg>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-white/10 flex items-center justify-center text-5xl shadow-inner not-italic">
                      {selectedMember.role === StaffRole.CLUB_DOCTOR ? '⚕' : selectedMember.role === StaffRole.PHYSIOTHERAPIST ? '+' : '👨‍💼'}
                    </div>
                  </div>
                  <span className="staff-rise text-[11px] text-yellow-500 tracking-[0.35em] mt-5 text-center" style={{ animationDelay: '150ms' }}>{ROLE_LABELS[selectedMember.role]}</span>
                  <span className="staff-rise text-[25px] text-white mt-2 text-center leading-tight" style={{ animationDelay: '190ms' }}>{selectedMember.firstName}<br />{selectedMember.lastName}</span>
                  <span className="text-[12px] text-slate-400 mt-0.5">{REGION_LABELS[selectedMember.nationality] ?? selectedMember.nationality} · {selectedMember.age} lat</span>
                  {/* komunikat akcji */}
                  {staffActionMsg && (
                    <div className={`mt-3 px-4 py-2 rounded-lg text-[11px] font-black italic uppercase tracking-tighter ${staffActionMsg.ok ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                      {staffActionMsg.text}
                    </div>
                  )}
                  <div className="staff-rise staff-info-card mt-8 w-full p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-3 relative overflow-hidden hover:border-emerald-400/40 hover:bg-white/[0.08] transition-all duration-300" style={{ animationDelay: '330ms' }}>
                    <div className="staff-shine absolute inset-0 pointer-events-none" />
                    <div className="relative flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" />
                      </svg>
                      <div>
                        <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Kontrakt do</span>
                        <span className="text-sm text-white tabular-nums">{(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}</span>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <circle cx="12" cy="12" r="9" /><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.1 0-2-.4-2.5-1.2M12 6.5v11" />
                      </svg>
                      <div>
                        <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Pensja roczna</span>
                        <span className="text-sm text-emerald-400 tabular-nums">{selectedMember.salary.toLocaleString('pl-PL')} PLN / rok</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* atrybuty */}
                <div className="flex-1 relative z-10 p-9 overflow-y-auto custom-scrollbar bg-black/20 backdrop-blur-[2px]">
                  <div className="staff-rise" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-xs text-yellow-500 tracking-[0.4em] mb-6 flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                        <polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" />
                      </svg>
                      Atrybuty sztabu
                    </h3>
                    <div className="flex gap-8 items-center">
                      <div className="w-44 h-44 shrink-0">
                        <StaffAttributeRadar values={STAFF_ROLE_ATTRS[selectedMember.role].map(({ key, label }) => ({ label, value: selectedMember.attributes[key] ?? 0 }))} />
                      </div>
                      <div className="flex-1 grid grid-cols-1 gap-x-10">
                        {STAFF_ROLE_ATTRS[selectedMember.role].map(({ key, label }) => {
                          const val = selectedMember.attributes[key] ?? 0;
                          const color = staffAttrColor(val);
                          return (
                            <div key={key} className="mb-4 cursor-default group/staff-stat">
                              <div className="flex justify-between mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/staff-stat:text-white transition-colors">
                                <span>{label}</span>
                                <span style={{ color }} className="tabular-nums">{val}</span>
                              </div>
                              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="h-full rounded-full relative overflow-hidden"
                                  style={{
                                    width: `${(val / 20) * 100}%`,
                                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                                    boxShadow: `0 0 10px ${color}55`,
                                  }}
                                >
                                  <div className="staff-shine absolute inset-0" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                {/* zarobki + kontrakt */}
                <div className="px-8 pt-4 pb-4 mt-2 bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-amber-900/50 border-t border-yellow-600/30">
                  <div className="text-[11px] font-black italic uppercase tracking-tighter text-yellow-400/80 mb-2 text-center">Informacje o kontrakcie</div>
                  <div className="border-b border-white/20 mb-3" />
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Zarobki roczne</div>
                      <span className="text-[15px] font-black italic tracking-tighter text-white">{selectedMember.salary.toLocaleString('pl-PL')} PLN</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Kontrakt do</div>
                      <span className="text-[15px] font-black italic tracking-tighter text-white">
                        {(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* historia */}
                <div className="px-8 pt-4 pb-7 border-t border-amber-800/30 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mb-2 text-center">Historia kariery</div>
                  <div className="border-b border-white/20 mb-3" />
                  {selectedMember.history.length === 0 ? (
                    <span className="text-[12px] italic text-slate-600">Brak historii</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedMember.history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[14px] font-black italic uppercase tracking-tighter text-white">{h.clubName}</span>
                          <span className="text-[11px] italic text-slate-200">
                            {MONTHS_PL[(h.fromMonth ?? 1) - 1]} {h.fromYear} — {h.toYear ? `${MONTHS_PL[(h.toMonth ?? 1) - 1]} ${h.toYear}` : 'obecnie'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </div>
                {/* modal potwierdzenia zwolnienia */}
                {staffFireConfirmOpen && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 rounded-[32px]" onClick={e => e.stopPropagation()}>
                    <div className="px-8 py-8 flex flex-col items-center gap-4 max-w-[340px] text-center">
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-red-400">Potwierdzenie zwolnienia</span>
                      <span className="text-[18px] font-black italic uppercase tracking-tighter text-white">{selectedMember.firstName} {selectedMember.lastName}</span>
                      <div className="border-b border-white/15 w-full" />
                      <span className="text-[12px] italic text-slate-300">Kwota odprawy:</span>
                      <span className="text-[24px] font-black italic tracking-tighter text-yellow-400">{Math.round((selectedMember.salary / 12) * 3).toLocaleString('pl-PL')} PLN</span>
                      <span className="text-[11px] italic text-slate-500">(3 miesięczne pensje)</span>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => setStaffFireConfirmOpen(false)}
                          className="px-5 py-2 rounded-xl text-[12px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={() => {
                            const result = fireStaffMember(selectedMember.id);
                            setStaffFireConfirmOpen(false);
                            setStaffActionMsg({ text: result.message, ok: result.success });
                            if (result.success) setSelectedStaffId(null);
                          }}
                          className="px-5 py-2 rounded-xl text-[12px] font-black italic uppercase tracking-tighter text-white border border-red-700/60 bg-red-900/70 hover:bg-red-800/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Potwierdź zwolnienie
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* modal negocjacji kontraktu */}
                {staffNegotiationOpen && (() => {
                  const boardMaxSalary = (rep: number) => rep <= 3 ? 80_000 : rep <= 6 ? 150_000 : rep <= 9 ? 250_000 : rep <= 14 ? 500_000 : 1_200_000;
                  const clubRep = myClub?.reputation ?? 5;
                  const contractEndFormatted = (years: number) => {
                    const d = new Date(selectedMember.contractEndDate);
                    d.setFullYear(d.getFullYear() + years);
                    return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                  };
                  return (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 rounded-[32px]" onClick={e => e.stopPropagation()}>
                      <div className="px-8 py-7 flex flex-col items-center gap-3 w-full max-w-[360px] text-center">
                        <span className="text-[13px] font-black italic uppercase tracking-tighter text-yellow-400">Negocjacje kontraktu</span>
                        <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">{ROLE_LABELS[selectedMember.role]}</span>
                        <span className="text-[18px] font-black italic uppercase tracking-tighter text-white">{selectedMember.firstName} {selectedMember.lastName}</span>
                        <div className="border-b border-white/15 w-full" />
                        <div className="flex gap-6 w-full justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Obecne wynagrodzenie</span>
                            <span className="text-[13px] font-black italic tracking-tighter text-slate-300">{selectedMember.salary.toLocaleString('pl-PL')} PLN</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Kontrakt do</span>
                            <span className="text-[13px] font-black italic tracking-tighter text-slate-300">{(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}</span>
                          </div>
                        </div>
                        <div className="border-b border-white/10 w-full" />

                        {staffNegPhase === 'proposal' && (
                          <>
                            <div className="border-b border-white/15 w-full" />
                            <span className="text-[11px] italic text-slate-400 mt-1">Dziękuję za spotkanie. Moja propozycja na przedłużenie kontraktu to:</span>
                            <div className="flex gap-6 mt-1">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Wynagrodzenie</span>
                                <span className="text-[20px] font-black italic tracking-tighter text-yellow-400">{staffNegProposedSalary.toLocaleString('pl-PL')} PLN</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Czas kontraktu</span>
                                <span className="text-[20px] font-black italic tracking-tighter text-white">{staffNegProposedYears} {staffNegProposedYears === 1 ? 'rok' : 'lata'}</span>
                                <span className="text-[10px] italic text-slate-500">do {contractEndFormatted(staffNegProposedYears)}</span>
                              </div>
                            </div>
                            <div className="border-b border-white/15 w-full" />
                            <div className="flex gap-3 mt-1">
                              <button onClick={() => setStaffNegotiationOpen(false)} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Anuluj</button>
                              <button onClick={() => setStaffNegPhase('counter')} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Negocjuj</button>
                              <button
                                onClick={() => { negotiateStaffContract(selectedMember.id, staffNegProposedSalary, staffNegProposedYears); setStaffNegotiationOpen(false); setStaffActionMsg({ text: 'Kontrakt przedłużony.', ok: true }); }}
                                className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-yellow-700/60 bg-yellow-800/60 hover:bg-yellow-700/70 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                              >
                                Akceptuj
                              </button>
                            </div>
                          </>
                        )}

                        {staffNegPhase === 'counter' && (
                          <>
                            <span className="text-[11px] italic text-slate-400 mt-1">Twoja propozycja:</span>
                            <div className="flex flex-col gap-3 w-full mt-1">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Wynagrodzenie (PLN/rok)</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setStaffNegCounterSalary(v => Math.max(0, v - 10_000))} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">−</button>
                                  <input
                                    type="text"
                                    value={staffNegSalaryStr || staffNegCounterSalary.toLocaleString('pl-PL') + ' PLN'}
                                    onFocus={() => setStaffNegSalaryStr(String(staffNegCounterSalary))}
                                    onChange={e => setStaffNegSalaryStr(e.target.value.replace(/[^0-9]/g, ''))}
                                    onBlur={() => { const v = parseInt(staffNegSalaryStr, 10); if (!isNaN(v)) setStaffNegCounterSalary(v); setStaffNegSalaryStr(''); }}
                                    className="text-[16px] font-black italic tracking-tighter text-yellow-400 min-w-[150px] text-center bg-transparent border-b border-yellow-700/60 outline-none"
                                  />
                                  <button onClick={() => setStaffNegCounterSalary(v => v + 10_000)} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">+</button>
                                </div>
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Czas kontraktu</span>
                                <div className="flex gap-2">
                                  {[1, 2, 3].map(y => (
                                    <button key={y} onClick={() => setStaffNegCounterYears(y)} className={`px-4 py-2 rounded-lg text-[12px] font-black italic uppercase tracking-tighter border transition-colors ${staffNegCounterYears === y ? 'border-yellow-500/60 bg-yellow-800/50 text-yellow-300' : 'border-white/15 bg-slate-800/60 text-slate-400 hover:text-white'}`}>
                                      {y} {y === 1 ? 'rok' : 'lata'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 mt-3">
                              <button onClick={() => setStaffNegPhase('proposal')} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Wróć</button>
                              <button
                                onClick={() => {
                                  const counterSal = Math.round(staffNegCounterSalary / 10_000) * 10_000;
                                  const maxSal = boardMaxSalary(clubRep);
                                  if (counterSal > maxSal) {
                                    setStaffNegResultMsg(`Zarząd zablokował ofertę — maksymalne wynagrodzenie dla tego klubu to ${maxSal.toLocaleString('pl-PL')} PLN.`);
                                    setStaffNegResultOk(false);
                                    setStaffNegPhase('result');
                                    return;
                                  }
                                  const staffAccepts = counterSal >= staffNegProposedSalary * 0.80 && staffNegCounterYears >= staffNegProposedYears - 1;
                                  if (!staffAccepts) {
                                    setStaffNegResultMsg('Pracownik odrzucił ofertę — proponowana kwota lub czas kontraktu są zbyt niskie.');
                                    setStaffNegResultOk(false);
                                    setStaffNegPhase('result');
                                    return;
                                  }
                                  negotiateStaffContract(selectedMember.id, counterSal, staffNegCounterYears);
                                  setStaffNegResultMsg(`Kontrakt przedłużony. Nowe wynagrodzenie: ${counterSal.toLocaleString('pl-PL')} PLN, czas: ${staffNegCounterYears} ${staffNegCounterYears === 1 ? 'rok' : 'lata'}.`);
                                  setStaffNegResultOk(true);
                                  setStaffNegPhase('result');
                                }}
                                className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-yellow-700/60 bg-yellow-800/60 hover:bg-yellow-700/70 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                              >
                                Złóż ofertę
                              </button>
                            </div>
                          </>
                        )}

                        {staffNegPhase === 'result' && (
                          <>
                            <div className={`mt-2 px-5 py-3 rounded-xl text-[12px] font-black italic uppercase tracking-tighter ${staffNegResultOk ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                              {staffNegResultMsg}
                            </div>
                            <button onClick={() => setStaffNegotiationOpen(false)} className="mt-3 px-6 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Zamknij</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* LISTA SZTABU */}
            {!selectedMember && !isManagerProfileOpen && (
              <div
                className="relative max-h-[88vh] w-[900px] overflow-y-auto rounded-[38px] border border-cyan-100/15 shadow-[0_50px_120px_rgba(0,0,0,0.9)] custom-scrollbar"
                onClick={e => e.stopPropagation()}
              >
                <CoachingStaffScene primaryColor={managerAccentPrimary} secondaryColor={managerAccentSecondary} />

                <div className="relative z-10">
                  <header className="relative flex min-h-[122px] items-center gap-5 border-b border-cyan-100/10 px-8 pr-24">
                    {getClubLogo(myClub.id) && (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-[#06111f]/75 p-2 shadow-[0_10px_26px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                        <img src={getClubLogo(myClub.id)!} alt={myClub.name} className="h-full w-full object-contain drop-shadow-lg" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentSecondary }}>Centrum treningowe</div>
                      <div className="mt-1 truncate text-[25px] font-semibold leading-tight tracking-[-0.02em] text-white">{myClub.name}</div>
                      <div className="mt-1 text-[17px] font-medium tracking-normal text-cyan-100/65">Sztab szkoleniowy</div>
                    </div>
                    <div className="ml-auto hidden items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_9px_rgba(110,231,183,0.8)]" />
                      <span className="text-[9px] font-black italic uppercase tracking-tighter text-emerald-100/70">Sztab aktywny</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStaffOpen(false)}
                      aria-label="Zamknij sztab szkoleniowy"
                      className="absolute right-7 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#06111f]/82 text-base text-slate-300 shadow-[0_8px_20px_rgba(0,0,0,0.32)] transition-colors hover:border-cyan-200/35 hover:bg-cyan-300/10 hover:text-white"
                    >
                      ✕
                    </button>
                  </header>

                  <main className="space-y-4 px-7 pb-7 pt-6">
                    <button
                      type="button"
                      className={`group relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#081522]/86 px-6 py-5 text-left shadow-[0_15px_34px_rgba(0,0,0,0.28)] transition-all ${coachName ? 'cursor-pointer hover:-translate-y-0.5 hover:border-white/20' : 'cursor-default'}`}
                      style={{ boxShadow: `inset 4px 0 0 ${managerAccentPrimary}, 0 15px 34px rgba(0,0,0,0.28)` }}
                      onClick={() => {
                        if (!coachName) return;
                        if (isUserClub && safeManagerProfile) setIsManagerProfileOpen(true);
                        else if (myClub.coachId) {
                          setIsStaffOpen(false);
                          setSelectedStaffId(null);
                          viewCoachDetails(myClub.coachId);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black italic uppercase tracking-tighter" style={{ color: managerAccentSecondary }}>Trener główny</span>
                          <span className={`mt-1.5 block text-[24px] font-semibold leading-tight tracking-[-0.02em] ${coachName ? 'text-white' : 'text-slate-500'}`}>
                            {coachName ?? 'Wakat'}
                          </span>
                        </div>
                        <svg viewBox="0 0 82 56" className="h-14 w-20 opacity-55" aria-hidden="true">
                          <rect x="2" y="2" width="78" height="52" rx="7" fill="none" stroke={managerAccentPrimary} strokeWidth="2" />
                          <line x1="41" y1="3" x2="41" y2="53" stroke={managerAccentPrimary} strokeWidth="1.5" />
                          <circle cx="41" cy="28" r="9" fill="none" stroke={managerAccentSecondary} strokeWidth="1.5" />
                          <path d="M2 17h14v22H2M80 17H66v22h14" fill="none" stroke={managerAccentSecondary} strokeWidth="1.5" />
                        </svg>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      {assistants.length > 0 && (
                        <StaffGroup label="Asystent trenera" accent="#c4b5fd">
                          {assistants.map(m => <StaffCard key={m.id} m={m} accent="#c4b5fd" />)}
                        </StaffGroup>
                      )}
                      {gkCoaches.length > 0 && (
                        <StaffGroup label="Trener bramkarzy" accent="#7dd3fc">
                          {gkCoaches.map(m => <StaffCard key={m.id} m={m} accent="#7dd3fc" />)}
                        </StaffGroup>
                      )}
                      {fitness.length > 0 && (
                        <StaffGroup label="Przygotowanie motoryczne" accent="#fbbf24">
                          {fitness.map(m => <StaffCard key={m.id} m={m} accent="#fbbf24" />)}
                        </StaffGroup>
                      )}
                      {analysts.length > 0 && (
                        <StaffGroup label="Analityk video" accent="#60a5fa">
                          {analysts.map(m => <StaffCard key={m.id} m={m} accent="#60a5fa" />)}
                        </StaffGroup>
                      )}
                      {physios.length > 0 && (
                        <StaffGroup label="Fizjoterapeuci" accent="#6ee7b7">
                          {physios.map(m => <StaffCard key={m.id} m={m} accent="#6ee7b7" />)}
                        </StaffGroup>
                      )}
                      {doctors.length > 0 && (
                        <StaffGroup label="Lekarz klubowy" accent="#fda4af">
                          {doctors.map(m => <StaffCard key={m.id} m={m} accent="#fda4af" />)}
                        </StaffGroup>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            )}
          </div>
          </PortalScaleWrapper>,
          document.body
        );
      })()}

      {/*
        MODAL SZCZEGÓŁÓW WYPOŻYCZENIA
        Ten panel jest celowo umieszczony w SquadView, bo zakładka WYPOŻYCZENIA jest miejscem,
        w którym gracz zarządza wypożyczonymi zawodnikami. Wiersz tabeli daje szybki skrót,
        ale modal pokazuje pełny kontekst jednej umowy: terminy, finanse, status oraz archiwum
        miesięcznych raportów zapisanych w player.loan.monthlyReports.

        Ważne założenie danych:
        - raporty miesięczne są zapisywane w GameContext przy generowaniu maila sztabu,
        - mail może zostać usunięty, ale historia w loan.monthlyReports zostaje,
        - najnowszy raport jest zawsze pierwszy, więc poniżej nie sortujemy agresywnie danych,
          tylko ufamy kolejności zapisu i pokazujemy ostatnie miesiące w naturalnej kolejności.
      */}
      {loanDetailsPlayer?.loan && createPortal(
        <PortalScaleWrapper>
        {(() => {
          const player = loanDetailsPlayer;
          const loan = player.loan!;
          const destinationClub = clubs.find(club => club.id === loan.destinationClubId);
          const destinationLogo = destinationClub ? getClubLogo(destinationClub.id) : null;
          const daysLeft = getLoanDaysLeft(loan.endDate);
          const reports = loan.monthlyReports ?? [];
          const totalReportMinutes = reports.reduce((sum, report) => sum + report.minutes, 0);
          const totalReportMatches = reports.reduce((sum, report) => sum + report.matches, 0);
          const lastReport = reports[0] ?? null;
          const ratedReports = reports.filter(report => report.averageRating !== null);
          const detailAverageRating = ratedReports.length > 0
            ? ratedReports.reduce((sum, report) => sum + (report.averageRating ?? 0), 0) / ratedReports.length
            : null;

          return (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-6">
              <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-10" />
              <div className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-[40px] border border-cyan-300/20 bg-slate-950/72 shadow-[0_45px_140px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                <div className="border-b border-white/10 bg-white/[0.04] px-8 py-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    {destinationLogo ? (
                      <img src={destinationLogo} alt={loan.destinationClubName} className="h-16 w-16 object-contain shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-cyan-300 whitespace-nowrap">Szczegóły wypożyczenia</p>
                      <h2 className="text-[32px] font-black italic uppercase tracking-tighter text-white truncate">
                        {player.firstName} {player.lastName}
                      </h2>
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-slate-400 truncate">
                        {loan.destinationClubName} / {player.position} / OVR {player.overallRating}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLoanDetailsPlayerId(null)}
                    className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 text-[16px] font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-white/20"
                  >
                    X
                  </button>
                </div>

                <div className="custom-scrollbar max-h-[calc(88vh-110px)] overflow-y-auto p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Od', value: formatLoanDate(loan.startDate), color: 'text-slate-100' },
                      { label: 'Do', value: formatLoanDate(loan.endDate), color: 'text-slate-100' },
                      { label: 'Dni', value: `${daysLeft ?? '-'}`, color: daysLeft !== null && daysLeft <= 30 ? 'text-amber-300' : 'text-cyan-300' },
                      { label: 'Status', value: loan.forcedByClub ? 'Wymuszone' : 'Aktywne', color: loan.forcedByClub ? 'text-orange-300' : 'text-emerald-300' },
                    ].map(item => (
                      <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">{item.label}</p>
                        <p className={`mt-1 text-[22px] font-black italic uppercase tracking-tighter ${item.color} whitespace-nowrap`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-5">
                      <p className="mb-4 text-[12px] font-black italic uppercase tracking-tighter text-emerald-300 whitespace-nowrap">Warunki finansowe</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Pokrycie pensji</span>
                          <span className="text-[16px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{loan.wageCoveragePercent ?? 0}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Opłata</span>
                          <span className="text-[16px] font-black italic uppercase tracking-tighter text-emerald-200 whitespace-nowrap">{(loan.loanFee ?? 0).toLocaleString('pl-PL')} PLN</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Obiecana rola</span>
                          <span className="text-[13px] font-black italic uppercase tracking-tighter text-cyan-200 whitespace-nowrap">
                            {loan.promisedPlayingTime === 'FIRST_TEAM' ? 'Pierwszy skład' : loan.promisedPlayingTime === 'ROTATION' ? 'Zmiennik / rotacja' : 'Brak zapisu'}
                          </span>
                        </div>
                        {(loan.promiseConsecutiveBreaches ?? 0) > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Kontrola minut</span>
                            <span className="text-[13px] font-black italic uppercase tracking-tighter text-orange-300 whitespace-nowrap">Ostrzeżenie klubu</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5">
                      <p className="mb-4 text-[12px] font-black italic uppercase tracking-tighter text-cyan-300 whitespace-nowrap">Podsumowanie raportów</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Raporty</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{reports.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Mecze</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{totalReportMatches}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Minuty</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-cyan-200 whitespace-nowrap">{totalReportMinutes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {lastReport && (
                    <div className="rounded-[28px] border border-amber-300/20 bg-amber-500/10 p-5">
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-amber-300 whitespace-nowrap">Ostatni sygnał sztabu</p>
                      <p className="mt-2 text-[16px] font-black italic uppercase tracking-tighter text-amber-100">
                        {lastReport.monthLabel}: {lastReport.status}, {lastReport.minutes} min, rozwój: {lastReport.developmentNote}
                      </p>
                    </div>
                  )}

                  <div className="rounded-[30px] border border-white/10 bg-black/25 overflow-hidden">
                    <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between gap-4">
                      <p className="text-[13px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">Historia miesięcznych raportów</p>
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">
                        Śr. ocena: {detailAverageRating === null ? '-' : detailAverageRating.toFixed(2)}
                      </p>
                    </div>

                    {reports.length === 0 ? (
                      <div className="min-h-[170px] flex items-center justify-center px-6">
                        <p className="text-[14px] font-black italic uppercase tracking-tighter text-slate-500 text-center">
                          BRAK MIESIĘCZNYCH RAPORTÓW DLA TEGO WYPOŻYCZENIA.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {reports.map(report => (
                          <div key={report.id} className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1.4fr] gap-4 px-5 py-4 items-center bg-white/[0.018]">
                            <div className="min-w-0">
                              <p className="text-[13px] font-black italic uppercase tracking-tighter text-white truncate">{report.monthLabel}</p>
                              <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">{formatLoanDate(report.date)}</p>
                            </div>
                            <p className="text-[13px] font-black italic uppercase tracking-tighter text-slate-200 whitespace-nowrap">{report.matches} M</p>
                            <p className={`text-[13px] font-black italic uppercase tracking-tighter whitespace-nowrap ${report.minutes < 90 ? 'text-orange-300' : 'text-cyan-300'}`}>{report.minutes} MIN</p>
                            <p className="text-[13px] font-black italic uppercase tracking-tighter text-slate-200 whitespace-nowrap">{report.averageRating === null ? '-' : report.averageRating.toFixed(2)}</p>
                            <div className="min-w-0">
                              <p className={`text-[12px] font-black italic uppercase tracking-tighter truncate ${report.developmentChanged ? 'text-emerald-300' : 'text-slate-300'}`}>
                                {report.developmentChanged ? `${report.previousOverall}→${report.nextOverall}` : 'OVR bez zmian'}
                              </p>
                              <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 truncate">{report.status} / {report.developmentNote}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => viewPlayerDetails(player.id)}
                      className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-cyan-100 transition-colors hover:bg-cyan-500/20"
                    >
                      Karta zawodnika
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Skrócić wypożyczenie zawodnika ${player.firstName} ${player.lastName}? Zawodnik wróci natychmiast do kadry.`)) {
                          terminateLoanEarly(player.id);
                          setLoanDetailsPlayerId(null);
                        }
                      }}
                      className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-amber-100 transition-colors hover:bg-amber-500/20"
                    >
                      Skróć wypożyczenie
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        </PortalScaleWrapper>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }

        @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-ticker { animation: ticker 20s linear infinite; }

        @keyframes squad-player-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .pitch-player-token:hover .pitch-player-node {
          animation: squad-player-pulse 0.75s ease-in-out infinite;
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.35));
        }

        .clip-path-arc-top { clip-path: inset(50% 0 0 0); }
      `}</style>
    </div>
  );
};
