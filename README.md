# SILOCOM C.A. — Registro de Solicitud de Activos

Frontend web desarrollado con React, TypeScript y Vite para consultar catálogos y registrar solicitudes de activos en Google Sheets.

## Arquitectura

- **Frontend:** componentes y formularios React en `src/`.
- **API cliente:** `src/services/api.ts` envía solicitudes HTTP POST directamente a la Web App de Google Apps Script, usando `VITE_GAS_URL` y `VITE_API_TOKEN`.
- **Backend:** `Codigo.gs` es la copia local de referencia del script container-bound. Está integrado con la hoja de cálculo y admite tanto la interfaz nativa de Apps Script como las acciones REST que consume el frontend.
- **Persistencia:** Google Sheets, incluyendo las pestañas `BD` y `NUEVAS SOLICITUDES`.
- **Sin backend Vercel:** el repositorio no contiene endpoints `api/`; Vercel, si se usa, aloja el frontend estático mientras GAS ofrece la API.

La copia `gas/Codigo.gs` contiene actualmente el mismo código que `Codigo.gs`. Usa `Codigo.gs` como referencia principal al actualizar el script y mantén ambas copias sincronizadas si necesitas conservar el archivo duplicado para el flujo de Apps Script.

## Requisitos y desarrollo local

Se requiere Node.js y npm.

```bash
npm install
```

Crea `.env.local` en la raíz del proyecto:

```env
VITE_GAS_URL=https://script.google.com/macros/s/ID_DE_IMPLEMENTACION/exec
VITE_API_TOKEN=REEMPLAZAR_POR_EL_TOKEN_CONFIGURADO_EN_GAS
```

Inicia Vite con `npm run dev`. Para validar tipos y compilar:

```bash
npm run lint
npm run build
```

El directorio de salida es `dist/`.

## Despliegue

### Frontend en Vercel

Configura el proyecto como una aplicación Vite:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Variables de compilación:** `VITE_GAS_URL` y `VITE_API_TOKEN`

Configura las variables en el entorno correspondiente de Vercel y vuelve a desplegar después de cambiarlas. También se pueden usar en `.env.local` para desarrollo local.

### Backend en Google Apps Script

`Codigo.gs` es código fuente local, no un backend que ejecute Vercel. Publica el script container-bound como Web App desde Apps Script, con permisos y acceso apropiados para la hoja y para los usuarios previstos, y configura su URL `/exec` como `VITE_GAS_URL`.

## Datos y protección de fórmulas

- Las funciones `getFormInitialData()`, `getProductos()`, `getMarcas()` y `getModelos()` consultan los catálogos de la pestaña `BD`.
- `guardarSolicitud()` escribe una fila en `NUEVAS SOLICITUDES`, desde la columna C hasta la N. Las columnas A y B quedan fuera de ese rango de escritura.
- Si cambia la estructura de la hoja, verifica el mapeo en `Codigo.gs` antes de modificar el rango o desplegar cambios.

## Seguridad de configuración

Las variables con prefijo `VITE_` se incorporan al JavaScript servido al navegador. Por ello, `VITE_API_TOKEN` no es un secreto confidencial y no debe considerarse una barrera suficiente contra el uso no autorizado de la API. No incluyas credenciales privadas en variables `VITE_*`; aplica controles de acceso adecuados en el backend y en la configuración de Apps Script.
