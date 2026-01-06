# Configuración de Variables de Entorno

## 📋 Variables Requeridas

### Para el Calculador (Supabase)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-supabase
```

**Alternativas compatibles:**
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (para Vite)
- `window.SUPABASE_URL` y `window.SUPABASE_ANON_KEY` (configuración manual)

### Para el Despertador (API Run)

```env
NEXT_PUBLIC_API_RUN_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_CROM_TOKEN=super-secret-token
```

**Alternativas compatibles:**
- `VITE_API_RUN_URL` y `VITE_CROM_TOKEN` (para Vite)
- `window.NEXT_PUBLIC_API_RUN_URL` y `window.NEXT_PUBLIC_CROM_TOKEN` (configuración manual)

## 🏠 Desarrollo Local

### Next.js

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
NEXT_PUBLIC_API_RUN_URL=http://localhost:3000
NEXT_PUBLIC_CROM_TOKEN=tu-token-local
```

### Vite

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_API_RUN_URL=http://localhost:5173
VITE_CROM_TOKEN=tu-token-local
```

### Configuración Manual (cualquier bundler)

En tu HTML o JavaScript de inicialización:

```javascript
window.NEXT_PUBLIC_SUPABASE_URL = 'https://tu-proyecto.supabase.co';
window.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'tu-clave-anonima';
window.NEXT_PUBLIC_API_RUN_URL = 'https://tu-proyecto.vercel.app';
window.NEXT_PUBLIC_CROM_TOKEN = 'super-secret-token';
```

## 🚀 Producción

### Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega todas las variables con prefijo `NEXT_PUBLIC_`
4. Redeploy

### Netlify

1. Ve a tu sitio en Netlify
2. Site settings → Environment variables
3. Agrega todas las variables
4. Redeploy

### Otras Plataformas

Configura las variables según la documentación de tu plataforma. Asegúrate de que:
- Las variables con `NEXT_PUBLIC_` o `VITE_` se expongan al cliente
- No subas archivos `.env.local` al repositorio

## ✅ Verificación

El código busca las variables en este orden:
1. `window.*` (configuración manual)
2. `import.meta.env.*` (Vite)
3. `process.env.*` (Next.js/Node.js)

Si faltan variables, verás errores en la consola del navegador.

