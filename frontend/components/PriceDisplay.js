/**
 * PriceDisplay - Muestra resultado de conversión
 * Solo visualización, sin cálculo
 */

export function PriceDisplay({ 
  result,
  fiatTo,
  updatedAt,
  isLoading = false,
  error = null
}) {
  // Formatear número con separadores
  function formatNumber(num) {
    if (num === null || num === undefined) return '0.00';
    const numStr = num.toFixed(2);
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // Calcular tiempo transcurrido
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

  // Estado de carga
  if (isLoading) {
    return `
      <div class="price-display loading">
        <div class="price-loading-spinner"></div>
        <p class="price-loading-text">Calculando...</p>
      </div>
    `;
  }

  // Estado de error
  if (error) {
    return `
      <div class="price-display error">
        <div class="price-error-icon">⚠️</div>
        <p class="price-error-text">${error}</p>
      </div>
    `;
  }

  // Sin datos
  if (result === null || result === undefined) {
    return `
      <div class="price-display empty">
        <p class="price-empty-text">Ingresa un monto para convertir</p>
      </div>
    `;
  }

  // Resultado normal
  return `
    <div class="price-display result fade-in">
      <div class="price-result-main">
        <span class="price-value">${formatNumber(result)}</span>
        <span class="price-fiat">${fiatTo}</span>
      </div>
      <div class="price-meta">
        <span class="price-updated">Actualizado ${getTimeAgo(updatedAt)}</span>
      </div>
    </div>
  `;
}

