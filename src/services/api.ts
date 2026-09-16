/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Controlador de APIs y Comunicación REST con Google Apps Script
 */

import { ApiResponse, DataInicial, SolicitudPayload } from '../types';

const BASE: string = (import.meta.env.VITE_GAS_URL || '').trim();
const TOKEN: string = (import.meta.env.VITE_API_TOKEN || 'SILOCOM-SOL-2026').trim();

/**
 * Función central de invocación REST hacia el Web App de Google Apps Script.
 * Usa Content-Type: text/plain;charset=utf-8 para evitar preflights CORS OPTIONS innecesarios.
 * NO utiliza datos simulados: los errores de red, auth o JSON se propagan fielmente.
 */
export async function callApi<T>(action: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  if (!BASE) {
    throw new Error(
      'La variable de entorno VITE_GAS_URL no está configurada. Por favor define la URL del Web App de Google Apps Script en tu archivo .env.local o en las variables de entorno de Vercel.'
    );
  }

  const queryParams = new URLSearchParams({
    action,
    token: TOKEN,
  });

  const url = `${BASE}${BASE.includes('?') ? '&' : '?'}${queryParams.toString()}`;

  const payloadBody = {
    token: TOKEN,
    action,
    ...params,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payloadBody),
  });

  if (!response.ok && response.status !== 400 && response.status !== 403 && response.status !== 500) {
    throw new Error(`Error de red HTTP ${response.status}: ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result;
}

/**
 * Obtiene las listas independientes iniciales desde la hoja "BD" (Categorías, Técnicos, etc.)
 */
export async function getFormInitialData(): Promise<ApiResponse<DataInicial>> {
  return callApi<DataInicial>('getFormInitialData');
}

/**
 * Filtra los productos mapeando según la Categoría seleccionada.
 */
export async function getProductos(categoria: string): Promise<ApiResponse<string[]>> {
  return callApi<string[]>('getProductos', { categoria });
}

/**
 * Filtra las marcas mapeando según Categoría y Producto.
 */
export async function getMarcas(categoria: string, producto: string): Promise<ApiResponse<string[]>> {
  return callApi<string[]>('getMarcas', { categoria, producto });
}

/**
 * Filtra los modelos según Categoría, Producto y Marca.
 */
export async function getModelos(
  categoria: string,
  producto: string,
  marca: string
): Promise<ApiResponse<string[]>> {
  return callApi<string[]>('getModelos', { categoria, producto, marca });
}

/**
 * Registra los datos del formulario en la hoja "NUEVAS SOLICITUDES" (Columnas C a N).
 */
export async function guardarSolicitud(payload: SolicitudPayload): Promise<ApiResponse<null>> {
  return callApi<null>('guardarSolicitud', { payload });
}
