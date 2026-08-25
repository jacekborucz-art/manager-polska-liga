var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// services/DebugLoggerService.ts
var DebugLoggerService_exports = {};
__export(DebugLoggerService_exports, {
  DebugLoggerService: () => DebugLoggerService
});
module.exports = __toCommonJS(DebugLoggerService_exports);
var LIVE_KEY = "fm_debug_log_live";
var PREV_KEY = "fm_debug_log_prev_session";
var SESSION_ENABLED_KEY = "fm_debug_log_enabled_session";
var MAX_PERSISTED_ENTRIES = 1500;
var entries = [];
var sessionStart = (/* @__PURE__ */ new Date()).toISOString();
var loggingEnabled = (() => {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_ENABLED_KEY) === "1";
  } catch {
    return false;
  }
})();
var formatStack = (stack) => {
  if (!stack) return void 0;
  return stack.split("\n").slice(1, 5).map((l) => l.trim()).join(" | ");
};
var readMemory = () => {
  const mem = performance.memory;
  if (!mem) return {};
  return {
    heapUsedMB: Math.round(mem.usedJSHeapSize / 1048576),
    heapTotalMB: Math.round(mem.totalJSHeapSize / 1048576),
    heapLimitMB: Math.round(mem.jsHeapSizeLimit / 1048576)
  };
};
var persistLive = () => {
  if (!loggingEnabled) return;
  try {
    const trimmed = entries.length > MAX_PERSISTED_ENTRIES ? entries.slice(entries.length - MAX_PERSISTED_ENTRIES) : entries;
    localStorage.setItem(LIVE_KEY, JSON.stringify({ sessionStart, entries: trimmed }));
  } catch {
  }
};
var showLoggingStateNotice = (enabled) => {
  if (typeof document === "undefined") return;
  const noticeId = "fm-debug-logging-state";
  document.getElementById(noticeId)?.remove();
  const notice = document.createElement("div");
  notice.id = noticeId;
  notice.className = "font-black italic uppercase tracking-tighter";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  notice.textContent = enabled ? "Diagnostyka w\u0142\u0105czona \u2014 Ctrl+Alt+D wy\u0142\u0105cza" : "Diagnostyka wy\u0142\u0105czona \u2014 Ctrl+Alt+D w\u0142\u0105cza";
  Object.assign(notice.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "2147483647",
    padding: "14px 18px",
    color: "#f8fafc",
    background: enabled ? "rgba(6, 78, 59, 0.97)" : "rgba(15, 23, 42, 0.97)",
    border: `1px solid ${enabled ? "rgba(52, 211, 153, 0.75)" : "rgba(148, 163, 184, 0.55)"}`,
    boxShadow: "0 18px 48px rgba(0, 0, 0, 0.55)",
    fontSize: "13px",
    lineHeight: "1.2",
    pointerEvents: "none"
  });
  document.body.appendChild(notice);
  window.setTimeout(() => notice.remove(), 2600);
};
var formatEntries = (header, list) => [
  ...header,
  "\u2550".repeat(60),
  "",
  ...list.map(
    (e) => e.tag === "---" ? e.msg : `[${e.ts}] [${e.tag}] ${e.msg}` + (e.heapUsedMB !== void 0 ? ` | HEAP: ${e.heapUsedMB}/${e.heapTotalMB}MB (limit ${e.heapLimitMB}MB)` : "") + (e.stack ? `
  SK\u0104D: ${e.stack}` : "")
  )
].join("\n");
var downloadText = (text, filename) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`[DebugLogger] Plik zapisany: ${filename}`);
};
var DebugLoggerService = {
  isEnabled: () => loggingEnabled,
  setEnabled: (enabled) => {
    if (loggingEnabled === enabled) {
      showLoggingStateNotice(enabled);
      return enabled;
    }
    if (!enabled) {
      entries.push({
        ts: (/* @__PURE__ */ new Date()).toISOString().substring(11, 23),
        tag: "DEBUG",
        msg: "Diagnostyka zosta\u0142a wy\u0142\u0105czona skr\xF3tem Ctrl+Alt+D."
      });
      persistLive();
    }
    loggingEnabled = enabled;
    try {
      sessionStorage.setItem(SESSION_ENABLED_KEY, enabled ? "1" : "0");
    } catch {
    }
    if (enabled) {
      entries.length = 0;
      sessionStart = (/* @__PURE__ */ new Date()).toISOString();
      entries.push({
        ts: (/* @__PURE__ */ new Date()).toISOString().substring(11, 23),
        tag: "DEBUG",
        msg: "Diagnostyka zosta\u0142a w\u0142\u0105czona skr\xF3tem Ctrl+Alt+D."
      });
      persistLive();
    }
    showLoggingStateNotice(enabled);
    console.info(`[DebugLogger] Diagnostyka ${enabled ? "w\u0142\u0105czona" : "wy\u0142\u0105czona"}. Skr\xF3t: Ctrl+Alt+D.`);
    return enabled;
  },
  toggle: () => DebugLoggerService.setEnabled(!loggingEnabled),
  reset: () => {
    entries.length = 0;
    sessionStart = (/* @__PURE__ */ new Date()).toISOString();
    persistLive();
    console.log("[DebugLogger] Reset \u2013 nowa sesja");
  },
  log: (tag, msg, withStack = false) => {
    if (!loggingEnabled) return;
    const ts = (/* @__PURE__ */ new Date()).toISOString().substring(11, 23);
    const stack = withStack ? formatStack(new Error().stack) : void 0;
    entries.push({ ts, tag, msg, stack });
    persistLive();
    console.log(`[${ts}] [${tag}] ${msg}${stack ? ` | STACK: ${stack}` : ""}`);
  },
  /**
   * Jak log(), ale dodatkowo zapisuje bieżące zużycie pamięci JS (Chrome/Brave:
   * performance.memory). Używać w podejrzanych o wyciek miejscach — po
   * przeładowaniu karty po crashu window.downloadCrashLog() pokaże dokładnie,
   * przy którym checkpoincie i jakim zużyciu pamięci gra przestała odpowiadać.
   */
  checkpoint: (tag, msg) => {
    if (!loggingEnabled) return;
    const ts = (/* @__PURE__ */ new Date()).toISOString().substring(11, 23);
    entries.push({ ts, tag, msg, ...readMemory() });
    persistLive();
  },
  separator: (label) => {
    if (!loggingEnabled) return;
    const line = `${"\u2500".repeat(20)} ${label} ${"\u2500".repeat(20)}`;
    entries.push({ ts: "", tag: "---", msg: line });
    persistLive();
    console.log(`%c${line}`, "color: #94a3b8");
  },
  download: (filename) => {
    if (entries.length === 0) {
      console.warn("[DebugLogger] Brak log\xF3w do zapisania");
      return;
    }
    downloadText(
      formatEntries([
        `=== DEBUG LOG SESJI ===`,
        `Start: ${sessionStart}`,
        `Export: ${(/* @__PURE__ */ new Date()).toISOString()}`,
        `Liczba wpis\xF3w: ${entries.length}`
      ], entries),
      filename || `debug_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.txt`
    );
  },
  /**
   * Log z SESJI SPRZED przeładowania karty — czyli dokładnie ten, który był
   * budowany w momencie crasha "Out of Memory". Wywołaj window.downloadCrashLog()
   * w konsoli zaraz po ponownym wczytaniu gry.
   */
  downloadCrashLog: (filename) => {
    let parsed = null;
    try {
      const raw = localStorage.getItem(PREV_KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    if (!parsed?.entries?.length) {
      console.warn("[DebugLogger] Brak zapisanego logu z poprzedniej (crashuj\u0105cej) sesji.");
      return;
    }
    downloadText(
      formatEntries([
        `=== LOG SESJI SPRZED CRASHA ===`,
        `Start poprzedniej sesji: ${parsed.sessionStart ?? "?"}`,
        `Export: ${(/* @__PURE__ */ new Date()).toISOString()}`,
        `Liczba wpis\xF3w: ${parsed.entries.length}`
      ], parsed.entries),
      filename || `crash_log_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.txt`
    );
  },
  getAll: () => [...entries],
  count: () => entries.length
};
try {
  const leftoverLive = localStorage.getItem(LIVE_KEY);
  if (leftoverLive) {
    localStorage.setItem(PREV_KEY, leftoverLive);
    localStorage.removeItem(LIVE_KEY);
  }
} catch {
}
window.downloadDebugLogs = () => DebugLoggerService.download();
window.downloadCrashLog = () => DebugLoggerService.downloadCrashLog();
window.debugLogs = DebugLoggerService;
window.toggleDebugLogging = () => DebugLoggerService.toggle();
window.setDebugLogging = (enabled) => DebugLoggerService.setEnabled(enabled);
window.isDebugLoggingEnabled = () => DebugLoggerService.isEnabled();
if (!window.__fmDebugLoggingShortcutRegistered) {
  window.__fmDebugLoggingShortcutRegistered = true;
  window.addEventListener("keydown", (event) => {
    if (event.repeat || !event.ctrlKey || !event.altKey || event.code !== "KeyD") return;
    event.preventDefault();
    DebugLoggerService.toggle();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DebugLoggerService
});
