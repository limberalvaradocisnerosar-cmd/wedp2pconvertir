/**
 * Motor de cálculo del convertidor P2P
 * Solo lee precios y calcula. Sin lógica extra.
 */
import { supabase } from './supabase.js';

/**
 * Obtiene todos los precios desde Supabase y los agrupa por fiat
 * @returns {Promise<Object>} Objeto con precios agrupados por fiat
 * Ejemplo: { ARS: { buy: 1050.23, sell: 1072.10 }, BOB: { buy: 6.91, sell: 7.02 } }
 */
export async function getPrices() {
  const { data, error } = await (await supabase.from('p2p_prices'))
    .select('fiat, side, price_avg');

  if (error) {
    throw new Error(`Error al leer Supabase: ${error.message}`);
  }

  // Agrupar por fiat y separar BUY/SELL
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
 * Calcula la conversión de monedas siguiendo las 5 fases exactas
 * @param {Object} params - Parámetros de conversión
 * @param {number} params.amount - Monto a convertir
 * @param {string} params.fiatFrom - Moneda origen (ej: "ARS")
 * @param {string} params.fiatTo - Moneda destino (ej: "BOB")
 * @param {Object} params.prices - Precios agrupados por fiat
 * @returns {number} - Resultado de la conversión truncado a 2 decimales
 */
export function calculate({
  amount,
  fiatFrom,
  fiatTo,
  prices
}) {
  // Fase 1: Convertir amount a USDT usando prices[fiatFrom].buy
  const usdt = amount / prices[fiatFrom].buy;

  // Fase 2: Truncar a 2 decimales (NO redondear)
  const usdtTruncated = Math.trunc(usdt * 100) / 100;

  // Fase 3: Restar 0.14 USDT fijo
  const usdtAfterFee = usdtTruncated - 0.14;

  // Fase 4: Convertir a fiat destino usando prices[fiatTo].sell
  const result = usdtAfterFee * prices[fiatTo].sell;

  // Fase 5: Truncar el resultado final a 2 decimales (NO redondear)
  return Math.trunc(result * 100) / 100;
}

