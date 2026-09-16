/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Formulario Principal de Solicitud de Activos y Orquestador de Dependencias
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { AlertToast } from './AlertToast';
import { DataInicial, SolicitudPayload } from '../types';
import {
  getFormInitialData,
  getProductos,
  getMarcas,
  getModelos,
  guardarSolicitud,
} from '../services/api';

// Helper para obtener fecha de hoy en formato YYYY-MM-DD
const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface FormSolicitudProps {
  initialMasterData?: DataInicial | null;
  isLoadingMasterData?: boolean;
  onRefreshMasterData?: () => void;
}

export const FormSolicitud: React.FC<FormSolicitudProps> = ({
  initialMasterData,
  isLoadingMasterData = false,
}) => {
  // --- Estados del Formulario (12 Campos) ---
  const [fechaSolicitud, setFechaSolicitud] = useState<string>(getTodayString);
  const [tecnicoCliente, setTecnicoCliente] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [producto, setProducto] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('');
  const [operadora, setOperadora] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [status, setStatus] = useState<string>('');
  const [prioridad, setPrioridad] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  // --- Listas dependientes en cascada ---
  const [productosList, setProductosList] = useState<string[]>([]);
  const [marcasList, setMarcasList] = useState<string[]>([]);
  const [modelosList, setModelosList] = useState<string[]>([]);

  // Estados de carga de dependientes
  const [loadingProductos, setLoadingProductos] = useState<boolean>(false);
  const [loadingMarcas, setLoadingMarcas] = useState<boolean>(false);
  const [loadingModelos, setLoadingModelos] = useState<boolean>(false);

  // Estados de envío y alertas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  const cardRef = useRef<HTMLDivElement>(null);

  // --- Cargar Productos cuando cambia Categoría ---
  const handleCategoriaChange = useCallback(async (selectedCat: string) => {
    setCategoria(selectedCat);

    // Resetear dependientes inferiores
    setProducto('');
    setMarca('');
    setModelo('');
    setProductosList([]);
    setMarcasList([]);
    setModelosList([]);

    if (!selectedCat) return;

    setLoadingProductos(true);
    try {
      const res = await getProductos(selectedCat);
      if (res.success && Array.isArray(res.data)) {
        setProductosList(res.data);
      } else {
        setAlertState({
          type: 'error',
          message: res.error || 'No se pudieron cargar los productos para la categoría seleccionada.',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setAlertState({
        type: 'error',
        message: `Error al consultar productos: ${errorMsg}`,
      });
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  // --- Cargar Marcas cuando cambia Producto ---
  const handleProductoChange = useCallback(
    async (selectedProd: string) => {
      setProducto(selectedProd);

      // Resetear dependientes inferiores
      setMarca('');
      setModelo('');
      setMarcasList([]);
      setModelosList([]);

      if (!categoria || !selectedProd) return;

      setLoadingMarcas(true);
      try {
        const res = await getMarcas(categoria, selectedProd);
        if (res.success && Array.isArray(res.data)) {
          setMarcasList(res.data);
        } else {
          setAlertState({
            type: 'error',
            message: res.error || 'No se pudieron cargar las marcas para este producto.',
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setAlertState({
          type: 'error',
          message: `Error al consultar marcas: ${errorMsg}`,
        });
      } finally {
        setLoadingMarcas(false);
      }
    },
    [categoria]
  );

  // --- Cargar Modelos cuando cambia Marca ---
  const handleMarcaChange = useCallback(
    async (selectedMarca: string) => {
      setMarca(selectedMarca);

      // Resetear dependiente inferior
      setModelo('');
      setModelosList([]);

      if (!categoria || !producto || !selectedMarca) return;

      setLoadingModelos(true);
      try {
        const res = await getModelos(categoria, producto, selectedMarca);
        if (res.success && Array.isArray(res.data)) {
          setModelosList(res.data);
        } else {
          setAlertState({
            type: 'error',
            message: res.error || 'No se pudieron cargar los modelos.',
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setAlertState({
          type: 'error',
          message: `Error al consultar modelos: ${errorMsg}`,
        });
      } finally {
        setLoadingModelos(false);
      }
    },
    [categoria, producto]
  );

  // --- Reset Completo del Formulario ---
  const handleResetForm = useCallback(() => {
    setFechaSolicitud(getTodayString());
    setTecnicoCliente('');
    setCategoria('');
    setProducto('');
    setMarca('');
    setModelo('');
    setCarrier('');
    setOperadora('');
    setCantidad(1);
    setStatus('');
    setPrioridad('');
    setObservaciones('');

    setProductosList([]);
    setMarcasList([]);
    setModelosList([]);
  }, []);

  // --- Envío del Formulario ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Validaciones de campos requeridos
    const errores: string[] = [];
    if (!fechaSolicitud) errores.push('Fecha Solicitud');
    if (!tecnicoCliente) errores.push('Técnico / Cliente');
    if (!categoria) errores.push('Categoría');
    if (!producto) errores.push('Producto');
    if (!marca) errores.push('Marca');
    if (!modelo) errores.push('Modelo');
    if (!carrier) errores.push('Carrier');
    if (!operadora) errores.push('Operadora');
    if (!cantidad || cantidad < 1) errores.push('Cantidad (mínimo 1)');
    if (!status) errores.push('Status');
    if (!prioridad) errores.push('Prioridad');

    if (errores.length > 0) {
      setAlertState({
        type: 'error',
        message: `Por favor complete los campos requeridos: ${errores.join(', ')}.`,
      });
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const payload: SolicitudPayload = {
      fechaSolicitud,
      tecnicoCliente,
      categoria,
      producto,
      marca,
      modelo,
      carrier,
      operadora,
      cantidad: Number(cantidad),
      status,
      prioridad,
      observaciones: observaciones.trim(),
    };

    setIsSubmitting(true);
    setAlertState({ type: null, message: null });

    try {
      const res = await guardarSolicitud(payload);
      if (res.success) {
        setAlertState({
          type: 'success',
          message:
            res.message ||
            '¡Solicitud registrada correctamente en la base de datos de Google Sheets!',
        });
        // Reset completo en caso de éxito
        handleResetForm();
      } else {
        setAlertState({
          type: 'error',
          message:
            res.error ||
            'No se pudo registrar la solicitud en Google Sheets. Verifique los datos.',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setAlertState({
        type: 'error',
        message: `Ocurrió un error al procesar el guardado: ${errorMsg}`,
      });
    } finally {
      setIsSubmitting(false);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main
      ref={cardRef}
      className="w-full max-w-4xl mx-auto bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 sm:p-10 transition-shadow hover:shadow-md"
    >
      {/* Alerta de Éxito o Error */}
      <AlertToast
        type={alertState.type}
        message={alertState.message}
        onDismiss={() => setAlertState({ type: null, message: null })}
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* 1. Fecha Solicitud */}
          <div className="flex flex-col">
            <label
              htmlFor="fecha-solicitud"
              className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between"
            >
              <span>
                Fecha Solicitud <span className="text-[#be123c] font-bold">*</span>
              </span>
            </label>
            <input
              type="date"
              id="fecha-solicitud"
              name="fecha_solicitud"
              value={fechaSolicitud}
              onChange={(e) => setFechaSolicitud(e.target.value)}
              required
              className="w-full h-11 px-3.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-lg outline-none transition-all focus:border-blue-600 focus:ring-3 focus:ring-blue-600/20"
            />
          </div>

          {/* 2. Técnico / Cliente */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Técnico / Cliente <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-tecnico-cliente"
              name="tecnico_cliente"
              value={tecnicoCliente}
              options={initialMasterData?.tecnicoCliente || []}
              placeholder="Seleccione un Técnico/Cliente"
              loading={isLoadingMasterData}
              required
              onChange={setTecnicoCliente}
            />
          </div>

          {/* 3. Categoría */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Categoría <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-categoria"
              name="categoria"
              value={categoria}
              options={initialMasterData?.categorias || []}
              placeholder="Seleccione la Categoría"
              loading={isLoadingMasterData}
              required
              onChange={handleCategoriaChange}
            />
          </div>

          {/* 4. Producto (Dependiente de Categoría) */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Producto <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-producto"
              name="producto"
              value={producto}
              options={productosList}
              placeholder="Seleccione el Producto"
              disabledPlaceholder="Seleccione una Categoría primero..."
              disabled={!categoria}
              loading={loadingProductos}
              required
              onChange={handleProductoChange}
            />
          </div>

          {/* 5. Marca (Dependiente de Categoría + Producto) */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Marca <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-marca"
              name="marca"
              value={marca}
              options={marcasList}
              placeholder="Seleccione la Marca"
              disabledPlaceholder="Seleccione un Producto primero..."
              disabled={!producto}
              loading={loadingMarcas}
              required
              onChange={handleMarcaChange}
            />
          </div>

          {/* 6. Modelo (Dependiente de Categoría + Producto + Marca) */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Modelo <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-modelo"
              name="modelo"
              value={modelo}
              options={modelosList}
              placeholder="Seleccione el Modelo"
              disabledPlaceholder="Seleccione una Marca primero..."
              disabled={!marca}
              loading={loadingModelos}
              required
              onChange={setModelo}
            />
          </div>

          {/* 7. Carrier */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Carrier <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-carrier"
              name="carrier"
              value={carrier}
              options={initialMasterData?.carriers || []}
              placeholder="Seleccione el Carrier"
              loading={isLoadingMasterData}
              required
              onChange={setCarrier}
            />
          </div>

          {/* 8. Operadora */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Operadora <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-operadora"
              name="operadora"
              value={operadora}
              options={initialMasterData?.operadoras || []}
              placeholder="Seleccione la Operadora"
              loading={isLoadingMasterData}
              required
              onChange={setOperadora}
            />
          </div>

          {/* 9. Cantidad (number, min 1, default 1) */}
          <div className="flex flex-col">
            <label
              htmlFor="cantidad-input"
              className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5"
            >
              Cantidad <span className="text-[#be123c] font-bold">*</span>
            </label>
            <input
              type="number"
              id="cantidad-input"
              name="cantidad"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
              className="w-full h-11 px-3.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-lg outline-none transition-all focus:border-blue-600 focus:ring-3 focus:ring-blue-600/20"
            />
          </div>

          {/* 10. Status */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Status <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-status"
              name="status"
              value={status}
              options={initialMasterData?.statusList || []}
              placeholder="Seleccione el Status"
              loading={isLoadingMasterData}
              required
              onChange={setStatus}
            />
          </div>

          {/* 11. Prioridad */}
          <div className="flex flex-col">
            <label className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5">
              Prioridad <span className="text-[#be123c] font-bold">*</span>
            </label>
            <SearchableSelect
              id="select-prioridad"
              name="prioridad"
              value={prioridad}
              options={initialMasterData?.prioridades || []}
              placeholder="Seleccione la Prioridad"
              loading={isLoadingMasterData}
              required
              onChange={setPrioridad}
            />
          </div>

          {/* 12. Observaciones (textarea, ocupa las 2 columnas) */}
          <div className="flex flex-col md:col-span-2">
            <label
              htmlFor="observaciones"
              className="text-xs sm:text-[13.5px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between"
            >
              <span>Observaciones</span>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Opcional
              </span>
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba aquí observaciones adicionales sobre la solicitud..."
              className="w-full p-3.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-lg outline-none transition-all resize-y focus:border-blue-600 focus:ring-3 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Acciones y Botón de Envío */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="submit"
            id="btn-guardar"
            disabled={isSubmitting || isLoadingMasterData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 text-sm sm:text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando Almacenamiento...</span>
              </>
            ) : (
              <span>Guardar Solicitud</span>
            )}
          </button>
        </div>
      </form>
    </main>
  );
};
