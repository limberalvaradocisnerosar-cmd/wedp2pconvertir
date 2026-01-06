/**
 * API endpoint para exponer variables de entorno al frontend
 * Vercel Serverless Function
 * Solo expone variables con prefijo NEXT_PUBLIC_ o VITE_
 */
export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Obtener variables de entorno con prefijos públicos
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_API_RUN_URL: process.env.NEXT_PUBLIC_API_RUN_URL || '',
    NEXT_PUBLIC_CROM_TOKEN: process.env.NEXT_PUBLIC_CROM_TOKEN || '',
    // También soportar VITE_ para compatibilidad
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    VITE_API_RUN_URL: process.env.VITE_API_RUN_URL || '',
    VITE_CROM_TOKEN: process.env.VITE_CROM_TOKEN || ''
  };

  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json(env);
}

