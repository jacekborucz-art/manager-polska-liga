import React, { useState } from 'react';
import { useModalClose } from '../ui/useModalClose';
import { MailMessage, MailType, Newspaper, ViewState } from '../../types';
import { useGame } from '../../context/GameContext';
import awansEkstraklasaImg from '../../Graphic/cup/awans-do-ekst.png';
import { LeagueFinanceReportModal } from './LeagueFinanceReportModal';
import { MediaInterviewModal, MediaInterviewResult } from './MediaInterviewModal';
import { MediaInterviewService } from '../../services/MediaInterviewService';
import { KitPreview } from '../common/KitPreview';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { MatchReportModalPolishLeague } from './MatchReportModalPolishLeague';

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

const ISO3_TO_ISO2: Record<string, string> = {
  POL: 'pl', ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', NIR: 'gb-nir',
  ESP: 'es', GER: 'de', DEU: 'de', FRA: 'fr', ITA: 'it', POR: 'pt',
  NED: 'nl', BEL: 'be', CRO: 'hr', SUI: 'ch', AUT: 'at', CZE: 'cz',
  SVK: 'sk', HUN: 'hu', ROU: 'ro', BUL: 'bg', GRE: 'gr', TUR: 'tr',
  SWE: 'se', NOR: 'no', DEN: 'dk', FIN: 'fi', IRL: 'ie', UKR: 'ua',
  RUS: 'ru', SRB: 'rs', BIH: 'ba', SVN: 'si', ARG: 'ar', BRA: 'br',
  URU: 'uy', COL: 'co', CHI: 'cl', PER: 'pe', ECU: 'ec', PAR: 'py',
  BOL: 'bo', MEX: 'mx', USA: 'us', CAN: 'ca', MAR: 'ma', ALG: 'dz',
  EGY: 'eg', NGA: 'ng', SEN: 'sn', CIV: 'ci', KSA: 'sa', UZB: 'uz',
  QAT: 'qa', IRN: 'ir', JPN: 'jp', KOR: 'kr', AUS: 'au',
  AZE: 'az', MDA: 'md', CYP: 'cy', LTU: 'lt', EST: 'ee', FRO: 'fo',
  GIB: 'gi', LUX: 'lu', ISL: 'is', MKD: 'mk', LAT: 'lv', ALB: 'al',
  KAZ: 'kz', GEO: 'ge', ISR: 'il', BLR: 'by', MNE: 'me', ARM: 'am',
  LIE: 'li', KOS: 'xk', MLT: 'mt', AND: 'ad', SMR: 'sm',
};

const TEAM_NAME_TO_FLAG: Record<string, string> = {
  Anglia: 'gb-eng',
  Szkocja: 'gb-sct',
  Walia: 'gb-wls',
  Polska: 'pl',
  Hiszpania: 'es',
  Niemcy: 'de',
  Francja: 'fr',
  Holandia: 'nl',
  Portugalia: 'pt',
  Belgia: 'be',
  Chorwacja: 'hr',
  Rumunia: 'ro',
  Szwajcaria: 'ch',
  Urugwaj: 'uy',
  Japonia: 'jp',
  'Korea PŁD': 'kr',
  Kolumbia: 'co',
  'Wybrzeże Kości Słoniowej': 'ci',
  Meksyk: 'mx',
  Senegal: 'sn',
  Australia: 'au',
  'Stany Zjednoczone': 'us',
  Chile: 'cl',
  Peru: 'pe',
  Maroko: 'ma',
  Rosja: 'ru',
  Algieria: 'dz',
  Nigeria: 'ng',
  'Arabia Saudyjska': 'sa',
  Uzbekistan: 'uz',
  Egipt: 'eg',
  Kanada: 'ca',
  Ekwador: 'ec',
  Katar: 'qa',
  Grecja: 'gr',
  Kostaryka: 'cr',
  Panama: 'pa',
  Iran: 'ir',
  'Irlandia Północna': 'gb-nir',
  Albania: 'al',
  Andora: 'ad',
  Armenia: 'am',
  Austria: 'at',
  Azerbejdżan: 'az',
  Białoruś: 'by',
  'Bośnia i Hercegowina': 'ba',
  Bułgaria: 'bg',
  Cypr: 'cy',
  Czarnogóra: 'me',
  Czechy: 'cz',
  Dania: 'dk',
  Estonia: 'ee',
  Finlandia: 'fi',
  Gibraltar: 'gi',
  Gruzja: 'ge',
  Irlandia: 'ie',
  Islandia: 'is',
  Izrael: 'il',
  Kazachstan: 'kz',
  Kosovo: 'xk',
  Liechtenstein: 'li',
  Litwa: 'lt',
  Luksemburg: 'lu',
  Łotwa: 'lv',
  'Macedonia Północna': 'mk',
  Malta: 'mt',
  Mołdawia: 'md',
  Norwegia: 'no',
  Serbia: 'rs',
  Słowacja: 'sk',
  Słowenia: 'si',
  Szwecja: 'se',
  Turcja: 'tr',
  Ukraina: 'ua',
  Węgry: 'hu',
  Włochy: 'it',
  'Wyspy Owcze': 'fo',
  Angola: 'ao',
  Benin: 'bj',
  Botswana: 'bw',
  'Burkina Faso': 'bf',
  Burundi: 'bi',
  Czad: 'td',
  DRK: 'cd',
  Etiopia: 'et',
  Gabon: 'ga',
  Gambia: 'gm',
  Ghana: 'gh',
  Gwinea: 'gn',
  Kamerun: 'cm',
  Kenia: 'ke',
  Komory: 'km',
  Kongo: 'cg',
  Liberia: 'lr',
  Libia: 'ly',
  Madagaskar: 'mg',
  Mali: 'ml',
  Mozambik: 'mz',
  Namibia: 'na',
  Niger: 'ne',
  RPA: 'za',
  Sudan: 'sd',
  Tanzania: 'tz',
  Togo: 'tg',
  Tunezja: 'tn',
  Uganda: 'ug',
  Zambia: 'zm',
  Zimbabwe: 'zw',
  Argentyna: 'ar',
  Boliwia: 'bo',
  Brazylia: 'br',
  Paragwaj: 'py',
  Wenezuela: 've',
  Afganistan: 'af',
  Bahrajn: 'bh',
  Bangladesz: 'bd',
  Bhutan: 'bt',
  Brunei: 'bn',
  Chiny: 'cn',
  'Chinese Taipei': 'tw',
  Filipiny: 'ph',
  Guam: 'gu',
  Hongkong: 'hk',
  Indie: 'in',
  Indonezja: 'id',
  Irak: 'iq',
  Jemen: 'ye',
  Jordania: 'jo',
  Kambodża: 'kh',
  Kirgistan: 'kg',
  'Korea PŁN': 'kp',
  Kuwejt: 'kw',
  Laos: 'la',
  Liban: 'lb',
  Macau: 'mo',
  Malediwy: 'mv',
  Malezja: 'my',
  Mjanma: 'mm',
  Mongolia: 'mn',
  Nepal: 'np',
  Oman: 'om',
  Pakistan: 'pk',
  Palestyna: 'ps',
  Singapur: 'sg',
  'Sri Lanka': 'lk',
  Syria: 'sy',
  Tadżykistan: 'tj',
  Tajlandia: 'th',
  'Timor Wschodni': 'tl',
  Turkmenistan: 'tm',
  Wietnam: 'vn',
  ZEA: 'ae',
  Fidżi: 'fj',
  'Nowa Zelandia': 'nz',
  Papua: 'pg',
  Samoa: 'ws',
  Tahiti: 'pf',
  Tonga: 'to',
  Belize: 'bz',
  Dominikana: 'do',
  Gwatemala: 'gt',
  Haiti: 'ht',
  Honduras: 'hn',
  Jamajka: 'jm',
  Kuba: 'cu',
  Nikaragua: 'ni',
  Salwador: 'sv',
  Trynidad: 'tt',
};

type FriendlyMailMatch = {
  matchId?: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeCountry?: string;
  awayCountry?: string;
};

const getFlagCode = (teamName: string, country?: string): string | null => {
  const normalizedCountry = country?.trim().toUpperCase();
  if (normalizedCountry && ISO3_TO_ISO2[normalizedCountry]) return ISO3_TO_ISO2[normalizedCountry];
  if (normalizedCountry?.length === 2) return normalizedCountry.toLowerCase();
  return TEAM_NAME_TO_FLAG[teamName] ?? null;
};

const FlagBadge: React.FC<{ teamName: string; country?: string; align: 'left' | 'right' }> = ({ teamName, country, align }) => {
  const code = getFlagCode(teamName, country);
  const fallback = teamName.slice(0, 2).toUpperCase();

  if (!code) {
    return (
      <div className="flex h-9 w-12 items-center justify-center rounded-md border border-yellow-300/20 bg-yellow-300/10 text-[10px] font-black italic uppercase tracking-tighter text-yellow-100">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={teamName}
      className={`h-9 w-12 rounded-md border border-white/10 bg-white/5 object-cover shadow-lg ${align === 'right' ? 'order-first' : ''}`}
    />
  );
};

const getFriendlyMatchesFromMail = (mail: MailMessage): FriendlyMailMatch[] => {
  if (
    (mail.metadata?.type === 'AI_FRIENDLY_REPORT_LINK' ||
      mail.metadata?.type === 'NATIONAL_TEAM_FRIENDLY_RESULTS') &&
    mail.metadata.matches?.length
  ) {
    return mail.metadata.matches;
  }

  const matchRegex = /^(.+)\s(\d+)[–-](\d+)\s(.+)$/;
  return mail.body
    .split('\n')
    .map(line => line.trim().match(matchRegex))
    .filter((match): match is RegExpMatchArray => !!match)
    .map(match => ({
      homeName: match[1].trim(),
      awayName: match[4].trim(),
      homeScore: Number(match[2]),
      awayScore: Number(match[3]),
    }));
};

const FriendlyResultsMail: React.FC<{ mail: MailMessage }> = ({ mail }) => {
  const { clubs, nationalTeams } = useGame();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const matches = getFriendlyMatchesFromMail(mail);
  const intro = mail.body.split('\n').find(line => line.trim() && !line.match(/^(.+)\s(\d+)[–-](\d+)\s(.+)$/));

  const resolveCountry = (teamName: string, country?: string): string | undefined => {
    if (country) return country;
    const club = clubs.find(c => c.name === teamName);
    if (!club) return undefined;
    if (club.country) return club.country;
    if (club.leagueId?.startsWith('L_PL')) return 'POL';
    return undefined;
  };

  const resolveMatchId = (match: FriendlyMailMatch): string | null => {
    if (match.matchId) return match.matchId;
    if (mail.metadata?.type !== 'NATIONAL_TEAM_FRIENDLY_RESULTS') return null;

    const date = new Date(mail.date);
    if (Number.isNaN(date.getTime())) return null;

    const homeTeam = nationalTeams.find(team => team.name === match.homeName);
    const awayTeam = nationalTeams.find(team => team.name === match.awayName);
    if (!homeTeam || !awayTeam) return null;

    return [
      'NT',
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
      homeTeam.id,
      awayTeam.id,
    ].join('_');
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {intro && (
        <p className="mb-6 text-[13px] font-black italic uppercase tracking-tighter text-sky-100/75">
          {intro}
        </p>
      )}

      <div className="w-full">
        {matches.map((match, index) => {
          const homeWon = match.homeScore > match.awayScore;
          const awayWon = match.awayScore > match.homeScore;
          const matchId = resolveMatchId(match);

          return (
            <div key={`${match.homeName}_${match.awayName}_${index}`}>
              {index > 0 && <div className="mx-8 border-t border-yellow-300/30" />}
              <button
                type="button"
                disabled={!matchId}
                onClick={() => matchId && setSelectedMatchId(matchId)}
                className={`grid w-full grid-cols-[1fr_92px_1fr] items-center gap-4 px-6 py-4 text-left outline-none transition-all ${
                  matchId
                    ? 'cursor-pointer hover:bg-white/[0.035] focus-visible:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-emerald-400/70'
                    : 'cursor-default'
                }`}
                title={matchId ? 'Otwórz raport meczowy' : undefined}
              >
                <div className="flex min-w-0 items-center justify-end gap-3 text-right">
                  <span className={`truncate text-[14px] font-black italic uppercase tracking-tighter ${homeWon ? 'text-white' : 'text-slate-300'}`}>
                    {match.homeName}
                  </span>
                  <FlagBadge teamName={match.homeName} country={resolveCountry(match.homeName, match.homeCountry)} align="left" />
                </div>

                <div className="flex items-center justify-center rounded-xl border border-yellow-300/35 bg-yellow-300/10 px-3 py-2 text-[18px] font-black italic uppercase tracking-tighter text-yellow-100 shadow-[inset_0_0_18px_rgba(250,204,21,0.08)]">
                  {match.homeScore} : {match.awayScore}
                </div>

                <div className="flex min-w-0 items-center justify-start gap-3 text-left">
                  <FlagBadge teamName={match.awayName} country={resolveCountry(match.awayName, match.awayCountry)} align="right" />
                  <span className={`truncate text-[14px] font-black italic uppercase tracking-tighter ${awayWon ? 'text-white' : 'text-slate-300'}`}>
                    {match.awayName}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <MatchReportModalPolishLeague
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
        teamType="national"
      />
    </div>
  );
};

type WCQPlayoffPolandMailData = {
  stage: 'SF' | 'FINAL';
  pathLabel?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scoreLabel: string;
  polandWon: boolean;
  lead: string;
  finalOpponent?: string | null;
  wentToExtraTime?: boolean;
  penaltyWinner?: string;
};

const getWCQPlayoffPolandMailData = (mail: MailMessage): WCQPlayoffPolandMailData | null => {
  if (mail.metadata?.type === 'WCQ_PLAYOFF_POLAND') {
    return {
      stage: mail.metadata.stage,
      pathLabel: mail.metadata.pathLabel,
      homeTeam: mail.metadata.homeTeam,
      awayTeam: mail.metadata.awayTeam,
      homeScore: mail.metadata.homeScore,
      awayScore: mail.metadata.awayScore,
      scoreLabel: mail.metadata.scoreLabel,
      polandWon: mail.metadata.polandWon,
      lead: mail.metadata.lead,
      finalOpponent: mail.metadata.finalOpponent,
      wentToExtraTime: mail.metadata.wentToExtraTime,
      penaltyWinner: mail.metadata.penaltyWinner,
    };
  }

  const isLegacyPlayoffMail = mail.sender === 'Sport Express' && mail.subject.toLowerCase().includes('bara');
  if (!isLegacyPlayoffMail) return null;

  const lines = mail.body.split('\n').map(line => line.trim()).filter(Boolean);
  const lead = lines.find(line => line.includes('Reprezentacja Polski')) ?? '';
  const matchLine = lines.find(line => /^Polska\s+[—-]\s+/.test(line));
  const scoreLineIndex = matchLine ? lines.indexOf(matchLine) + 1 : -1;
  const scoreLine = scoreLineIndex > 0 ? lines[scoreLineIndex] : '';
  const opponent = matchLine?.replace(/^Polska\s+[—-]\s+/, '').trim() || 'Rywal';
  const scoreMatch = scoreLine.match(/(\d+)\s*:\s*(\d+)/);
  const homeScore = scoreMatch ? Number(scoreMatch[1]) : 0;
  const awayScore = scoreMatch ? Number(scoreMatch[2]) : 0;
  const polandWon = homeScore > awayScore || mail.subject.toLowerCase().includes('finale bara') && !mail.subject.toLowerCase().includes('odpada') && !mail.subject.toLowerCase().includes('przegrywa');
  const finalLine = lines.find(line => line.includes('Polska zagra z reprezentacją'));
  const finalOpponent = finalLine?.match(/reprezentacją\s+(.+?)\./)?.[1] ?? null;

  return {
    stage: mail.subject.toLowerCase().includes('półfinal') ? 'SF' : 'FINAL',
    homeTeam: 'Polska',
    awayTeam: opponent,
    homeScore,
    awayScore,
    scoreLabel: scoreLine || `${homeScore}:${awayScore}`,
    polandWon,
    lead,
    finalOpponent,
    wentToExtraTime: scoreLine.includes('dogr.'),
    penaltyWinner: scoreLine.includes('k.') ? (polandWon ? 'Polska' : opponent) : undefined,
  };
};

const WCQPlayoffPolandMail: React.FC<{ mail: MailMessage }> = ({ mail }) => {
  const data = getWCQPlayoffPolandMailData(mail);
  if (!data) return null;

  const statusText = data.polandWon
    ? data.stage === 'FINAL' ? 'Awans na mundial' : 'Awans do finału baraży'
    : data.stage === 'FINAL' ? 'Koniec walki o mundial' : 'Koniec baraży';
  const stageLabel = data.stage === 'SF' ? 'Półfinał baraży' : 'Finał baraży';
  const extraLabel = data.penaltyWinner
    ? `Karne: wygrała ${data.penaltyWinner}`
    : data.wentToExtraTime
      ? 'Po dogrywce'
      : 'Po 90 minutach';

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 py-2">
        <span className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-200">Sport Express</span>
        <span className="h-1 w-1 rounded-full bg-yellow-300/80" />
        <span className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-100">{stageLabel}</span>
      </div>

      <div className={`mb-6 w-full rounded-2xl border px-6 py-5 ${data.polandWon ? 'border-emerald-300/25 bg-emerald-500/10' : 'border-rose-300/25 bg-rose-500/10'}`}>
        <p className={`mb-2 text-[12px] font-black italic uppercase tracking-tighter ${data.polandWon ? 'text-emerald-200' : 'text-rose-200'}`}>
          {statusText}
        </p>
        {data.polandWon && data.stage === 'SF' ? (
          <div className="mx-auto max-w-2xl space-y-4 text-left text-[14px] font-medium leading-7 text-sky-50">
            <p>{data.lead}</p>
            <p>Spotkanie dostarczyło kibicom wielu emocji, a polscy zawodnicy pokazali determinację, zaangażowanie oraz wolę walki. Osiągnięty wynik pozwolił reprezentacji awansować do decydującego meczu barażowego, który rozstrzygnie o awansie na Mistrzostwa Świata.</p>
            {data.finalOpponent && (
              <p>Choć mundial jest już coraz bliżej, najtrudniejsze wyzwanie wciąż pozostaje przed Biało-Czerwonymi. W finałowym meczu barażowym Polska zmierzy się z reprezentacją {data.finalOpponent}. Zwycięzca tego spotkania zapewni sobie miejsce w gronie uczestników nadchodzących Mistrzostw Świata.</p>
            )}
            <p>Przed drużyną czas na regenerację, przygotowania oraz analizę kolejnego rywala. Cały sztab szkoleniowy i zawodnicy są świadomi stawki nadchodzącego pojedynku i zrobią wszystko, aby spełnić marzenia milionów polskich kibiców.</p>
            <p>Dziękujemy wszystkim fanom za nieustające wsparcie i wiarę w reprezentację. Przed nami ostatni krok na drodze do mundialu.</p>
          </div>
        ) : !data.polandWon ? (
          <div className="mx-auto max-w-2xl space-y-4 text-left text-[14px] font-medium leading-7 text-sky-50">
            <p>{data.lead}</p>
            <p>Pomimo ogromnego zaangażowania zawodników, sztabu szkoleniowego oraz wsparcia kibiców, reprezentacji nie udało się osiągnąć celu, jakim był awans na najważniejszy turniej piłkarski świata. Drużyna walczyła do końcowego gwizdka, jednak tego dnia przeciwnik okazał się skuteczniejszy.</p>
            <p>Brak awansu jest dużym rozczarowaniem dla całego środowiska piłkarskiego w Polsce. Jednocześnie pragniemy podziękować wszystkim kibicom za nieustające wsparcie, które towarzyszyło reprezentacji podczas całych eliminacji oraz meczu barażowego.</p>
            <p>Przed reprezentacją Polski rozpoczyna się nowy etap przygotowań do kolejnych rozgrywek międzynarodowych. Polski Związek Piłki Nożnej oraz sztab szkoleniowy dokonają szczegółowej analizy zakończonej kampanii, aby wyciągnąć wnioski i odpowiednio przygotować drużynę do przyszłych wyzwań.</p>
          </div>
        ) : (
          <p className="mx-auto max-w-2xl text-[16px] font-medium leading-8 text-sky-50">
            {data.lead}
          </p>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-3xl border border-yellow-300/25 bg-black/25 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
        <div className="border-b border-yellow-300/25 bg-yellow-300/10 px-6 py-3">
          <p className="text-[11px] font-black italic uppercase tracking-tighter text-yellow-100">
            Wynik meczu {data.pathLabel ? `/ Ścieżka ${data.pathLabel}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_128px_1fr] items-center gap-5 px-7 py-8">
          <div className="flex min-w-0 flex-col items-end gap-3 text-right">
            <FlagBadge teamName={data.homeTeam} align="left" />
            <span className={`max-w-full truncate text-[18px] font-black italic uppercase tracking-tighter ${data.homeScore >= data.awayScore ? 'text-white' : 'text-slate-300'}`}>
              {data.homeTeam}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex h-20 w-32 items-center justify-center rounded-2xl border border-yellow-300/40 bg-yellow-300/10 text-[30px] font-black italic uppercase tracking-tighter text-yellow-50 shadow-[inset_0_0_24px_rgba(250,204,21,0.08)]">
              {data.homeScore} : {data.awayScore}
            </div>
            <span className="mt-2 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">{extraLabel}</span>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-3 text-left">
            <FlagBadge teamName={data.awayTeam} align="right" />
            <span className={`max-w-full truncate text-[18px] font-black italic uppercase tracking-tighter ${data.awayScore >= data.homeScore ? 'text-white' : 'text-slate-300'}`}>
              {data.awayTeam}
            </span>
          </div>
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
    viewPlayerDetails,
    setContractManagementInitialMode,
    setPendingOpenRoleMindflow,
    // ── Transfer Request Dialog ──────────────────────────────────────────────
    // Flaga: PlayerCard wykrywa ją i otwiera PlayerTransferRequestModal.
    // Logika: PlayerTransferRequestDialogService | Handler: resolvePlayerTransferRequestDialog
    setPendingOpenTransferRequestDialog,
    setPendingOpenTransferListObjection,
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

  const { closeModal, exitClass } = useModalClose(onClose);
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

  const getTypeStyle = (type: MailType) => {
    switch (type) {
      case MailType.BOARD:
        return {
          label: 'Zarząd klubu',
          accent: '#f59e0b',
          glow: 'rgba(245,158,11,0.35)',
          headerText: 'text-amber-100',
        };
      case MailType.FANS:
        return {
          label: 'Kibice',
          accent: '#f43f5e',
          glow: 'rgba(244,63,94,0.35)',
          headerText: 'text-rose-100',
        };
      case MailType.STAFF:
        return {
          label: 'Sztab',
          accent: '#3b82f6',
          glow: 'rgba(59,130,246,0.35)',
          headerText: 'text-blue-100',
        };
      case MailType.MEDIA:
      case MailType.PRESS:
        return {
          label: 'Media',
          accent: '#10b981',
          glow: 'rgba(16,185,129,0.35)',
          headerText: 'text-emerald-100',
        };
      case MailType.SCOUT:
        return {
          label: 'Skauting',
          accent: '#22d3ee',
          glow: 'rgba(34,211,238,0.35)',
          headerText: 'text-cyan-100',
        };
      default:
        return {
          label: 'Centrum klubowe',
          accent: '#38bdf8',
          glow: 'rgba(56,189,248,0.32)',
          headerText: 'text-sky-100',
        };
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

  const typeStyle = getTypeStyle(mail.type);
  const sentDate = mail.date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const senderInitials = mail.sender
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/[0.82] p-6 ${exitClass} backdrop-blur-[2px]`}>
      <div
        className={`${
          mail.type === MailType.SCOUT ? 'max-w-[1693px] w-[88vw] h-[86vh]' : isTeamOfWeek ? 'max-w-[1500px] w-[82vw] h-[90vh]' : 'max-w-4xl max-h-[92vh]'
        } w-full overflow-hidden rounded-[30px] border bg-[#071321] shadow-[0_38px_90px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.04)] flex flex-col relative`}
        style={{ borderColor: `${typeStyle.accent}55`, boxShadow: `0 38px 90px rgba(0,0,0,0.92), 0 0 46px ${typeStyle.glow}` }}
      >
        <div className={`${isTeamOfWeek ? 'p-5' : 'px-8 py-6'} relative shrink-0 overflow-hidden border-b bg-[#063846]`} style={{ borderBottomColor: `${typeStyle.accent}66` }}>
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: typeStyle.accent }} />
          <div className="absolute right-8 top-6 text-[64px] font-black italic uppercase leading-none tracking-tighter text-white/[0.04] select-none">
            {typeStyle.label}
          </div>

          <div className="relative z-10 flex items-start justify-between gap-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-base font-black italic uppercase tracking-tighter text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)]" style={{ borderColor: typeStyle.accent, backgroundColor: `${typeStyle.accent}22` }}>
                {senderInitials || getAvatarIcon(mail.type)}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black italic uppercase tracking-tighter">
                  <span className={typeStyle.headerText}>
                    {typeStyle.label}
                  </span>
                  <span className="text-sky-100/80">
                    {sentDate}
                  </span>
                </div>
                <h2 className="max-w-[720px] text-[31px] font-black italic uppercase tracking-tighter leading-none text-white">{mail.subject || mail.sender}</h2>
                <p className="mt-3 text-[13px] font-semibold leading-relaxed text-sky-100">
                  <span className="text-white">{mail.sender}</span>
                  {mail.role && <span className="text-sky-100/75"> / {mail.role}</span>}
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-transparent text-lg font-light text-sky-100 shadow-lg transition-all hover:scale-110 hover:bg-white/10 hover:text-white active:scale-95"
            >
              x
            </button>
          </div>
        </div>

        <div className={`custom-scrollbar flex-1 min-h-0 bg-[#071321] ${isTeamOfWeek ? 'overflow-hidden p-4' : 'overflow-y-auto px-9 py-8'}`}>
          <div className={`${mail.type === MailType.SCOUT || isTeamOfWeek ? 'prose prose-invert max-w-none' : ''}`}>
            {mail.id.startsWith('BOARD_PROMOTION_EKSTRAKLASA_') ? (
              <img src={awansEkstraklasaImg} alt="Awans do Ekstraklasy" className="w-full object-contain" />
            ) : mail.type === MailType.SCOUT ? (
              <div dangerouslySetInnerHTML={{ __html: mail.body }} />
            ) : mail.metadata?.type === 'TEAM_OF_WEEK' ? (
              <TeamOfWeekPitch mail={mail} />
            ) : getWCQPlayoffPolandMailData(mail) ? (
              <WCQPlayoffPolandMail mail={mail} />
            ) : mail.metadata?.type === 'AI_FRIENDLY_REPORT_LINK' || mail.metadata?.type === 'NATIONAL_TEAM_FRIENDLY_RESULTS' ? (
              <FriendlyResultsMail mail={mail} />
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
              <p className="whitespace-pre-wrap text-[18px] font-medium leading-9 text-sky-50 [font-family:Archivo,sans-serif]">
                {mail.body}
              </p>
            )}
          </div>
        </div>

        <div className={`${isTeamOfWeek ? 'p-4' : 'px-8 py-5'} shrink-0 border-t bg-[#06101c] flex items-center justify-between`} style={{ borderTopColor: `${typeStyle.accent}33` }}>
          <div className="flex flex-col">
            <span className="text-[8px] font-black italic uppercase tracking-tighter text-sky-200/50">Wysłano</span>
            <span className="text-[11px] font-black italic uppercase tracking-tighter text-sky-100">
              {sentDate}
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

            {mail.metadata?.type === 'PLAYER_MORALE_REQUEST' && (
              <button
                onClick={() => {
                  if (mail.metadata!.requestType === 'RAISE') {
                    viewPlayerDetails(mail.metadata!.playerId);
                    setContractManagementInitialMode('NEGOTIATE');
                    navigateWithoutHistory(ViewState.CONTRACT_MANAGEMENT);
                  } else if (mail.metadata!.requestType === 'TRANSFER_LIST') {
                    // ── Transfer Request Dialog ──────────────────────────────────────────
                    // Otwiera PlayerTransferRequestModal przez PlayerCard.
                    // setPendingOpenTransferRequestDialog ustawia flagę, którą PlayerCard
                    // wykrywa w useEffect i otwiera modal (wzorzec identyczny jak ROLE).
                    // Serwis: PlayerTransferRequestDialogService
                    // ────────────────────────────────────────────────────────────────────
                    viewPlayerDetails(mail.metadata!.playerId);
                    setPendingOpenTransferRequestDialog(true);
                  } else if (mail.metadata!.requestType === 'TRANSFER_LIST_OBJECTION') {
                    viewPlayerDetails(mail.metadata!.playerId);
                    setPendingOpenTransferListObjection(true);
                  } else {
                    viewPlayerDetails(mail.metadata!.playerId);
                    setPendingOpenRoleMindflow(mail.metadata!.requestType === 'ROLE' || mail.metadata!.requestType === 'ROLE_PLAYTIME');
                  }
                  onClose();
                }}
                className="mr-4 rounded-2xl bg-violet-600 px-10 py-4 text-xs font-black italic uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {mail.metadata.requestType === 'RAISE'
                  ? 'Otwórz kontrakt'
                  : mail.metadata.requestType === 'ROLE' || mail.metadata.requestType === 'ROLE_PLAYTIME'
                    ? 'Otwórz rozmowę'
                    : mail.metadata.requestType === 'TRANSFER_LIST' || mail.metadata.requestType === 'TRANSFER_LIST_OBJECTION'
                      ? 'Porozmawiaj'
                      : 'Otwórz kartę'}
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
              onClick={closeModal}
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
