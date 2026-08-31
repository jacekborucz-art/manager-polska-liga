import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Definicja __dirname dla modułów ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACTIONS_DIR = path.resolve(__dirname, 'services/match/engines/v2/actions');

/**
 * Dev-server-only endpoint the match action editor posts to. It never runs
 * outside `npm run dev` (configureServer is only invoked by `vite serve`,
 * never by `vite build`), so recorded actions only ever land on disk when
 * whoever is authoring them is running the app locally — never for a player
 * of the shipped build.
 */
const matchActionEditorSavePlugin = (): Plugin => ({
  name: 'match-action-editor-save',
  configureServer(server) {
    server.middlewares.use('/__match-action-editor/save', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end();
        return;
      }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const recording = JSON.parse(body);
          const id = String(recording?.id ?? '');
          const outcome = String(recording?.outcome ?? '');
          if (!id || !outcome || !/^[A-Za-z0-9_-]+$/.test(id) || !/^[A-Z_]+$/.test(outcome)) {
            throw new Error('Nieprawidłowe id/outcome zapisywanej akcji.');
          }
          const dir = path.join(ACTIONS_DIR, outcome);
          fs.mkdirSync(dir, { recursive: true });
          const filePath = path.join(dir, `${id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(recording, null, 2), 'utf-8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
        }
      });
    });
  },
});

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), ...(command === 'serve' ? [matchActionEditorSavePlugin()] : [])],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
