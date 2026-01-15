


export function renderResult(result, fiatTo) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
  
  
  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-section';
    const formattedResult = formatNumber(result);
    const resultText = `${formattedResult} ${fiatTo}`;
    resultDiv.innerHTML = `
      <div class="result-value-container">
        <div class="result-value">= ${resultText}</div>
        <button class="copy-result-btn" title="Copiar resultado" aria-label="Copiar resultado" data-value="${resultText}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    `;
    
    
    const copyBtn = resultDiv.querySelector('.copy-result-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const valueToCopy = copyBtn.getAttribute('data-value');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(valueToCopy).then(() => {
            
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
              </svg>
            `;
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
            }, 1500);
          }).catch(() => {
            
            const textarea = document.createElement('textarea');
            textarea.value = valueToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          });
        } else {
          
          const textarea = document.createElement('textarea');
          textarea.value = valueToCopy;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      });
    }
  }
}


export function renderError(message) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  
  if (resultDiv) {
    resultDiv.style.display = 'none';
  }
  
  
  if (errorDiv) {
    errorDiv.style.display = 'block';
    errorDiv.className = 'error-section';
    errorDiv.innerHTML = `
      <div class="error-icon">ℹ️</div>
      <div class="error-message">${message}</div>
    `;
    
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      errorDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      errorDiv.style.opacity = '1';
      errorDiv.style.transform = 'translateY(0)';
    }, 10);
  }
}


export function renderLoading() {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'block';
  resultDiv.className = 'result loading';
  resultDiv.textContent = 'Calculando...';
}


export function renderLastUpdate(timestamp) {
  const updateDiv = document.getElementById('last-update');
  if (!updateDiv) return;
  
  if (timestamp) {
    const timeAgo = getTimeAgo(timestamp);
    updateDiv.textContent = `Última actualización: ${timeAgo}`;
    updateDiv.style.display = 'block';
  } else {
    updateDiv.style.display = 'none';
  }
}



function formatNumber(num) {
  
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  
  return `${formattedInteger},${decimalPart}`;
}


export function getTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) {
      return `hace ${diffSec}s`;
    } else if (diffMin < 60) {
      return `hace ${diffMin}m`;
    } else if (diffHour < 24) {
      return `hace ${diffHour}h`;
    } else {
      const diffDays = Math.floor(diffHour / 24);
      return `hace ${diffDays}d`;
    }
  } catch (e) {
    return 'N/A';
  }
}

