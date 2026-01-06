/**
 * CurrencyInput - Input numérico con selector de fiat
 * Solo UI, sin cálculos
 */

export function CurrencyInput({ 
  id,
  label,
  value,
  fiat,
  availableFiats = [],
  onAmountChange,
  onFiatChange,
  placeholder = '0.00',
  disabled = false
}) {
  // Formatear número con separadores de miles
  function formatNumber(num) {
    if (!num || num === '') return '';
    const numStr = num.toString().replace(/,/g, '');
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // Obtener bandera del fiat (placeholder)
  function getFlagUrl(fiatCode) {
    return `/public/flags/${fiatCode?.toLowerCase()}.svg` || '';
  }

  return `
    <div class="currency-input-container">
      <label for="${id}" class="currency-label">${label}</label>
      <div class="currency-input-wrapper">
        <div class="currency-flag">
          <img 
            src="${getFlagUrl(fiat)}" 
            alt="${fiat}" 
            class="flag-icon"
            onerror="this.style.display='none'"
          />
        </div>
        <input
          type="text"
          id="${id}"
          class="currency-amount-input"
          value="${formatNumber(value)}"
          placeholder="${placeholder}"
          ${disabled ? 'disabled' : ''}
          data-fiat="${fiat}"
        />
        <select
          class="currency-select"
          ${disabled ? 'disabled' : ''}
          data-input-id="${id}"
        >
          ${availableFiats.map(f => `
            <option value="${f}" ${f === fiat ? 'selected' : ''}>${f}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `;
}

