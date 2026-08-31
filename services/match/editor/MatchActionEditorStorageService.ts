import type { MatchActionRecording } from './MatchActionEditorTypes';

const SAVE_ENDPOINT = '/__match-action-editor/save';

// Vite resolves this glob eagerly at build/dev time relative to this file.
// Every JSON file the dev-server save endpoint writes under
// services/match/engines/v2/actions/** is picked up automatically — no
// hand-written index/registry to keep in sync.
const savedModules = import.meta.glob<MatchActionRecording>('../engines/v2/actions/**/*.json', {
  eager: true,
  import: 'default',
});

export const MatchActionEditorStorageService = {
  /**
   * Writes the recording to services/match/engines/v2/actions/<outcome>/<id>.json
   * via the dev-only Vite middleware (see vite.config.ts). Only meaningful
   * while running `npm run dev` — the middleware never exists in a
   * production build, so this rejects outside import.meta.env.DEV.
   */
  save: async (recording: MatchActionRecording): Promise<void> => {
    if (!import.meta.env.DEV) {
      throw new Error('Zapis akcji działa tylko w trybie deweloperskim (npm run dev).');
    }
    const response = await fetch(SAVE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recording),
    });
    if (!response.ok) {
      throw new Error(`Zapis akcji nie powiódł się (${response.status}).`);
    }
  },

  /** All actions already saved to disk, freshest first. */
  listSaved: (): MatchActionRecording[] =>
    Object.values(savedModules).sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
};
