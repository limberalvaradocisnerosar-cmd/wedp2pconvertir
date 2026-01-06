/**
 * Motor de cálculo del convertidor P2P
 * Ejecuta las 5 fases obligatorias del cálculo
 */

import { getPricesByFiats } from './supabase.js';

/**
 * Trunca un número a 2 decimales SIN redondear
 * @param {number} value - Valor a truncar
 * @returns {number} - Valor truncado a 2 decimales
 */
function truncateTwoDecimals(value) {
  return Math.floor(value * 100) / 100;
}

/**
 * Función principal del convertidor
 * Ejecuta las 5 fases obligatorias del cálculo
 * 
 * @param {Object} params - Parámetros de conversión
 * @param {number} params.amount - Monto a convertir (fiat1)
 * @param {string} params.fiatFrom - Código de la moneda origen (ej: "ARS")
 * @param {string} params.fiatTo - Código de la moneda destino (ej: "BOB")
 * @returns {Promise<Object>} - Resultado de la conversión
 */
export async function convertAmount({ amount, fiatFrom, fiatTo }) {
  try {
    // Validar parámetros
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('El monto debe ser un número positivo');
    }
    
    if (!fiatFrom || !fiatTo) {
      throw new Error('fiatFrom y fiatTo son requeridos');
    }
    
    // Obtener precios desde Supabase
    const { fiat1Buy, fiat2Sell, updatedAt } = await getPricesByFiats(fiatFrom, fiatTo);
    
    // FASE 1: Usuario ingresa monto (fiat1)
    let result = amount;
    
    // FASE 2: Truncar a 2 decimales SIN redondear
    result = truncateTwoDecimals(result);
    
    // FASE 3: Restar 0.14 USDT
    // Si el resultado es negativo → devolver 0
    result = result - 0.14;
    if (result < 0) {
      result = 0;
    }
    
    // FASE 4: Multiplicar por fiat2 SELL (obtenido de Supabase)
    result = result * fiat2Sell;
    
    // FASE 5: Truncar nuevamente a 2 decimales SIN redondear
    result = truncateTwoDecimals(result);
    
    // Retornar objeto con toda la información
    return {
      input: amount,
      fiatFrom,
      fiatTo,
      fiat1Buy,
      fiat2Sell,
      result,
      updatedAt
    };
  } catch (error) {
    throw new Error(`Error en convertAmount: ${error.message}`);
  }
}

