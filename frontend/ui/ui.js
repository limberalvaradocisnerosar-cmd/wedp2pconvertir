

import { getPrices, calculate } from '../../calculator/index.js';
import { 
  renderResult, 
  renderError, 
  renderLoading,
  renderLastUpdate
} from './render.js';
import { parseFormattedNumber, initInputFormatter } from './input-formatter.js';


let state = {
  prices: null,
  lastUpdate: null,
  isLoading: false
};


let calculateTimeout = null;
const CALCULATE_DEBOUNCE_MS = 500; 


function getElements() {
  return {
    amountInput: document.getElementById('amount'),
    fiatFromSelect: document.getElementById('fiatFrom'),
    fiatToSelect: document.getElementById('fiatTo'),
    refreshBtn: document.getElementById('refresh-btn')
  };
}


function validateInputs(amount, fiatFrom, fiatTo) {
  
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


async function handleCalculate(showLoading = true) {
  const elements = getElements();
  
  
  
  const amount = parseFormattedNumber(elements.amountInput.value);
  const fiatFrom = elements.fiatFromSelect.value;
  const fiatTo = elements.fiatToSelect.value;
  
  
  const isValid = validateInputs(amount, fiatFrom, fiatTo);
  if (!isValid) {
    
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
    
    let prices = state.prices;
    if (!prices) {
      prices = await loadPrices();
    }
    
    
    validatePrices(prices, fiatFrom, fiatTo);
    
    
    const result = calculate({
      amount,
      fiatFrom,
      fiatTo,
      prices
    });
    
    
    renderResult(result, fiatTo);
    renderLastUpdate(state.lastUpdate);
    
  } catch (error) {
    console.error('Error en cálculo:', error);
    
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    if (resultDiv) resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
  } finally {
    state.isLoading = false;
  }
}


function handleAutoCalculate() {
  
  if (calculateTimeout) {
    clearTimeout(calculateTimeout);
  }
  
  
  calculateTimeout = setTimeout(() => {
    handleCalculate(false); 
  }, CALCULATE_DEBOUNCE_MS);
}


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
      
      state.prices = null;
      
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


export function initUI() {
  const elements = getElements();
  
  
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
      
      localStorage.setItem('fiatFrom', elements.fiatFromSelect.value);
      
      if (inputCurrency) {
        inputCurrency.textContent = elements.fiatFromSelect.value;
      }
      handleAutoCalculate();
    });
  }
  
  if (elements.fiatToSelect) {
    elements.fiatToSelect.addEventListener('change', () => {
      
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

