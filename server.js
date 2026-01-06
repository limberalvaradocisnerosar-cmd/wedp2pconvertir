/**
 * Servidor local simple para desarrollo
 * Alternativa si no tienes Vercel CLI instalado
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

// Verificar que las variables se cargaron (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('📋 Variables de entorno cargadas:');
  console.log('  API_RUN_URL:', process.env.API_RUN_URL ? '✅ Configurado' : '❌ No configurado');
  console.log('  CRON_TOKEN:', process.env.CRON_TOKEN ? '✅ Configurado' : '❌ No configurado');
}

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
      // Llamar realmente a la API externa
      const apiRunUrl = process.env.API_RUN_URL;
      const cronToken = process.env.CRON_TOKEN;
      
      if (!apiRunUrl || !cronToken) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'API_RUN_URL o CRON_TOKEN no configurados en .env.local'
        }));
        return;
      }
      
      try {
        console.log('🔔 Wakeup llamado:');
        console.log('  URL:', apiRunUrl);
        console.log('  Token presente:', cronToken ? 'Sí' : 'No');
        console.log('  Token (primeros 10 chars):', cronToken ? cronToken.substring(0, 10) + '...' : 'N/A');
        
        // Hacer la llamada real al Proyecto 1
        const response = await fetch(apiRunUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-token': cronToken
          }
        });
        
        console.log('  Status:', response.status);
        console.log('  Headers recibidos:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('  Respuesta:', data);
        
        res.writeHead(response.status, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
        
      } catch (error) {
        console.error('❌ Error en wakeup:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Wakeup failed',
          message: error.message
        }));
      }
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

