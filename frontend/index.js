/**
 * Frontend de prueba para el motor de cálculo
 * Test funcional simple - NO es el diseño final
 */
import { getPrices, calculate } from '../calculator/index.js';

const amountInput = document.getElementById('amount');
const fiatFromSelect = document.getElementById('fiatFrom');
const fiatToSelect = document.getElementById('fiatTo');
const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

/**
 * Muestra un resultado exitoso
 */
function showResult(result, fiatTo) {
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'block';
  resultDiv.className = 'result';
  resultDiv.innerHTML = `
    <strong>Resultado:</strong>
    <div class="result-value">${result.toFixed(2)} ${fiatTo}</div>
  `;
}

/**
 * Muestra un error
 */
function showError(message) {
  resultDiv.style.display = 'none';
  errorDiv.style.display = 'block';
  errorDiv.className = 'error';
  errorDiv.textContent = `Error: ${message}`;
}

/**
 * Muestra estado de carga
 */
function showLoading() {
  resultDiv.style.display = 'block';
  resultDiv.className = 'result loading';
  resultDiv.textContent = 'Calculando...';
  errorDiv.style.display = 'none';
}

/**
 * Maneja el click en el botón Calcular
 */
calculateBtn.addEventListener('click', async () => {
  // Obtener valores del formulario
  const amount = parseFloat(amountInput.value);
  const fiatFrom = fiatFromSelect.value;
  const fiatTo = fiatToSelect.value;
  
  // Validar inputs
  if (!amount || amount <= 0) {
    showError('Ingresa un monto válido mayor a 0');
    return;
  }
  
  if (!fiatFrom) {
    showError('Selecciona la moneda origen');
    return;
  }
  
  if (!fiatTo) {
    showError('Selecciona la moneda destino');
    return;
  }
  
  if (fiatFrom === fiatTo) {
    showError('Las monedas origen y destino deben ser diferentes');
    return;
  }
  
  // Deshabilitar botón durante el cálculo
  calculateBtn.disabled = true;
  calculateBtn.textContent = 'Calculando...';
  showLoading();
  
  try {
    // Obtener precios desde Supabase
    const prices = await getPrices();
    
    // Validar que existan los precios necesarios
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
    
    // Calcular conversión
    const result = calculate({
      amount,
      fiatFrom,
      fiatTo,
      prices
    });
    
    // Mostrar resultado
    showResult(result, fiatTo);
    
  } catch (error) {
    console.error('Error en cálculo:', error);
    showError(error.message || 'Error al calcular la conversión');
  } finally {
    // Rehabilitar botón
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calcular';
  }
});
