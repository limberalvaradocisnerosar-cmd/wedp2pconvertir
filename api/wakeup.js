/**
 * API endpoint para despertar el Proyecto 1 (api-binance)
 * Server-side: el CRON_TOKEN nunca se expone al cliente
 * Cooldown: 1 llamada real cada 60 segundos
 */

// Cooldown: timestamp de la última llamada exitosa
let lastCallTime = 0;
const COOLDOWN_MS = 60000; // 60 segundos

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar cooldown
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastCall) / 1000);
      return res.status(200).json({ 
        status: 'cooldown',
        message: `Espera ${remainingSeconds} segundos antes de actualizar nuevamente`,
        remainingSeconds
      });
    }

    // Leer variables de entorno (server-side, no expuestas al cliente)
    const apiRunUrl = process.env.API_RUN_URL;
    const cronToken = process.env.CRON_TOKEN;

    if (!apiRunUrl || !cronToken) {
      return res.status(500).json({ 
        error: 'API_RUN_URL o CRON_TOKEN no configurados' 
      });
    }

    // Llamar al Proyecto 1 con el token en headers
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
    
    // Retornar la respuesta del Proyecto 1
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error en wakeup:', error);
    res.status(500).json({ error: 'Wakeup failed' });
  }
}

