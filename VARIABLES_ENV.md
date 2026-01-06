# Variables de Entorno - Resumen

## 🔐 Variables PRIVADAS (Server-side solamente)

Estas **NO** se exponen al cliente. Solo existen en el servidor.

### Para `api/wakeup.js`:
```
API_RUN_URL=https://api-binance.vercel.app/api/run
CRON_TOKEN=super-secreto
```

**Dónde se usan:**
- `api/wakeup.js` - Función serverless que llama al Proyecto 1
- `server.js` - Servidor local de desarrollo

**⚠️ IMPORTANTE:**
- NO usar prefijo `NEXT_PUBLIC_` ni `VITE_`
- Son completamente privadas
- El cliente nunca las ve

---

## 🌐 Variables PÚBLICAS (Van al cliente)

Estas se exponen al navegador porque son necesarias para el calculador.

### Para `calculator/supabase.js`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-supabase
```

**Dónde se usan:**
- `calculator/supabase.js` - Cliente de Supabase en el navegador
- `api/config.js` - Endpoint que las expone al frontend

**⚠️ IMPORTANTE:**
- Las keys de Supabase (`ANON_KEY`) están diseñadas para ser públicas
- Son seguras para exponer al cliente
- Se cargan desde `/api/config` antes de inicializar el calculador

---

## 📋 Configuración en Vercel

En Vercel → Settings → Environment Variables, configura:

### Privadas (server-side):
```
API_RUN_URL=https://api-binance.vercel.app/api/run
CRON_TOKEN=super-secreto
```

### Públicas (van al cliente):
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-supabase
```

---

## 🏠 Desarrollo Local

Crea `.env.local` (NO se sube a Git):

```env
# Privadas
API_RUN_URL=https://api-binance.vercel.app/api/run
CRON_TOKEN=tu-token-local

# Públicas
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

---

## ✅ Resumen Rápido

| Variable | Tipo | Dónde se usa | Expuesta al cliente? |
|----------|------|--------------|---------------------|
| `API_RUN_URL` | Privada | `api/wakeup.js` | ❌ NO |
| `CRON_TOKEN` | Privada | `api/wakeup.js` | ❌ NO |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | `calculator/supabase.js` | ✅ SÍ (necesaria) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | `calculator/supabase.js` | ✅ SÍ (necesaria) |

