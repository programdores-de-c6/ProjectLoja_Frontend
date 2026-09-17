/**
 * ====================================================
 * JOB TITLE FORM - FORMULÁRIO DE CARGOS
 * ====================================================
 */

import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Bilioteca de Formularios
import { zodResolver } from '@hookform/resolvers/zod'; // Intergrador com validador Zod
import * as z from 'zod'; // Validador de Esquema
// Componentes de Formulário
import FormField from '@/components/forms/FormField'; // Componente de Campo de Formulário Reutilizável
import { JobTitlesFormData } from './JobTitlesService';

// ====================================================
// ENUM DE NÍVEIS DE ACESSO
// ====================================================
const ACCESS_LEVELS = [
  { value: 'NO_ACCESS', label: 'Sem acesso ao sistema' },
  { value: 'ROLE_USER', label: 'Operador / Caixa' },
  { value: 'ROLE_MANAGER', label: 'Gerente' },
  { value: 'ROLE_ADMIN', label: 'Administrador' },
];

// ====================================================
// // Define as regras de validação (O que é obrigatório ou não)
// ====================================================
export const JobTitleSchema = z.object({
  id: z.number().optional(), // Id não é obrigatorio no cadastro, mas é necessário para edição
  nomecargo: z.string().min(1, 'Nome do cargo é obrigatório'), // Mínimo 1 caractere
  descricao: z.string().optional(),
valor: z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;

    return parseFloat(
      val.replace(/\./g, "").replace(",", ".")
    );
  }),
  accessLevel: z.string().min(1, 'Nível de acesso é obrigatório'), // Valor padrão caso não seja selecionado
});
// Extrai o tipo de dados baseado no esquema Zod
type JobTitleFormValues = z.infer<typeof JobTitleSchema>;

// ====================================================
// PROPS
// ====================================================
interface JobTitleFormProps {
  initialData?: JobTitlesFormData;  // Dados iniciais para edição
  isLoading?: boolean; // Estado de carregamento
}
// Interface que define o que a "Page" pode comandar neste formulário via Ref
export interface JobTitleFormRef {
  trigger: () => Promise<boolean>; // Comando para validar o form
  getValues: () => JobTitleFormValues;// Comando para ler os valores atuais
}

// ====================================================
// COMPONENTE
// ====================================================

// forwardRef permite que o componente pai (Page) acesse funções internas deste formulário
const JobTitleForm = forwardRef<JobTitleFormRef, JobTitleFormProps>(
  ({ initialData, isLoading }, ref) => {

    // ====================================================
    // INICIALIZA FORMULÁRIO
    // ====================================================
       // Configura o formulário com o React Hook Form e integra o Zod para validação
    const { control, trigger, getValues, reset, formState: { errors } } =
      useForm<JobTitleFormValues>({
        resolver: zodResolver(JobTitleSchema),// Usa o Zod para validar
        defaultValues: initialData || { // Valores iniciais
          nomecargo: '',
          descricao: '',
          valor: 0.0,
          accessLevel: 'NO_ACCESS',
        },
        mode: 'onChange' // Valida enquanto o usuário digita
      });
    // Atualiza o formulário sempre que o initialData mudar (importante para abrir edição
    useEffect(() => {
      // Reseta valores quando muda o initialData
      reset(initialData || {
        nomecargo: '',
        descricao: '',
        valor: 0.0,
        accessLevel: 'NO_ACCESS' 
      });
    }, [initialData, reset]);
  // Expõe as funções 'trigger' e 'getValues' para a JobTitlesPage
    useImperativeHandle(ref, () => ({
      trigger,
      getValues
    }));

    // ====================================================
    // RENDER
    // ====================================================
    return (
      <div className="space-y-4">

        {/* Nome do Cargo */}
        <Controller
          name="nomecargo"
          control={control}
          render={({ field }) => (
            <FormField
              label="Nome do Cargo *"
              placeholder="Digite o cargo"
              {...field}
              disabled={isLoading}
              error={errors.nomecargo?.message}
            />
          )}
        />

        {/* Descrição */}
        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <FormField
              label="Descrição"
              placeholder="Digite a descrição"
              {...field}
              disabled={isLoading}
              error={errors.descricao?.message}
            />
          )}
        />

        {/* Valor - campo moeda */}
       <Controller
  name="valor"
  control={control}
  render={({ field }) => (
    <FormField
      label="Valor"
      placeholder="0,00"
      {...field}
      value={field.value ?? ''} // garante string vazia caso undefined
      disabled={isLoading}
      error={errors.valor?.message}
      isCurrency={true}          // ativa máscara de moeda
      decimalSeparator=","       // separador decimal
      groupSeparator="."         // separador de milhar
      decimalsLimit={2}          // casas decimais
      onChange={field.onChange}  // garante integração com RHF
    />
  )}
/>

        {/* Nível de Acesso - select */}
     <Controller
  name="accessLevel"
  control={control}
  render={({ field }) => (
    <FormField
      type="select"
      label="Nível de Acesso *"
      placeholder="Selecione o nível de acesso"
      {...field}
      value={field.value ?? undefined}   // valor tratado para select
      onSelectChange={field.onChange} // integração RHF
      disabled={isLoading}
      error={errors.accessLevel?.message}
      options={ACCESS_LEVELS}      // opções do enum
    />
  )}
/>

      </div>
    );
  }
);

JobTitleForm.displayName = 'JobTitleForm';

export default JobTitleForm;
