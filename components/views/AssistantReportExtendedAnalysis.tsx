import React from 'react';
import { PlayerReport } from '../../services/TrainingAssistantService';

interface AssistantReportExtendedAnalysisProps {
  report: PlayerReport;
  className?: string;
}

const scoreTone = (score: number): { border: string; text: string; bar: string } => {
  if (score >= 75) return { border: 'border-emerald-400/20', text: 'text-emerald-300', bar: 'bg-emerald-400' };
  if (score >= 50) return { border: 'border-sky-400/20', text: 'text-sky-300', bar: 'bg-sky-400' };
  if (score >= 35) return { border: 'border-amber-400/20', text: 'text-amber-300', bar: 'bg-amber-400' };
  return { border: 'border-rose-400/20', text: 'text-rose-300', bar: 'bg-rose-400' };
};

// Both Squad and Training render this exact component. Keeping the advanced
// analysis in one place prevents the two assistant reports from drifting again
// when another data source or recommendation rule is added in the future.
export const AssistantReportExtendedAnalysis: React.FC<AssistantReportExtendedAnalysisProps> = ({ report, className = '' }) => {
  const sections = [
    { title: 'Forma sportowa', data: report.formAnalysis },
    { title: 'Gotowość do gry', data: report.readinessAnalysis },
    { title: 'Zachowanie na boisku', data: report.matchBehavior },
    { title: 'Aklimatyzacja', data: report.adaptationAnalysis },
  ];

  return (
    <section className={`relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/65 p-4 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.055] via-transparent to-violet-500/[0.045] pointer-events-none" />
      <div className="relative flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="font-black italic uppercase tracking-tighter text-[12px] text-cyan-300">Pełna analiza asystenta</h3>
          <p className="font-black italic uppercase tracking-tighter mt-1 text-[10px] leading-relaxed text-slate-400">Forma, zachowanie, gotowość, aklimatyzacja i plan dalszej kariery</p>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-950/30 px-3 py-2 text-right">
          <span className="font-black italic uppercase tracking-tighter block text-[8px] text-slate-500">Pewność analizy</span>
          <strong className="font-black italic uppercase tracking-tighter block text-[12px] text-violet-300">{report.analysisMeta.confidenceLabel}</strong>
          <span className="font-black italic uppercase tracking-tighter block text-[8px] text-slate-500">RNG ±{report.analysisMeta.uncertaintyPercent}%</span>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sections.map(section => {
          const tone = scoreTone(section.data.score);
          return (
            <article key={section.title} className={`rounded-xl border bg-black/30 p-3 ${tone.border}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-black italic uppercase tracking-tighter block text-[8px] text-slate-500">{section.title}</span>
                  <strong className={`font-black italic uppercase tracking-tighter mt-1 block text-[12px] ${tone.text}`}>{section.data.label}</strong>
                </div>
                <strong className={`font-black italic uppercase tracking-tighter text-xl ${tone.text}`}>{section.data.score}</strong>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${section.data.score}%` }} />
              </div>
              <p className="font-black italic uppercase tracking-tighter mt-2 text-[9px] leading-relaxed text-slate-300">{section.data.assessment}</p>
              <p className="font-black italic uppercase tracking-tighter mt-2 border-t border-white/5 pt-2 text-[9px] leading-relaxed text-emerald-300">{section.data.recommendation}</p>
            </article>
          );
        })}
      </div>

      <div className="relative mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3">
          <span className="font-black italic uppercase tracking-tighter block text-[8px] text-amber-400/70">Decyzja dotycząca kariery</span>
          <strong className="font-black italic uppercase tracking-tighter mt-1 block text-[15px] text-amber-300">{report.careerPlan.decision}</strong>
          <span className="font-black italic uppercase tracking-tighter mt-1 block text-[9px] text-slate-400">Horyzont: {report.careerPlan.horizon}</span>
          <p className="font-black italic uppercase tracking-tighter mt-2 text-[9px] leading-relaxed text-slate-300">{report.careerPlan.assessment}</p>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/15 p-3">
          <span className="font-black italic uppercase tracking-tighter block text-[8px] text-emerald-400/70">Plan działania</span>
          <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-3">
            {report.careerPlan.nextSteps.map((step, index) => (
              <div key={`${step}-${index}`} className="flex gap-2 rounded-lg border border-white/5 bg-black/25 p-2">
                <span className="font-black italic uppercase tracking-tighter flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[9px] text-emerald-300">{index + 1}</span>
                <p className="font-black italic uppercase tracking-tighter text-[9px] leading-relaxed text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="font-black italic uppercase tracking-tighter relative mt-3 text-[8px] leading-relaxed text-slate-500">{report.analysisMeta.note}</p>
    </section>
  );
};
