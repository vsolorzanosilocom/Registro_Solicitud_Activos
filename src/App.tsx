/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Componente Raíz de la Aplicación (Single-Screen Layout)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FormSolicitud } from './components/FormSolicitud';
import { AlertToast } from './components/AlertToast';
import { DataInicial } from './types';
import { getFormInitialData } from './services/api';

export default function App() {
  const [masterData, setMasterData] = useState<DataInicial | null>(null);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  const gasUrlConfigured = Boolean(
    (import.meta.env.VITE_GAS_URL || '').trim()
  );

  // Carga única de datos maestros al montar la aplicación
  const fetchMasterData = useCallback(async () => {
    setIsLoadingMasterData(true);
    setInitError(null);

    try {
      const response = await getFormInitialData();
      if (response.success && response.data) {
        setMasterData(response.data);
      } else {
        setInitError(
          response.error ||
            'No se pudieron cargar los datos maestros de la hoja "BD". Verifique los permisos del Web App.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setInitError(msg);
    } finally {
      setIsLoadingMasterData(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* Header oficial con fondo Navy y Logo Silocom */}
      <Header onRefresh={fetchMasterData} isInitialLoading={isLoadingMasterData} />

      {/* Contenido Principal */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* Banner informativo si VITE_GAS_URL no está configurada */}
        {!gasUrlConfigured && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">⚙️</span>
              <div>
                <p className="font-bold text-amber-950">
                  Configuración de Conexión Requerida (Vercel / Local)
                </p>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  La variable <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">VITE_GAS_URL</code> no está configurada aún en el entorno. Configúrala en tu archivo <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">.env.local</code> o en el panel de Vercel con la URL de tu Web App de Google Apps Script.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error en carga inicial si ocurre */}
        {initError && (
          <div className="mb-6">
            <AlertToast
              type="error"
              message={`No se pudieron inicializar los datos de Google Sheets: ${initError}`}
              onDismiss={() => setInitError(null)}
            />
            <div className="flex justify-center -mt-2 mb-4">
              <button
                type="button"
                onClick={fetchMasterData}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-md border border-slate-300 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                ↻ Reintentar conexión con Google Sheets
              </button>
            </div>
          </div>
        )}

        {/* Formulario de 12 campos con selects autocompletables y cascada */}
        <FormSolicitud
          initialMasterData={masterData}
          isLoadingMasterData={isLoadingMasterData}
          onRefreshMasterData={fetchMasterData}
        />
      </div>

      {/* Footer oficial */}
      <Footer />
    </div>
  );
}
