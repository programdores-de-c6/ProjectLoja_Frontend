/**
 * ====================================================
 * CUSTOMER FORM - FORMULÁRIO DE CLIENTE
 * ====================================================
 *
 * Componente de formulário para criação/edição de clientes.
 * Usa Controller + Zod + FormField
 */

import  { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormField from '@/components/forms/FormField';
import { showErrorToast } from '@/utils/toast';
import { type CustomerFormData } from './CustomerService';
import { useLocationService, type Location } from '../locations/LocationService';

// ====================================================
// ESQUEMA DE VALIDAÇÃO
// ====================================================
export const CustomerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  numeroContribuinte: z.string().min(1, 'Número do contribuinte é obrigatório').or(z.literal('')),
  email: z.string().email('Formato inválido').optional().or(z.literal('')),
  contactoprincipal: z.string().optional().or(z.literal('')),
  contactosecudario: z.string().optional().or(z.literal('')),
  location: z
    .object({
      id: z.union([z.string(), z.number()]),
      nome: z.string(),
    })
    .nullable()
    .refine((value) => value !== null, 'Localidade é obrigatória'),
});

//type CustomerFormValues = z.infer<typeof CustomerSchema>;

// ====================================================
// REF E PROPS
// ====================================================
interface CustomerFormProps {
  initialData?: CustomerFormData;
  isLoading?: boolean;
  setData: (data: CustomerFormData) => void;
}

export interface CustomerFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => CustomerFormData;
}

// ====================================================
// COMPONENTE
// ====================================================
const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(
  ({ initialData, isLoading }, ref) => {

    const { listar: listarLocalidades } = useLocationService();
    const [localidades, setLocalidades] = useState<Location[]>([]);

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<CustomerFormData>({
      resolver: zodResolver(CustomerSchema),
      defaultValues: initialData || {
        nome: '',
        numeroContribuinte: '',
        email: '',
        contactoPrincipal: '',
        contactoSecudario: '',
        location: null,
      },
      mode: 'onChange',
    });

    // Atualizar valores quando initialData muda
    useEffect(() => {
      reset(initialData || {
        nome: '',
        numeroContribuinte: '',
        email: '',
        contactoPrincipal: '',
        contactoSecudario: '',
        location: null,
      });
    }, [initialData, reset]);

    // Carregar localidades
    useEffect(() => {
      const fetchLocalidades = async () => {
        try {
          const lista = await listarLocalidades();
          setLocalidades(lista);
        } catch (error) {
          console.error('Erro ao carregar localidades', error);
          showErrorToast('Erro ao carregar localidades');
        }
      };
      fetchLocalidades();
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
                placeholder="Digite o nome do cliente"
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
            name="numeroContribuinte"
            control={control}
            render={({ field }) => (
              <FormField
                label="Número de Contribuinte"
                placeholder="Ex: 123456789"
                {...field}
                disabled={isLoading}
                error={errors.numeroContribuinte?.message}
                onChange={(e) => {
                  // Aplicar maxLength 9 manualmente
                  if (e.target.value.length <= 9) field.onChange(e);
                }}
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
                label="Email"
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
                error={errors.contactoPrincipal?.message}
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
                error={errors.contactoSecudario?.message}
              />
            )}
          />
        </div>

        {/* Localidade */}
        <div className="col-span-6">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <FormField
                {...field}
                label="Localidade *"
                type="select"
                options={localidades.map(loc => ({
                  label: loc.nome,
                  value: String(loc.id),
                }))}
                selectPlaceholder="Selecione uma localidade"
                value={field.value?.id ? String(field.value.id) : ''}
                onSelectChange={(id) => {
                  const loc = localidades.find(l => String(l.id) === String(id)) || null;
                  field.onChange(loc);
                }}
                disabled={isLoading}
                error={errors.location?.message}
              />
            )}
          />
        </div>

      </div>
    );
  }
);

CustomerForm.displayName = 'CustomerForm';
export default CustomerForm;