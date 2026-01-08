/**
 * panel-popups.js - Sistema de tarjetas flotantes para el panel
 * Maneja la apertura/cierre de popups y animaciones
 */

let currentPopup = null;
let popupResizeHandler = null; // used to remove resize listener when popup closes
let popupMutationObserver = null; // observe content changes to readjust popup fit


/**
 * Abre una tarjeta flotante con el contenido especificado
 * @param {string} contentFile - Nombre del archivo HTML a cargar
 * @param {boolean} isPage - Si es true, abre en nueva página
 */
export async function openPopup(contentFile, isPage = false) {
    // Si es una página, redirigir
    if (isPage) {
        window.location.href = `/frontend/htmls/${contentFile}.html`;
        return;
    }

    // Cerrar popup actual si existe
    closePopup();

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popup-overlay';
    
    // Crear contenedor del popup
    const popup = document.createElement('div');
    popup.className = 'popup-card';
    popup.id = 'popup-card';
    
    // Crear contenido
    const content = document.createElement('div');
    content.className = 'popup-content';
    content.id = 'popup-content';
    content.innerHTML = '<div class="popup-loading">Cargando...</div>';
    
    popup.appendChild(content);
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    currentPopup = popup;
    
    // Cargar contenido
    try {
        const response = await fetch(`/frontend/htmls/${contentFile}.html`);
        if (!response.ok) throw new Error('No se pudo cargar el contenido');
        const html = await response.text();
        content.innerHTML = html;
        
        // Si la página incluye un botón con data-close-popup, enlazar cierre
        const closeButtons = content.querySelectorAll('[data-close-popup]');
        closeButtons.forEach(btn => btn.addEventListener('click', () => closePopup()));

        // Si es precios-actuales, cargar los precios
        if (contentFile === 'precios-actuales') {
            loadPopupPrices();
        }

        // Función para ajustar el popup al viewport (ancho/alto) y reducir fuente si es necesario
        function adjustPopupFit() {
            const maxW = window.innerWidth - 48; // margen lateral mínimo
            const maxH = window.innerHeight - 48;

            // Ajustar ancho si excede
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.width > maxW) popup.style.width = `calc(100% - 48px)`;
            else popup.style.width = ''; // restaurar si cabe

            // Ajustar alto máximo del contenido
            if (popupRect.height > maxH) {
                content.style.maxHeight = `${maxH - 24}px`;
            } else {
                content.style.maxHeight = '';
            }

            // Intentar reducir la fuente gradualmente hasta un mínimo para que encaje
            const computed = window.getComputedStyle(popup);
            let fontPx = parseFloat(computed.fontSize);
            const minFontPx = 12; // no reducir bajo ~12px
            const step = 1; // px por iteración
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

            // Si todavía excede, asegurar scroll interno en el contenido
            const finalRect = popup.getBoundingClientRect();
            if (finalRect.height > maxH) content.style.maxHeight = `${maxH - 24}px`;
        }

        // Ejecutar ajuste inicial dentro de RAF
        requestAnimationFrame(() => adjustPopupFit());

        // Recalcular en resize/orientationchange mientras el popup está abierto
        popupResizeHandler = () => requestAnimationFrame(() => adjustPopupFit());
        window.addEventListener('resize', popupResizeHandler);
        window.addEventListener('orientationchange', popupResizeHandler);

        // Observar cambios en el contenido (imagenes que cargan, nodos dinámicos) y reajustar
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => requestAnimationFrame(() => adjustPopupFit()));
            observer.observe(content, { childList: true, subtree: true, characterData: true });
            popupMutationObserver = observer;
        }

        // Reajustar cuando las imágenes internas terminen de cargar
        const imgs = content.querySelectorAll('img');
        imgs.forEach(img => {
            if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(() => adjustPopupFit()));
        });
    } catch (error) {
        console.error('Error cargando popup:', error);
        content.innerHTML = '<div class="popup-error">Error al cargar el contenido</div>';
    }
    
    // Animar entrada
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        popup.classList.add('active');
    });
    
    // Event listeners
    overlay.addEventListener('click', closePopup);
    
    // Cerrar con Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Cierra la tarjeta flotante actual
 */
export function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('popup-card');
    
    if (popup) {
        popup.classList.remove('active');
        overlay?.classList.remove('active');
        
        // Remover listeners de resize/orientation
        if (popupResizeHandler) {
            window.removeEventListener('resize', popupResizeHandler);
            window.removeEventListener('orientationchange', popupResizeHandler);
            popupResizeHandler = null;
        }

        // Desconectar observer de contenido si existe
        if (popupMutationObserver) {
            try { popupMutationObserver.disconnect(); } catch (e) { /* ignore */ }
            popupMutationObserver = null;
        }

        setTimeout(() => {
            popup.remove();
            overlay?.remove();
            currentPopup = null;
        }, 300);
    }
}

/**
 * Carga precios en el popup de precios actuales
 */
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
            const lastUpdate = priceData.lastUpdate || 'N/A';
            
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

/**
 * Inicializa los event listeners de los botones del panel
 */
export function initPanelButtons() {
    const panelButtons = document.querySelectorAll('.panel-info-btn');
    
    panelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const contentFile = btn.getAttribute('data-content');
            const isPage = btn.getAttribute('data-page') === 'true';
            
            // Si el popup ya está abierto y es el mismo botón, cerrarlo
            if (currentPopup && btn.classList.contains('active')) {
                closePopup();
                btn.classList.remove('active');
            } else {
                // Remover active de todos los botones
                panelButtons.forEach(b => b.classList.remove('active'));
                // Agregar active al botón clickeado
                btn.classList.add('active');
                // Abrir popup
                openPopup(contentFile, isPage);
            }
        });
    });
}

