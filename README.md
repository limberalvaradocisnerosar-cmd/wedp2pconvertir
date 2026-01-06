# Convertidor P2P - Web Pública

Sistema de conversión P2P que interactúa con Binance y Supabase.

## 🏗️ Estructura del Proyecto

```
convertidor-web/
├── api/                    # Serverless functions (Vercel)
│   ├── wakeup.js          # Endpoint para actualizar precios
│   └── config.js          # Endpoint para config pública
├── calculator/             # Motor de cálculo (puro, sin UI)
│   ├── index.js           # Funciones getPrices() y calculate()
│   └── supabase.js        # Cliente Supabase
├── frontend/               # Interfaz de usuario
│   ├── index.html         # Página principal
│   ├── index.js           # Inicialización
│   ├── ui/                # Capa de UI desacoplada
│   │   ├── ui.js         # Lógica de UI y eventos
│   │   ├── render.js     # Renderizado puro
│   │   └── animations.js # Animaciones opcionales
│   └── styles/            # Estilos CSS
│       ├── base.css       # Reset y variables
│       ├── layout.css     # Layout y estructura
│       └── components.css # Componentes UI
└── vercel.json            # Configuración Vercel
```

## 🚀 Características

- ✅ **Cálculo automático**: Se calcula automáticamente mientras escribes
- ✅ **Actualización de precios**: Botón para actualizar precios desde Binance
- ✅ **Motor desacoplado**: Lógica de cálculo separada de la UI
- ✅ **Serverless**: Funciones serverless en Vercel
- ✅ **Diseño moderno**: Estilo limpio tipo Apple

## 🎯 Uso

1. Ingresa un monto
2. Selecciona moneda origen y destino
3. El cálculo se hace automáticamente
4. Usa "Actualizar precios" para refrescar datos desde Binance

## 📝 Notas

- El motor de cálculo (`calculator/`) es independiente y no debe modificarse
- Los precios se cachean en el cliente para mejor rendimiento
- Cooldown de 60 segundos para actualización de precios
- Diseño responsive mobile-first

## 📄 Licencia

MIT
