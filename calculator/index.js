/**
 * Motor de cálculo del convertidor P2P
 * Lee precios desde Supabase y calcula conversiones
 */
import { supabase } from './supabase.js';

/**
 * Obtiene todos los precios desde Supabase y los agrupa por fiat
 * @returns {Promise<Object>} Objeto con precios agrupados por fiat
 * Ejemplo: { ARS: { buy: 1050, sell: 1072 }, BOB: { buy: 6.91, sell: 7.02 } }
 */
export async function getPrices() {
  const { data, error } = await supabase
    .from('p2p_prices')
    .select('fiat, side, price_avg');

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  /**
   * Convertimos esto:
   * [
   *  { fiat: 'ARS', side: 'BUY', price_avg: 1050 },
   *  { fiat: 'ARS', side: 'SELL', price_avg: 1072 }
   * ]
   *
   * En esto:
   * {
   *   ARS: { buy: 1050, sell: 1072 }
   * }
   */

  const prices = {};

  for (const row of data) {
    if (!prices[row.fiat]) {
      prices[row.fiat] = {};
    }

    if (row.side === 'BUY') {
      prices[row.fiat].buy = Number(row.price_avg);
    }

    if (row.side === 'SELL') {
      prices[row.fiat].sell = Number(row.price_avg);
    }
  }

  return prices;
}

/**
 * Calcula la conversión de monedas siguiendo las 5 fases
 * @param {Object} params - Parámetros de conversión
 * @param {number} params.amount - Monto a convertir
 * @param {string} params.fiatFrom - Moneda origen (ej: "ARS")
 * @param {string} params.fiatTo - Moneda destino (ej: "BOB")
 * @param {Object} params.prices - Precios agrupados por fiat
 * @returns {number} - Resultado de la conversión
 */
export function calculate({
  amount,
  fiatFrom,
  fiatTo,
  prices
}) {
  // 1. amount → USDT usando BUY
  const usdt = amount / prices[fiatFrom].buy;

  // 2. truncar a 2 decimales (NO redondear)
  const usdtTruncated = Math.trunc(usdt * 100) / 100;

  // 3. restar fee fijo
  const usdtAfterFee = usdtTruncated - 0.14;

  // 4. convertir a fiat destino usando SELL
  const result = usdtAfterFee * prices[fiatTo].sell;

  // 5. truncar resultado final
  return Math.trunc(result * 100) / 100;
}

