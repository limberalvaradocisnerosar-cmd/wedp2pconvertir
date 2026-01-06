/**
 * Servidor local simple para desarrollo
 * Alternativa si no tienes Vercel CLI instalado
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createReadStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3001;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
  // Manejar favicon
  if (req.url === '/favicon.ico') {
    const faviconPath = join(__dirname, 'public', 'favicon.ico');
    if (existsSync(faviconPath)) {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      createReadStream(faviconPath).pipe(res);
      return;
    } else {
      // Si no existe, responder 204 (No Content) para evitar 404
      res.writeHead(204);
      res.end();
      return;
    }
  }
  
  // Manejar ruta raíz
  if (req.url === '/') {
    req.url = '/frontend/index.html';
  }
  
  let filePath = join(__dirname, req.url);
  
  // Manejar API routes
  if (req.url.startsWith('/api/')) {
    if (req.url === '/api/wakeup' && req.method === 'POST') {
      // Simular respuesta de API
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'executed',
        message: 'Wakeup successful (local simulation)'
      }));
      return;
    }
  }
  
  // Servir archivos estáticos
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';
  
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor local corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});

