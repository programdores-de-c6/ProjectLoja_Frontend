import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import FormField from '@/components/forms/FormField';
import { LocationFormData, useLocationService, Distrito } from './LocationService';

// ====================================================
// ESQUEMA DE VALIDAÇÃO
// ====================================================
const locationSchema = z.object({
id: z.number().optional(),
  nome: z.string().min(1, 'O nome da localidade é obrigatório.'),
  sigla: z.string().optional(),
distritoid: z
  .string()
  .min(1, 'O distrito é obrigatório')
  .or(z.literal(''))
 
 

});

// ====================================================
// PROPS
// ====================================================
interface LocationFormProps {
  initialData?: LocationFormData;
  isLoading?: boolean;
}

// ====================================================
// REF INTERFACE
// ====================================================
export interface LocationFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => LocationFormData;
}

// ====================================================
// COMPONENTE
// ====================================================
const LocationForm = forwardRef<LocationFormRef, LocationFormProps>(
  ({ initialData, isLoading }, ref) => {

    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const { listarDistritos } = useLocationService();

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<LocationFormData>({
      resolver: zodResolver(locationSchema),
      defaultValues: initialData || {
        nome: '',
        sigla: '',
        distritoid: '',
        distritoNome: ''
      },
      mode: 'onChange'
    });

    // ====================================================
    // Carrega distritos ao montar o form
    // ====================================================
    useEffect(() => {
  const fetchDistritos = async () => {
    try {
      const lista = await listarDistritos();
      setDistritos(lista);
    } catch (error) {
      console.error('Não foi possível carregar distritos');
    }
  };
  fetchDistritos();
  
}, []); 

    // ====================================================
    // Reset do form ao abrir modal
    // ====================================================
    useEffect(() => {
      reset(initialData || {
        nome: '',
        sigla: '',
        distritoid: '',
        distritoNome: ''
      });
    }, [initialData, reset]);

    // ====================================================
    // Métodos expostos ao componente pai
    // ====================================================
    useImperativeHandle(ref, () => ({
      trigger,
      getValues
    }));

    return (
      <div className="space-y-6">

        {/* NOME */}
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <FormField
              label="Nome da Localidade *"
              placeholder="Ex: Água Grande"
              disabled={isLoading}
              {...field}
              error={errors.nome?.message}
            />
          )}
        />

        {/* SIGLA */}
        <Controller
          name="sigla"
          control={control}
          render={({ field }) => (
            <FormField
              label="Sigla"
              placeholder="Ex: AG"
              disabled={isLoading}
              {...field}
              error={errors.sigla?.message}
            />
          )}
        />

        {/* DISTRITO */}
        <Controller
          name="distritoid"
          control={control}
          render={({ field }) => (
            <FormField
              label="Distrito *"
              name={field.name}
              type="select"
              options={distritos.map(d => ({
                label: d.nome,
                value: d.id
              }))}
              selectPlaceholder="Selecione um distrito"
              value={field.value || ''}
              onSelectChange={field.onChange}
              disabled={isLoading}
              error={errors.distritoid?.message}
            />
          )}
        />

      </div>
    );
  }
);

export default LocationForm;