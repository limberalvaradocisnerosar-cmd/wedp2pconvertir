


let lastCallTime = 0;
const COOLDOWN_MS = 60000; 

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    
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

    
    const apiRunUrl = process.env.API_RUN_URL;
    const cronToken = process.env.CRON_TOKEN;

    if (!apiRunUrl || !cronToken) {
      return res.status(500).json({ 
        error: 'API_RUN_URL o CRON_TOKEN no configurados' 
      });
    }

    
    const response = await fetch(apiRunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    
    if (response.ok) {
      lastCallTime = now;
    }
    
    
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error en wakeup:', error);
    res.status(500).json({ error: 'Wakeup failed' });
  }
}

