/**
 * ui.js - Lógica de UI y estado del convertidor
 * Maneja eventos y delega al motor de cálculo
 */

import { getPrices, calculate } from '../../calculator/index.js';
import { 
  renderResult, 
  renderError, 
  renderLoading,
  renderLastUpdate
} from './render.js';
import { parseFormattedNumber, initInputFormatter } from './input-formatter.js';

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
  // Validación silenciosa - no mostrar mensajes, solo retornar si es válido
  if (!amount || amount <= 0) {
    return false;
  }
  
  if (!fiatFrom || !fiatTo) {
    return false;
  }
  
  if (fiatFrom === fiatTo) {
    return false;
  }
  
  return true;
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
  // El input está formateado, necesitamos parsearlo
  const amount = parseFormattedNumber(elements.amountInput.value);
  const fiatFrom = elements.fiatFromSelect.value;
  const fiatTo = elements.fiatToSelect.value;
  
  // Validar inputs - silenciosamente, solo ocultar resultado si no es válido
  const isValid = validateInputs(amount, fiatFrom, fiatTo);
  if (!isValid) {
    // Simplemente ocultar resultado y error - sin mensajes
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    if (resultDiv) resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    return;
  }
  
  state.isLoading = true;
  if (showLoading) {
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
    // Ocultar resultado en caso de error, sin mostrar mensaje
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    if (resultDiv) resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
  } finally {
    state.isLoading = false;
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
  
  // Cargar preferencias guardadas (monedas seleccionadas)
  const savedFiatFrom = localStorage.getItem('fiatFrom');
  const savedFiatTo = localStorage.getItem('fiatTo');
  
  if (savedFiatFrom && elements.fiatFromSelect) {
    elements.fiatFromSelect.value = savedFiatFrom;
    elements.fiatFromSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (savedFiatTo && elements.fiatToSelect) {
    elements.fiatToSelect.value = savedFiatTo;
    elements.fiatToSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (elements.amountInput) {
    initInputFormatter(elements.amountInput);
  }
  
  
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener('click', handleRefresh);
  }
  
  const swapBtn = document.getElementById('swap-currencies-btn');
  const inputCurrency = document.getElementById('input-currency');
  
  if (swapBtn && elements.fiatFromSelect && elements.fiatToSelect) {
    swapBtn.addEventListener('click', () => {
      const temp = elements.fiatFromSelect.value;
      elements.fiatFromSelect.value = elements.fiatToSelect.value;
      elements.fiatToSelect.value = temp;
      
      // Guardar preferencias
      localStorage.setItem('fiatFrom', elements.fiatFromSelect.value);
      localStorage.setItem('fiatTo', elements.fiatToSelect.value);
      
      elements.fiatFromSelect.dispatchEvent(new Event('change', { bubbles: true }));
      elements.fiatToSelect.dispatchEvent(new Event('change', { bubbles: true }));
      
      if (inputCurrency && elements.fiatFromSelect) {
        inputCurrency.textContent = elements.fiatFromSelect.value;
      }
      
      handleAutoCalculate();
    });
  }
  
  if (elements.amountInput) {
    elements.amountInput.addEventListener('input', () => {
      setTimeout(handleAutoCalculate, 100);
    });
    elements.amountInput.addEventListener('change', handleAutoCalculate);
  }
  
  if (elements.fiatFromSelect) {
    elements.fiatFromSelect.addEventListener('change', () => {
      // Guardar preferencia
      localStorage.setItem('fiatFrom', elements.fiatFromSelect.value);
      
      if (inputCurrency) {
        inputCurrency.textContent = elements.fiatFromSelect.value;
      }
      handleAutoCalculate();
    });
  }
  
  if (elements.fiatToSelect) {
    elements.fiatToSelect.addEventListener('change', () => {
      // Guardar preferencia
      localStorage.setItem('fiatTo', elements.fiatToSelect.value);
      handleAutoCalculate();
    });
  }
  
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
  
  if (inputCurrency && elements.fiatFromSelect) {
    inputCurrency.textContent = elements.fiatFromSelect.value;
  }
}

