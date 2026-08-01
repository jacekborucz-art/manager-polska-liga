/**
 * PerfProfilerService — narzędzie diagnostyczne (tymczasowe).
 * Automatycznie mierzy czas wykonania metod zarejestrowanych serwisów,
 * żeby namierzyć realne wąskie gardło w advanceDay bez zgadywania.
 *
 * Użycie (patrz rejestracja w GameContext.tsx):
 *   window.showPerfReport()   -> podsumowanie w konsoli (posortowane wg łącznego czasu)
 *   window.resetPerfReport()  -> wyczyść zebrane dane
 */

type PerfEntry = { label: string; ms: number };

const entries: PerfEntry[] = [];

function wrapMethod(target: any, key: string, label: string) {
  const original = target[key];
  if (typeof original !== 'function' || original.__perfWrapped) return;

  const wrapped: any = function (this: any, ...args: any[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    entries.push({ label, ms: performance.now() - start });
    return result;
  };
  wrapped.__perfWrapped = true;

  try {
    target[key] = wrapped;
  } catch {
    // Niektóre eksporty mogą być nienadpisywalne (np. zamrożone obiekty) — pomijamy bezpiecznie.
  }
}

export const PerfProfilerService = {
  instrument(target: any, name: string) {
    if (!target || (typeof target !== 'object' && typeof target !== 'function')) return;
    Object.keys(target).forEach(key => {
      try {
        wrapMethod(target, key, `${name}.${key}`);
      } catch {
        // pomiń pojedynczą metodę, nie przerywaj reszty
      }
    });
  },

  reset: () => {
    entries.length = 0;
  },

  report: () => {
    const totals = new Map<string, { count: number; totalMs: number; maxMs: number }>();
    entries.forEach(e => {
      const cur = totals.get(e.label) ?? { count: 0, totalMs: 0, maxMs: 0 };
      cur.count += 1;
      cur.totalMs += e.ms;
      cur.maxMs = Math.max(cur.maxMs, e.ms);
      totals.set(e.label, cur);
    });
    return [...totals.entries()]
      .map(([label, s]) => ({ label, ...s, avgMs: s.totalMs / s.count }))
      .sort((a, b) => b.totalMs - a.totalMs);
  },

  print: (top = 25) => {
    const rows = PerfProfilerService.report().slice(0, top);
    console.log(`=== [PERF REPORT] Top ${rows.length} wg łącznego czasu ===`);
    rows.forEach(r => {
      console.log(
        `${r.label}  |  total: ${r.totalMs.toFixed(1)}ms  |  wywołania: ${r.count}  |  śr: ${r.avgMs.toFixed(2)}ms  |  max: ${r.maxMs.toFixed(1)}ms`
      );
    });
  },

  download: (filename = 'fm_perf_report.txt') => {
    const rows = PerfProfilerService.report();
    const lines = [
      `=== PERF REPORT ===`,
      `Wygenerowano: ${new Date().toISOString()}`,
      `Liczba zmierzonych wywołań: ${entries.length}`,
      '─'.repeat(60),
      ...rows.map(r =>
        `${r.label}\ttotal=${r.totalMs.toFixed(1)}ms\twywolania=${r.count}\tsr=${r.avgMs.toFixed(2)}ms\tmax=${r.maxMs.toFixed(1)}ms`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

(window as any).showPerfReport = (top?: number) => PerfProfilerService.print(top);
(window as any).resetPerfReport = () => PerfProfilerService.reset();
(window as any).downloadPerfReport = (filename?: string) => PerfProfilerService.download(filename);
