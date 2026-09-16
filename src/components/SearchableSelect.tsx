/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Componente SearchableSelect con Búsqueda en Tiempo Real y Accesibilidad
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { SelectOption } from '../types';

interface SearchableSelectProps {
  id?: string;
  name?: string;
  value: string;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabledPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  value,
  options,
  placeholder = 'Seleccione una opción',
  disabledPlaceholder,
  disabled = false,
  loading = false,
  required = false,
  onChange,
  className = '',
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Normalizar opciones a array de SelectOption
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return (options || []).map((opt) =>
      typeof opt === 'string' ? { id: opt, name: opt } : opt
    );
  }, [options]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLUListElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  // Sincronizar el texto del input visible con el valor seleccionado
  useEffect(() => {
    const selected = normalizedOptions.find((opt) => opt.id === value);
    if (selected) {
      setSearchTerm(selected.name);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, normalizedOptions]);

  // Filtrado de opciones insensible a mayúsculas
  const filteredOptions = React.useMemo(() => {
    const query = (searchTerm || '').trim().toLowerCase();
    if (!isOpen || !query) {
      return normalizedOptions;
    }
    // Si el término de búsqueda coincide exactamente con la opción ya seleccionada, mostrar todas
    const currentSelected = normalizedOptions.find((opt) => opt.id === value);
    if (currentSelected && currentSelected.name.toLowerCase() === query) {
      return normalizedOptions;
    }
    return normalizedOptions.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [normalizedOptions, searchTerm, isOpen, value]);

  // Auto-scroll para opción resaltada con teclado
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const items = optionsListRef.current.querySelectorAll('.select-option-item');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleFocus = () => {
    if (disabled || loading) return;
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleBlur = () => {
    // Retardo de 200ms para permitir que los eventos mousedown de las opciones se ejecuten
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      const selected = normalizedOptions.find((opt) => opt.id === value);
      if (selected) {
        setSearchTerm(selected.name);
      } else {
        setSearchTerm('');
        onChange('');
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || loading) return;
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (val.trim() === '') {
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    if (filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const selectOption = (opt: SelectOption) => {
    onChange(opt.id);
    setSearchTerm(opt.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Determinar texto de placeholder según el estado
  let activePlaceholder = placeholder;
  if (loading) {
    activePlaceholder = 'Cargando...';
  } else if (disabled && disabledPlaceholder) {
    activePlaceholder = disabledPlaceholder;
  }

  const isDisabledState = disabled || loading;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isDisabledState ? 'is-disabled' : ''} ${isOpen ? 'is-open' : ''} ${className}`}
    >
      {/* Input oculto para formularios nativos o binding */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        id={`hidden-${inputId}`}
      />

      {/* Input visible de búsqueda */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={searchTerm}
          placeholder={activePlaceholder}
          disabled={isDisabledState}
          autoComplete="off"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-11 px-3.5 pr-10 text-sm font-normal text-slate-900 bg-white border rounded-lg outline-none transition-all duration-150 ${
            isDisabledState
              ? 'bg-slate-100 cursor-not-allowed text-slate-400 border-slate-200'
              : isOpen
              ? 'border-blue-600 ring-3 ring-blue-600/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/20'
          }`}
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />

        {/* Indicador de flecha o spinner */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <span
              className={`text-[10px] text-slate-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            >
              ▼
            </span>
          )}
        </div>
      </div>

      {/* Dropdown de opciones */}
      {isOpen && !isDisabledState && (
        <ul
          ref={optionsListRef}
          className="absolute left-0 top-[calc(100%+4px)] w-full max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-lg shadow-xl z-50 py-1 list-none divide-y divide-slate-100"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3.5 py-3 text-xs italic text-slate-500 text-center select-none">
              No se encontraron resultados
            </li>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.id === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    // Prevenir pérdida de foco prematura del input
                    e.preventDefault();
                    selectOption(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`select-option-item px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-blue-700 font-semibold'
                      : isHighlighted
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{opt.name}</span>
                  {isSelected && (
                    <span className="text-emerald-600 text-xs font-bold ml-2">✓</span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
