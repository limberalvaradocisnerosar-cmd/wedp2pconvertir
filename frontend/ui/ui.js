/**
 * ui.js - Lógica de UI y estado del convertidor
 * Maneja eventos y delega al motor de cálculo
 */

import { getPrices, calculate } from '../../calculator/index.js';
import { 
  renderResult, 
  renderError, 
  renderLoading,
  renderLastUpdate,
  updateCalculateButton
} from './render.js';

// Estado del convertidor
let state = {
  prices: null,
  lastUpdate: null,
  isLoading: false
};

// Debounce para cálculo automático
let calculateTimeout = null;
const CALCULATE_DEBOUNCE_MS = 500; // 500ms de espera después del último cambio

/**
 * Obtiene referencias a los elementos del DOM
 */
function getElements() {
  return {
    amountInput: document.getElementById('amount'),
    fiatFromSelect: document.getElementById('fiatFrom'),
    fiatToSelect: document.getElementById('fiatTo'),
    calculateBtn: document.getElementById('calculate-btn'),
    refreshBtn: document.getElementById('refresh-btn')
  };
}

/**
 * Valida los inputs del formulario
 * @param {number} amount - Monto ingresado
 * @param {string} fiatFrom - Moneda origen
 * @param {string} fiatTo - Moneda destino
 * @returns {string|null} - Mensaje de error o null si es válido
 */
function validateInputs(amount, fiatFrom, fiatTo) {
  if (!amount || amount <= 0) {
    return 'Ingresa un monto válido mayor a 0';
  }
  
  if (!fiatFrom) {
    return 'Selecciona la moneda origen';
  }
  
  if (!fiatTo) {
    return 'Selecciona la moneda destino';
  }
  
  if (fiatFrom === fiatTo) {
    return 'Las monedas origen y destino deben ser diferentes';
  }
  
  return null;
}

/**
 * Carga los precios desde Supabase
 * @returns {Promise<Object>} - Precios agrupados por fiat
 */
async function loadPrices() {
  try {
    const prices = await getPrices();
    state.prices = prices;
    state.lastUpdate = new Date().toISOString();
    return prices;
  } catch (error) {
    throw new Error(`Error al cargar precios: ${error.message}`);
  }
}

/**
 * Valida que existan los precios necesarios
 * @param {Object} prices - Precios agrupados
 * @param {string} fiatFrom - Moneda origen
 * @param {string} fiatTo - Moneda destino
 */
function validatePrices(prices, fiatFrom, fiatTo) {
  if (!prices[fiatFrom]) {
    throw new Error(`No se encontraron precios para ${fiatFrom}`);
  }
  
  if (!prices[fiatTo]) {
    throw new Error(`No se encontraron precios para ${fiatTo}`);
  }
  
  if (!prices[fiatFrom].buy) {
    throw new Error(`No se encontró precio BUY para ${fiatFrom}`);
  }
  
  if (!prices[fiatTo].sell) {
    throw new Error(`No se encontró precio SELL para ${fiatTo}`);
  }
}

/**
 * Maneja el cálculo de conversión
 * @param {boolean} showLoading - Si debe mostrar estado de carga
 */
async function handleCalculate(showLoading = true) {
  const elements = getElements();
  
  // Obtener valores del formulario
  const amount = parseFloat(elements.amountInput.value);
  const fiatFrom = elements.fiatFromSelect.value;
  const fiatTo = elements.fiatToSelect.value;
  
  // Validar inputs
  const validationError = validateInputs(amount, fiatFrom, fiatTo);
  if (validationError) {
    // Solo mostrar error si hay valores parciales, no si está vacío
    if (amount || fiatFrom || fiatTo) {
      renderError(validationError);
    } else {
      // Limpiar resultado si no hay inputs
      const resultDiv = document.getElementById('result');
      const errorDiv = document.getElementById('error');
      if (resultDiv) resultDiv.style.display = 'none';
      if (errorDiv) errorDiv.style.display = 'none';
    }
    return;
  }
  
  // Actualizar estado
  state.isLoading = true;
  if (showLoading) {
    updateCalculateButton(true, 'Calculando...');
    renderLoading();
  }
  
  try {
    // Cargar precios si no están en cache
    let prices = state.prices;
    if (!prices) {
      prices = await loadPrices();
    }
    
    // Validar precios
    validatePrices(prices, fiatFrom, fiatTo);
    
    // Calcular conversión usando el motor
    const result = calculate({
      amount,
      fiatFrom,
      fiatTo,
      prices
    });
    
    // Renderizar resultado
    renderResult(result, fiatTo);
    renderLastUpdate(state.lastUpdate);
    
  } catch (error) {
    console.error('Error en cálculo:', error);
    renderError(error.message || 'Error al calcular la conversión');
  } finally {
    // Restaurar estado
    state.isLoading = false;
    if (showLoading) {
      updateCalculateButton(false, 'Calcular');
    }
  }
}

/**
 * Cálculo automático con debounce
 * Se ejecuta cuando cambian los inputs
 */
function handleAutoCalculate() {
  // Limpiar timeout anterior
  if (calculateTimeout) {
    clearTimeout(calculateTimeout);
  }
  
  // Programar nuevo cálculo después del debounce
  calculateTimeout = setTimeout(() => {
    handleCalculate(false); // false = no mostrar loading en cálculo automático
  }, CALCULATE_DEBOUNCE_MS);
}

/**
 * Maneja la actualización de precios (wakeup)
 */
async function handleRefresh() {
  const elements = getElements();
  if (!elements.refreshBtn) return;
  
  elements.refreshBtn.disabled = true;
  elements.refreshBtn.textContent = 'Actualizando...';

  try {
    const res = await fetch('/api/wakeup', { method: 'POST' });
    const data = await res.json();

    if (data.status === 'cooldown') {
      elements.refreshBtn.textContent = `Espera ${data.remainingSeconds}s`;
    } else if (data.status === 'executed') {
      elements.refreshBtn.textContent = 'Precios actualizados';
      // Invalidar cache de precios para forzar recarga
      state.prices = null;
      // Recalcular automáticamente si hay valores en el formulario
      handleAutoCalculate();
    } else {
      elements.refreshBtn.textContent = 'Datos recientes';
    }

  } catch {
    elements.refreshBtn.textContent = 'Error';
  }

  setTimeout(() => {
    elements.refreshBtn.disabled = false;
    elements.refreshBtn.textContent = 'Actualizar precios';
  }, 2000);
}

/**
 * Inicializa la UI y configura los event listeners
 */
export function initUI() {
  const elements = getElements();
  
  // Event listener para calcular (botón manual)
  if (elements.calculateBtn) {
    elements.calculateBtn.addEventListener('click', () => handleCalculate(true));
  }
  
  // Event listener para actualizar precios
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener('click', handleRefresh);
  }
  
  // Cálculo automático cuando cambian los inputs
  if (elements.amountInput) {
    elements.amountInput.addEventListener('input', handleAutoCalculate);
    elements.amountInput.addEventListener('change', handleAutoCalculate);
  }
  
  if (elements.fiatFromSelect) {
    elements.fiatFromSelect.addEventListener('change', handleAutoCalculate);
  }
  
  if (elements.fiatToSelect) {
    elements.fiatToSelect.addEventListener('change', handleAutoCalculate);
  }
  
  // Permitir calcular con Enter en el input (forzar cálculo inmediato)
  if (elements.amountInput) {
    elements.amountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (calculateTimeout) {
          clearTimeout(calculateTimeout);
        }
        handleCalculate(true);
      }
    });
  }
}

