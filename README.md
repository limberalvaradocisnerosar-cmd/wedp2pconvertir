# Convertidor P2P Web

Sistema de conversión de monedas P2P con Binance + Supabase.

## 🏗️ Arquitectura

El proyecto está dividido en 3 módulos independientes:

### 📁 `calculator/` - Motor de cálculo
- Lee precios desde Supabase
- Ejecuta las 5 fases de conversión
- **NO** llama a Binance
- **NO** llama a /api/run.js

### 📁 `despertador/` - Despierta la API
- Hace POST a `/api/run` cada 60 segundos
- Solo funciona mientras la web está abierta
- El TTL del backend controla las ejecuciones reales

### 📁 `frontend/` - Interfaz de usuario
- UI pura, sin lógica de negocio
- Delega cálculos al motor
- Muestra resultados formateados

## 🚀 Configuración

### Variables de entorno

Crea un archivo `.env.local` (o configura en tu plataforma de despliegue):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima

# API Run
NEXT_PUBLIC_API_RUN_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_CROM_TOKEN=super-secret-token
```

### Desarrollo local

1. Copia `.env.local.example` a `.env.local`
2. Rellena con tus valores reales
3. Configura tu bundler (Next.js, Vite, etc.) para leer las variables

### Producción

Configura las variables de entorno en tu plataforma:
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Environment variables
- **Otros**: Según la documentación de tu plataforma

## 📦 Compatibilidad

El código es compatible con:
- ✅ Next.js (usa `process.env.NEXT_PUBLIC_*`)
- ✅ Vite (usa `import.meta.env.VITE_*`)
- ✅ Configuración manual via `window.*`

## 🔒 Seguridad

- Las variables con prefijo `NEXT_PUBLIC_` o `VITE_` son **públicas** (se exponen al cliente)
- El token `CROM_TOKEN` solo protege `/api/run` de spam externo
- El TTL del backend es la defensa real contra ejecuciones duplicadas

## 📝 Notas

- El calculador **solo lee** de Supabase, nunca escribe
- El despertador es silencioso y no rompe la UI si falla
- El frontend es completamente desacoplado del motor

