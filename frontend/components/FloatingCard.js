/**
 * FloatingCard - Contenedor con glassmorphism
 * Solo layout, sin lógica
 */

export function FloatingCard({ children, className = '' }) {
  return `
    <div class="floating-card ${className}">
      ${children}
    </div>
  `;
}

