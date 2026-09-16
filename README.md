# SILOCOM C.A. — Sistema de Registro de Solicitud de Activos

Frontend moderno desarrollado en **React + Vite + TypeScript** con integración directa al backend en **Google Apps Script** y **Google Sheets** (hojas `BD` y `NUEVAS SOLICITUDES`).

---

## 📋 Arquitectura y Despliegue

El sistema utiliza una arquitectura desacoplada y de alto rendimiento:
- **Backend (Google Apps Script - Container-Bound):** Archivo `Código.gs` integrado directamente a la hoja de cálculo de Google Sheets. Provee una API REST pública protegida por token y mantiene simultáneamente la Web App interna de Apps Script.
- **Frontend (React + Vite + TypeScript):** Interfaz rápida, ligera y adaptable (desktop y mobile), lista para desplegar en **Vercel** o ejecutar localmente con Vite.

---

## 🚀 Despliegue en Vercel

### Paso 1: Subir el repositorio a GitHub
1. Inicializa git en el proyecto (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "feat: migración frontend react para vercel con backend gas rest"
   ```
2. Crea un repositorio en GitHub y sube tu código:
   ```bash
   git remote add origin https://github.com/tu-usuario/silocom-solicitud-activos.git
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Importar el proyecto en Vercel
1. Ingresa a tu cuenta de [Vercel](https://vercel.com).
2. Haz clic en **"Add New..."** → **"Project"**.
3. Selecciona tu cuenta de GitHub y haz clic en **"Import"** en el repositorio creado.

### Paso 3: Configurar Build y Output Settings
Vercel detecta automáticamente la configuración de Vite:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Paso 4: Configurar Variables de Entorno en Vercel
En la sección **"Environment Variables"** de Vercel, agrega:

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `VITE_GAS_URL` | `https://script.google.com/macros/s/AKfycb.../exec` | URL generada al implementar la Web App de Google Apps Script (terminada en `/exec`) |
| `VITE_API_TOKEN` | `SILOCOM-SOL-2026` | Token compartido configurado en `Código.gs` |

Haz clic en **"Deploy"**. En segundos tendrás tu aplicación publicada en la CDN global de Vercel.

---

## ⚙️ Configuración del Backend en Google Apps Script

1. Abre la hoja de cálculo de Google Sheets de Silocom.
2. Ve al menú superior: **Extensiones** → **Apps Script**.
3. Reemplaza el archivo `Código.gs` con el código provisto en `gas/Codigo.gs` (o en la raíz del proyecto `Codigo.gs`).
4. Haz clic en el botón azul **"Implementar"** (Deploy) → **"Nueva implementación"** (New deployment).
5. Selecciona el tipo de engranaje: **"Aplicación web"** (Web app).
6. Configura:
   - **Descripción:** `API REST Silocom V3`
   - **Ejecutar como:** `Yo (tu correo electrónico)`
   - **Quién tiene acceso:** `Cualquier persona` (Anyone) *(vital para permitir llamadas fetch desde Vercel sin login de Google)*.
7. Haz clic en **"Implementar"** y copia la **URL de la aplicación web** terminada en `/exec`.
8. Pega esa URL en tu archivo `.env.local` (desarrollo local) y en las variables de entorno de Vercel (producción).

---

## 💻 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables locales en `.env.local`:
   ```env
   VITE_GAS_URL="https://script.google.com/macros/s/AKfycb.../exec"
   VITE_API_TOKEN="SILOCOM-SOL-2026"
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 🛡️ Estructura de Datos y Protección de Fórmulas

- **Lectura:**
  - `getFormInitialData()`: Lee datos maestros de la pestaña `BD`.
  - `getProductos()`, `getMarcas()`, `getModelos()`: Filtros dinámicos en cascada desde la hoja `BD`.
- **Escritura:**
  - `guardarSolicitud()`: Escribe exclusivamente en las columnas **C a N** (columnas 3 a 14) de la hoja `NUEVAS SOLICITUDES`.
  - Respeta y no sobrescribe ninguna columna formulada previa (A, B) ni columnas posteriores.

---

## 👥 Autoría y Créditos
- **Proyecto:** Sistema de Registro de Solicitud de Activos - Silocom C.A.
- **Desarrollo & Arquitectura:** Victor Solorzano
- **Asistencia Técnica:** Google AI Studio & Antigravity IDE
