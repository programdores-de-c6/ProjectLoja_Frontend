/**
 * ====================================================
 * SUPPLIER FORM - FORMULÁRIO DE FORNECEDOR
 * ====================================================
 *
 * Componente de formulário para criação/edição de fornecedores.
 * Usa Controller + Zod + FormField
 */

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormField from '@/components/forms/FormField';
import { showErrorToast } from '@/utils/toast';
import { useSupplierService, type SupplierFormData, type Country } from './SuppliersService';

// ====================================================
// ESQUEMA DE VALIDAÇÃO
// ====================================================
export const SupplierSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  numeroContribuite: z.string().min(1, 'Contribuinte é obrigatório'),
 email: z
    .string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  contactoPrincipal: z.string().optional().or(z.literal('')),
  contactoSecudario: z.string().optional().or(z.literal('')),
  country: z
  .object({
    id: z.union([
      z.string(),
      z.number(),
    ]),
    nome: z.string(),
  })
  .nullable()
  .refine(
    (value) => value !== null,
    'País é obrigatório'
  ),
});

type SupplierFormValues = z.infer<typeof SupplierSchema>;

// ====================================================
// REF E PROPS
// ====================================================
interface SupplierFormProps {
  initialData?: SupplierFormData;
  isLoading?: boolean;
}

export interface SupplierFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => SupplierFormData;
}

// ====================================================
// COMPONENTE
// ====================================================
const SupplierForm = forwardRef<SupplierFormRef, SupplierFormProps>(
  ({ initialData, isLoading }, ref) => {

    const { listarPais } = useSupplierService();
    const [paises, setPaises] = useState<Country[]>([]);

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<SupplierFormData>({
      resolver: zodResolver(SupplierSchema),
      defaultValues: initialData || {
        nome: '',
        numeroContribuite: '',
        email: '',
        contactoPrincipal: '',
        contactoSecudario: '',
        country: null,
      },
      mode: 'onChange',
    });

    // Atualizar valores quando initialData muda
    useEffect(() => {
      reset(initialData || {
        nome: '',
        numeroContribuite: '',
        email: '',
        contactoPrincipal: '',
        contactoSecudario: '',
        country: null,
      });
    }, [initialData, reset]);

    // Carregar países
    useEffect(() => {
      const fetchPaises = async () => {
        try {
          const lista = await listarPais();
          setPaises(lista);
        } catch (error) {
          console.error('Erro ao carregar países', error);
          showErrorToast('Erro ao carregar países');
        }
      };
      fetchPaises();
    }, []);

    // Ref métodos expostos
    useImperativeHandle(ref, () => ({ trigger, getValues }));

    return (
      <div className="grid grid-cols-12 gap-6">

        {/* Nome */}
        <div className="col-span-6">
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <FormField
                label="Nome *"
                placeholder="Digite o nome do fornecedor"
                {...field}
                disabled={isLoading}
                error={errors.nome?.message}
              />
            )}
          />
        </div>

        {/* Contribuinte */}
        <div className="col-span-6">
          <Controller
            name="numeroContribuite"
            control={control}
            render={({ field }) => (
              <FormField
                label="Número de Contribuinte *"
                placeholder="Ex: 123456789"
                {...field}
                disabled={isLoading}
                error={errors.numeroContribuite?.message}
              />
            )}
          />
        </div>

        {/* Email */}
        <div className="col-span-6">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormField
                label="Email *"
                type="email"
                placeholder="email@exemplo.com"
                {...field}
                disabled={isLoading}
                error={errors.email?.message}
              />
            )}
          />
        </div>

        {/* Contacto Principal */}
        <div className="col-span-6">
          <Controller
            name="contactoPrincipal"
            control={control}
            render={({ field }) => (
              <FormField
                label="Contacto Principal"
                placeholder="Digite o contacto"
                {...field}
                disabled={isLoading}
                //error={errors.contactoPrincipal?.message}
              />
            )}
          />
        </div>

        {/* Contacto Secundário */}
        <div className="col-span-6">
          <Controller
            name="contactoSecudario"
            control={control}
            render={({ field }) => (
              <FormField
                label="Contacto Secundário"
                placeholder="Digite o contacto secundário"
                {...field}
                disabled={isLoading}
                //error={errors.contactoSecudario?.message}
              />
            )}
          />
        </div>

        {/* País */}
        <div className="col-span-6">
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <FormField
                {...field}
                label="País *"
                type="select"
                options={paises.map(p => ({
                  label: p.nome,
                  value: String(p.id),
                }))}
                selectPlaceholder="Selecione um país"
                value={field.value?.id ? String(field.value.id) : ''}
                onSelectChange={(id) => {
                  const p = paises.find(item => String(item.id) === String(id)) || null;
                  field.onChange(p);
                }}
                disabled={isLoading}
                error={errors.country?.message}
              />
            )}
          />
        </div>

      </div>
    );
  }
);

SupplierForm.displayName = 'SupplierForm';
export default SupplierForm;
