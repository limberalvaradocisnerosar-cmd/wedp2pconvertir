/**
 * Cliente de Supabase para leer precios
 * Compatible con navegador (window) y Vercel (process.env)
 */
import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno desde múltiples fuentes
function getEnvVar(key) {
  // 1. Desde window (configuración manual o inyectada)
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  // 2. Desde import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  // 3. Desde process.env (Next.js, Node.js)
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
  throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

