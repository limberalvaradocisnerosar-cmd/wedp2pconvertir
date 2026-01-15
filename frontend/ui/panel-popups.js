

import { getTimeAgo } from './render.js';

let currentPopup = null;
let popupResizeHandler = null; 
let popupMutationObserver = null; 



export async function openPopup(contentFile, isPage = false) {
    
    if (isPage) {
        window.location.href = `/frontend/htmls/${contentFile}.html`;
        return;
    }

    
    closePopup();

    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popup-overlay';
    
    
    const popup = document.createElement('div');
    popup.className = 'popup-card';
    popup.id = 'popup-card';
    
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    content.id = 'popup-content';
    content.innerHTML = '<div class="popup-loading">Cargando...</div>';
    
    popup.appendChild(content);
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    currentPopup = popup;
    
    
    try {
        const response = await fetch(`/frontend/htmls/${contentFile}.html`);
        if (!response.ok) throw new Error('No se pudo cargar el contenido');
        const html = await response.text();
        content.innerHTML = html;
        
        
        const closeButtons = content.querySelectorAll('[data-close-popup]');
        closeButtons.forEach(btn => btn.addEventListener('click', () => closePopup()));

        
        if (contentFile === 'precios-actuales') {
            loadPopupPrices();
        }

        
        function adjustPopupFit() {
            const maxW = window.innerWidth - 48; 
            const maxH = window.innerHeight - 48;

            
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.width > maxW) popup.style.width = `calc(100% - 48px)`;
            else popup.style.width = ''; 

            
            if (popupRect.height > maxH) {
                content.style.maxHeight = `${maxH - 24}px`;
            } else {
                content.style.maxHeight = '';
            }

            
            const computed = window.getComputedStyle(popup);
            let fontPx = parseFloat(computed.fontSize);
            const minFontPx = 12; 
            const step = 1; 
            let iter = 0;
            const maxIter = 10;

            while (iter < maxIter) {
                const rect = popup.getBoundingClientRect();
                if (rect.width <= maxW && rect.height <= maxH) break;
                if (fontPx <= minFontPx) break;
                fontPx = Math.max(minFontPx, fontPx - step);
                popup.style.fontSize = `${fontPx}px`;
                iter++;
            }

            if (iter > 0) popup.classList.add('shrunk'); else popup.classList.remove('shrunk');

            
            const finalRect = popup.getBoundingClientRect();
            if (finalRect.height > maxH) content.style.maxHeight = `${maxH - 24}px`;
        }

        
        requestAnimationFrame(() => adjustPopupFit());

        
        popupResizeHandler = () => requestAnimationFrame(() => adjustPopupFit());
        window.addEventListener('resize', popupResizeHandler);
        window.addEventListener('orientationchange', popupResizeHandler);

        
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => requestAnimationFrame(() => adjustPopupFit()));
            observer.observe(content, { childList: true, subtree: true, characterData: true });
            popupMutationObserver = observer;
        }

        
        const imgs = content.querySelectorAll('img');
        imgs.forEach(img => {
            if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(() => adjustPopupFit()));
        });
    } catch (error) {
        console.error('Error cargando popup:', error);
        content.innerHTML = '<div class="popup-error">Error al cargar el contenido</div>';
    }
    
    
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        popup.classList.add('active');
    });
    
    
    overlay.addEventListener('click', closePopup);
    
    
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}


export function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('popup-card');
    
    if (popup) {
        popup.classList.remove('active');
        overlay?.classList.remove('active');
        
        
        if (popupResizeHandler) {
            window.removeEventListener('resize', popupResizeHandler);
            window.removeEventListener('orientationchange', popupResizeHandler);
            popupResizeHandler = null;
        }

        
        if (popupMutationObserver) {
            try { popupMutationObserver.disconnect(); } catch (e) {  }
            popupMutationObserver = null;
        }

        setTimeout(() => {
            popup.remove();
            overlay?.remove();
            currentPopup = null;
        }, 300);
    }
}


async function loadPopupPrices() {
    const tbody = document.getElementById('prices-tbody-popup');
    if (!tbody) return;
    
    try {
        const { getPrices } = await import('/calculator/index.js');
        const prices = await getPrices();
        
        if (!prices || Object.keys(prices).length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-text">No hay precios disponibles</td></tr>';
            return;
        }
        
        const currencies = ['ARS', 'BOB', 'CLP', 'MXN', 'PEN'];
        tbody.innerHTML = currencies.map(fiat => {
            const priceData = prices[fiat];
            if (!priceData) return '';
            
            const buy = priceData.buy || 'N/A';
            const sell = priceData.sell || 'N/A';
            const updatedAt = priceData.updated_at;
            const lastUpdate = updatedAt ? getTimeAgo(updatedAt) : 'N/A';
            
            const buyFormatted = typeof buy === 'number' ? buy.toFixed(2) : buy;
            const sellFormatted = typeof sell === 'number' ? sell.toFixed(2) : sell;
            
            return `
                <tr>
                    <td><strong>${fiat}</strong></td>
                    <td>${buyFormatted}</td>
                    <td>${sellFormatted}</td>
                    <td>${lastUpdate}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error cargando precios:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="error-text">Error al cargar precios</td></tr>';
    }
}


export function initPanelButtons() {
    const panelButtons = document.querySelectorAll('.panel-info-btn');
    
    panelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const contentFile = btn.getAttribute('data-content');
            const isPage = btn.getAttribute('data-page') === 'true';
            
            
            if (currentPopup && btn.classList.contains('active')) {
                closePopup();
                btn.classList.remove('active');
            } else {
                
                panelButtons.forEach(b => b.classList.remove('active'));
                
                btn.classList.add('active');
                
                openPopup(contentFile, isPage);
            }
        });
    });
}

