import React from 'react';
import { Club, PlayerPosition } from '../../types';
import bojoPitch from '../../Graphic/themes/bojo.png';
import { TacticRepository } from '../../resources/tactics_db';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import {
  TeamAnalysisPlayerConcern,
  TeamAnalysisReport,
  TeamAnalysisSpecialist,
} from '../../services/TeamAnalysisService';
import { SportingDirectorService } from '../../services/SportingDirectorService';
import { getClubLogo } from '../../resources/ClubLogoAssets';

const POSITION_ORDER: PlayerPosition[] = [
  PlayerPosition.GK,
  PlayerPosition.DEF,
  PlayerPosition.MID,
  PlayerPosition.FWD,
];

const POSITION_TITLES: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'Bramkarze',
  [PlayerPosition.DEF]: 'Obrońcy',
  [PlayerPosition.MID]: 'Pomocnicy',
  [PlayerPosition.FWD]: 'Napastnicy',
};

const POSITION_ACCENTS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: '#facc15',
  [PlayerPosition.DEF]: '#3b82f6',
  [PlayerPosition.MID]: '#10b981',
  [PlayerPosition.FWD]: '#f43f5e',
};

const TeamAnalysisBackdrop: React.FC<{ club: Club }> = ({ club }) => {
  const logo = getClubLogo(club.id);
  const primary = club.colorsHex[0] ?? club.colorPrimary ?? '#2563eb';
  const secondary = club.colorsHex[1] ?? club.colorSecondary ?? '#0ea5e9';

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 980" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="teamAnalysisBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#071426" />
          <stop offset="0.52" stopColor="#030916" />
          <stop offset="1" stopColor="#081221" />
        </linearGradient>
        <linearGradient id="teamAnalysisClubBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={primary} stopOpacity="0" />
          <stop offset="0.42" stopColor={primary} stopOpacity="0.2" />
          <stop offset="0.75" stopColor={secondary} stopOpacity="0.13" />
          <stop offset="1" stopColor={secondary} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="teamAnalysisClubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={primary} stopOpacity="0.18" />
          <stop offset="1" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <pattern id="teamAnalysisGrid" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M38 0H0V38" fill="none" stroke="#7dd3fc" strokeOpacity="0.025" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1600" height="980" fill="url(#teamAnalysisBase)" />
      <ellipse cx="1240" cy="420" rx="520" ry="470" fill="url(#teamAnalysisClubGlow)" />
      <path d="M-200 820 L970 145 H1450 L280 820 Z" fill="url(#teamAnalysisClubBand)" opacity="0.5" />
      <path d="M100 980 L1390 300 H1710" fill="none" stroke={secondary} strokeOpacity="0.055" strokeWidth="105" />
      {logo && <image href={logo} x="1080" y="205" width="440" height="440" preserveAspectRatio="xMidYMid meet" opacity="0.055" />}
      <rect width="1600" height="980" fill="url(#teamAnalysisGrid)" />
    </svg>
  );
};

const OvalGauge: React.FC<{
  value: number;
  max: number;
  displayValue?: string;
  label: string;
  accent: string;
  compact?: boolean;
}> = ({ value, max, displayValue, label, accent, compact = false }) => {
  const percentage = Math.max(0, Math.min(100, max > 0 ? value / max * 100 : 0));

  return (
    <svg viewBox="0 0 124 76" className={compact ? 'h-[58px] w-[94px]' : 'h-[76px] w-[124px]'} role="img" aria-label={`${label}: ${displayValue ?? Math.round(value)}`}>
      <ellipse cx="62" cy="38" rx="50" ry="27" fill="rgba(2,8,23,0.86)" stroke="rgba(125,211,252,0.12)" strokeWidth="7" />
      <ellipse
        cx="62"
        cy="38"
        rx="50"
        ry="27"
        fill="none"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${percentage} 100`}
        transform="rotate(-180 62 38)"
        opacity="0.92"
      />
      <ellipse cx="62" cy="38" rx="40" ry="20" fill={accent} fillOpacity="0.055" />
      <text x="62" y="38" textAnchor="middle" fill="#ffffff" fontSize={compact ? '14' : '16'} className="font-black italic uppercase tracking-tighter">{displayValue ?? Math.round(value)}</text>
      <text x="62" y="52" textAnchor="middle" fill="#cbd5e1" fontSize="7" className="font-black italic uppercase tracking-tighter">{label}</text>
    </svg>
  );
};

const CoachCardChrome: React.FC<{ accent: string }> = ({ accent }) => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 460 150" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`coachCardGradient_${accent.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={accent} stopOpacity="0.13" />
        <stop offset="0.48" stopColor="#071221" stopOpacity="0" />
        <stop offset="1" stopColor={accent} stopOpacity="0.045" />
      </linearGradient>
    </defs>
    <path d="M0 0 H460 V46 C330 18 230 64 116 32 C72 20 34 17 0 22 Z" fill={`url(#coachCardGradient_${accent.replace('#', '')})`} />
    <path d="M318 150 C360 102 396 72 460 55 V150 Z" fill={accent} fillOpacity="0.035" />
    <path d="M1 35 Q1 1 35 1 H425 Q459 1 459 35" fill="none" stroke={accent} strokeOpacity="0.22" strokeWidth="1.2" />
  </svg>
);

const SpecialistCoachCard: React.FC<{
  entry: TeamAnalysisSpecialist;
  index: number;
  accent: string;
}> = ({ entry, index, accent }) => (
  <div className="analysis-coach-card relative min-h-[138px] overflow-hidden rounded-[22px] p-4">
    <CoachCardChrome accent={accent} />
    <div className="relative flex h-full items-start gap-3">
      <OvalGauge value={entry.score} max={100} displayValue={String(Math.round(entry.score))} label={`Wybór ${index + 1}`} accent={accent} compact />
      <div className="min-w-0 flex-1 pt-1">
        <div className="font-black italic uppercase tracking-tighter truncate text-[15px] text-white">{formatPlayerFullName(entry.player)}</div>
        <div className={`font-black italic uppercase tracking-tighter mt-1 text-[9px] ${PlayerPresentationService.getPositionColorClass(entry.player.position)}`}>
          {entry.player.position}
        </div>
        <p className="font-black italic uppercase tracking-tighter mt-3 text-[12px] leading-5 text-slate-200">{entry.reason}</p>
      </div>
    </div>
  </div>
);

const ConcernRows: React.FC<{
  entries: TeamAnalysisPlayerConcern[];
  emptyText: string;
  accent: string;
}> = ({ entries, emptyText, accent }) => (
  <div className="space-y-2">
    {entries.length === 0 ? (
      <div className="font-black italic uppercase tracking-tighter rounded-2xl bg-white/[0.025] px-4 py-3 text-[11px] leading-5 text-slate-300">
        {emptyText}
      </div>
    ) : entries.slice(0, 4).map(entry => (
      <div key={entry.player.id} className="analysis-card rounded-2xl px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-black italic uppercase tracking-tighter truncate text-[13px] text-white">
              {formatPlayerFullName(entry.player)}
            </div>
            <div className="font-black italic uppercase tracking-tighter mt-1 text-[9px]" style={{ color: accent }}>
              {entry.label}
            </div>
          </div>
          <div className="font-black italic uppercase tracking-tighter shrink-0 text-[15px] text-white">{entry.score}</div>
        </div>
        <p className="font-black italic uppercase tracking-tighter mt-2 text-[10px] leading-5 text-slate-200">{entry.detail}</p>
        <p className="font-black italic uppercase tracking-tighter mt-1 text-[9px] leading-4" style={{ color: accent }}>{entry.action}</p>
      </div>
    ))}
  </div>
);

export const TeamAnalysisModal: React.FC<{
  club: Club;
  report: TeamAnalysisReport;
  onClose: () => void;
  assistantName?: string;
}> = ({ club, report, onClose, assistantName }) => {
  const highlightedNames = getHighlightedNames(report);
  const directorPerspective = SportingDirectorService.getTeamAnalysisPerspective(club);
  const generatedLabel = new Date(report.generatedAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="team-analysis-modal fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-6 backdrop-blur-[3px]" onClick={onClose}>
      <div
        className="relative w-full max-w-[1600px] max-h-[92vh] overflow-hidden rounded-[40px] border border-cyan-300/15 bg-[#030916] shadow-[0_40px_120px_rgba(0,0,0,0.72),0_0_80px_rgba(14,165,233,0.08)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/*
          One club-aware SVG spans the entire report. Foreground panels remain dark
          enough for legibility, while the crest and colours unify the composition.
        */}
        <TeamAnalysisBackdrop club={club} />

        <div className="relative z-10 border-b border-cyan-200/10 bg-[#071224]/90 px-8 py-6">
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="font-black italic uppercase tracking-tighter text-[11px] text-cyan-300">Analiza drużyny</div>
              <h2 className="font-black italic uppercase tracking-tighter mt-2 text-4xl text-white">{club.name}</h2>
              <p className="font-black italic uppercase tracking-tighter mt-3 max-w-4xl text-[13px] leading-6 text-slate-200">
                Raport wygenerowany {generatedLabel}. {report.injuryRule}
              </p>
            </div>
            <button
              onClick={onClose}
              className="font-black italic uppercase tracking-tighter shrink-0 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.07] px-6 py-3 text-xs text-white transition-all hover:border-cyan-200/30 hover:bg-cyan-300/10"
            >
              Zamknij
            </button>
          </div>
        </div>

        <div className="custom-scrollbar relative z-10 max-h-[calc(92vh-110px)] space-y-6 overflow-y-auto p-8">
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: 'Zawodnicy', value: report.squadSize, max: 32, display: String(report.squadSize), accent: '#38bdf8' },
              { label: 'Średni OVR', value: report.squadAverageOverall, max: 99, display: report.squadAverageOverall.toFixed(1), accent: '#a78bfa' },
              { label: 'Technika', value: report.trainingAnalysis.teamTechniqueAverage, max: 99, display: report.trainingAnalysis.teamTechniqueAverage.toFixed(1), accent: '#f59e0b' },
              { label: 'Obsada XI', value: report.tacticalRecommendation.healthyPoolUsed, max: 11, display: `${report.tacticalRecommendation.healthyPoolUsed}/11`, accent: '#34d399' },
            ].map(metric => (
              <div key={metric.label} className="analysis-summary-card relative flex min-h-[102px] items-center justify-center overflow-hidden rounded-[26px] px-4">
                <CoachCardChrome accent={metric.accent} />
                <div className="relative flex items-center gap-4">
                  <OvalGauge value={metric.value} max={metric.max} displayValue={metric.display} label={metric.label} accent={metric.accent} />
                  <div className="hidden 2xl:block">
                    <p className="font-black italic uppercase tracking-tighter text-[10px] text-slate-300">Szybki odczyt</p>
                    <p className="font-black italic uppercase tracking-tighter mt-1 text-[12px] text-white">{metric.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/*
            The decision centre keeps the report actionable. Every statement is
            generated from squad evidence first and only then interpreted through
            the hired assistant's hidden, weekly-stable observation error.
          */}
          <section className="analysis-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="font-black italic uppercase tracking-tighter text-[10px] text-cyan-300">Centrum decyzji</div>
                <h3 className="font-black italic uppercase tracking-tighter mt-2 text-2xl text-white">Najważniejsze wnioski asystenta</h3>
              </div>
              <div className="font-black italic uppercase tracking-tighter text-right text-[10px] leading-5 text-slate-300">
                Raport tygodniowy<br />aktualizowany wraz z nowymi danymi
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {[
                { title: 'Mocne strony', items: report.executiveSummary.strengths, accent: '#34d399' },
                { title: 'Główne ryzyka', items: report.executiveSummary.risks, accent: '#fb7185' },
                { title: 'Zalecane działania', items: report.executiveSummary.actions, accent: '#38bdf8' },
              ].map(column => (
                <div key={column.title} className="analysis-card relative overflow-hidden rounded-[22px] p-5">
                  <CoachCardChrome accent={column.accent} />
                  <div className="relative">
                    <div className="font-black italic uppercase tracking-tighter text-[11px]" style={{ color: column.accent }}>{column.title}</div>
                    <div className="mt-4 space-y-3">
                      {column.items.map((item, index) => (
                        <div key={`${column.title}_${index}`} className="font-black italic uppercase tracking-tighter flex gap-3 text-[11px] leading-5 text-slate-100">
                          <span className="font-black italic uppercase tracking-tighter" style={{ color: column.accent }}>{String(index + 1).padStart(2, '0')}</span>
                          <span className="font-black italic uppercase tracking-tighter">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="analysis-panel rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black italic uppercase tracking-tighter text-[10px] text-emerald-300">Forma i dowody meczowe</div>
                  <h3 className="font-black italic uppercase tracking-tighter mt-2 text-xl text-white">Ostatnie {report.formAnalysis.sampleSize} spotkań</h3>
                </div>
                <OvalGauge
                  value={report.formAnalysis.pointsPerMatch}
                  max={3}
                  displayValue={report.formAnalysis.pointsPerMatch.toFixed(2)}
                  label="Pkt / mecz"
                  accent="#34d399"
                  compact
                />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Bilans', value: `${report.formAnalysis.wins}-${report.formAnalysis.draws}-${report.formAnalysis.losses}` },
                  { label: 'Bramki', value: `${report.formAnalysis.goalsFor}:${report.formAnalysis.goalsAgainst}` },
                  { label: 'Śr. ocena', value: report.formAnalysis.averageRating?.toFixed(2) ?? '—' },
                ].map(metric => (
                  <div key={metric.label} className="analysis-card rounded-2xl px-4 py-3 text-center">
                    <div className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">{metric.label}</div>
                    <div className="font-black italic uppercase tracking-tighter mt-1 text-lg text-white">{metric.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex min-h-[30px] items-center gap-2">
                {report.formAnalysis.recentForm.length === 0 ? (
                  <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-300">Forma pojawi się po pierwszym meczu.</span>
                ) : report.formAnalysis.recentForm.map((result, index) => (
                  <span
                    key={`${result}_${index}`}
                    className={`font-black italic uppercase tracking-tighter flex h-7 w-7 items-center justify-center rounded-lg text-[10px] text-white ${result === 'W' ? 'bg-emerald-500/80' : result === 'D' ? 'bg-amber-500/80' : 'bg-rose-500/80'}`}
                  >
                    {result === 'W' ? 'Z' : result === 'D' ? 'R' : 'P'}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {report.formAnalysis.insights.map((line, index) => (
                  <p key={index} className="font-black italic uppercase tracking-tighter text-[11px] leading-5 text-slate-200">• {line}</p>
                ))}
              </div>
              {report.formAnalysis.tacticRecords.length > 0 && (
                <div className="mt-5 border-t border-cyan-200/10 pt-4">
                  <div className="font-black italic uppercase tracking-tighter mb-3 text-[9px] text-slate-300">Wyniki według ustawienia</div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {report.formAnalysis.tacticRecords.slice(0, 4).map(record => (
                      <div key={record.tacticId} className="analysis-card flex items-center justify-between rounded-xl px-3 py-2">
                        <span className="font-black italic uppercase tracking-tighter truncate text-[10px] text-white">{record.tacticName}</span>
                        <span className="font-black italic uppercase tracking-tighter shrink-0 text-[10px] text-emerald-300">{record.wins}Z {record.draws}R {record.losses}P</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="analysis-panel rounded-[28px] p-6">
              <div>
                <div className="font-black italic uppercase tracking-tighter text-[10px] text-sky-300">Model gry zespołu</div>
                <h3 className="font-black italic uppercase tracking-tighter mt-2 text-xl text-white">Instrukcje i dopasowanie kadry</h3>
                <p className="font-black italic uppercase tracking-tighter mt-1 text-[10px] text-slate-300">Aktualnie: {report.tacticalProfile.currentTacticName}</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Pressing', value: report.tacticalProfile.pressingFit, accent: '#38bdf8' },
                  { label: 'Kontratak', value: report.tacticalProfile.counterAttackFit, accent: '#a78bfa' },
                  { label: 'Wysoka linia', value: report.tacticalProfile.highLineFit, accent: '#f59e0b' },
                ].map(metric => (
                  <div key={metric.label} className="analysis-card flex items-center justify-center rounded-[22px] py-2">
                    <OvalGauge value={metric.value} max={99} displayValue={String(metric.value)} label={metric.label} accent={metric.accent} compact />
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {report.tacticalProfile.notes.map((note, index) => (
                  <div key={index} className="analysis-card rounded-2xl px-4 py-3">
                    <p className="font-black italic uppercase tracking-tighter text-[11px] leading-5 text-slate-100">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-panel rounded-[28px] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-black italic uppercase tracking-tighter text-[10px] text-amber-300">Gotowość meczowa</div>
                  <h3 className="font-black italic uppercase tracking-tighter mt-2 text-xl text-white">Kondycja, urazy i rotacja</h3>
                </div>
                <div className="font-black italic uppercase tracking-tighter text-right text-[10px] leading-5 text-slate-200">
                  {report.readinessAnalysis.ready} gotowych<br />{report.readinessAnalysis.unavailable} niedostępnych
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="analysis-card rounded-2xl p-3 text-center">
                  <div className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">Średnia kondycja</div>
                  <div className="font-black italic uppercase tracking-tighter mt-1 text-xl text-emerald-300">{report.readinessAnalysis.averageCondition}%</div>
                </div>
                <div className="analysis-card rounded-2xl p-3 text-center">
                  <div className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">Dług zmęczenia</div>
                  <div className="font-black italic uppercase tracking-tighter mt-1 text-xl text-amber-300">{report.readinessAnalysis.averageFatigueDebt}</div>
                </div>
              </div>
              <ConcernRows entries={report.readinessAnalysis.concerns} emptyText="Kadra nie zgłasza obecnie pilnego ryzyka obciążeniowego." accent="#fbbf24" />
            </div>

            <div className="analysis-panel rounded-[28px] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-black italic uppercase tracking-tighter text-[10px] text-rose-300">Szatnia i aklimatyzacja</div>
                  <h3 className="font-black italic uppercase tracking-tighter mt-2 text-xl text-white">Relacje, role i zadowolenie</h3>
                </div>
                <div className="font-black italic uppercase tracking-tighter text-right text-[10px] leading-5 text-slate-200">
                  Morale {report.dressingRoomAnalysis.averageMorale}/100<br />Aklimatyzacja {report.dressingRoomAnalysis.averageAdaptation}/100
                </div>
              </div>
              <ConcernRows entries={report.dressingRoomAnalysis.concerns} emptyText="Nie widać obecnie poważnego napięcia w szatni." accent="#fb7185" />
            </div>
          </section>

          <section className="analysis-panel rounded-[28px] p-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.72fr_1.28fr]">
              <div>
                <div className="font-black italic uppercase tracking-tighter text-[10px] text-violet-300">Rozwój i trening</div>
                <h3 className="font-black italic uppercase tracking-tighter mt-2 text-xl text-white">Skuteczność planu treningowego</h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Aktywny plan', value: report.developmentAnalysis.activeTrainingName },
                    { label: 'Intensywność', value: report.developmentAnalysis.intensityLabel },
                    { label: 'Rozwijających się', value: String(report.developmentAnalysis.improvingPlayers) },
                    { label: 'Śr. rozwój', value: String(report.developmentAnalysis.averageGrowth) },
                  ].map(metric => (
                    <div key={metric.label} className="analysis-card rounded-2xl p-4">
                      <div className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">{metric.label}</div>
                      <div className="font-black italic uppercase tracking-tighter mt-2 text-[13px] leading-5 text-white">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {report.developmentAnalysis.summary.map((line, index) => (
                    <p key={index} className="font-black italic uppercase tracking-tighter text-[10px] leading-5 text-slate-200">• {line}</p>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-black italic uppercase tracking-tighter mb-4 text-[10px] text-slate-200">Indywidualne plany wymagające korekty</div>
                <ConcernRows entries={report.developmentAnalysis.focusMismatches} emptyText="Indywidualne cele i obciążenia są obecnie zgodne z potrzebami zawodników." accent="#c4b5fd" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
            <div className="analysis-panel rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Raport sztabu</div>
                  <h3 className="text-2xl font-black italic text-white mt-2">ANALIZA ASYSTENTA</h3>
                  <p className="text-xs text-slate-500 mt-1">{assistantName ? `${assistantName} • ` : ''}Raport sporządzony na podstawie dostępnych danych.</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
                  Raport
                </div>
              </div>
              <div className="space-y-4 text-[15px] leading-8 text-slate-200">
                {report.commentary.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-slate-200">
                    {renderHighlightedParagraph(paragraph, highlightedNames)}
                  </p>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Analiza Techniki I Treningu</div>
                <div className="space-y-3 text-[15px] leading-7 text-slate-200">
                  {report.trainingAnalysis.summary.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="analysis-panel rounded-[28px] p-6">
                <div className="font-black italic uppercase tracking-tighter mb-4 text-[10px] text-slate-300">Dostępna kadra do taktyki</div>
                <div className="grid grid-cols-2 gap-3">
                  {POSITION_ORDER.map(position => (
                    <div key={position} className="analysis-card relative flex min-h-[92px] items-center justify-center overflow-hidden rounded-[22px] px-3">
                      <CoachCardChrome accent={POSITION_ACCENTS[position]} />
                      <div className="relative">
                        <OvalGauge
                          value={report.availableCounts[position]}
                          max={Math.max(1, report.squadSize)}
                          displayValue={String(report.availableCounts[position])}
                          label={POSITION_TITLES[position]}
                          accent={POSITION_ACCENTS[position]}
                          compact
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-panel rounded-[28px] p-6">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Rekomendowane Ustawienie</div>
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-3xl font-black italic text-white">{report.tacticalRecommendation.tacticName}</h3>
                    <p className="text-sm text-slate-400 mt-2">Najlepsze ustawienie przy obecnej kadrze</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Obsadzone pozycje</div>
                    <div className="text-2xl font-black text-emerald-400">{report.tacticalRecommendation.healthyPoolUsed}/11</div>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  {report.tacticalRecommendation.reasons.map((reason, index) => (
                    <div key={index} className="text-sm text-slate-300">• {reason}</div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 overflow-hidden">
                  {report.tacticalRecommendation.projectedXI.map((slot) => (
                    <div
                      key={slot.slotIndex}
                      className={`flex items-center justify-between gap-4 px-4 py-3 border-b border-white/8 last:border-b-0 ${getProjectedSlotRowClass(slot.role)}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`text-[10px] font-black uppercase tracking-[0.25em] ${PlayerPresentationService.getPositionColorClass(slot.role)}`}>
                          {slot.role}
                        </div>
                        <div className="text-[15px] font-medium italic text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
                          {slot.player ? formatPlayerFullName(slot.player) : 'Brak obsady'}
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] text-slate-500">
                        {slot.player ? `OVR ${slot.player.overallRating}` : 'Brak pełnej obsady'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {directorPerspective && (
            <section className="analysis-panel rounded-[28px] p-6 shadow-[inset_4px_0_0_rgba(245,158,11,0.45)]">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Punkt Widzenia Dyrektora</div>
                  <h3 className="text-2xl font-black italic text-white mt-2">Polityka Sportowa Klubu</h3>
                </div>
              </div>
              <p className="text-[15px] leading-7 text-slate-200">{directorPerspective.summary}</p>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5">
                {[
                  { title: 'Chronieni', items: directorPerspective.protected },
                  { title: 'Do rozwoju', items: directorPerspective.development },
                  { title: 'Do sprzedaży', items: directorPerspective.sales },
                ].map(section => (
                  <div key={section.title} className="analysis-card rounded-2xl p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 mb-3">{section.title}</div>
                    <div className="space-y-2 text-sm text-slate-300">
                      {section.items.length === 0 ? (
                        <p>Brak jednoznacznych wskazań.</p>
                      ) : section.items.map(item => (
                        <div key={item.playerId}>
                          <div className="font-black text-white">{item.playerName}</div>
                          <div className="text-xs text-slate-400">{item.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {[
              { title: 'Rzuty karne', entries: report.assistantLeaders.penalties, accent: '#f59e0b', countLabel: 'Wybory' },
              { title: 'Rzuty wolne', entries: report.assistantLeaders.freeKicks, accent: '#38bdf8', countLabel: 'Wybory' },
              { title: 'Kandydaci na kapitana', entries: report.assistantLeaders.captains, accent: '#34d399', countLabel: 'Kandydaci' },
            ].map(group => (
              <div key={group.title} className="analysis-panel rounded-[28px] p-5">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="font-black italic uppercase tracking-tighter text-[9px]" style={{ color: group.accent }}>Karta rekomendacji sztabu</p>
                    <h3 className="font-black italic uppercase tracking-tighter mt-1 text-[17px] text-white">{group.title}</h3>
                  </div>
                  <OvalGauge value={group.entries.length} max={Math.max(3, group.entries.length)} displayValue={`${group.entries.length}`} label={group.countLabel} accent={group.accent} compact />
                </div>
                <div className="space-y-3">
                  {group.entries.map((entry, index) => (
                    <SpecialistCoachCard key={`${group.title}_${entry.player.id}`} entry={entry} index={index} accent={group.accent} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="analysis-panel rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rozmowa z analitykiem</div>
                <h3 className="text-2xl font-black italic text-white mt-2">Rekomendacje dotyczące zawodników</h3>
                <p className="text-xs text-slate-500 mt-1">W tej sekcji analityk mówi, co warto zrobić z konkretnymi zawodnikami i dlaczego.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {report.analystNotes.map((note) => (
                <div key={note.id} className="analysis-card relative overflow-hidden rounded-2xl p-5">
                  <CoachCardChrome accent="#60a5fa" />
                  <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white font-black italic text-xl">{note.title}</div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-blue-300 mt-1">{note.actionLabel}</div>
                    </div>
                    <div className={`text-[11px] font-black ${PlayerPresentationService.getPositionColorClass(note.player.position)}`}>{note.player.position}</div>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-200">{note.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="analysis-panel rounded-[28px] p-6 xl:col-span-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Mocne i Ważne Ogniwa</div>
              <div className="space-y-4">
                {report.keyPlayers.map((entry) => (
                  <div key={entry.player.id} className="analysis-card rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-black italic text-lg">{formatPlayerFullName(entry.player)}</div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{entry.label}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[11px] font-black ${PlayerPresentationService.getPositionColorClass(entry.player.position)}`}>{entry.player.position}</div>
                        <div className="text-xl font-black text-white">{entry.player.overallRating}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      {entry.reasons.map((reason, index) => <div key={index}>• {reason}</div>)}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Status: {entry.availabilityNote}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-panel rounded-[28px] p-6 xl:col-span-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Zawodnicy, którzy powinni odejść</div>
              <div className="space-y-4">
                {report.exitCandidates.length === 0 && report.exitCandidatesNote ? (
                  <div className="analysis-card rounded-2xl p-4 text-[15px] leading-7 text-slate-200">
                    {report.exitCandidatesNote}
                  </div>
                ) : report.exitCandidates.map((entry) => (
                  <div key={entry.player.id} className="analysis-card rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-black italic text-lg">{formatPlayerLabel(entry.player)}</div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400">{entry.actionLabel}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Prawd.</div>
                        <div className="text-2xl font-black text-amber-300">{entry.probability}%</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      {entry.reasons.map((reason, index) => <div key={index}>• {reason}</div>)}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">{entry.squadNote}</div>
                  </div>
                ))}
              </div>
            </div>

            {report.contractCases.length > 0 && (
              <div className="analysis-panel rounded-[28px] p-6 xl:col-span-1">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Sprawy Kontraktowe</div>
                <div className="space-y-4">
                  {report.contractCases.map((entry) => (
                    <div key={entry.player.id} className="analysis-card rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white font-black italic text-lg">{formatPlayerLabel(entry.player)}</div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-sky-300">{entry.actionLabel}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Pilność</div>
                          <div className="text-2xl font-black text-sky-200">{entry.urgency}%</div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-slate-300">
                        {entry.reasons.map((reason, index) => <div key={index}>• {reason}</div>)}
                      </div>
                      <div className="mt-3 text-xs text-slate-500">{entry.contractNote}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="analysis-panel rounded-[28px] p-6 xl:col-span-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Talenty Pod Opiekę</div>
              <div className="space-y-4">
                {report.talents.map((entry) => (
                  <div key={entry.player.id} className="analysis-card rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-black italic text-lg">{formatPlayerLabel(entry.player)}</div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-400">Plan rozwoju</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Talent</div>
                        <div className="text-2xl font-black text-emerald-300">{entry.player.attributes.talent}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-blue-300 font-bold">{entry.developmentPath}</div>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      {entry.reasons.map((reason, index) => <div key={index}>• {reason}</div>)}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">{entry.warning}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="analysis-panel rounded-[28px] p-6 xl:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Alternatywne Systemy</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.alternativeTactics.map((option) => (
                  <div key={option.tacticId} className="analysis-card rounded-2xl p-4">
                    <div className="text-white font-black italic text-xl">{option.tacticName}</div>
                    <div className="text-sm text-slate-400 mt-1">Opcja rezerwowa</div>
                    <div className="mt-4">
                      <MiniTacticPreview tacticId={option.tacticId} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-300">
                      {option.reasons.slice(0, 2).map((reason, index) => <div key={index}>• {reason}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-panel rounded-[28px] p-6 xl:col-span-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">RAPORT POSZCZEGÓLNYCH POZYCJI</div>
              <div className="space-y-3">
                {POSITION_ORDER.map((position) => {
                  const assessment = getLineAssessment(position, report);

                  return (
                    <div key={position} className="analysis-card grid min-h-[126px] grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-4 py-3">
                      <div>
                        <div className={`font-black italic uppercase tracking-tighter text-[10px] ${PlayerPresentationService.getPositionColorClass(position)}`}>{POSITION_TITLES[position]}</div>
                        <div className={`font-black italic uppercase tracking-tighter mt-2 text-[15px] ${assessment.textClass}`}>{assessment.label}</div>
                        <div className="font-black italic uppercase tracking-tighter mt-3 text-[11px] leading-5 text-slate-200">{assessment.detail}</div>
                      </div>
                      <OvalGauge value={assessment.score} max={100} displayValue={`${assessment.score}`} label="Ocena" accent={POSITION_ACCENTS[position]} compact />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        /*
         * The modal keeps its original 1600px / 92vh envelope. These scoped rules
         * soften legacy white utility borders and replace the condensed italic face
         * without changing layout measurements or hiding any report content.
         */
        .team-analysis-modal,
        .team-analysis-modal * {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-style: normal !important;
          letter-spacing: 0.01em !important;
        }
        .team-analysis-modal .analysis-panel {
          border: 1px solid rgba(56, 189, 248, 0.11);
          background: linear-gradient(145deg, rgba(8, 20, 38, 0.94), rgba(3, 10, 24, 0.9));
          box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.035), 0 18px 48px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(12px);
        }
        .team-analysis-modal .analysis-card {
          border: 1px solid rgba(125, 211, 252, 0.085);
          background: linear-gradient(135deg, rgba(4, 13, 29, 0.9), rgba(9, 24, 43, 0.72));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }
        .team-analysis-modal .analysis-summary-card {
          border: 1px solid rgba(125, 211, 252, 0.1);
          background: linear-gradient(135deg, rgba(7, 19, 37, 0.94), rgba(3, 10, 24, 0.88));
          box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.04), 0 14px 34px rgba(0, 0, 0, 0.2);
        }
        .team-analysis-modal .analysis-coach-card {
          border: 1px solid rgba(125, 211, 252, 0.09);
          background: linear-gradient(145deg, rgba(4, 12, 27, 0.96), rgba(8, 21, 38, 0.88));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025), 0 12px 30px rgba(0, 0, 0, 0.2);
        }
        .team-analysis-modal [class*="border-white/"] {
          border-color: rgba(125, 211, 252, 0.11) !important;
        }
        .team-analysis-modal .text-slate-500,
        .team-analysis-modal .text-slate-400 {
          color: #cbd5e1 !important;
        }
        .team-analysis-modal .text-slate-300 {
          color: #e2e8f0 !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.24); border-radius: 999px; }
      `}</style>
    </div>
  );
};

const formatPlayerFullName = (player: { firstName: string; lastName: string }) =>
  `${player.firstName} ${player.lastName}`;

const MiniTacticPreview: React.FC<{ tacticId: string }> = ({ tacticId }) => {
  const tactic = TacticRepository.getById(tacticId);

  if (!tactic) return null;

  const slotLayouts = getMiniSlotLayouts(tactic.slots);

  return (
    <div className="relative h-48 rounded-[24px] border border-emerald-500/25 shadow-inner overflow-hidden bg-slate-950/50">
      <img
        src={bojoPitch}
        alt="Boisko"
        className="absolute inset-0 h-full w-full object-contain object-bottom"
      />
      <div className="absolute inset-0 bg-slate-950/5" />

      {tactic.slots.map((slot) => (
        <div
          key={`${tactic.id}_${slot.index}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={slotLayouts[slot.index]}
        >
          <div className={`flex h-[18px] w-[18px] min-h-[18px] min-w-[18px] max-h-[18px] max-w-[18px] flex-none items-center justify-center overflow-hidden rounded-full border border-white/60 bg-slate-950/85 ${getMiniRoleRingClass(slot.role)}`} />
        </div>
      ))}
    </div>
  );
};

const formatPlayerLabel = (player: { firstName: string; lastName: string; age: number; position: PlayerPosition }) =>
  `${formatPlayerFullName(player)} • ${player.position} • ${player.age} l.`;

const getHighlightedNames = (report: TeamAnalysisReport): string[] => {
  const names = [
    ...report.keyPlayers.map(entry => formatPlayerFullName(entry.player)),
    ...report.exitCandidates.map(entry => formatPlayerFullName(entry.player)),
    ...report.contractCases.map(entry => formatPlayerFullName(entry.player)),
    ...report.talents.map(entry => formatPlayerFullName(entry.player)),
    ...report.analystNotes.map(entry => formatPlayerFullName(entry.player)),
    ...report.assistantLeaders.penalties.map(entry => formatPlayerFullName(entry.player)),
    ...report.assistantLeaders.freeKicks.map(entry => formatPlayerFullName(entry.player)),
    ...report.assistantLeaders.captains.map(entry => formatPlayerFullName(entry.player)),
  ];

  return [...new Set(names)].sort((a, b) => b.length - a.length);
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedParagraph = (paragraph: string, names: string[]) => {
  if (names.length === 0) return paragraph;

  const regex = new RegExp(`(${names.map(escapeRegExp).join('|')})`, 'g');
  const parts = paragraph.split(regex);

  return parts.map((part, index) =>
    names.includes(part)
      ? <span key={`${part}_${index}`} className="font-black text-amber-300">{part}</span>
      : <React.Fragment key={`${part}_${index}`}>{part}</React.Fragment>
  );
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const getRecentAverageRating = (player: { stats: { ratingHistory?: number[] } }): number | null => {
  const recent = player.stats.ratingHistory?.slice(-5) ?? [];
  return recent.length > 0 ? average(recent) : null;
};

const normalizeOverall = (value: number): number => clamp(((value - 50) / 30) * 100, 0, 100);
const normalizeForm = (value: number): number => clamp(((value - 5.8) / 1.7) * 100, 0, 100);

const getLineAssessment = (position: PlayerPosition, report: TeamAnalysisReport): {
  score: number;
  label: string;
  detail: string;
  textClass: string;
} => {
  const lineSlots = report.tacticalRecommendation.projectedXI.filter(slot => slot.role === position);
  const linePlayers = lineSlots.map(slot => slot.player).filter(Boolean);
  const filledCount = linePlayers.length;
  const totalSlots = lineSlots.length;
  const fillRate = totalSlots === 0 ? 0 : filledCount / totalSlots;
  const avgOverall = average(linePlayers.map(player => player!.overallRating));
  const avgCondition = average(linePlayers.map(player => player!.condition));
  const avgForm = average(linePlayers.map(player => getRecentAverageRating(player!) ?? 6.3));

  const score = Math.round(clamp(
    normalizeOverall(avgOverall) * 0.5 +
    normalizeForm(avgForm) * 0.23 +
    avgCondition * 0.12 +
    fillRate * 100 * 0.15 -
    (totalSlots - filledCount) * 12,
    0,
    100
  ));

  const lineName = position === PlayerPosition.GK
    ? 'Bramka'
    : position === PlayerPosition.DEF
      ? 'Obrona'
      : position === PlayerPosition.MID
        ? 'Pomoc'
        : 'Atak';

  let label = `${lineName} wygląda przeciętnie.`;
  let textClass = 'text-amber-300';

  if (score >= 78) {
    label = `${lineName} wygląda bardzo dobrze.`;
    textClass = 'text-emerald-300';
  } else if (score >= 64) {
    label = `${lineName} wygląda solidnie.`;
    textClass = 'text-lime-300';
  } else if (score >= 50) {
    label = `${lineName} wygląda przeciętnie.`;
    textClass = 'text-amber-300';
  } else {
    label = `${lineName} wymaga poprawy.`;
    textClass = 'text-red-300';
  }

  const detail = totalSlots === 0
    ? 'Ta linia nie jest używana w obecnym ustawieniu.'
    : `Obsada ${filledCount}/${totalSlots}, średni OVR ${avgOverall.toFixed(1)}, forma ${avgForm.toFixed(1)}, kondycja ${Math.round(avgCondition)}%.`;

  return { score, label, detail, textClass };
};

const getMiniRoleRingClass = (position: PlayerPosition): string => {
  switch (position) {
    case PlayerPosition.GK:
      return 'shadow-[0_0_0_1px_rgba(250,204,21,0.45)]';
    case PlayerPosition.DEF:
      return 'shadow-[0_0_0_1px_rgba(59,130,246,0.45)]';
    case PlayerPosition.MID:
      return 'shadow-[0_0_0_1px_rgba(34,197,94,0.45)]';
    case PlayerPosition.FWD:
      return 'shadow-[0_0_0_1px_rgba(239,68,68,0.45)]';
    default:
      return '';
  }
};

const getProjectedSlotRowClass = (position: PlayerPosition): string => {
  switch (position) {
    case PlayerPosition.GK:
      return 'bg-yellow-400/10';
    case PlayerPosition.DEF:
      return 'bg-blue-500/10';
    case PlayerPosition.MID:
      return 'bg-emerald-500/10';
    case PlayerPosition.FWD:
      return 'bg-red-500/10';
    default:
      return 'bg-white/5';
  }
};

const getMiniSlotLayouts = (
  slots: Array<{ index: number; x: number; y: number }>
): Record<number, React.CSSProperties> => {
  const groupedRows = new Map<number, Array<{ index: number; x: number; y: number }>>();

  slots.forEach((slot) => {
    const rowKey = Math.round(slot.y * 100);
    const row = groupedRows.get(rowKey) ?? [];
    row.push(slot);
    groupedRows.set(rowKey, row);
  });

  const layout: Record<number, React.CSSProperties> = {};

  groupedRows.forEach((rowSlots) => {
    const sortedRow = [...rowSlots].sort((leftSlot, rightSlot) => leftSlot.x - rightSlot.x);

    sortedRow.forEach((slot, orderIndex) => {
      const rowCenterOffset = orderIndex - (sortedRow.length - 1) / 2;
      const horizontalOffset = rowCenterOffset * 12;
      const perspectiveWidth = 0.76 - slot.y * 0.16;
      const normalizedX = 0.5 + (slot.x - 0.5) * perspectiveWidth;
      const spreadX = clamp(normalizedX, 0.16, 0.84);
      const shiftedY = clamp(8 + slot.y * 48, 18, 72);
      const goalkeeperOffset = slot.y >= 0.9 ? 40 : 0;
      const defenseOffset = slot.y >= 0.7 && slot.y < 0.9 ? 20 : 0;
      const midfieldOffset = slot.y > 0.25 && slot.y < 0.7 ? -15 : 0;
      const forwardOffset = slot.y <= 0.25 ? -40 : 0;

      layout[slot.index] = {
        left: `calc(${(spreadX * 100).toFixed(2)}% + ${horizontalOffset}px)`,
        top: `calc(${shiftedY}% + ${20 + goalkeeperOffset + defenseOffset + midfieldOffset + forwardOffset}px)`,
      };
    });
  });

  return layout;
};
