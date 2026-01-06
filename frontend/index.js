/**
 * Frontend principal del convertidor
 * Botón público para actualizar precios
 */

const btn = document.getElementById('refresh-btn');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  btn.innerText = 'Actualizando...';

  try {
    const res = await fetch('/api/wakeup', { method: 'POST' });
    const data = await res.json();

    if (data.status === 'cooldown') {
      btn.innerText = `Espera ${data.remainingSeconds}s`;
    } else if (data.status === 'executed') {
      btn.innerText = 'Precios actualizados';
    } else {
      btn.innerText = 'Datos recientes';
    }

  } catch {
    btn.innerText = 'Error';
  }

  setTimeout(() => {
    btn.disabled = false;
    btn.innerText = 'Actualizar precios';
  }, 2000);
});

