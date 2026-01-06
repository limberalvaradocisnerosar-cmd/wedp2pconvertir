/**
 * Frontend principal del convertidor
 * UI pura - delega cálculos al motor
 */

import { convertAmount } from '../calculator/index.js';
import { startWakeUp, stopWakeUp } from '../despertador/index.js';
import { CurrencyInput } from './components/CurrencyInput.js';
import { FloatingCard } from './components/FloatingCard.js';
import { PriceDisplay } from './components/PriceDisplay.js';

// Estado de la aplicación (solo UI)
let state = {
  amount: '',
  fiatFrom: 'ARS',
  fiatTo: 'BOB',
  result: null,
  updatedAt: null,
  isLoading: false,
  error: null,
  availableFiats: ['ARS', 'BOB', 'CLP', 'PEN', 'MXN', 'USD'] // Lista inicial, se puede expandir
};

// Referencias a elementos DOM
let elements = {};

/**
 * Inicializa la aplicación
 */
export function init() {
  // Crear estructura HTML
  createAppStructure();
  
  // Configurar event listeners después de crear la estructura
  setupEventListeners();
  
  // Iniciar despertador
  startWakeUp();
  
  // Limpiar al cerrar
  window.addEventListener('beforeunload', () => {
    stopWakeUp();
  });
}

/**
 * Crea la estructura HTML de la aplicación
 */
function createAppStructure() {
  const app = document.getElementById('app') || document.body;
  
  app.innerHTML = `
    <div class="container">
      <header class="app-header">
        <h1 class="text-center">Convertidor P2P</h1>
        <p class="text-center text-secondary">Conversión de monedas en tiempo real</p>
      </header>
      
      <main class="app-main">
        ${FloatingCard({ className: 'converter-card' })}
      </main>
    </div>
  `;
  
  // Llenar el card con contenido
  const card = document.querySelector('.floating-card');
  if (card) {
    card.innerHTML = `
      <div class="converter-content">
        <div class="converter-inputs grid grid-1-1">
          ${CurrencyInput({
            id: 'input-from',
            label: 'De',
            value: state.amount,
            fiat: state.fiatFrom,
            availableFiats: state.availableFiats,
            placeholder: '0.00'
          })}
          
          ${CurrencyInput({
            id: 'input-to',
            label: 'A',
            value: '',
            fiat: state.fiatTo,
            availableFiats: state.availableFiats,
            disabled: true
          })}
        </div>
        
        <div class="converter-result">
          ${PriceDisplay({
            result: state.result,
            fiatTo: state.fiatTo,
            updatedAt: state.updatedAt,
            isLoading: state.isLoading,
            error: state.error
          })}
        </div>
      </div>
    `;
  }
  
  // Guardar referencias inmediatamente después de crear el HTML
  elements = {
    amountInput: document.getElementById('input-from'),
    fiatFromSelect: document.querySelector('select[data-input-id="input-from"]'),
    fiatToSelect: document.querySelector('select[data-input-id="input-to"]'),
    resultDisplay: document.querySelector('.converter-result')
  };
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Limpiar listeners anteriores si existen
  if (elements.amountInput) {
    elements.amountInput.removeEventListener('input', handleAmountChange);
    elements.amountInput.removeEventListener('blur', handleAmountBlur);
  }
  if (elements.fiatFromSelect) {
    elements.fiatFromSelect.removeEventListener('change', handleFiatFromChange);
  }
  if (elements.fiatToSelect) {
    elements.fiatToSelect.removeEventListener('change', handleFiatToChange);
  }
  
  // Agregar nuevos listeners
  if (elements.amountInput) {
    elements.amountInput.addEventListener('input', handleAmountChange);
    elements.amountInput.addEventListener('blur', handleAmountBlur);
  }
  
  if (elements.fiatFromSelect) {
    elements.fiatFromSelect.addEventListener('change', handleFiatFromChange);
  }
  
  if (elements.fiatToSelect) {
    elements.fiatToSelect.addEventListener('change', handleFiatToChange);
  }
}

/**
 * Maneja cambios en el input de monto
 */
function handleAmountChange(e) {
  const value = e.target.value.replace(/,/g, '');
  state.amount = value;
  
  // Si hay un valor válido, calcular
  if (value && !isNaN(value) && parseFloat(value) > 0) {
    debounceCalculate();
  } else {
    state.result = null;
    updateResultDisplay();
  }
}

/**
 * Maneja blur del input (formatear)
 */
function handleAmountBlur(e) {
  const value = parseFloat(e.target.value.replace(/,/g, ''));
  if (!isNaN(value) && value > 0) {
    e.target.value = formatNumber(value);
  }
}

/**
 * Maneja cambio de fiat origen
 */
function handleFiatFromChange(e) {
  state.fiatFrom = e.target.value;
  if (state.amount && parseFloat(state.amount) > 0) {
    calculateConversion();
  }
}

/**
 * Maneja cambio de fiat destino
 */
function handleFiatToChange(e) {
  state.fiatTo = e.target.value;
  if (state.amount && parseFloat(state.amount) > 0) {
    calculateConversion();
  }
}

/**
 * Calcula la conversión usando el motor
 */
async function calculateConversion() {
  const amount = parseFloat(state.amount.replace(/,/g, ''));
  
  if (!amount || isNaN(amount) || amount <= 0) {
    state.result = null;
    state.error = null;
    updateResultDisplay();
    return;
  }
  
  if (state.fiatFrom === state.fiatTo) {
    state.result = amount;
    state.error = null;
    updateResultDisplay();
    return;
  }
  
  state.isLoading = true;
  state.error = null;
  updateResultDisplay();
  
  try {
    // Llamar al motor de cálculo
    const result = await convertAmount({
      amount: amount,
      fiatFrom: state.fiatFrom,
      fiatTo: state.fiatTo
    });
    
    state.result = result.result;
    state.updatedAt = result.updatedAt;
    state.error = null;
  } catch (error) {
    state.error = error.message || 'Error al calcular conversión';
    state.result = null;
  } finally {
    state.isLoading = false;
    updateResultDisplay();
  }
}

/**
 * Debounce para evitar cálculos excesivos
 */
let debounceTimer = null;
function debounceCalculate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    calculateConversion();
  }, 500);
}

/**
 * Actualiza la visualización del resultado
 */
function updateResultDisplay() {
  if (elements.resultDisplay) {
    elements.resultDisplay.innerHTML = PriceDisplay({
      result: state.result,
      fiatTo: state.fiatTo,
      updatedAt: state.updatedAt,
      isLoading: state.isLoading,
      error: state.error
    });
  }
}

/**
 * Formatea número con separadores
 */
function formatNumber(num) {
  if (!num || isNaN(num)) return '';
  const numStr = num.toFixed(2);
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

