/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Modelos e Interfaces de Datos TypeScript
 */

export interface DataInicial {
  categorias: string[];
  tecnicoCliente: string[];
  operadoras: string[];
  statusList: string[];
  prioridades: string[];
  carriers: string[];
}

export interface SolicitudPayload {
  fechaSolicitud: string;
  tecnicoCliente: string;
  categoria: string;
  producto: string;
  marca: string;
  modelo: string;
  carrier: string;
  operadora: string;
  cantidad: number;
  status: string;
  prioridad: string;
  observaciones: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  id: string;
  name: string;
}
