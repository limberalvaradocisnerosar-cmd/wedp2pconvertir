/**
 * Cliente de Supabase para leer precios
 * Motor puro, sin lógica extra
 */
import { createClient } from '@supabase/supabase-js';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

