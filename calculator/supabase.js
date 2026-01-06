/**
 * Módulo para leer precios desde Supabase
 * Solo lectura, sin cache, sin modificaciones
 * Compatible con navegador (ES modules)
 */

/**
 * Crea y retorna el cliente de Supabase
 * Compatible con navegador usando import dinámico o estático
 */
async function createSupabaseClient() {
  let createClient;
  
  try {
    // Intentar import estático primero (si Supabase está instalado)
    const supabaseModule = await import('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    // Si falla, usar CDN (compatible con navegador)
    const supabaseModule = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClient = supabaseModule.createClient;
  }
  
  // Obtener credenciales desde múltiples fuentes (compatible con Next.js, Vite, y window)
  const getEnvVar = (key) => {
    // 1. Intentar desde window (para configuración manual)
    if (typeof window !== 'undefined' && window[key]) {
      return window[key];
    }
    // 2. Intentar desde import.meta.env (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
      return import.meta.env[key];
    }
    // 3. Intentar desde process.env (Next.js, Node.js)
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }
    return null;
  };
  
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
                      getEnvVar('VITE_SUPABASE_URL') || 
                      getEnvVar('SUPABASE_URL');
                      
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                          getEnvVar('VITE_SUPABASE_ANON_KEY') || 
                          getEnvVar('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos. Configúralos como NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Obtiene los precios de dos fiats desde Supabase
 * @param {string} fiat1 - Código de la primera moneda (ej: "ARS")
 * @param {string} fiat2 - Código de la segunda moneda (ej: "BOB")
 * @returns {Promise<{fiat1Buy: number, fiat2Sell: number, updatedAt: string}>}
 */
export async function getPricesByFiats(fiat1, fiat2) {
  try {
    const supabase = await createSupabaseClient();
    
    // Leer precios para fiat1 y fiat2
    const { data: prices, error } = await supabase
      .from('p2p_prices')
      .select('fiat, buy_price, sell_price, updated_at')
      .in('fiat', [fiat1, fiat2]);
    
    if (error) {
      throw new Error(`Error al leer Supabase: ${error.message}`);
    }
    
    if (!prices || prices.length === 0) {
      throw new Error(`No se encontraron precios para ${fiat1} o ${fiat2}`);
    }
    
    // Separar los precios por fiat
    const fiat1Data = prices.find(p => p.fiat === fiat1);
    const fiat2Data = prices.find(p => p.fiat === fiat2);
    
    if (!fiat1Data) {
      throw new Error(`No se encontró precio para ${fiat1}`);
    }
    
    if (!fiat2Data) {
      throw new Error(`No se encontró precio para ${fiat2}`);
    }
    
    // Obtener el updated_at más reciente
    const updatedAt1 = new Date(fiat1Data.updated_at).getTime();
    const updatedAt2 = new Date(fiat2Data.updated_at).getTime();
    const mostRecentUpdatedAt = updatedAt1 > updatedAt2 
      ? fiat1Data.updated_at 
      : fiat2Data.updated_at;
    
    return {
      fiat1Buy: Number(fiat1Data.buy_price),
      fiat2Sell: Number(fiat2Data.sell_price),
      updatedAt: mostRecentUpdatedAt
    };
  } catch (error) {
    throw new Error(`Error en getPricesByFiats: ${error.message}`);
  }
}
