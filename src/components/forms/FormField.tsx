/**
 * ====================================================
 * COMPONENTE DE CAMPO DE FORMULÁRIO REUTILIZÁVEL
 * ====================================================
 * 
 * Campo de formulário padronizado com:
 * - Suporte a diferentes tipos de input
 * - Validação visual integrada
 * - Labels flutuantes
 * - Mensagens de erro
 * - Upload de arquivos
 * - Selects customizados
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Upload, Image as ImageIcon } from 'lucide-react';

// ====================================================
// TIPOS E INTERFACES
// ====================================================

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormFieldProps {
  id?: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
    isCurrency?: boolean;
  decimalSeparator?: string;
  groupSeparator?: string;
  decimalsLimit?: number;
  
  // Props específicas para textarea
  rows?: number;
  
  // Props específicas para select
  options?: SelectOption[];
  selectPlaceholder?: string;
  
  // Props específicas para file
  accept?: string;
  multiple?: boolean;
  
  // Props específicas para number
  min?: number;
  max?: number;
  step?: number;
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onSelectChange,
  onFileChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className,
  inputClassName,
  rows = 3,
  options = [],
  selectPlaceholder = 'Selecione uma opção',
  accept,
  multiple = false,
  min,
  max,
  step,
  ...props
}, ref) => {
  const fieldId = id || name;
  const hasError = !!error;

  /**
   * Manipula mudanças em arquivos
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange?.(file);
  };

  /**
   * Renderiza o campo de upload de arquivo
   */
  const renderFileInput = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={fieldId}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            hasError 
              ? "border-red-300 bg-red-50 hover:bg-red-100" 
              : "border-gray-300 bg-gray-50 hover:bg-gray-100",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">
              {accept ? `Formatos aceitos: ${accept}` : 'Todos os formatos'}
            </p>
          </div>
          <input
            id={fieldId}
            name={name}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            {...props}
          />
        </label>
      </div>
    </div>
  );

  /**
   * Renderiza o campo select
   */
  const renderSelect = () => (
    <Select
      value={value as string}
      onValueChange={onSelectChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn(
        hasError && "border-red-500 focus:border-red-500",
        inputClassName
      )}>
        <SelectValue placeholder={selectPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  /**
   * Renderiza o campo textarea
   */
  const renderTextarea = () => (
    <Textarea
      id={fieldId}
      name={name}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      rows={rows}
      className={cn(
        hasError && "border-red-500 focus:border-red-500",
        inputClassName
      )}
      {...props}
    />
  );

  /**
   * Renderiza o campo input padrão
   */
  const renderInput = () => (
    <Input
      ref={ref}
      id={fieldId}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={cn(
        hasError && "border-red-500 focus:border-red-500",
        inputClassName
      )}
      {...props}
    />
  );

  /**
   * Renderiza o campo baseado no tipo
   */
  const renderField = () => {
    switch (type) {
      case 'file':
        return renderFileInput();
      case 'select':
        return renderSelect();
      case 'textarea':
        return renderTextarea();
      default:
        return renderInput();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <Label 
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium",
          hasError && "text-red-600",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </Label>

      {/* Campo */}
      {renderField()}

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;