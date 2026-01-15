

export function applyTheme(theme) {
  const html = document.documentElement;

  
  if (window.__themeMediaListener && theme !== 'auto') {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window.__themeMediaListener);
      window.__themeMediaListener = null;
    } catch (e) {
      
    }
  }

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

    
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

  
  applyTheme(savedTheme);

  
  themeButtons.forEach(btn => {
    const btnTheme = btn.getAttribute('data-theme');
    if (btnTheme === savedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    
    if (!btn.__themeInit) {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        localStorage.setItem('theme', theme);
        applyTheme(theme);

        
        const allBtns = document.querySelectorAll('.theme-btn');
        allBtns.forEach(b => b.classList.toggle('active', b === btn));
      });
      btn.__themeInit = true;
    }
  });
}
