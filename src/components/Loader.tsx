/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Indicador de Carga y Spinners
 */

import React from 'react';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Cargando...',
  size = 'md',
  inline = false,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2.5',
    lg: 'w-8 h-8 border-3',
  }[size];

  const spinner = (
    <div
      className={`${sizeMap} border-slate-300 border-t-blue-600 rounded-full animate-spin`}
      role="status"
    />
  );

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
        {spinner}
        {label && <span>{label}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600 space-y-3">
      {spinner}
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
    </div>
  );
};
