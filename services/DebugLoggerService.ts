/**
 * DebugLoggerService
 * Zbiera logi w pamięci i zapisuje je do pliku .txt automatycznie.
 * Wywołaj DebugLoggerService.download() lub window.downloadDebugLogs() z konsoli.
 *
 * Po ręcznym włączeniu każdy wpis jest też zapisywany do localStorage
 * (LIVE_KEY), więc przeżywa twardy crash karty (Out of Memory). Przy starcie
 * nowej sesji to, co zostało w LIVE_KEY po poprzedniej, jest zamrażane pod
 * PREV_KEY i dostępne przez window.downloadCrashLog().
 *
 * Logowanie jest domyślnie WYŁĄCZONE. Skrót Ctrl+Alt+D przełącza je na czas
 * bieżącej sesji przeglądarki.
 */

interface LogEntry {
  ts: string;
  tag: string;
  msg: string;
  stack?: string;
  heapUsedMB?: number;
  heapTotalMB?: number;
  heapLimitMB?: number;
}

const LIVE_KEY = 'fm_debug_log_live';
const PREV_KEY = 'fm_debug_log_prev_session';
const SESSION_ENABLED_KEY = 'fm_debug_log_enabled_session';
const MAX_PERSISTED_ENTRIES = 1500;

const entries: LogEntry[] = [];
let sessionStart = new Date().toISOString();

/**
 * PERFORMANCE SAFETY:
 * Debug logging is intentionally disabled by default. localStorage is a
 * synchronous browser API and the crash-safe logger serializes the retained
 * entries before every write. Keeping that path active during normal gameplay
 * would add diagnostic work to every simulated day. The setting lives only in
 * sessionStorage, so enabling diagnostics survives a page reload needed to
 * reproduce a crash, but a new browser session always starts with logging off.
 */
let loggingEnabled = (() => {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
})();

const formatStack = (stack: string | undefined): string | undefined => {
  if (!stack) return undefined;
  // Usuń pierwszą linię (Error) i zostaw tylko 4 kolejne
  return stack.split('\n').slice(1, 5).map(l => l.trim()).join(' | ');
};

const readMemory = (): Pick<LogEntry, 'heapUsedMB' | 'heapTotalMB' | 'heapLimitMB'> => {
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  if (!mem) return {};
  return {
    heapUsedMB: Math.round(mem.usedJSHeapSize / 1_048_576),
    heapTotalMB: Math.round(mem.totalJSHeapSize / 1_048_576),
    heapLimitMB: Math.round(mem.jsHeapSizeLimit / 1_048_576),
  };
};

const persistLive = () => {
  if (!loggingEnabled) return;
  try {
    const trimmed = entries.length > MAX_PERSISTED_ENTRIES
      ? entries.slice(entries.length - MAX_PERSISTED_ENTRIES)
      : entries;
    localStorage.setItem(LIVE_KEY, JSON.stringify({ sessionStart, entries: trimmed }));
  } catch {
    // Diagnostyka nigdy nie może wywrócić pętli gry (np. localStorage pełny).
  }
};

const showLoggingStateNotice = (enabled: boolean) => {
  if (typeof document === 'undefined') return;

  const noticeId = 'fm-debug-logging-state';
  document.getElementById(noticeId)?.remove();

  const notice = document.createElement('div');
  notice.id = noticeId;
  notice.className = 'font-black italic uppercase tracking-tighter';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.textContent = enabled
    ? 'Diagnostyka włączona — Ctrl+Alt+D wyłącza'
    : 'Diagnostyka wyłączona — Ctrl+Alt+D włącza';
  Object.assign(notice.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    zIndex: '2147483647',
    padding: '14px 18px',
    color: '#f8fafc',
    background: enabled ? 'rgba(6, 78, 59, 0.97)' : 'rgba(15, 23, 42, 0.97)',
    border: `1px solid ${enabled ? 'rgba(52, 211, 153, 0.75)' : 'rgba(148, 163, 184, 0.55)'}`,
    boxShadow: '0 18px 48px rgba(0, 0, 0, 0.55)',
    fontSize: '13px',
    lineHeight: '1.2',
    pointerEvents: 'none',
  });
  document.body.appendChild(notice);
  window.setTimeout(() => notice.remove(), 2600);
};

const formatEntries = (header: string[], list: LogEntry[]): string => [
  ...header,
  '═'.repeat(60),
  '',
  ...list.map(e =>
    e.tag === '---'
      ? e.msg
      : `[${e.ts}] [${e.tag}] ${e.msg}` +
        (e.heapUsedMB !== undefined ? ` | HEAP: ${e.heapUsedMB}/${e.heapTotalMB}MB (limit ${e.heapLimitMB}MB)` : '') +
        (e.stack ? `\n  SKĄD: ${e.stack}` : '')
  ),
].join('\n');

const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`[DebugLogger] Plik zapisany: ${filename}`);
};

export const DebugLoggerService = {
  isEnabled: () => loggingEnabled,

  setEnabled: (enabled: boolean) => {
    if (loggingEnabled === enabled) {
      showLoggingStateNotice(enabled);
      return enabled;
    }

    if (!enabled) {
      // Persist the final marker while logging is still active. Once the flag
      // flips, every logging method becomes a zero-cost early return.
      entries.push({
        ts: new Date().toISOString().substring(11, 23),
        tag: 'DEBUG',
        msg: 'Diagnostyka została wyłączona skrótem Ctrl+Alt+D.',
      });
      persistLive();
    }

    loggingEnabled = enabled;
    try {
      sessionStorage.setItem(SESSION_ENABLED_KEY, enabled ? '1' : '0');
    } catch {
      // Brak sessionStorage nie może blokować gry ani samej diagnostyki.
    }

    if (enabled) {
      entries.length = 0;
      sessionStart = new Date().toISOString();
      entries.push({
        ts: new Date().toISOString().substring(11, 23),
        tag: 'DEBUG',
        msg: 'Diagnostyka została włączona skrótem Ctrl+Alt+D.',
      });
      persistLive();
    }

    showLoggingStateNotice(enabled);
    console.info(`[DebugLogger] Diagnostyka ${enabled ? 'włączona' : 'wyłączona'}. Skrót: Ctrl+Alt+D.`);
    return enabled;
  },

  toggle: () => DebugLoggerService.setEnabled(!loggingEnabled),

  reset: () => {
    entries.length = 0;
    sessionStart = new Date().toISOString();
    persistLive();
    console.log('[DebugLogger] Reset – nowa sesja');
  },

  log: (tag: string, msg: string, withStack = false) => {
    if (!loggingEnabled) return;
    const ts = new Date().toISOString().substring(11, 23);
    const stack = withStack ? formatStack(new Error().stack) : undefined;
    entries.push({ ts, tag, msg, stack });
    persistLive();
    // Nadal wypisuj do konsoli
    console.log(`[${ts}] [${tag}] ${msg}${stack ? ` | STACK: ${stack}` : ''}`);
  },

  /**
   * Jak log(), ale dodatkowo zapisuje bieżące zużycie pamięci JS (Chrome/Brave:
   * performance.memory). Używać w podejrzanych o wyciek miejscach — po
   * przeładowaniu karty po crashu window.downloadCrashLog() pokaże dokładnie,
   * przy którym checkpoincie i jakim zużyciu pamięci gra przestała odpowiadać.
   */
  checkpoint: (tag: string, msg: string) => {
    if (!loggingEnabled) return;
    const ts = new Date().toISOString().substring(11, 23);
    entries.push({ ts, tag, msg, ...readMemory() });
    persistLive();
  },

  separator: (label: string) => {
    if (!loggingEnabled) return;
    const line = `${'─'.repeat(20)} ${label} ${'─'.repeat(20)}`;
    entries.push({ ts: '', tag: '---', msg: line });
    persistLive();
    console.log(`%c${line}`, 'color: #94a3b8');
  },

  download: (filename?: string) => {
    if (entries.length === 0) {
      console.warn('[DebugLogger] Brak logów do zapisania');
      return;
    }
    downloadText(
      formatEntries([
        `=== DEBUG LOG SESJI ===`,
        `Start: ${sessionStart}`,
        `Export: ${new Date().toISOString()}`,
        `Liczba wpisów: ${entries.length}`,
      ], entries),
      filename || `debug_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
    );
  },

  /**
   * Log z SESJI SPRZED przeładowania karty — czyli dokładnie ten, który był
   * budowany w momencie crasha "Out of Memory". Wywołaj window.downloadCrashLog()
   * w konsoli zaraz po ponownym wczytaniu gry.
   */
  downloadCrashLog: (filename?: string) => {
    let parsed: { sessionStart?: string; entries?: LogEntry[] } | null = null;
    try {
      const raw = localStorage.getItem(PREV_KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    if (!parsed?.entries?.length) {
      console.warn('[DebugLogger] Brak zapisanego logu z poprzedniej (crashującej) sesji.');
      return;
    }
    downloadText(
      formatEntries([
        `=== LOG SESJI SPRZED CRASHA ===`,
        `Start poprzedniej sesji: ${parsed.sessionStart ?? '?'}`,
        `Export: ${new Date().toISOString()}`,
        `Liczba wpisów: ${parsed.entries.length}`,
      ], parsed.entries),
      filename || `crash_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
    );
  },

  getAll: () => [...entries],
  count: () => entries.length,
};

// Przy starcie nowego procesu przeglądarki to, co zostało w LIVE_KEY, pochodzi
// z sesji, która nie zdążyła się poprawnie zakończyć (np. crash) — zamroź je
// pod PREV_KEY, zanim zacznie się nadpisywać nową, bieżącą sesją.
try {
  const leftoverLive = localStorage.getItem(LIVE_KEY);
  if (leftoverLive) {
    localStorage.setItem(PREV_KEY, leftoverLive);
    localStorage.removeItem(LIVE_KEY);
  }
} catch {
  // ignore
}

// Eksponuj globalnie – możesz wywołać window.downloadDebugLogs() z konsoli przeglądarki
(window as any).downloadDebugLogs = () => DebugLoggerService.download();
(window as any).downloadCrashLog = () => DebugLoggerService.downloadCrashLog();
(window as any).debugLogs = DebugLoggerService;
(window as any).toggleDebugLogging = () => DebugLoggerService.toggle();
(window as any).setDebugLogging = (enabled: boolean) => DebugLoggerService.setEnabled(enabled);
(window as any).isDebugLoggingEnabled = () => DebugLoggerService.isEnabled();

// Register once so Vite hot reload cannot stack multiple shortcut handlers.
if (!(window as any).__fmDebugLoggingShortcutRegistered) {
  (window as any).__fmDebugLoggingShortcutRegistered = true;
  window.addEventListener('keydown', event => {
    if (event.repeat || !event.ctrlKey || !event.altKey || event.code !== 'KeyD') return;
    event.preventDefault();
    DebugLoggerService.toggle();
  });
}
