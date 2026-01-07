/**
 * Frontend principal - Inicializa la UI
 * Delega toda la lógica a ui.js
 */
import { initUI } from './ui/ui.js';
import { initCustomSelects } from './ui/custom-select.js';

// Inicializar UI cuando el DOM esté listo
function initialize() {
  initCustomSelects();
  setTimeout(() => {
    initUI();
  }, 50);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
