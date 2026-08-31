import React from 'react';
import ReactDOM from 'react-dom/client';
import { MatchActionEditorView } from './components/match/editor/MatchActionEditorView';

// Standalone entry point — deliberately does NOT import App/GameProvider.
// The action editor only needs read-only game resources (formations, player
// position enum, the V2 engine's pitch-projection helpers), never a running
// game session, so it boots independently of the game and is not reachable
// through it. editor.html is not part of the default Vite build entry
// (only index.html is), so this never ships in a production build.
const rootElement = document.getElementById('editor-root');
if (!rootElement) {
  throw new Error('Could not find editor-root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MatchActionEditorView />
  </React.StrictMode>
);
