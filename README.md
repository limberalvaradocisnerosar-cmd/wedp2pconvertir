# Convertidor Web P2P

Web pública del convertidor P2P con botón para actualizar precios.

## 🏗️ Arquitectura

- **Frontend**: HTML + CSS + JS puro (sin frameworks)
- **Backend**: Vercel Serverless Functions
- **Seguridad**: Token CRON protegido server-side

## 🔐 Variables de Entorno (Vercel)

Configurar en Vercel → Settings → Environment Variables:

```
API_RUN_URL=https://api-binance.vercel.app/api/run
CRON_TOKEN=super-secreto
```

⚠️ **NO usar NEXT_PUBLIC_** - estas variables son privadas (server-side)

## 🚀 Flujo

1. Usuario hace click en "Actualizar precios"
2. Frontend llama a `/api/wakeup` (POST)
3. `api/wakeup.js` (server-side) llama al Proyecto 1 con `CRON_TOKEN`
4. El Proyecto 1 decide si ejecuta según su TTL

## 📁 Estructura

```
convertidor-web/
├── api/
│   └── wakeup.js        # Serverless function (seguro)
├── frontend/
│   ├── index.html
│   ├── index.js
│   ├── components/
│   ├── styles/
│   └── public/
└── vercel.json
```

## ✅ Checklist de Verificación

- [ ] `/api/wakeup` responde 200
- [ ] `CRON_TOKEN` NO aparece en DevTools
- [ ] Proyecto 1 recibe la llamada
- [ ] TTL sigue mandando
- [ ] Botón no rompe nada

