/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Barra Superior de Encabezado con Logo Tipográfico Oficial
 */

import React from 'react';
import { SilocomLogo } from './SilocomLogo';

interface HeaderProps {
  onRefresh?: () => void;
  isInitialLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isInitialLoading }) => {
  return (
    <header className="w-full bg-[#0f172a] border-b border-slate-800 text-white py-6 px-4 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Logo Silocom en pastilla blanca dentro de barra navy oscura */}
        <div className="mb-4 transform hover:scale-[1.02] transition-transform">
          <SilocomLogo size="md" showRif={true} />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-slate-100">
          Nueva Solicitud de Activos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Formulario de registro y control interno de inventario y equipos
        </p>

        {onRefresh && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isInitialLoading}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
              title="Recargar datos maestros de Google Sheets"
            >
              <svg
                className={`w-3.5 h-3.5 ${isInitialLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isInitialLoading ? 'Actualizando BD...' : 'Sincronizar Datos'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
