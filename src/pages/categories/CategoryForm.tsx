/**
 * ====================================================
 * FORMULÁRIO DE CATEGORIA COM VALIDAÇÃO (CategoryForm.tsx)
 * ====================================================
 *
 * Componente responsável apenas pelos campos do formulário.
 * Mantém validação com react-hook-form e Zod.
 * Os botões ficam no ModalForm.
 */

import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormField from '@/components/forms/FormField';
import { CategoryFormData } from './CategoryService';

// ====================================================
// ESQUEMA DE VALIDAÇÃO ZOD
// ====================================================
const categoryFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, 'O nome da categoria é obrigatório.'),
  descricao: z.string().optional(),
});

// ====================================================
// PROPS DO COMPONENTE
// ====================================================
interface CategoryFormProps {
  initialData?: CategoryFormData; // dados atuais (edição ou criação)
  isLoading?: boolean;
}
// Interface da ref
export interface CategoryFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => CategoryFormData;
}
const CategoryForm = forwardRef<CategoryFormRef, CategoryFormProps>(
  ({ initialData, isLoading }, ref) => {

    const { control, formState: { errors }, trigger, getValues, reset } = useForm<CategoryFormData>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: initialData || { nome: '', descricao: '' },
      mode: 'onChange',
    });

    // Reseta formulário sempre que abrir modal ou mudar initialData
    useEffect(() => {
      reset(initialData || { nome: '', descricao: '' });
    }, [initialData, reset]);

    // Expõe funções para a página principal
    useImperativeHandle(ref, () => ({
      trigger,
      getValues,
    }));

    return (
      <div className="space-y-6">
        {/* Campo Nome */}
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <div>
              <FormField
                label="Nome da Categoria *"
                placeholder="Ex: Produtos Escolares"
                disabled={isLoading}
                {...field}
              />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
             
            </div>
          )}
        />
        {/* Campo Descrição */}
        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <div>
              <FormField
                label="Descrição"
                type="textarea"
                placeholder="Ex: Produtos Escolares em geral"
                disabled={isLoading}
                {...field}
              />
              {errors.descricao && <p className="text-sm text-red-600">{errors.descricao.message}</p>}
            </div>
          )}
        />
      </div>
    );
  }
);

export default CategoryForm;
