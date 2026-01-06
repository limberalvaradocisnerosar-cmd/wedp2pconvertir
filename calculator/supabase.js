/**
 * Cliente de Supabase para leer precios
 * Motor puro, sin lógica extra
 * Compatible con navegador usando CDN
 */

// Obtener variables de entorno (compatible con navegador y servidor)
function getEnvVar(key) {
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
                    getEnvVar('VITE_SUPABASE_URL');
                    
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                        getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar configurados');
}

// Crear cliente de Supabase usando CDN (compatible con navegador)
let supabaseClient = null;
let clientPromise = null;

async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  if (clientPromise) {
    return clientPromise;
  }
  
  clientPromise = (async () => {
    // Intentar import desde CDN (navegador)
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseClient;
    } catch (e) {
      // Si falla CDN, intentar import local (si está instalado)
      try {
        const { createClient } = await import('@supabase/supabase-js');
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
      } catch (err) {
        throw new Error('No se pudo cargar Supabase client');
      }
    }
  })();
  
  return clientPromise;
}

// Exportar cliente con método from que funciona async
export const supabase = {
  from(table) {
    return {
      async select(columns) {
        const client = await getSupabaseClient();
        return client.from(table).select(columns);
      }
    };
  }
};

