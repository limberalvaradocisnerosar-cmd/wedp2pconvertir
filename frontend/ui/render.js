/**
 * render.js - Renderizado puro, sin lógica
 * Solo actualiza el DOM según el estado
 */

/**
 * Muestra el resultado de la conversión
 * @param {number} result - Resultado calculado
 * @param {string} fiatTo - Moneda destino
 */
export function renderResult(result, fiatTo) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  // Ocultar errores
  errorDiv.style.display = 'none';
  
  // Mostrar resultado
  resultDiv.style.display = 'block';
  resultDiv.className = 'result';
  resultDiv.innerHTML = `
    <strong>Resultado:</strong>
    <div class="result-value">${formatNumber(result)} ${fiatTo}</div>
  `;
  
  // Animación de entrada
  resultDiv.style.opacity = '0';
  resultDiv.style.transform = 'translateY(10px)';
  setTimeout(() => {
    resultDiv.style.transition = 'all 0.3s ease';
    resultDiv.style.opacity = '1';
    resultDiv.style.transform = 'translateY(0)';
  }, 10);
}

/**
 * Muestra un error
 * @param {string} message - Mensaje de error
 */
export function renderError(message) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  // Ocultar resultado
  resultDiv.style.display = 'none';
  
  // Mostrar error
  errorDiv.style.display = 'block';
  errorDiv.className = 'error';
  errorDiv.textContent = `Error: ${message}`;
  
  // Animación de entrada
  errorDiv.style.opacity = '0';
  setTimeout(() => {
    errorDiv.style.transition = 'opacity 0.3s ease';
    errorDiv.style.opacity = '1';
  }, 10);
}

/**
 * Muestra estado de carga
 */
export function renderLoading() {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'block';
  resultDiv.className = 'result loading';
  resultDiv.textContent = 'Calculando...';
}

/**
 * Muestra información de última actualización
 * @param {string} timestamp - Timestamp de última actualización
 */
export function renderLastUpdate(timestamp) {
  const updateDiv = document.getElementById('last-update');
  if (!updateDiv) return;
  
  if (timestamp) {
    const timeAgo = getTimeAgo(timestamp);
    updateDiv.textContent = `Última actualización: ${timeAgo}`;
    updateDiv.style.display = 'block';
  } else {
    updateDiv.style.display = 'none';
  }
}

/**
 * Actualiza el estado del botón de calcular
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {string} text - Texto del botón
 */
export function updateCalculateButton(disabled, text) {
  const btn = document.getElementById('calculate-btn');
  if (btn) {
    btn.disabled = disabled;
    btn.textContent = text;
  }
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calcula tiempo transcurrido desde un timestamp
 * @param {string} timestamp - Timestamp ISO
 * @returns {string} - Tiempo transcurrido (ej: "hace 5m")
 */
function getTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) {
      return `hace ${diffSec}s`;
    } else if (diffMin < 60) {
      return `hace ${diffMin}m`;
    } else if (diffHour < 24) {
      return `hace ${diffHour}h`;
    } else {
      const diffDays = Math.floor(diffHour / 24);
      return `hace ${diffDays}d`;
    }
  } catch (e) {
    return 'N/A';
  }
}

