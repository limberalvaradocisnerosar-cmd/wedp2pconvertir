/**
 * Frontend principal - Inicializa la UI
 * Delega toda la lógica a ui.js
 */
import { initUI } from './ui/ui.js';

// Inicializar UI cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
