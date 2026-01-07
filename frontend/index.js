/**
 * Frontend principal - Inicializa la UI
 * Delega toda la lógica a ui.js
 */
import { initUI } from './ui/ui.js';
import { initCustomSelects } from './ui/custom-select.js';

// Inicializar UI cuando el DOM esté listo
function initialize() {
  initUI();
  // Inicializar selectores personalizados después de un pequeño delay
  // para asegurar que el DOM esté completamente listo
  setTimeout(() => {
    initCustomSelects();
  }, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
