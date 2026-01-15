


export function cleanInput(value) {
  
  return value.replace(/[^0-9,.]/g, '');
}


export function normalizeDecimal(value) {
  
  const lastCommaIndex = value.lastIndexOf(',');
  if (lastCommaIndex !== -1) {
    
    const beforeComma = value.substring(0, lastCommaIndex).replace(/,/g, '').replace(/\./g, '');
    const afterComma = value.substring(lastCommaIndex + 1).replace(/\./g, '').replace(/,/g, '');
    return beforeComma + ',' + afterComma;
  }
  
  
  return value.replace(/\./g, '');
}


export function limitDecimals(value) {
  const parts = value.split(',');
  if (parts.length === 2) {
    
    parts[1] = parts[1].slice(0, 2);
    return parts.join(',');
  }
  return value;
}


export function formatNumberDisplay(rawValue) {
  if (!rawValue) return '';
  
  
  const parts = rawValue.split(',');
  let integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  
  integerPart = integerPart.replace(/\D/g, '');
  
  
  if (!integerPart && !decimalPart) return '';
  
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  
  if (decimalPart) {
    return `${formattedInteger},${limitDecimals(decimalPart)}`;
  }
  
  return formattedInteger;
}


export function parseFormattedNumber(formattedValue) {
  if (!formattedValue || formattedValue.trim() === '') return 0;
  
  
  const cleaned = formattedValue
    .replace(/\./g, '') 
    .replace(',', '.'); 
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}


export function handleInputFormat(e) {
  const input = e.target;
  let value = input.value;
  
  
  const cursorPosition = input.selectionStart;
  const originalLength = value.length;
  
  
  value = cleanInput(value);
  
  
  value = normalizeDecimal(value);
  
  
  value = limitDecimals(value);
  
  
  const formatted = formatNumberDisplay(value);
  
  
  if (input.value !== formatted) {
    input.value = formatted;
    
    
    
    if (cursorPosition >= originalLength - 1) {
      input.setSelectionRange(formatted.length, formatted.length);
    } else {
      
      const lengthDiff = formatted.length - originalLength;
      const newPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, formatted.length));
      input.setSelectionRange(newPosition, newPosition);
    }
  }
  
  
  e.stopPropagation();
}


export function initInputFormatter(input) {
  if (!input) {
    console.warn('initInputFormatter: input no encontrado');
    return;
  }
  
  
  if (input.type !== 'text') {
    console.warn('initInputFormatter: el input debe ser type="text", actual:', input.type);
    input.type = 'text';
  }
  
  
  input.addEventListener('input', handleInputFormat, { passive: true });
  
  
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = cleanInput(pasted);
    const normalized = normalizeDecimal(cleaned);
    const limited = limitDecimals(normalized);
    const formatted = formatNumberDisplay(limited);
    input.value = formatted;
    
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  
  if (input.value) {
    const formatted = formatNumberDisplay(normalizeDecimal(cleanInput(input.value)));
    if (formatted !== input.value) {
      input.value = formatted;
    }
  }
}

