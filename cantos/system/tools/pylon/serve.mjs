#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse CLI arguments
const args = process.argv.slice(2);
let rootDir = process.cwd();
let port = 3000;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root' && args[i + 1]) {
    rootDir = args[i + 1];
    i++;
  }
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  }
}

// Resolve to absolute path
rootDir = path.resolve(rootDir);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Strip query string (cache-bust params like ?v=20260605) and decode
  // percent-encoding (e.g. %20) so URLs map to real files on disk.
  let urlPath = req.url.split('?')[0].split('#')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch { /* keep raw on malformed input */ }
  let filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);

  // Prevent directory traversal
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Try to serve index.html for directory requests
      if (urlPath.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
        fs.stat(filePath, (err) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            serveFile(filePath, res);
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (err) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          serveFile(filePath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Serving files from: ${rootDir}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${port} is already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});
