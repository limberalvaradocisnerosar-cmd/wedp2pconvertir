# 🚀 Guía de Despliegue a Vercel

## Pasos para desplegar

### 1. Conectar repositorio a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Importa el repositorio: `limberalvaradocisnerosar-cmd/convertidor-web`
4. Vercel detectará automáticamente el proyecto

### 2. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-supabase
NEXT_PUBLIC_API_RUN_URL=https://tu-proyecto-api.vercel.app
NEXT_PUBLIC_CROM_TOKEN=super-secret-token
```

**Cómo agregar:**
- Settings → Environment Variables
- Agrega cada variable
- Selecciona "Production", "Preview" y "Development"
- Guarda y redeploy

### 3. Configuración del Proyecto

**Framework Preset:** Otro (o Static Site)

**Build Command:** (dejar vacío o `echo 'No build'`)

**Output Directory:** `.` (raíz)

**Install Command:** (dejar vacío)

### 4. Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el despliegue
3. Tu sitio estará disponible en `https://tu-proyecto.vercel.app`

## ⚠️ Notas Importantes

- Este proyecto es **JavaScript puro** (ES modules)
- No requiere build step
- Las variables con `NEXT_PUBLIC_` se exponen al cliente
- Asegúrate de que `/api/run` esté desplegado en otro proyecto

## 🔧 Si necesitas un servidor estático

Si Vercel no sirve los archivos correctamente, puedes:

1. **Opción A:** Usar Next.js
   - Crear `pages/index.js` que importe `frontend/index.js`
   - Configurar `next.config.js`

2. **Opción B:** Usar un servidor estático
   - Crear `public/index.html` que cargue los módulos
   - Configurar Vercel para servir archivos estáticos

3. **Opción C:** Usar Vite
   - Crear `vite.config.js`
   - Configurar build para producción

## 📝 Verificación Post-Despliegue

1. Verifica que las variables de entorno estén configuradas
2. Abre la consola del navegador
3. Verifica que no haya errores de variables faltantes
4. Prueba una conversión

## 🐛 Troubleshooting

**Error: "SUPABASE_URL no está definido"**
- Verifica que las variables tengan el prefijo `NEXT_PUBLIC_`
- Asegúrate de hacer redeploy después de agregar variables

**Error: "Module not found"**
- Verifica que todos los archivos estén en el repositorio
- Asegúrate de que las rutas de import sean correctas

**El despertador no funciona**
- Verifica `NEXT_PUBLIC_API_RUN_URL` y `NEXT_PUBLIC_CROM_TOKEN`
- Revisa la consola del navegador para errores

