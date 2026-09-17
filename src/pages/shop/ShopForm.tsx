/**
 * ====================================================
 * SHOP FORM - FORMULÁRIO DE LOJA (REAJUSTADO)
 * ====================================================
 */

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'; 
import FormField from '@/components/forms/FormField';
import {  type ShopFormData } from './ShopService.tsx';
import { showErrorToast } from '@/utils/toast';
import { useLocationService, type Location } from '../locations/LocationService.tsx';
import { Label } from 'recharts';
import { Input } from '@/components/ui/input.tsx';

// ====================================================
// ESQUEMA DE VALIDAÇÃO
// ====================================================

// Limite de tamanho: 1MB (1024 * 1024 bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024; 
export const ShopSchema = z.object({

  nome: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório'),

  numeroContribuite: z
    .string()
    .trim()
    .min(1, 'NIF é obrigatório'),

  email: z
    .string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),

  contacto: z
    .string()
    .trim()
    .min(1, 'Contacto é obrigatório'),

  // OPCIONAL
  caixaPostal: z.preprocess(
    (val) => {
      if (
        val === '' ||
        val === null ||
        val === undefined
      ) {
        return undefined;
      }

      return Number(val);
    },
    z
      .number({
        invalid_type_error: 'Caixa Postal deve ser um número',
      })
      .optional()
  ),

  location: z
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
      'Localização é obrigatória'
    ),

  logo: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .nullable()
    .refine(
      (value) => {
        if (value === null) {
          return false;
        }

        if (value instanceof File) {
          return value.size > 0;
        }

        return value.trim().length > 0;
      },
      'Logótipo é obrigatório'
    ),

  shopType: z.enum(
    [
      'LOJA',
      'ARMAZEM',
      'GRAFICA',
    ],
    {
      required_error:
        'Tipo é obrigatório',
    }
  ),

});

//type ShopFormValues = z.infer<typeof ShopSchema>;

// ====================================================
// PROPS E REF
// ====================================================
interface ShopFormProps {
  initialData?: ShopFormData;
  isLoading?: boolean;
  setData: (data: ShopFormData) => void;
  isEditMode?: boolean; 
}

export interface ShopFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => ShopFormData;
  isReady: boolean; //  Indica se o processamento da imagem terminou
}

// ====================================================
// COMPONENTE
// ====================================================
const ShopForm = forwardRef<ShopFormRef, ShopFormProps>(({ initialData, isLoading, isEditMode}, ref) => {
  const { listar: listarLocalidades } = useLocationService();
  const [localidades, setLocalidades] = useState<Location[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
   const [sizeError, setSizeError] = useState<boolean>(false);

  // Inicialização do formulário
  const { control, trigger, getValues, reset, setValue, formState: { errors } } = useForm<ShopFormData>({
    resolver: zodResolver(ShopSchema),
    defaultValues: initialData || {
      nome: '',
      numeroContribuite: '',
      email: '',
      contacto: '',
      caixaPostal: undefined,
      location: null,
      logo: null,
      shopType: 'LOJA',
    },
    mode: 'onChange',
  });

  // Sincroniza dados iniciais e preview da imagem
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.logo) {
        if (typeof initialData.logo === 'string') setLogoPreview(initialData.logo);
        else setLogoPreview(URL.createObjectURL(initialData.logo as File));
      }
    }
  }, [initialData, reset]);

  // Carrega lista de localidades
  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const lista = await listarLocalidades();
        setLocalidades(lista);
      } catch (error) {
        showErrorToast('Erro ao carregar localidades');
      }
    };
    fetchLocalidades();
  }, []);
 /**
   * handleFileChange: Valida o tamanho e processa a leitura
   */
  const handleFileChange = (file: File | null, onChange: (f: File | null) => void) => {
    if (!file) return;

    // ✅ VALIDAÇÃO DE TAMANHO (1MB)
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(true);
      setLogoPreview(null);
      setUploadProgress(0);
      onChange(null); // Limpa o valor no Form
      showErrorToast("Ficheiro demasiado grande! O limite para o logótipo é de 1MB.");
      return;
    }

    // Se o tamanho estiver OK, prossegue
    setSizeError(false);
    setIsProcessing(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onloadend = () => {
      setLogoPreview(URL.createObjectURL(file));
      onChange(file); 
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  /**
   * handleRemoveLogo: Limpa os estados da imagem
   */
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setUploadProgress(0);
    setSizeError(false);
    setValue('logo', null);
  };

  /**
   * Métodos expostos: O 'isReady' bloqueia o botão salvar na ShopPage
   */
  useImperativeHandle(ref, () => ({
    trigger,
    getValues,
    // ✅ Bloqueia se estiver processando OU se houver erro de tamanho
    isReady: !isProcessing && !sizeError 
  }));

  return (
    <div className="grid grid-cols-12 gap-6">
      
      {/* Nome - Adicionado prop 'name' conforme solicitado */}
      <div className="col-span-6">
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <FormField
     
              label="Nome da Loja *"
              placeholder="Digite o nome da loja"
              {...field}
              disabled={isLoading}
              error={errors.nome?.message}
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

      {/* Número de Contribuinte */}
      <div className="col-span-5">
        <Controller
          name="numeroContribuite"
          control={control}
          render={({ field }) => (
            <FormField
             
              label="Número de Contribuinte *"
              placeholder="Digite o número"
              {...field}
              disabled={isLoading}
              error={errors.numeroContribuite?.message}
            />
          )}
        />
      </div>

      {/* Contacto */}
      <div className="col-span-4">
        <Controller
          name="contacto"
          control={control}
          render={({ field }) => (
            <FormField
              
              label="Contacto *"
              placeholder="Digite o contacto"
              {...field}
              disabled={isLoading}
              error={errors.contacto?.message}
            />
          )}
        />
      </div>

      {/* Caixa Postal */}
      <div className="col-span-3">
        <Controller
          name="caixaPostal"
          control={control}
          render={({ field }) => (
            <FormField
              name="caixaPostal"
              label="Caixa Postal"
              type="number"
              placeholder="Ex: 123"
              value={field.value ?? ''} 
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === '' ? undefined : Number(val));
              }}
              disabled={isLoading}
              error={errors.caixaPostal?.message}
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
              name="location"
              label="Localidade *"
              type="select"
              options={localidades.map(loc => ({
                label: loc.nome,
                value: String(loc.id)
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

      {/* Tipo de Loja - ✅ Adicionada a opção GRAFICA */}
      <div className="col-span-6">
        <Controller
          name="shopType"
          control={control}
          render={({ field }) => (
            <FormField
              name="shopType"
              label="Tipo de Loja *"
              type="select"
              options={[
                { label: 'Loja', value: 'LOJA' },
                { label: 'Gráfica', value: 'GRAFICA' },
                { label: 'Armazém', value: 'ARMAZEM' },
              ]}
              selectPlaceholder="Selecione o tipo"
              value={field.value}
              onSelectChange={field.onChange}
              disabled={isLoading}
              error={errors.shopType?.message}
            />
          )}
        />
      </div>

      {/* SEÇÃO DE LOGO COM VALIDAÇÃO DE TAMANHO */}
      {!isEditMode && (
        <div className={`col-span-12 p-4 rounded-2xl border ${sizeError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-6">
            <div className="relative group w-24 h-24 flex-shrink-0">
              <div className={`w-full h-full rounded-2xl overflow-hidden border-2 shadow-md flex items-center justify-center ${sizeError ? 'bg-red-100 border-red-300' : 'bg-white border-white'}`}>
                {isProcessing ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : 
                 sizeError ? <AlertCircle className="w-8 h-8 text-red-500" /> :
                 logoPreview ? <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
              </div>
              {logoPreview && !isProcessing && (
                <button type="button" onClick={handleRemoveLogo} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"><X size={14} /></button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Controller name="logo" control={control} render={({ field }) => (
                <div className="space-y-1">
                  <Label className={`text-[10px] font-black uppercase ${sizeError ? 'text-red-600' : 'text-slate-400'}`}>Logótipo (Máx 1MB)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, field.onChange)} disabled={isLoading || isProcessing} className="h-10 bg-white text-xs" />
                </div>
              )} />

              {/* MENSAGEM DE ERRO OU PROGRESSO */}
              {sizeError ? (
                <p className="text-[10px] text-red-600 font-bold uppercase animate-pulse italic">❌ Ficheiro excede 1MB. Por favor, escolha outro.</p>
              ) : (isProcessing || uploadProgress > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase">
                    <span className={uploadProgress === 100 ? "text-emerald-600" : "text-blue-600"}>{uploadProgress === 100 ? "✓ OK" : "A preparar..."}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${uploadProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ShopForm.displayName = 'ShopForm';
export default ShopForm;