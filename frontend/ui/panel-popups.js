/**
 * panel-popups.js - Sistema de tarjetas flotantes para el panel
 * Maneja la apertura/cierre de popups y animaciones
 */

let currentPopup = null;

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
        
        // Si es precios-actuales, cargar los precios
        if (contentFile === 'precios-actuales') {
            loadPopupPrices();
        }
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

