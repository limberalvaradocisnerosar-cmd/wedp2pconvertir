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
  
  // Obtener el ícono si existe
  const icon = selectElement.parentElement.querySelector('.currency-icon');
  
  // Mapa de íconos de banderas
  const iconMap = {
    'ARS': '/frontend/public/banderas/argentina.svg',
    'BOB': '/frontend/public/banderas/bolivia.svg',
    'CLP': '/frontend/public/banderas/chile.svg',
    'MXN': '/frontend/public/banderas/mexico.svg',
    'PEN': '/frontend/public/banderas/peru.svg'
  };
  
  // Función para actualizar el botón con el valor seleccionado
  function updateButton() {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const abbr = selectedOption.getAttribute('data-abbr') || selectedOption.value;
    
    // Obtener ícono actualizado
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
      
      optionElement.innerHTML = `
        <img src="${iconMap[option.value] || ''}" alt="${abbr}" class="option-icon" onerror="this.style.display='none'">
        <span class="option-text">${fullText}</span>
        ${isSelected ? '<svg class="option-check" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        ${isDisabled ? '<span class="option-disabled-hint">Ya seleccionada</span>' : ''}
      `;
      
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
          setTimeout(() => {
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
          }, 10);
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
  
  function openDropdown() {
    // Actualizar opciones antes de abrir para reflejar cambios en el otro selector
    createOptions();
    
    customSelect.classList.add('open');
    
    // Calcular posición del dropdown con position: fixed
    const rect = selectButton.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Calcular posición
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      // Mostrar arriba
      dropdown.style.top = `${rect.top + window.scrollY - dropdown.offsetHeight - 8}px`;
      dropdown.classList.add('dropdown-up');
    } else {
      // Mostrar abajo
      dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
      dropdown.classList.remove('dropdown-up');
    }
    
    // Posición horizontal
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
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

  // Cerrar al hacer scroll
  window.addEventListener('scroll', () => {
    if (customSelect.classList.contains('open')) {
      closeDropdown();
    }
  }, true);
  
  // Escuchar cambios del select nativo (por si cambia programáticamente)
  selectElement.addEventListener('change', () => {
    updateButton();
    createOptions();
  });
  
  // Escuchar cambios del otro selector para actualizar opciones deshabilitadas
  const otherSelector = getOtherSelector();
  if (otherSelector) {
    otherSelector.addEventListener('change', () => {
      // Solo actualizar si el dropdown está abierto
      if (customSelect.classList.contains('open')) {
        createOptions();
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

