/**
 * input-formatter.js - Formateo automático de input numérico
 * Formato: 000.000.000.000,00 (puntos de mil, coma decimal)
 */

/**
 * Limpia el valor: elimina todo excepto números, comas y puntos
 * @param {string} value - Valor a limpiar
 * @returns {string} - Valor limpio
 */
export function cleanInput(value) {
  // Permitir solo números, comas y puntos
  return value.replace(/[^0-9,.]/g, '');
}

/**
 * Normaliza el separador decimal: solo una coma
 * @param {string} value - Valor a normalizar
 * @returns {string} - Valor normalizado
 */
export function normalizeDecimal(value) {
  // Si hay múltiples comas, dejar solo la última como decimal
  const lastCommaIndex = value.lastIndexOf(',');
  if (lastCommaIndex !== -1) {
    // Hay al menos una coma
    const beforeComma = value.substring(0, lastCommaIndex).replace(/,/g, '').replace(/\./g, '');
    const afterComma = value.substring(lastCommaIndex + 1).replace(/\./g, '').replace(/,/g, '');
    return beforeComma + ',' + afterComma;
  }
  
  // No hay coma, eliminar puntos (se agregarán al formatear)
  return value.replace(/\./g, '');
}

/**
 * Limita a 2 decimales
 * @param {string} value - Valor con decimales
 * @returns {string} - Valor limitado a 2 decimales
 */
export function limitDecimals(value) {
  const parts = value.split(',');
  if (parts.length === 2) {
    // Limitar parte decimal a 2 caracteres
    parts[1] = parts[1].slice(0, 2);
    return parts.join(',');
  }
  return value;
}

/**
 * Formatea un número con puntos de mil y coma decimal
 * @param {string} rawValue - Valor crudo (solo números)
 * @returns {string} - Valor formateado (ej: "1.234.567,89")
 */
export function formatNumberDisplay(rawValue) {
  if (!rawValue) return '';
  
  // Separar parte entera y decimal
  const parts = rawValue.split(',');
  let integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Limpiar parte entera (solo números)
  integerPart = integerPart.replace(/\D/g, '');
  
  // Si está vacío, devolver solo decimales si existen
  if (!integerPart && !decimalPart) return '';
  
  // Formatear parte entera con puntos de mil
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Construir resultado
  if (decimalPart) {
    return `${formattedInteger},${limitDecimals(decimalPart)}`;
  }
  
  return formattedInteger;
}

/**
 * Convierte valor formateado a número para cálculos
 * @param {string} formattedValue - Valor formateado (ej: "1.234.567,89")
 * @returns {number} - Número para cálculos
 */
export function parseFormattedNumber(formattedValue) {
  if (!formattedValue || formattedValue.trim() === '') return 0;
  
  // Reemplazar puntos de mil (espacios) y coma decimal por punto
  const cleaned = formattedValue
    .replace(/\./g, '') // Eliminar puntos de mil
    .replace(',', '.'); // Coma decimal a punto
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Maneja el evento de entrada en el input
 * @param {Event} e - Evento de input
 */
export function handleInputFormat(e) {
  const input = e.target;
  let value = input.value;
  
  // Guardar posición del cursor
  const cursorPosition = input.selectionStart;
  const originalLength = value.length;
  
  // Limpiar input (solo números, comas y puntos)
  value = cleanInput(value);
  
  // Normalizar decimales
  value = normalizeDecimal(value);
  
  // Limitar decimales
  value = limitDecimals(value);
  
  // Formatear visualmente
  const formatted = formatNumberDisplay(value);
  
  // Actualizar valor solo si cambió
  if (input.value !== formatted) {
    input.value = formatted;
    
    // Calcular nueva posición del cursor
    // Si el usuario está escribiendo al final, mantener al final
    if (cursorPosition >= originalLength - 1) {
      input.setSelectionRange(formatted.length, formatted.length);
    } else {
      // Ajustar posición según caracteres agregados/quitados
      const lengthDiff = formatted.length - originalLength;
      const newPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, formatted.length));
      input.setSelectionRange(newPosition, newPosition);
    }
  }
  
  // Prevenir propagación para evitar conflictos
  e.stopPropagation();
}

/**
 * Inicializa el formateo en un input
 * @param {HTMLInputElement} input - Input a formatear
 */
export function initInputFormatter(input) {
  if (!input) {
    console.warn('initInputFormatter: input no encontrado');
    return;
  }
  
  // Verificar que el input sea de tipo text
  if (input.type !== 'text') {
    console.warn('initInputFormatter: el input debe ser type="text", actual:', input.type);
    input.type = 'text';
  }
  
  // Escuchar evento input para formateo en tiempo real
  input.addEventListener('input', handleInputFormat, { passive: true });
  
  // Prevenir pegado de valores no válidos
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = cleanInput(pasted);
    const normalized = normalizeDecimal(cleaned);
    const limited = limitDecimals(normalized);
    const formatted = formatNumberDisplay(limited);
    input.value = formatted;
    
    // Disparar evento input para que el cálculo automático funcione
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  // También formatear el valor inicial si existe
  if (input.value) {
    const formatted = formatNumberDisplay(normalizeDecimal(cleanInput(input.value)));
    if (formatted !== input.value) {
      input.value = formatted;
    }
  }
}

