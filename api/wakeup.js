/**
 * API endpoint para despertar el Proyecto 1 (api-binance)
 * Server-side: el CRON_TOKEN nunca se expone al cliente
 */
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
        'Content-Type': 'application/json',
        'x-cron-token': cronToken
      }
    });

    const data = await response.json();
    
    // Retornar la respuesta del Proyecto 1
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error en wakeup:', error);
    res.status(500).json({ error: 'Wakeup failed' });
  }
}

