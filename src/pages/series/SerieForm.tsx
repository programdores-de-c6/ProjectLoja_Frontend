/**
 * ====================================================
 * SERIE FORM - FORMULÁRIO DE SÉRIE (TYPESCRIPT)
 * ====================================================
 * 
 * Componente de formulário para gerir a criação e edição de séries de numeração fiscal.
 * Utiliza o componente reutilizável FormField para garantir consistência visual.
 * 
 * MELHORIAS REALIZADAS:
 * - Sincronização correta entre Controller e FormField.
 * - Validação em tempo real com Zod e React Hook Form.
 * - Exposição de métodos via useImperativeHandle para controlo externo (Page).
 */

import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/useAuth';

// Componentes reutilizáveis
import FormField from '@/components/forms/FormField';
import { type SerieFormData } from './SeriesService';
import { useShopService, type Shop } from '../shop/ShopService';
import { showErrorToast } from '@/utils/toast';

// ====================================================
// ESQUEMA DE VALIDAÇÃO (ZOD)
// ====================================================

/**
 * Define as regras de negócio e validação para o formulário de Série.
 */
export const SerieSchema = z.object({
  id:  z.number().optional(),
  serie: z
    .string()
    .min(1, 'O identificador da série é obrigatório.'),
    //.max(10, 'A série não pode ter mais de 10 caracteres.')
   // .regex(/^[A-Z0-9]+$/, 'Apenas letras maiúsculas e números são permitidos.'),
  numeroautorizacao: z
    .string()
    .min(1, 'O número de autorização fiscal é obrigatório.'),
   // .regex(/^\d+\/\d{4}$/, 'Formato esperado: XXXXX/YYYY (ex: 12345/2024).'),
  ano: z
    .number()
    .min(2000, 'O ano não pode ser anterior a 2000.')
    .max(new Date().getFullYear() + 5, 'O ano não pode ser superior a 5 anos no futuro.'),
  shop: z.string().min(1, 'O distrito é obrigatório.')
    
});

// Extrai o tipo TypeScript a partir do esquema Zod
type SerieFormValues = z.infer<typeof SerieSchema>;

// ====================================================
// PROPS E INTERFACE DE REFERÊNCIA
// ====================================================

interface SerieFormProps {
  initialData?: SerieFormData; // Dados iniciais para edição
  isLoading?: boolean; // Estado de carregamento global
}

/**
 * Define os métodos que o componente pai pode invocar via ref.
 */
export interface SerieFormRef {
  trigger: () => Promise<boolean>; // Dispara a validação manual
  getValues: () => SerieFormData; // Obtém os valores atuais do formulário
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const SerieForm = forwardRef<SerieFormRef, SerieFormProps>(({ initialData, isLoading }, ref) => {
  
  // Hooks de Serviço
  const { listar: listarLojas } = useShopService();
  const { user, isAdmin, isManager } = useAuth();
  const isManagerRole = isManager && !isAdmin;
  
  // Estados Locais
  const [lojas, setLojas] = useState<Shop[]>([]); // Lista de lojas para o select

  const defaultShop = initialData?.shop?.trim().length ? initialData.shop : (isManagerRole ? user?.idl ?? '' : '');

  const initialFormValues: SerieFormValues = useMemo(() => ({
    id: initialData?.id,
    serie: initialData?.serie ?? '',
    numeroautorizacao: initialData?.numeroautorizacao ?? '',
    ano: initialData?.ano ?? new Date().getFullYear(),
    shop: defaultShop,
  }), [initialData, defaultShop]);

  // Configuração do React Hook Form
  const { control, trigger, getValues, reset, formState: { errors } } = useForm<SerieFormValues>({
    resolver: zodResolver(SerieSchema),
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  // ====================================================
  // EFEITOS (EFFECTS)
  // ====================================================

  /**
   * Atualiza o formulário sempre que os dados iniciais mudarem (ex: abrir modal de edição)
   */
  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  /**
   * Carrega a lista de lojas da API ao montar o componente
   */
  const availableLojas = useMemo(() => {
    if (!isManagerRole) return lojas;
    return lojas.filter((shop) => String(shop.id) === String(user?.idl));
  }, [isManagerRole, lojas, user?.idl]);

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const lista = await listarLojas();
        setLojas(lista);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        showErrorToast('Não foi possível carregar a lista de lojas.');
      }
    };
    fetchLojas();
  }, []);

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
        name="serie"
        control={control}
        render={({ field }) => (
          <FormField
            label="Identificador da Série *"
            placeholder="Ex: FA, RC, NF"
            {...field}
            onChange={(e) => field.onChange(e.target.value.toUpperCase())} // Converte para maiúsculas
            disabled={isLoading}
            error={errors.serie?.message}
          />
        )}
      />

      {/* Campo: Número de Autorização Fiscal */}
      <Controller
        name="numeroautorizacao"
        control={control}
        render={({ field }) => (
          <FormField
            label="Número de Autorização Fiscal *"
            placeholder="Ex: 12345/2024"
            {...field}
            disabled={isLoading}
            error={errors.numeroautorizacao?.message}
          />
        )}
      />

      {/* Campo: Ano Fiscal */}
      <Controller
        name="ano"
        control={control}
        render={({ field }) => (
          <FormField
          name='ano'
            label="Ano Fiscal *"
            type="number"
            placeholder={new Date().getFullYear().toString()}
            value={field.value}
            onChange={(e) => {
              const val = e.target.value;
              field.onChange(val === '' ? undefined : Number(val));
            }}
            disabled={isLoading}
            error={errors.ano?.message}
          />
        )}
      />

      {/* Campo: Loja Associada */}
      <Controller
        name="shop"
        control={control}
        render={({ field }) => (
          <FormField
            label="Loja *"
            name={field.name}
            type="select"
            options={availableLojas.map(shop => ({ label: shop.nome, value: shop.id }))}
            selectPlaceholder="Selecione a loja"
            value={field.value || ''}
            onSelectChange={field.onChange}
            disabled={isLoading || (isManagerRole && availableLojas.length === 1)}
            error={errors.shop?.message}
          />
        )}
      />
    </div>
  );
});

SerieForm.displayName = 'SerieForm';
export default SerieForm;
