/**
 * ====================================================
 * TAXES FORM - FORMULÁRIO DE IMPSTOS (TYPESCRIPT)
 * ====================================================
 * 
 * Componente de formulário para gerir a criação e edição de impostos.
 * Utiliza o componente reutilizável FormField para garantir consistência visual.
 * 
 * MELHORIAS REALIZADAS:
 * - Sincronização correta entre Controller e FormField.
 * - Validação em tempo real com Zod e React Hook Form.
 * - Exposição de métodos via useImperativeHandle para controlo externo (Page).
 */

import  { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Componentes reutilizáveis
import FormField from '@/components/forms/FormField';

import { type TaxesFormData } from './TaxesService';



// ====================================================
// ESQUEMA DE VALIDAÇÃO (ZOD)
// ====================================================

/**
 * Define as regras de negócio e validação para o formulário de Imposto.
 */
export const TaxesSchema = z.object({
  id:  z.number().optional(),
  imposto: z
    .string()
    .min(1, 'O identificador do imposto é obrigatório.'),
    //.max(10, 'O imposto não pode ter mais de 10 caracteres.')
   // .regex(/^[A-Z0-9]+$/, 'Apenas letras maiúsculas e números são permitidos.'),
  baseCalculo: z
  .coerce
  .number({
    invalid_type_error: 'A base de cálculo deve ser um número.'
  })
  .min(0, 'A base de cálculo não pode ser negativa.')
    .max(100, 'A base de cálculo não pode ser superior a 100%.'),
  
});

// Extrai o tipo TypeScript a partir do esquema Zod
type TaxesFormValues = z.infer<typeof TaxesSchema>;


// ====================================================
// PROPS E INTERFACE DE REFERÊNCIA
// ====================================================

interface TaxesFormProps {
  initialData?: TaxesFormData; // Dados iniciais para edição
  isLoading?: boolean; // Estado de carregamento global
}

/**
 * Define os métodos que o componente pai pode invocar via ref.
 */
export interface TaxesFormRef {
  trigger: () => Promise<boolean>; // Dispara a validação manual
  getValues: () => TaxesFormData; // Obtém os valores atuais do formulário
}


// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const TaxesForm = forwardRef<TaxesFormRef, TaxesFormProps>(({ initialData, isLoading }, ref) => {
  

  


  // Configuração do React Hook Form
  const { control, trigger, getValues, reset, formState: { errors } } = useForm<TaxesFormValues>({
    resolver: zodResolver(TaxesSchema),
    defaultValues: initialData || {
      imposto: '',
      baseCalculo: 0
    },
    mode: 'onChange',
  });

  // ====================================================
  // EFEITOS (EFFECTS)
  // ====================================================

   /**
   * Atualiza o formulário sempre que os dados iniciais mudarem (ex: abrir modal de edição)
   */
  useEffect(() => {
    reset(initialData || {
      imposto: '',
      baseCalculo: 0
    });
  }, [initialData, reset]);

  

  // ====================================================
  // MÉTODOS EXPOSTOS (REF)
  // ====================================================

  /**
   * Expõe funções internas para o componente pai (SeriesPage)
   */
  useImperativeHandle(ref, () => ({
    trigger,
    getValues
  }));

  // ====================================================
  // RENDERIZAÇÃO (JSX)
  // ====================================================


  return (
    <div className="space-y-6">
      
      {/* Campo: Identificador da Série */}
      <Controller
        name="imposto"
        control={control}
        render={({ field }) => (
          <FormField
            label="Imposto *"
            placeholder="Ex: IVA, ISS"
            {...field}
            onChange={(e) => field.onChange(e.target.value.toUpperCase())} // Converte para maiúsculas
            disabled={isLoading}
            error={errors.imposto?.message}
          />
        )}
      />

      {/* Campo: Número de Autorização Fiscal */}
      <Controller
        name="baseCalculo"
        control={control}
        render={({ field }) => (
          <FormField
            label="Base de Cálculo*"
            placeholder="Ex: 12 (em %)"
            {...field}
            disabled={isLoading}
            error={errors.baseCalculo?.message}
          />
        )}
      />

     

    
    </div>
  );
});

TaxesForm.displayName = 'TaxesForm';
export default TaxesForm;
