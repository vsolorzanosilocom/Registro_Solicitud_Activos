/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Logotipo Tipográfico Oficial Silocom C.A.
 */

import React from 'react';

interface SilocomLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showRif?: boolean;
  className?: string;
}

export const SilocomLogo: React.FC<SilocomLogoProps> = ({
  size = 'md',
  showRif = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: {
      container: 'px-3.5 py-1.5 rounded-md min-w-[130px]',
      wordmark: 'text-xl',
      rif: 'text-[7.5px] tracking-[0.14em]',
    },
    md: {
      container: 'px-5 py-2 rounded-lg min-w-[160px]',
      wordmark: 'text-2xl',
      rif: 'text-[9px] tracking-[0.16em]',
    },
    lg: {
      container: 'px-7 py-2.5 rounded-xl min-w-[200px]',
      wordmark: 'text-3xl',
      rif: 'text-[10.5px] tracking-[0.18em]',
    },
  }[size];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center bg-white border border-slate-200 shadow-inner select-none transition-shadow ${sizeStyles.container} ${className}`}
      style={{
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
      aria-label="Silocom C.A. RIF J-30725192-1"
    >
      <div
        className={`flex items-baseline font-black leading-none tracking-tight ${sizeStyles.wordmark}`}
      >
        <span className="text-slate-900 font-extrabold">S</span>
        <span className="text-rose-700 font-black px-0.5">i</span>
        <span className="text-slate-900 font-extrabold">locom</span>
      </div>
      {showRif && (
        <span
          className={`font-bold text-slate-800 uppercase mt-1 leading-tight ${sizeStyles.rif}`}
        >
          RIF: J-30725192-1
        </span>
      )}
    </div>
  );
};
