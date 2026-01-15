
import { initUI } from './ui/ui.js';
import { initCustomSelects } from './ui/custom-select.js';


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
