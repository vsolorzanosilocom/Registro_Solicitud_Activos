/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Pie de Página Institucional con Logo Oficial y Metadatos de Sistema
 */

import React from 'react';
import { SilocomLogo } from './SilocomLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0f172a] border-t border-slate-800 text-slate-400 py-8 px-4 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-4">
        {/* Logo Silocom en footer */}
        <SilocomLogo size="sm" showRif={true} />

        <div className="text-xs space-y-1 text-slate-400">
          <p className="font-medium text-slate-300">
            SILOCOM C.A. — Sistema Centralizado de Registro y Solicitud de Activos
          </p>
          <p className="text-slate-500">
            Integración Google Sheets (Container-Bound) &bull; Frontend React + Vite para Vercel
          </p>
          <p className="text-[11px] text-slate-600 pt-2">
            Desarrollo &amp; Arquitectura: Victor Solorzano &bull; Versión 3.0 REST
          </p>
        </div>
      </div>
    </footer>
  );
};
