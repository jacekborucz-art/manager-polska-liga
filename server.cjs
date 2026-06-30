const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const preferredPort = Number(process.argv[2] || process.env.FM_PORT || 4173);
const host = '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const requested = path.normalize(path.join(root, cleanPath || 'index.html'));
  if (!requested.startsWith(root)) return null;
  return requested;
}

function createServer() {
  return http.createServer((req, res) => {
    if (!fs.existsSync(root)) {
      send(res, 500, 'Brak folderu dist. Uruchom najpierw npm run build.');
      return;
    }

    const filePath = resolveFile(req.url || '/');
    if (!filePath) {
      send(res, 403, 'Forbidden');
      return;
    }

    const candidate = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
      ? filePath
      : path.join(root, 'index.html');

    fs.readFile(candidate, (error, data) => {
      if (error) {
        send(res, 404, 'Not found');
        return;
      }
      const ext = path.extname(candidate).toLowerCase();
      send(res, 200, data, mimeTypes[ext] || 'application/octet-stream');
    });
  });
}

function listen(port) {
  const server = createServer();
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} jest juz zajety. Zamknij inny lokalny serwer albo zmien FM_PORT w START_GRY.bat.`);
      process.exit(1);
      return;
    }
    console.error(error);
    process.exit(1);
  });
  server.listen(port, host, () => {
    console.log(`FM_LOCAL_URL=http://${host}:${port}`);
    console.log('Serwer gry dziala. Zamknij to okno, aby zakonczyc.');
  });
}

listen(preferredPort);
