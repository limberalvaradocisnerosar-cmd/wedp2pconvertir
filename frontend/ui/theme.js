/*
 * theme.js - Sistema compartido de temas (auto / light / dark)
 * Exporta applyTheme y initThemeSystem para ser usados en todas las páginas
 */

export function applyTheme(theme) {
  const html = document.documentElement;

  // Remove previous listener if exists when switching away from 'auto'
  if (window.__themeMediaListener && theme !== 'auto') {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window.__themeMediaListener);
      window.__themeMediaListener = null;
    } catch (e) {
      // noop
    }
  }

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

    // Escuchar cambios del sistema (solo una vez)
    if (!window.__themeMediaListener) {
      window.__themeMediaListener = (e) => {
        html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', window.__themeMediaListener);
    }
  } else {
    html.setAttribute('data-theme', theme);
  }
}

export function initThemeSystem(root = document) {
  const themeButtons = root.querySelectorAll('.theme-btn');
  if (!themeButtons || themeButtons.length === 0) return;

  const savedTheme = localStorage.getItem('theme') || 'auto';

  // Aplicar tema guardado
  applyTheme(savedTheme);

  // Marcar botón activo según tema guardado
  themeButtons.forEach(btn => {
    const btnTheme = btn.getAttribute('data-theme');
    if (btnTheme === savedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    // Evitar duplicar listeners: guardar flag
    if (!btn.__themeInit) {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        localStorage.setItem('theme', theme);
        applyTheme(theme);

        // Actualizar estado activo de todos los botones en el documento
        const allBtns = document.querySelectorAll('.theme-btn');
        allBtns.forEach(b => b.classList.toggle('active', b === btn));
      });
      btn.__themeInit = true;
    }
  });
}
