import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, CompetitionType, MatchStatus, FriendlyMatchConditions, PreMatchStudioData, PlayerPosition, Player, Club } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { getPlayerCardImage, getClubKitVariants, KitVariant } from '../../resources/PlayerCardAssets';
import { PreMatchStudioService } from '../../services/PreMatchStudioService';
import { TacticRepository } from '../../resources/tactics_db';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { KitSelectionService, KitSelection } from '../../services/KitSelectionService';
import { LineupService } from '../../services/LineupService';
import bojo2Pitch from '../../Graphic/themes/bojo2.png';
import startMecz from '../../Graphic/themes/start-mecz.png';

type DrawRule = FriendlyMatchConditions['drawRule'];
type MaxSubs = FriendlyMatchConditions['maxSubstitutions'];

const DRAW_RULE_OPTIONS: { value: DrawRule; label: string; desc: string }[] = [
  { value: 'NONE',              label: 'Tylko 90 minut',             desc: 'Remis pozostaje remisem' },
  { value: 'PENALTIES',         label: 'Rzuty karne po remisie',     desc: 'Seria karnych bez dogrywki' },
  { value: 'ET_ONLY',           label: 'Dogrywka (bez karnych)',     desc: '2 × 15 min dogrywki' },
  { value: 'ET_THEN_PENALTIES', label: 'Dogrywka + rzuty karne',    desc: 'Dogrywka, a potem karne' },
];

// Małe europejskie stadiony (Tier 4) na mecze neutralne — nie polskie, rózne kraje
const SMALL_EUROPEAN_VENUES: { name: string; city: string; countryCode: string }[] = [
  { name: 'Stadion Myjava',            city: 'Myjava',       countryCode: 'SVK' },
  { name: 'Štadión FK Senica',         city: 'Senica',       countryCode: 'SVK' },
  { name: 'Stade de Furiani',          city: 'Furiani',      countryCode: 'FRA' },
  { name: 'Stade Henri-Deschamps',     city: 'Mulhouse',     countryCode: 'FRA' },
  { name: 'Stadion FK Velez',          city: 'Mostar',       countryCode: 'BIH' },
  { name: 'Gradski Stadion',           city: 'Zenica',       countryCode: 'BIH' },
  { name: 'Josy Barthel Stadium',      city: 'Luksemburg',   countryCode: 'LUX' },
  { name: 'Stade Emile Mayrisch',      city: 'Esch-sur-Alzette', countryCode: 'LUX' },
  { name: 'Sportpark Ronhof',          city: 'Fürth',        countryCode: 'DEU' },
  { name: 'Erdgas Sportpark',          city: 'Halle',        countryCode: 'DEU' },
  { name: 'Städtisches Stadion',       city: 'Bayreuth',     countryCode: 'DEU' },
  { name: 'Sportanlage Gazi-Stadion',  city: 'Stuttgart-Degerloch', countryCode: 'DEU' },
  { name: 'Stade Olympique de Radès',  city: 'Radès',        countryCode: 'TUN' },
  { name: 'NV Arena',                  city: 'St. Pölten',   countryCode: 'AUT' },
  { name: 'Joanneum-Stadion',          city: 'Graz',         countryCode: 'AUT' },
  { name: 'Brann Stadion',             city: 'Bergen',       countryCode: 'NOR' },
  { name: 'Color Line Stadion',        city: 'Ålesund',      countryCode: 'NOR' },
  { name: 'Lerkendal Stadion',         city: 'Trondheim',    countryCode: 'NOR' },
  { name: 'Vejle Stadion',             city: 'Vejle',        countryCode: 'DNK' },
  { name: 'Aarhus Stadion',            city: 'Aarhus',       countryCode: 'DNK' },
  { name: 'Szombathely Stadion',       city: 'Szombathely',  countryCode: 'HUN' },
  { name: 'Nagyerdei Stadion',         city: 'Debreczyn',    countryCode: 'HUN' },
  { name: 'Dariusz Padevet Stadion',   city: 'Praga',        countryCode: 'CZE' },
  { name: 'Andrův Stadion',            city: 'Ołomuniec',    countryCode: 'CZE' },
  { name: 'Doosan Arena',              city: 'Pilzno',       countryCode: 'CZE' },
  { name: 'Olimpico di Serravalle',    city: 'Serravalle',   countryCode: 'SMR' },
  { name: 'Stadio Silvio Piola',       city: 'Novara',       countryCode: 'ITA' },
  { name: 'Stadio Carlo Castellani',   city: 'Empoli',       countryCode: 'ITA' },
  { name: 'Estadio Municipal',         city: 'Ponferrada',   countryCode: 'ESP' },
  { name: 'Estadio El Alcoraz',        city: 'Huesca',       countryCode: 'ESP' },
  { name: 'Mestalla',                  city: 'Valencia',     countryCode: 'ESP' },
  { name: 'Jan Breydel Stadion',       city: 'Brugge',       countryCode: 'BEL' },
  { name: 'Stade du Pays de Charleroi', city: 'Charleroi',   countryCode: 'BEL' },
  { name: 'Rat Verlegh Stadion',       city: 'Breda',        countryCode: 'NLD' },
  { name: 'Polman Stadion',            city: 'Almelo',       countryCode: 'NLD' },
  { name: 'Kapfenberg Stadion',        city: 'Kapfenberg',   countryCode: 'AUT' },
  { name: 'Stadion Norden',            city: 'Bregenz',      countryCode: 'AUT' },
  { name: 'Södermalm Stadion',         city: 'Malmö',        countryCode: 'SWE' },
  { name: 'Myresjöhus Arena',          city: 'Växjö',        countryCode: 'SWE' },
];

const getContrastTextColor = (bgHex: string, secondaryHex: string): string => {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
  };
  const lum = ({ r, g, b }: { r: number; g: number; b: number }) => 0.299 * r + 0.587 * g + 0.114 * b;
  const diff = Math.abs(lum(parse(bgHex)) - lum(parse(secondaryHex)));
  if (diff > 60) return secondaryHex;
  return lum(parse(bgHex)) > 128 ? '#000000' : '#ffffff';
};

const GOALKEEPER_KIT_POOL = ['#facc15', '#fb923c', '#f472b6', '#881337', '#dc2626', '#16a34a'];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getPitchSlotTop = (isHome: boolean, slotY: number): string =>
  `${isHome ? 55 + slotY * 32 : 45 - slotY * 32}%`;

const pickGoalkeeperKitColor = (seed: string, blockedColors: string[]): string => {
  const threshold = 120;
  const viableColors = GOALKEEPER_KIT_POOL.filter(color =>
    blockedColors.every(blocked => KitSelectionService.getColorDistance(color, blocked) > threshold)
  );
  if (viableColors.length > 0) {
    return viableColors[hashString(seed) % viableColors.length];
  }
  const ranked = [...GOALKEEPER_KIT_POOL].sort((a, b) => {
    const aScore = Math.min(...blockedColors.map(blocked => KitSelectionService.getColorDistance(a, blocked)));
    const bScore = Math.min(...blockedColors.map(blocked => KitSelectionService.getColorDistance(b, blocked)));
    return bScore - aScore;
  });
  return ranked[hashString(seed) % ranked.length];
};

const getPitchPlayerLabel = (player?: Player | null): string =>
  player ? `${player.firstName.charAt(0)}. ${player.lastName}` : 'BRAK';

const PitchPlayerKit: React.FC<{
  player?: Player;
  left: string;
  top: string;
  primary: string;
  secondary: string;
  trim: string;
}> = ({ player, left, top, primary, secondary, trim }) => {
  const shirtText = getContrastTextColor(primary, secondary);
  return (
    <div
      className="absolute z-20 flex flex-col items-center gap-0 transition-transform duration-300 hover:scale-110"
      style={{ left, top, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 24 24" className="w-[34px] h-[34px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">
          <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={primary} />
          <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.9" />
          <path d="M7 2L2 5v4l3 1V6.5L8.3 5l1.7 2.3h4L15.7 5 19 6.5V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={secondary} fillOpacity="0.35" />
          <path d="M12 7.2v11.8" stroke={trim} strokeWidth="1.15" strokeOpacity="0.85" />
          <text x="12" y="15.6" textAnchor="middle" fontSize="3.6" fontWeight="900" fontStyle="italic" fill={shirtText}>
            {player?.overallRating ?? '??'}
          </text>
        </svg>
        <svg viewBox="0 0 28 18" className="-mt-1 w-[18px] h-[10px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
          <path d="M4 2h20l2 4-3 10H16l-2-6-2 6H5L2 6z" fill={secondary} stroke={trim} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M14 3v12" stroke={trim} strokeWidth="1" strokeOpacity="0.7" />
        </svg>
      </div>
      <div className="min-w-[82px] max-w-[96px] -mt-[4px] rounded-md border border-white/10 bg-black/85 px-2 py-1 text-center shadow-[0_6px_16px_rgba(0,0,0,0.45)]">
        <span className="block truncate text-[8px] font-black uppercase tracking-[0.14em] text-white">
          {getPitchPlayerLabel(player)}
        </span>
      </div>
    </div>
  );
};

function kitEffectiveDistance(kA: KitVariant, kB: KitVariant): number {
  let minDist = KitSelectionService.getColorDistance(kA.hex, kB.hex);
  if (kA.secondaryHex) minDist = Math.min(minDist, KitSelectionService.getColorDistance(kA.secondaryHex, kB.hex));
  if (kB.secondaryHex) minDist = Math.min(minDist, KitSelectionService.getColorDistance(kA.hex, kB.secondaryHex));
  if (kA.secondaryHex && kB.secondaryHex) minDist = Math.min(minDist, KitSelectionService.getColorDistance(kA.secondaryHex, kB.secondaryHex));
  return minDist;
}

function resolveShorts(candidates: string[], opponentPrimary: string, opponentShorts: string, THRESHOLD = 110): string {
  for (const c of candidates) {
    if (KitSelectionService.getColorDistance(c, opponentPrimary) >= THRESHOLD &&
        KitSelectionService.getColorDistance(c, opponentShorts) >= THRESHOLD) {
      return c;
    }
  }
  return candidates[0];
}

function selectKitsFromVariants(homeClub: Club, awayClub: Club): KitSelection {
  const homeVariants = getClubKitVariants(homeClub.id, homeClub.colorsHex);
  const awayVariants = getClubKitVariants(awayClub.id, awayClub.colorsHex);
  const CLASH_THRESHOLD = 350;
  let bestHomeIdx = 0, bestAwayIdx = 0, maxScore = -1;
  for (let h = 0; h < homeVariants.length; h++) {
    for (let a = 0; a < awayVariants.length; a++) {
      const dist = kitEffectiveDistance(homeVariants[h], awayVariants[a]);
      const score = dist + (h === 0 ? 100 : 0) + (a === 0 ? 50 : 0);
      if (score > maxScore) { maxScore = score; bestHomeIdx = h; bestAwayIdx = a; }
    }
    if (h === 0 && kitEffectiveDistance(homeVariants[0], awayVariants[bestAwayIdx]) > CLASH_THRESHOLD) break;
  }
  const hKit = homeVariants[bestHomeIdx];
  const aKit = awayVariants[bestAwayIdx];
  const hNext = homeVariants[(bestHomeIdx + 1) % homeVariants.length];
  const aNext = awayVariants[(bestAwayIdx + 1) % awayVariants.length];

  const awayShortsCandidates = [
    aKit.secondaryHex ?? aNext.hex,
    aKit.hex,
    '#FFFFFF',
    '#000000',
  ];
  const awaySecondary = resolveShorts(awayShortsCandidates, hKit.hex, hKit.secondaryHex ?? hNext.hex);

  const homeShortsCandidates = [
    hKit.secondaryHex ?? hNext.hex,
    hKit.hex,
    '#FFFFFF',
    '#000000',
  ];
  const homeSecondary = resolveShorts(homeShortsCandidates, aKit.hex, awaySecondary);

  return {
    home: {
      primary: hKit.hex,
      secondary: homeSecondary,
      text: KitSelectionService.isColorLight(hKit.hex) ? '#000000' : '#ffffff'
    },
    away: {
      primary: aKit.hex,
      secondary: awaySecondary,
      text: KitSelectionService.isColorLight(aKit.hex) ? '#000000' : '#ffffff'
    }
  };
}

export const PreMatchFriendlyStudioView: React.FC = () => {
  const {
    fixtures, clubs, players, lineups, currentDate, navigateTo, userTeamId,
    activeFriendlyFixtureId, setActiveFriendlyConditions, viewRefereeDetails,
  } = useGame();

  const [drawRule, setDrawRule] = useState<DrawRule>('NONE');
  const [maxSubs, setMaxSubs] = useState<MaxSubs>(5);
  const [data, setData] = useState<PreMatchStudioData | null>(null);
  const [loading, setLoading] = useState(true);

  const fixture = useMemo(() => {
    if (activeFriendlyFixtureId) return fixtures.find(f => f.id === activeFriendlyFixtureId);
    return fixtures.find(f =>
      f.leagueId === CompetitionType.FRIENDLY &&
      f.date.toDateString() === currentDate.toDateString() &&
      f.status === MatchStatus.SCHEDULED &&
      (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
    );
  }, [fixtures, activeFriendlyFixtureId, currentDate, userTeamId]);

  useEffect(() => {
    if (!fixture) { setLoading(false); return; }
    const init = async () => {
      const home = clubs.find(c => c.id === fixture.homeTeamId)!;
      const away = clubs.find(c => c.id === fixture.awayTeamId)!;
      const hPlayers = players[home.id] || [];
      const aPlayers = players[away.id] || [];
      let hLineup = lineups[home.id] || LineupService.autoPickLineup(home.id, hPlayers);
      let aLineup = lineups[away.id] || LineupService.autoPickLineup(away.id, aPlayers);
      const studioData = await PreMatchStudioService.prepareStudioData(
        fixture, home, away, hLineup, aLineup, hPlayers, aPlayers, clubs
      );
      setData(studioData);
      setLoading(false);
    };
    init();
  }, [fixture, clubs, players, lineups]);

  const matchKits = useMemo(() => {
    if (!data) return null;
    return selectKitsFromVariants(data.homeClub, data.awayClub);
  }, [data]);

  // Bardzo niska frekwencja dla sparingów
  const friendlyAttendance = useMemo(() => Math.floor(20 + Math.random() * 480), []);

  // Stadion neutralny — mały europejski, nie polski, nie z kraju przeciwnika
  const venueInfo = useMemo(() => {
    if (!data || !fixture?.neutralVenue) return null;
    const opponentCountry = (data.homeClub.id === userTeamId ? data.awayClub : data.homeClub).country || '';
    const candidates = SMALL_EUROPEAN_VENUES.filter(
      v => v.countryCode !== 'POL' && v.countryCode !== opponentCountry
    );
    if (!candidates.length) return SMALL_EUROPEAN_VENUES[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [data, fixture, userTeamId]);

  const handleStart = () => {
    setActiveFriendlyConditions({ drawRule, maxSubstitutions: maxSubs });
    navigateTo(ViewState.MATCH_LIVE_FRIENDLY);
  };

  if (loading || !data || !matchKits) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 border-t-4 border-l-4 border-green-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-2xl font-black italic uppercase tracking-tighter">Studio Sparingowe</p>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <p className="text-white/40 text-sm">Brak zaplanowanego sparingu na dziś.</p>
      </div>
    );
  }

  const getJerseyUrl = (clubId: string, hex: string) => getPlayerCardImage(clubId, hex);

  const homeXI   = data.homeLineup.startingXI.map(id => data.homePlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  const awayXI   = data.awayLineup.startingXI.map(id => data.awayPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  const homeBench = data.homeLineup.bench.map(id => data.homePlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  const awayBench = data.awayLineup.bench.map(id => data.awayPlayers.find(p => p.id === id)).filter(Boolean) as Player[];

  const homeTactic = TacticRepository.getById(data.homeLineup.tacticId);
  const awayTactic = TacticRepository.getById(data.awayLineup.tacticId);

  const blockedGoalkeeperColors = [
    matchKits.home.primary,
    matchKits.home.secondary,
    matchKits.away.primary,
    matchKits.away.secondary
  ];
  const homeGoalkeeperColor = pickGoalkeeperKitColor(
    `${data.homeClub.id}-${data.awayClub.id}-${homeXI.find(p => p.position === PlayerPosition.GK)?.id ?? 'home-gk'}`,
    blockedGoalkeeperColors
  );
  const awayGoalkeeperColor = pickGoalkeeperKitColor(
    `${data.awayClub.id}-${data.homeClub.id}-${awayXI.find(p => p.position === PlayerPosition.GK)?.id ?? 'away-gk'}`,
    blockedGoalkeeperColors
  );

  const stadiumName = venueInfo
    ? `${venueInfo.name}, ${venueInfo.city}`
    : data.homeClub.stadiumName;

  const UnifiedPlayerList = ({ club, xi, bench, side }: { club: Club; xi: Player[]; bench: Player[]; side: 'left' | 'right' }) => (
    <div className="w-80 shrink-0 bg-slate-900/30 rounded-[40px] border border-white/10 backdrop-blur-[1px] shadow-2xl flex flex-col overflow-hidden h-full">
      <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-green-400"></span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: club.colorsHex[0] }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        <div className="pb-2">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 block ml-2">Jedenastka Wyjściowa</span>
          {xi.map(p => (
            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.08] transition-all ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
              <span className={`w-8 font-black font-mono text-[9px] ${PlayerPresentationService.getPositionColorClass(p.position)}`}>{p.position}</span>
              <span className="text-[12px] font-bold text-white uppercase italic tracking-tight truncate group-hover:text-green-400">
                {p.firstName} {p.lastName}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-white/5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block ml-2">Rezerwowi</span>
          {bench.map(p => (
            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl bg-black/20 opacity-60 group hover:opacity-100 transition-all ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
              <span className="w-8 font-black font-mono text-[8px] text-slate-500">{p.position}</span>
              <span className="text-[9px] font-medium text-slate-300 uppercase truncate">{p.firstName} {p.lastName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col animate-fade-in overflow-hidden relative font-sans">

      {/* CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <div className="absolute inset-0 bg-cover bg-center scale-100 opacity-20" style={{ backgroundImage: `url(${startMecz})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 shrink-0 w-full max-w-[1850px] mx-auto pt-6 px-6">
        <div className="bg-slate-900/30 border border-white/10 rounded-[35px] shadow-2xl backdrop-blur-[1px]">
          <div className="flex items-center justify-between h-20 px-10">

            {/* HOME */}
            <div className="flex items-center flex-1">
              <div className="relative z-10 shrink-0 -mr-6">
                {getClubLogo(data.homeClub.id) ? (
                  <img src={getClubLogo(data.homeClub.id)} alt={data.homeClub.name} className="w-[115px] h-[115px] object-contain transform -rotate-6 drop-shadow-2xl opacity-80" />
                ) : (
                  <div className="w-12 h-12 rounded-[15px] border-2 border-white/20 overflow-hidden flex flex-col transform -rotate-3">
                    <div style={{ backgroundColor: matchKits.home.primary }} className="flex-1" />
                    <div style={{ backgroundColor: matchKits.home.secondary }} className="flex-1" />
                  </div>
                )}
              </div>
              <div className="relative z-0 pl-8">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{data.homeClub.name}</h2>
                <span className="text-[11px] font-black text-green-400 uppercase tracking-widest mt-1 block">GOSPODARZE</span>
              </div>
            </div>

            {/* CENTER BADGE */}
            <div className="flex flex-col items-center justify-center px-12 border-x border-white/5 bg-black/30 h-full">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
                <span className="text-[13px] font-black text-white font-mono tracking-[0.4em] uppercase">STUDIO SPARINGOWE</span>
              </div>
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">{currentDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            {/* AWAY */}
            <div className="flex items-center flex-1 justify-end text-right">
              <div className="relative z-0 pr-8">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{data.awayClub.name}</h2>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-1 block">GOŚCIE</span>
              </div>
              <div className="relative z-10 shrink-0 -ml-6">
                {getClubLogo(data.awayClub.id) ? (
                  <img src={getClubLogo(data.awayClub.id)} alt={data.awayClub.name} className="w-[115px] h-[115px] object-contain transform rotate-6 drop-shadow-2xl opacity-80" />
                ) : (
                  <div className="w-12 h-12 rounded-[15px] border-2 border-white/20 overflow-hidden flex flex-col transform rotate-3">
                    <div style={{ backgroundColor: matchKits.away.primary }} className="flex-1" />
                    <div style={{ backgroundColor: matchKits.away.secondary }} className="flex-1" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INFO BAR */}
          <div className="bg-black/30 border-t border-white/5 p-2.5 px-10 flex justify-between items-center text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <div className="flex gap-10">
              <span>🏟️ {stadiumName}{venueInfo ? ' (NEUTRAL)' : ''}</span>
              <span>👥 WIDZÓW: {friendlyAttendance.toLocaleString()}</span>
              <span>🌡️ {data.weather.tempC}°C • {data.weather.description.toUpperCase()}</span>
              <span onClick={() => viewRefereeDetails(data.referee.id)} className="cursor-pointer hover:text-green-400 transition-colors">⚖️ SĘDZIA: {data.referee.firstName} {data.referee.lastName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>⚽ SPARING</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 flex-1 w-full max-w-[1850px] mx-auto flex gap-6 px-6 py-4 min-h-0">

        <UnifiedPlayerList club={data.homeClub} xi={homeXI} bench={homeBench} side="left" />

        {/* CENTER COLUMN */}
        <div className="flex-1 flex flex-col gap-4 items-center min-w-0">

          {/* JERSEYS + PITCH */}
          <div className="w-full flex items-center justify-between gap-2 animate-fade-in flex-1 min-h-0">

            {/* HOME JERSEY */}
            <div className="relative group shrink-0 self-center -mr-20 z-20">
              <div className="absolute -inset-4 bg-green-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img
                src={getJerseyUrl(data.homeClub.id, matchKits.home.primary)}
                className="w-48 h-72 lg:w-64 lg:h-[380px] object-cover rounded-[50px] border-2 border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.7)] transform perspective-[1000px] rotate-y-[12deg] -rotate-[2deg] group-hover:rotate-y-0 group-hover:rotate-0 transition-transform duration-700 hover:scale-[1.02] opacity-80"
                style={{ boxShadow: `0 0 50px ${matchKits.home.primary}44` }}
                alt="Koszulka Gospodarzy"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/30 backdrop-blur-[1px] p-4 rounded-3xl border border-white/10 shadow-2xl">
                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest leading-none mb-1">KLUCZOWY ZAWODNIK</p>
                <p className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                  {[...homeXI].sort((a,b) => b.overallRating - a.overallRating)[0]?.lastName}
                </p>
              </div>
            </div>

            {/* BOISKO W WIDOKU 2D Z KOSZULKAMI SVG */}
            <div className="flex-1 max-w-[430px] xl:max-w-[470px] flex items-center justify-center py-2">
              <div
                className="w-full aspect-[2/3] rounded-[10px] relative shadow-[0_45px_80px_rgba(0,0,0,0.55)] overflow-visible group/pitch opacity-90"
              >
                <img src={bojo2Pitch} alt="boisko" className="absolute inset-0 w-full h-full object-fill" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />

                {homeTactic.slots.map((slot, i) => {
                  const player = homeXI[i];
                  const primary = slot.role === PlayerPosition.GK ? homeGoalkeeperColor : matchKits.home.primary;
                  const secondary = slot.role === PlayerPosition.GK ? '#111827' : matchKits.home.secondary;
                  const trim = slot.role === PlayerPosition.GK ? getContrastTextColor(primary, '#111827') : getContrastTextColor(primary, matchKits.home.secondary);
                  return (
                    <PitchPlayerKit
                      key={`h-${i}`}
                      player={player}
                      left={`${slot.x * 100}%`}
                      top={
                        slot.role === PlayerPosition.GK
                          ? `calc(${getPitchSlotTop(true, slot.y)} + 60px)`
                          : slot.role === PlayerPosition.DEF
                            ? `calc(${getPitchSlotTop(true, slot.y)} + 37px)`
                            : slot.role === PlayerPosition.MID
                              ? `calc(${getPitchSlotTop(true, slot.y)} - 7px)`
                              : slot.role === PlayerPosition.FWD
                                ? `calc(${getPitchSlotTop(true, slot.y)} - 45px)`
                                : getPitchSlotTop(true, slot.y)
                      }
                      primary={primary}
                      secondary={secondary}
                      trim={trim}
                    />
                  );
                })}

                {awayTactic.slots.map((slot, i) => {
                  const player = awayXI[i];
                  const primary = slot.role === PlayerPosition.GK ? awayGoalkeeperColor : matchKits.away.primary;
                  const secondary = slot.role === PlayerPosition.GK ? '#111827' : matchKits.away.secondary;
                  const trim = slot.role === PlayerPosition.GK ? getContrastTextColor(primary, '#111827') : getContrastTextColor(primary, matchKits.away.secondary);
                  return (
                    <PitchPlayerKit
                      key={`a-${i}`}
                      player={player}
                      left={`${slot.x * 100}%`}
                      top={
                        slot.role === PlayerPosition.GK
                          ? `calc(${getPitchSlotTop(false, slot.y)} - 60px)`
                          : slot.role === PlayerPosition.DEF
                            ? `calc(${getPitchSlotTop(false, slot.y)} - 35px)`
                            : slot.role === PlayerPosition.MID
                              ? `calc(${getPitchSlotTop(false, slot.y)} + 5px)`
                              : slot.role === PlayerPosition.FWD
                                ? `calc(${getPitchSlotTop(false, slot.y)} + 48px)`
                                : getPitchSlotTop(false, slot.y)
                      }
                      primary={primary}
                      secondary={secondary}
                      trim={trim}
                    />
                  );
                })}
              </div>
            </div>

            {/* AWAY JERSEY */}
            <div className="relative group shrink-0 self-center -ml-20 z-20">
              <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img
                src={getJerseyUrl(data.awayClub.id, matchKits.away.primary)}
                className="w-48 h-72 lg:w-64 lg:h-[380px] object-cover rounded-[50px] border-2 border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.7)] transform perspective-[1000px] rotate-y-[-12deg] rotate-[2deg] group-hover:rotate-y-0 group-hover:rotate-0 transition-transform duration-700 hover:scale-[1.02] opacity-80"
                style={{ boxShadow: `0 0 50px ${matchKits.away.primary}44` }}
                alt="Koszulka Gości"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/30 backdrop-blur-[1px] p-4 rounded-3xl border border-white/10 shadow-2xl text-right">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">KLUCZOWY ZAWODNIK</p>
                <p className="text-xl font-black text-white italic uppercase tracking-tighter truncate">
                  {[...awayXI].sort((a,b) => b.overallRating - a.overallRating)[0]?.lastName}
                </p>
              </div>
            </div>

          </div>

          {/* CONDITIONS + START BUTTON */}
          <div className="w-full bg-slate-900/30 rounded-[35px] border border-white/10 p-5 flex gap-4 backdrop-blur-[1px] shadow-2xl shrink-0">

            {/* DRAW RULE */}
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Co po remisie?</p>
              <div className="grid grid-cols-2 gap-2">
                {DRAW_RULE_OPTIONS.map(opt => {
                  const sel = drawRule === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setDrawRule(opt.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${sel ? 'bg-green-500/15 border-green-500/50 shadow-[0_0_14px_rgba(34,197,94,0.15)]' : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07]'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? 'border-green-400 bg-green-400' : 'border-white/30'}`}>
                        {sel && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold leading-tight ${sel ? 'text-green-300' : 'text-white/80'}`}>{opt.label}</p>
                        <p className="text-white/30 text-[10px]">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAX SUBS */}
            <div className="flex flex-col gap-2 w-44 shrink-0">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Liczba zmian</p>
              <div className="flex gap-2 flex-wrap">
                {([5, 6, 7, 8, 9] as MaxSubs[]).map(n => {
                  const sel = maxSubs === n;
                  return (
                    <button key={n} onClick={() => setMaxSubs(n)}
                      className={`flex-1 min-w-[2.5rem] py-3 rounded-2xl border font-bold text-sm transition-all ${sel ? 'bg-green-500/15 border-green-500/50 text-green-300 shadow-[0_0_14px_rgba(34,197,94,0.15)]' : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.07]'}`}>
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* START */}
            <div className="flex items-center shrink-0">
              <button onClick={handleStart}
                className="group relative px-10 py-5 rounded-[30px] bg-white text-slate-950 font-black italic text-lg uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.2)] border-b-8 border-slate-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  ZAGRAJ SPARING <span className="text-xl group-hover:rotate-12 transition-transform">⚽</span>
                </span>
              </button>
            </div>

          </div>

        </div>

        <UnifiedPlayerList club={data.awayClub} xi={awayXI} bench={awayBench} side="right" />

      </main>
    </div>
  );
};
