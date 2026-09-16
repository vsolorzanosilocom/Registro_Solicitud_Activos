/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Componente de Alertas de Retroalimentación de Éxito y Error
 */

import React from 'react';

interface AlertToastProps {
  type: 'success' | 'error' | null;
  message: string | null;
  onDismiss?: () => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ type, message, onDismiss }) => {
  if (!type || !message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`w-full p-4 rounded-lg mb-6 text-sm font-semibold flex items-start gap-3 transition-all duration-200 border animate-in fade-in slide-in-from-top-2 ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
          : 'bg-red-50 border-red-500 text-red-800'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess ? (
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 whitespace-pre-line text-sm leading-relaxed">{message}</div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      )}
    </div>
  );
};
