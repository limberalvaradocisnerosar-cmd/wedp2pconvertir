/**
 * Módulo despertador - Despierta /api/run cada 60 segundos
 * Solo funciona mientras la web esté abierta
 * Servicio silencioso sin UI
 */

// Variable interna para proteger contra múltiples intervalos
let intervalId = null;

/**
 * Obtiene las variables de entorno necesarias
 * Compatible con Next.js (process.env), Vite (import.meta.env) y window
 */
function getEnvVars() {
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
  
  const apiRunUrl = getEnvVar('NEXT_PUBLIC_API_RUN_URL') || 
                    getEnvVar('VITE_API_RUN_URL');
                    
  const cromToken = getEnvVar('NEXT_PUBLIC_CROM_TOKEN') || 
                    getEnvVar('VITE_CROM_TOKEN');
  
  return { apiRunUrl, cromToken };
}

/**
 * Hace un fetch silencioso POST a /api/run
 * Incluye el CROM_TOKEN en headers
 * Maneja errores sin romper la UI
 */
async function wakeUpAPI() {
  try {
    const { apiRunUrl, cromToken } = getEnvVars();
    
    // Si no hay variables de entorno, no hacer nada
    if (!apiRunUrl || !cromToken) {
      return;
    }
    
    // Construir URL completa
    const url = `${apiRunUrl}/api/run`;
    
    // Fetch POST con token en headers - sin esperar respuesta
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crom-token': cromToken
      },
      body: JSON.stringify({}),
      // No bloquear si hay problemas de red
      keepalive: false
    }).catch(() => {
      // Errores silenciosos - no romper la UI
      // El TTL del backend maneja la lógica
    });
  } catch (error) {
    // Errores silenciosos - no romper la UI
    // El TTL del backend maneja la lógica
  }
}

/**
 * Inicia el despertador automático
 * Hace ping cada 60 segundos a /api/run
 * Solo crea un intervalo si no existe uno activo
 */
export function startWakeUp() {
  // Protección anti-tormenta: no crear múltiples intervalos
  if (intervalId !== null) {
    return;
  }
  
  // Hacer el primer ping inmediatamente
  wakeUpAPI();
  
  // Crear intervalo de 60 segundos exactos
  intervalId = setInterval(() => {
    wakeUpAPI();
  }, 60000);
}

/**
 * Detiene el despertador
 * Limpia el intervalo si existe
 * Se usa cuando la app se desmonta o la pestaña se cierra
 */
export function stopWakeUp() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

