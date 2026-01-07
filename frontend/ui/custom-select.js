/**
 * custom-select.js - Selector personalizado premium
 * Reemplaza el select nativo con un diseño custom
 */

/**
 * Crea un selector personalizado
 * @param {HTMLSelectElement} selectElement - El select nativo a reemplazar
 */
export function createCustomSelect(selectElement) {
  if (!selectElement) return;
  
  // Evitar inicialización duplicada
  if (selectElement.dataset.customSelectInitialized === 'true') {
    return;
  }
  selectElement.dataset.customSelectInitialized = 'true';

  // Crear contenedor del selector personalizado
  const customSelect = document.createElement('div');
  customSelect.className = 'custom-select-wrapper';
  
  // Crear el botón que muestra el valor seleccionado
  const selectButton = document.createElement('button');
  selectButton.className = 'custom-select-button';
  selectButton.type = 'button';
  
  // Crear el dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'custom-select-dropdown';
  
  // Ancho fijo del dropdown (se calcula una sola vez)
  let fixedDropdownWidth = null;
  
  // Obtener el ícono si existe
  const icon = selectElement.parentElement.querySelector('.currency-icon');
  
  // Flag para evitar loops infinitos
  let isUpdating = false;
  
  // Mapa de íconos de banderas
  const iconMap = {
    'ARS': '/frontend/public/banderas/argentina.png',
    'BOB': '/frontend/public/banderas/bolivia.png',
    'CLP': '/frontend/public/banderas/chile.png',
    'MXN': '/frontend/public/banderas/mexico.png',
    'PEN': '/frontend/public/banderas/peru.png'
  };
  
  function updateButton() {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const abbr = selectedOption.getAttribute('data-abbr') || selectedOption.value;
    
    const currentIcon = icon || selectElement.parentElement.querySelector('.currency-icon');
    const iconSrc = iconMap[abbr] || (currentIcon ? currentIcon.src : '');
    
    selectButton.innerHTML = `
      ${iconSrc ? `<img src="${iconSrc}" alt="${abbr}" class="custom-select-icon">` : ''}
      <span class="custom-select-text">${abbr}</span>
      <svg class="custom-select-arrow" width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M6 9L1 4h10z" fill="currentColor"/>
      </svg>
    `;
  }
  
  // Obtener el otro selector para evitar duplicados
  function getOtherSelector() {
    const allSelects = document.querySelectorAll('.currency-select');
    if (allSelects.length !== 2) return null;
    
    // Identificar si este es el primero o segundo
    const isFirst = selectElement.id === 'fiatFrom' || 
                    (selectElement.id !== 'fiatTo' && allSelects[0] === selectElement);
    
    return isFirst ? allSelects[1] : allSelects[0];
  }
  
  // Crear opciones del dropdown
  function createOptions() {
    dropdown.innerHTML = '';
    const otherSelector = getOtherSelector();
    const otherValue = otherSelector ? otherSelector.value : null;
    
    Array.from(selectElement.options).forEach((option, index) => {
      const optionElement = document.createElement('div');
      const isSelected = option.selected;
      const isDisabled = otherValue && option.value === otherValue && !isSelected;
      
      optionElement.className = 'custom-select-option';
      if (isSelected) {
        optionElement.classList.add('selected');
      }
      if (isDisabled) {
        optionElement.classList.add('disabled');
        optionElement.title = 'Esta moneda ya está seleccionada en el otro campo';
      }
      
      const abbr = option.getAttribute('data-abbr') || option.value;
      const fullText = option.textContent;
      
      // Crear imagen protegida
      if (iconMap[option.value]) {
        const optionImg = document.createElement('img');
        optionImg.src = iconMap[option.value];
        optionImg.alt = abbr;
        optionImg.className = 'option-icon';
        optionImg.draggable = false;
        optionImg.oncontextmenu = (e) => e.preventDefault();
        optionImg.ondragstart = (e) => e.preventDefault();
        optionImg.onerror = function() { this.style.display = 'none'; };
        optionImg.style.pointerEvents = 'none';
        optionImg.style.userSelect = 'none';
        optionElement.appendChild(optionImg);
      }
      
      // Crear texto
      const textSpan = document.createElement('span');
      textSpan.className = 'option-text';
      textSpan.textContent = fullText;
      optionElement.appendChild(textSpan);
      
      // Crear check si está seleccionado
      if (isSelected) {
        const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        checkSvg.setAttribute('class', 'option-check');
        checkSvg.setAttribute('width', '16');
        checkSvg.setAttribute('height', '16');
        checkSvg.setAttribute('viewBox', '0 0 16 16');
        checkSvg.setAttribute('fill', 'none');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M13.5 4L6 11.5L2.5 8');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        checkSvg.appendChild(path);
        optionElement.appendChild(checkSvg);
      }
      
      if (!isDisabled) {
        optionElement.addEventListener('click', () => {
          // Actualizar el select nativo
          selectElement.selectedIndex = index;
          
          // Cerrar dropdown primero
          closeDropdown();
          
          // Actualizar botón
          updateButton();
          
          // Actualizar ícono si existe
          if (icon) {
            icon.src = iconMap[option.value] || '';
            icon.alt = option.value;
          }
          
        // Disparar evento change después de actualizar visualmente
        // Usar flag para evitar loops
        if (!isUpdating) {
          isUpdating = true;
          setTimeout(() => {
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            isUpdating = false;
          }, 10);
        }
        });
      } else {
        optionElement.style.cursor = 'not-allowed';
      }
      
      dropdown.appendChild(optionElement);
    });
  }
  
  // Abrir/cerrar dropdown
  function toggleDropdown() {
    const isOpen = customSelect.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }
  
  function closeAllOtherSelects() {
    const allSelects = document.querySelectorAll('.custom-select-wrapper');
    allSelects.forEach(wrapper => {
      if (wrapper !== customSelect && wrapper.classList.contains('open')) {
        wrapper.classList.remove('open');
      }
    });
  }

  function openDropdown() {
    closeAllOtherSelects();
    
    dropdown.innerHTML = '';
    createOptions();
    
    customSelect.classList.add('open');
    
    requestAnimationFrame(() => {
      const container = document.querySelector('.currency-selectors-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${containerRect.bottom + 8}px`;
      dropdown.style.left = `${containerRect.left + (containerRect.width / 2)}px`;
      dropdown.style.transform = 'translateX(-50%)';
      dropdown.style.right = 'auto';
      
      // Calcular ancho solo la primera vez
      if (fixedDropdownWidth === null) {
        const optionElements = dropdown.querySelectorAll('.custom-select-option');
        let maxContentWidth = 200;
        
        // Primero aplicar un ancho temporal para medir correctamente
        dropdown.style.width = 'auto';
        dropdown.style.minWidth = '200px';
        dropdown.style.maxWidth = 'none';
        
        optionElements.forEach(option => {
          option.style.whiteSpace = 'nowrap';
          // Forzar un layout para obtener medidas precisas
          const tempWidth = option.offsetWidth;
          if (tempWidth > maxContentWidth) {
            maxContentWidth = tempWidth;
          }
        });
        
        const maxWidth = Math.min(maxContentWidth + 48, window.innerWidth - 32);
        fixedDropdownWidth = Math.max(200, maxWidth);
      }
      
      // Aplicar ancho fijo siempre (resetear cualquier estilo previo)
      dropdown.style.width = `${fixedDropdownWidth}px`;
      dropdown.style.minWidth = `${fixedDropdownWidth}px`;
      dropdown.style.maxWidth = `${fixedDropdownWidth}px`;
      dropdown.style.boxSizing = 'border-box';
    });
  }
  
  function closeDropdown() {
    customSelect.classList.remove('open');
  }
  
  // Event listeners
  selectButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
  
  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
  
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && customSelect.classList.contains('open')) {
      closeDropdown();
    }
  });

  // NO cerrar al hacer scroll - permitir scroll dentro del dropdown
  // El dropdown tiene su propio scroll interno y debe permanecer abierto
  
  // Escuchar cambios del select nativo (por si cambia programáticamente)
  // Solo actualizar botón, no recrear opciones para evitar loops
  selectElement.addEventListener('change', () => {
    updateButton();
    // Solo actualizar opciones si el dropdown está abierto
    if (customSelect.classList.contains('open')) {
      createOptions();
    }
  });
  
  // Escuchar cambios del otro selector para actualizar opciones deshabilitadas
  const otherSelector = getOtherSelector();
  if (otherSelector) {
    otherSelector.addEventListener('change', () => {
      if (!isUpdating && customSelect.classList.contains('open')) {
        isUpdating = true;
        createOptions();
        setTimeout(() => { isUpdating = false; }, 100);
      }
    });
  }
  
  // Construir estructura
  customSelect.appendChild(selectButton);
  customSelect.appendChild(dropdown);
  
  // Ocultar select nativo pero mantenerlo funcional
  selectElement.style.position = 'absolute';
  selectElement.style.opacity = '0';
  selectElement.style.pointerEvents = 'none';
  selectElement.style.width = '1px';
  selectElement.style.height = '1px';
  
  // Insertar el selector personalizado
  selectElement.parentElement.insertBefore(customSelect, selectElement);
  
  // Inicializar
  updateButton();
}

/**
 * Inicializa todos los selectores personalizados
 */
export function initCustomSelects() {
  const selects = document.querySelectorAll('.currency-select');
  selects.forEach(select => {
    createCustomSelect(select);
  });
}

