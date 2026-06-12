import React from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';

export const CoachCard: React.FC = () => {
  const { viewedCoachId, coaches, clubs, nationalTeams, navigateTo, previousViewState } = useGame();
  const coach = viewedCoachId ? coaches[viewedCoachId] : null;

  if (!coach) return null;

  const currentClub = clubs.find(c => c.id === coach.currentClubId);
  const currentNT = !currentClub && coach.currentNationalTeamId
    ? nationalTeams.find(t => t.id === coach.currentNationalTeamId)
    : undefined;

  const FORMATION_MAP: Record<string, number[]> = {
    '4-3-3 Atak':          [4, 3, 3],
    '3-4-3':               [3, 4, 3],
    'Wysoki Pressing':     [4, 3, 3],
    'Total Football':      [4, 3, 3],
    '4-1-2-1-2':           [4, 1, 2, 1, 2],
    '4-4-2':               [4, 4, 2],
    '4-3-3 Zrównoważona':  [4, 3, 3],
    '3-5-2':               [3, 5, 2],
    '4-5-1':               [4, 5, 1],
    '4-2-3-1':             [4, 2, 3, 1],
    '5-3-2':               [5, 3, 2],
    '5-4-1':               [5, 4, 1],
    '5-3-2 Blok':          [5, 3, 2],
    '4-4-2 Kontratak':     [4, 4, 2],
    'Niski Blok':          [5, 4, 1],
    '4-5-1 Defensywna':    [4, 5, 1],
    '3-6-1':               [3, 6, 1],
  };

  const TacticDiagram = ({ tactic, accent }: { tactic: string; accent: string }) => {
    const rows = FORMATION_MAP[tactic] || [4, 4, 2];
    const W = 80, H = 100;
    const gkY = 88;
    const topY = 10;
    const rowCount = rows.length;
    const rowStep = rowCount > 1 ? (gkY - 20 - topY) / (rowCount - 1) : 0;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect width={W} height={H} fill="#0f2d1a" rx="6" />
        <line x1="5" y1={H / 2} x2={W - 5} y2={H / 2} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
        <circle cx={W / 2} cy={gkY} r="4" fill="#facc15" />
        {rows.flatMap((count, rowIndex) => {
          const y = gkY - 20 - rowIndex * rowStep;
          const r = count >= 6 ? 2.5 : 3.5;
          return Array.from({ length: count }, (_, i) => (
            <circle key={`${rowIndex}-${i}`} cx={(W / (count + 1)) * (i + 1)} cy={y} r={r} fill={accent} fillOpacity="0.9" />
          ));
        })}
      </svg>
    );
  };

  const StatBar = ({ label, value }: { label: string, value: number }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  const clubLogoUrl = currentClub?.logoFile
    ? new URL(`../../Graphic/logo/${currentClub.logoFile}`, import.meta.url).href
    : null;
  const contractEnd = coach.contractEndDate ? new Date(coach.contractEndDate) : null;
  const contractEndLabel = contractEnd && !Number.isNaN(contractEnd.getTime())
    ? contractEnd.toLocaleDateString('pl-PL')
    : 'Brak danych';
  const annualSalaryLabel = typeof coach.annualSalary === 'number' && coach.annualSalary > 0
    ? `${coach.annualSalary.toLocaleString('pl-PL')} PLN / rok`
    : 'Brak danych';
  const expPointsLabel = (typeof coach.expPoints === 'number' ? coach.expPoints : 1).toLocaleString('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in font-black italic uppercase tracking-tighter" style={{ backgroundImage: "url('../Graphic/themes/trener.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/80" />
      <div className="max-w-4xl w-full bg-slate-900/20 backdrop-blur-sm rounded-[45px] border border-white/10 shadow-2xl flex overflow-hidden h-[700px] relative z-10">

        {/* Left Profile */}
        <div className="w-1/3 bg-black/20 p-10 flex flex-col items-center border-r border-white/5">
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-white/5 flex items-center justify-center text-5xl mb-6">👨‍💼</div>
          <h2 className="text-2xl text-white text-center">{coach.firstName} {coach.lastName}</h2>
          <span className="text-blue-500 mt-2 text-xs">{coach.nationalityFlag} • {coach.age} lat</span>

          <div className="mt-10 w-full p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-3">
            <span className="block text-[8px] text-slate-500 tracking-[0.3em] self-start">Obecny Klub</span>
            {clubLogoUrl
              ? <img src={clubLogoUrl} alt="" className="w-16 h-16 object-contain" />
              : <div className="w-16 h-16 flex items-center justify-center text-3xl">🏟️</div>
            }
            <span className="text-sm text-white text-center">{currentClub?.name || currentNT?.name || 'Bezrobotny'}</span>
          </div>

          <div className="mt-4 w-full p-5 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-3">
            <div>
              <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Kontrakt do</span>
              <span className="text-sm text-white">{contractEndLabel}</span>
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Pensja roczna</span>
              <span className="text-sm text-emerald-400">{annualSalaryLabel}</span>
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Punkty EXP</span>
              <span className="text-sm text-yellow-400">{expPointsLabel}</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo(previousViewState || ViewState.DASHBOARD)}
            className="mt-auto w-full py-4 bg-white text-black text-xs hover:scale-105 transition-all rounded-2xl tracking-[0.2em]"
          >
            Zamknij
          </button>
        </div>

        {/* Right Stats & History */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs text-yellow-500 tracking-[0.4em] mb-8">Atrybuty Trenerskie</h3>
          <div className="grid grid-cols-2 gap-x-10">
            <StatBar label="Doświadczenie" value={coach.attributes.experience} />
            <StatBar label="Motywacja" value={coach.attributes.motivation} />
            <StatBar label="Decyzyjność" value={coach.attributes.decisionMaking} />
            <StatBar label="Trening" value={coach.attributes.training} />
          </div>

          <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-6">Ulubione Taktyki</h3>
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { label: 'Ofensywna',  tactic: coach.favoriteTactics.offensive,  color: 'text-orange-400', accent: '#f97316' },
              { label: 'Neutralna',  tactic: coach.favoriteTactics.neutral,    color: 'text-blue-400',   accent: '#60a5fa' },
              { label: 'Defensywna', tactic: coach.favoriteTactics.defensive,  color: 'text-teal-400',   accent: '#2dd4bf' },
            ].map(({ label, tactic, color, accent }) => (
              <div key={label} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                <span className={`text-[9px] tracking-[0.3em] ${color}`}>{label}</span>
                <TacticDiagram tactic={tactic} accent={accent} />
                <span className="text-[10px] text-white text-center">{tactic}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-4">Historia Kariery</h3>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left py-2 px-3 text-slate-500 tracking-[0.2em] font-black">Od</th>
                  <th className="text-left py-2 px-3 text-slate-500 tracking-[0.2em] font-black">Klub</th>
                  <th className="text-center py-2 px-3 text-green-500 tracking-[0.2em] font-black">W</th>
                  <th className="text-center py-2 px-3 text-yellow-500 tracking-[0.2em] font-black">R</th>
                  <th className="text-center py-2 px-3 text-red-500 tracking-[0.2em] font-black">P</th>
                </tr>
              </thead>
              <tbody>
                {coach.history.map((h, i) => {
                  const matchingStats = (coach.seasonStats || []).filter(s =>
                    s.season >= h.fromYear && (h.toYear === null || s.season < h.toYear)
                  );
                  const totalW = matchingStats.reduce((acc, s) => acc + s.wins, 0);
                  const totalD = matchingStats.reduce((acc, s) => acc + s.draws, 0);
                  const totalL = matchingStats.reduce((acc, s) => acc + s.losses, 0);
                  const hasStats = matchingStats.length > 0;
                  return (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{h.fromMonth}/{h.fromYear}</td>
                      <td className="py-2 px-3 text-white">{h.clubName}</td>
                      <td className="py-2 px-3 text-center text-green-400">{hasStats ? totalW : '—'}</td>
                      <td className="py-2 px-3 text-center text-yellow-400">{hasStats ? totalD : '—'}</td>
                      <td className="py-2 px-3 text-center text-red-400">{hasStats ? totalL : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {coach.seasonStats && coach.seasonStats.length > 0 && (
            <>
              <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-4">Statystyki Sezonów</h3>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left py-2 px-3 text-slate-500 tracking-[0.2em] font-black">Sezon</th>
                      <th className="text-left py-2 px-3 text-slate-500 tracking-[0.2em] font-black">Liga</th>
                      <th className="text-center py-2 px-2 text-slate-500 tracking-[0.2em] font-black">#</th>
                      <th className="text-center py-2 px-2 text-green-500 tracking-[0.2em] font-black">W</th>
                      <th className="text-center py-2 px-2 text-yellow-500 tracking-[0.2em] font-black">R</th>
                      <th className="text-center py-2 px-2 text-red-500 tracking-[0.2em] font-black">P</th>
                      <th className="text-center py-2 px-2 text-slate-500 tracking-[0.2em] font-black">Bramki</th>
                      <th className="text-left py-2 px-3 text-amber-500 tracking-[0.2em] font-black">Puchar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...coach.seasonStats].reverse().map((s, i) => {
                      const gd = s.goalsFor - s.goalsAgainst;
                      const cupLabel: Record<string, string> = {
                        'WINNER':  '🏆 Zdobywca',
                        'FINAL':   'Finalista',
                        'SEMI':    '1/2 finału',
                        'QUARTER': '1/4 finału',
                        'R8':      '1/8 finału',
                        'R16':     '1/16',
                        'R32':     '1/32',
                        'R64':     '1/64',
                        'NONE':    '—',
                      };
                      const leagueLabel: Record<string, string> = {
                        'L_PL_1': 'Ekstraklasa',
                        'L_PL_2': '1. Liga',
                        'L_PL_3': '2. Liga',
                      };
                      return (
                        <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                          <td className="py-2 px-3 text-white whitespace-nowrap">{s.season}/{s.season + 1}</td>
                          <td className="py-2 px-3 text-slate-300">{leagueLabel[s.leagueId] || s.leagueId}</td>
                          <td className="py-2 px-2 text-center text-slate-400">#{s.finalRank}</td>
                          <td className="py-2 px-2 text-center text-green-400">{s.wins}</td>
                          <td className="py-2 px-2 text-center text-yellow-400">{s.draws}</td>
                          <td className="py-2 px-2 text-center text-red-400">{s.losses}</td>
                          <td className="py-2 px-2 text-center text-white whitespace-nowrap">{s.goalsFor}:{s.goalsAgainst} <span className={gd >= 0 ? 'text-green-400' : 'text-red-400'}>({gd >= 0 ? '+' : ''}{gd})</span></td>
                          <td className="py-2 px-3 text-amber-400">{cupLabel[s.cupReached]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
