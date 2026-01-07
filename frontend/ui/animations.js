export function fadeIn(element, duration = 300) {
  if (!element) return;
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    element.style.opacity = '1';
  });
}

export function slideUp(element, duration = 300) {
  if (!element) return;
  element.style.transform = 'translateY(20px)';
  element.style.opacity = '0';
  element.style.transition = `all ${duration}ms ease`;
  requestAnimationFrame(() => {
    element.style.transform = 'translateY(0)';
    element.style.opacity = '1';
  });
}

export function pulse(element) {
  if (!element) return;
  element.style.animation = 'pulse 0.5s ease';
  setTimeout(() => {
    element.style.animation = '';
  }, 500);
}

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  if (!document.querySelector('style[data-animations]')) {
    style.setAttribute('data-animations', 'true');
    document.head.appendChild(style);
  }
}

