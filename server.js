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

// Cargar variables de entorno desde .env.local (si existe)
dotenv.config({ path: '.env.local' });

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

// Cooldown: timestamp de la última llamada exitosa
let lastCallTime = 0;
const COOLDOWN_MS = 60000; // 60 segundos

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
    // Endpoint de configuración pública
    if (req.url === '/api/config' && req.method === 'GET') {
      const config = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || ''
      };
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(config));
      return;
    }
    
    if (req.url === '/api/wakeup' && req.method === 'POST') {
      // Verificar cooldown
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (timeSinceLastCall < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastCall) / 1000);
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          status: 'cooldown',
          message: `Espera ${remainingSeconds} segundos antes de actualizar nuevamente`,
          remainingSeconds
        }));
        return;
      }
      
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
        // Hacer la llamada real al Proyecto 1
        const response = await fetch(apiRunUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cronToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        // Actualizar timestamp solo si la llamada fue exitosa
        if (response.ok) {
          lastCallTime = now;
        }
        
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
  console.log(` Servidor local corriendo en http://localhost:${PORT}`);
  console.log(` Sirviendo archivos desde: ${__dirname}`);
});

