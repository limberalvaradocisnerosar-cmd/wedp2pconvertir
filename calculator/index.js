
import { supabase } from './supabase.js';


export async function getPrices() {
  const table = await supabase.from('p2p_prices');
  const { data, error } = await table.select('fiat, side, price_avg, updated_at');

  if (error) {
    throw new Error(`Error al leer Supabase: ${error.message}`);
  }

  
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

    
    if (row.updated_at) {
      const rowTimestamp = new Date(row.updated_at).getTime();
      const currentTimestamp = prices[row.fiat].updated_at 
        ? new Date(prices[row.fiat].updated_at).getTime() 
        : 0;
      
      if (rowTimestamp > currentTimestamp) {
        prices[row.fiat].updated_at = row.updated_at;
      }
    }
  }

  return prices;
}


export function calculate({
  amount,
  fiatFrom,
  fiatTo,
  prices
}) {
  
  const usdt = amount / prices[fiatFrom].buy;

  
  const usdtTruncated = Math.trunc(usdt * 100) / 100;

  
  const usdtAfterFee = usdtTruncated - 0.14;

  
  const result = usdtAfterFee * prices[fiatTo].sell;

  
  return Math.trunc(result * 100) / 100;
}

