


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
    
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseClient;
    } catch (e) {
      
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



export const supabase = {
  async from(table) {
    const client = await getSupabaseClient();
    return client.from(table);
  }
};

