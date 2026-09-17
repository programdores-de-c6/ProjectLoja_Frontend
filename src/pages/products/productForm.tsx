/**
 * ====================================================
 * PRODUCT FORM - VERSÃO FINAL ADAPTATIVA (SÉNIOR)
 * ====================================================
 */

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, ArrowLeft, ArrowRight, Package, ShieldCheck } from 'lucide-react';

import FormField from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useProductService, type ProductFormData, type StockDTO } from './ProductsService';
//import { showErrorToast } from '@/utils/toast';
import { useAuth } from '@/contexts/useAuth';

// --- TIPOS E INTERFACES ---

export type ProductFormMode = 
  | 'SINGLE_STORE' 
  | 'GLOBAL_CATALOG' 
  | 'LOCAL_STORE' 
  | 'CONFIGURE_EXISTING' 
  | 'EDIT';

interface Category { id: string | number; nome: string; }
interface Supplier { id: string | number; nome: string; }
interface Tax { id: string | number; imposto: string; }
interface Shop { id: string | number; nome: string; }

interface ProductFormProps {
  initialData?: ProductFormData;
  isLoading?: boolean;
  isEditMode?: boolean;
  mode: ProductFormMode;
}

export interface ProductFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => ProductFormData;
  resetStep: () => void;
}

// ====================================================
// ESQUEMA DE VALIDAÇÃO ZOD
// ====================================================

export const ProductSchema = z.object({
  codigobarra: z.string().min(1, 'Código de Barra é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().max(150, 'Máximo 150 caracteres').nullable().optional(),
  precoUnitario: z.string().optional(),
  controlaStock: z.boolean().default(true),
  categoria: z.object({ id: z.union([z.string(), z.number()]), nome: z.string() }).nullable().refine(val => val !== null, 'Categoria obrigatória'),
  fornacedor: z.object({ id: z.union([z.string(), z.number()]), nome: z.string() }).nullable().refine(val => val !== null, 'Fornecedor obrigatório'),
  imposto: z.object({ id: z.union([z.string(), z.number()]), nome: z.string() }).nullable().refine(val => val !== null, 'Imposto obrigatório'),
  imagem: z.any().nullable().optional(),
  distribuicaoStock: z.array(z.object({
    storeId: z.union([z.string(), z.number()]),
    storeName: z.string(),
    stock: z.number().min(0),
    stockMin: z.number().min(0),
    precoUnitario: z.number().min(0)
  })).optional().default([]),
  tempStock: z.number().optional().default(0),
  tempStockMin: z.number().optional().default(0),
});

const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(({ initialData, isLoading, isEditMode, mode }, ref) => {
  
 const { user, isManager } = useAuth(); 
  const { listarCategorias, listarFornecedores, listarImpostos, listarLojas } = useProductService();

  const { control, trigger, getValues, reset, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: initialData || {
      nome: '', codigobarra: '', descricao: '', precoUnitario: '',
      controlaStock: true, categoria: null, fornacedor: null, imposto: null,
      imagem: null, distribuicaoStock: [], tempStock: 0, tempStockMin: 0
    },
    mode: 'onChange',
  });

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isStockEnabled = watch('controlaStock');
  
  // ✅ CORREÇÃO DO LOOP (useMemo): Estabiliza a lista para o useCallback não disparar sempre
  const watchedDistribuicao = watch('distribuicaoStock');
  const distribuicaoStock = useMemo(() => watchedDistribuicao || [], [watchedDistribuicao]);

  // ✅ REGRA: Global agora tem apenas 2 passos (Ficha Técnica pura)
  const totalSteps = 2;
const isAdminGlobal = user?.idl === '0';
const isIdentityDisabled = mode === 'CONFIGURE_EXISTING' || isManager;
 const isGlobalCatalog = mode === 'GLOBAL_CATALOG' || (isEditMode && isAdminGlobal);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, supps, imps, lojas] = await Promise.all([
          listarCategorias(), listarFornecedores(), listarImpostos(), listarLojas()
        ]);
        setCategories(cats); setSuppliers(supps); setTaxes(imps); setShops(lojas);
      } catch (error) { console.error('Erro ao carregar dados:', error); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (typeof initialData.imagem === 'string') setImagePreview(initialData.imagem);
    }
  }, [initialData, reset]);

  // ✅ MÉTODO EXPOSTO COM LÓGICA DE UNIDADE AUTOMÁTICA E STOREID NA RAIZ
  useImperativeHandle(ref, () => ({
    trigger,
    getValues: () => {
      const data = getValues();
      const targetId = mode === 'SINGLE_STORE' ? shops[0]?.id : user?.idl;

      // Se não for modo Global nem Edição pura
      if (!isGlobalCatalog && mode !== 'EDIT') {
        
        // --- CASO 1: PRODUTO LIVRE (isStockEnabled = false) ---
        if (!isStockEnabled && !isEditMode) {
          if (targetId && targetId !== "0") {
            // ✅ Injeta storeId na raiz para o Backend associar o preço ao local correto
            data.storeId = targetId;
            data.distribuicaoStock = []; 
          }
        } 
        
        // --- CASO 2: PRODUTO COM STOCK (isStockEnabled = true) ---
        else if (isStockEnabled && !isEditMode) {
          if (targetId && targetId !== "0") {
            const precoNumerico = typeof data.precoUnitario === 'string'
              ? parseFloat(data.precoUnitario.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."))
              : Number(data.precoUnitario || 0);

            data.distribuicaoStock = [{
              storeId: targetId,
              storeName: user?.loja || 'Unidade Local',
              stock: data.tempStock || 0,
              stockMin: data.tempStockMin || 0,
              precoUnitario: precoNumerico
            }];
          }
        }
      } else if (isGlobalCatalog) {
          // No modo Global, limpamos qualquer lixo de stock
          data.distribuicaoStock = [];
      }
      return data;
    },
    resetStep: () => setStep(0),
  }));

  // ✅ handleAddStock estabilizado pelo useMemo acima
  const handleAddStock = useCallback(() => {
    // Nota: Esta função só seria usada no Step 2, que agora está oculto no Global.
    // Mantida para integridade técnica caso o requisito de Admin Global mude no futuro.
  }, []);

  const nextStep = async () => {
    let fields: Array<keyof ProductFormData> = [];
    if (step === 0) fields = ['codigobarra', 'nome'];
    if (step === 1) {
      fields = ['categoria', 'fornacedor', 'imposto'];
      if (!isGlobalCatalog) fields.push('precoUnitario');
      if (!isGlobalCatalog && mode !== 'EDIT' && isStockEnabled) {
          fields.push('tempStock', 'tempStockMin');
      }
    }
    const isValid = await trigger(fields);
    if (isValid) setStep(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Progress value={((step + 1) / totalSteps) * 100} className="h-2 transition-all" />
      
      <div className="min-h-[350px]">
        {/* PASSO 0: IDENTIDADE */}
        {step === 0 && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="col-span-12 md:col-span-9 space-y-4">
              <Controller name="codigobarra" control={control} render={({ field }) => (
                <FormField label="Código de Barra *" {...field} disabled={isIdentityDisabled} error={errors.codigobarra?.message} />
              )} />
              <Controller name="nome" control={control} render={({ field }) => (
                <FormField label="Nome do Produto *" {...field} disabled={isIdentityDisabled} error={errors.nome?.message} />
              )} />
            </div>
            {!isEditMode && (
              <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center gap-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Imagem</Label>
                <div className={`w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden bg-blue-50/30 relative ${isIdentityDisabled ? 'opacity-50' : 'cursor-pointer hover:border-blue-400'}`}>
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Plus className="w-8 h-8 text-blue-300" />}
                  {!isIdentityDisabled && (
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setValue('imagem', file); setImagePreview(URL.createObjectURL(file)); }
                    }} />
                  )}
                </div>
              </div>
            )}
            <div className="col-span-12">
              <Controller name="descricao" control={control} render={({ field }) => (
                <FormField label="Descrição" type="textarea" {...field} value={field.value || ''} disabled={isIdentityDisabled} error={errors.descricao?.message} />
              )} />
            </div>
          </div>
        )}

        {/* PASSO 1: DADOS TÉCNICOS E FINANCEIROS */}
        {step === 1 && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* O Preço só aparece se NÃO for cadastro Global Central */}
            {!isGlobalCatalog && (
              <div className="col-span-12 md:col-span-6">
                <Controller name="precoUnitario" control={control} render={({ field }) => (
                  <FormField label="Preço de Venda (Db) *" placeholder="0.00" {...field} error={errors.precoUnitario?.message} />
                )} />
              </div>
            )}

            <div className="col-span-12 md:col-span-6">
              <Controller name="categoria" control={control} render={({ field }) => (
                <FormField  name="categoria" label="Categoria *" type="select" options={categories.map(c => ({ label: c.nome, value: String(c.id) }))} value={field.value?.id ? String(field.value.id) : ''}
                  disabled={isIdentityDisabled}
                  onSelectChange={(id) => { const cat = categories.find(c => String(c.id) === id); field.onChange(cat ? { id: cat.id, nome: cat.nome } : null); }} error={errors.categoria?.message} />
              )} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller name="imposto" control={control} render={({ field }) => (
                <FormField  name="imposto" label="Taxa de Imposto *" type="select" options={taxes.map(t => ({ label: t.imposto, value: String(t.id) }))} value={field.value?.id ? String(field.value.id) : ''}
                  disabled={isIdentityDisabled}
                  onSelectChange={(id) => { const imp = taxes.find(t => String(t.id) === id); field.onChange(imp ? { id: imp.id, nome: imp.imposto } : null); }} error={errors.imposto?.message} />
              )} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller name="fornacedor" control={control} render={({ field }) => (
                <FormField  name="fornacedor" label="Fornecedor Principal *" type="select" options={suppliers.map(s => ({ label: s.nome, value: String(s.id) }))} value={field.value?.id ? String(field.value.id) : ''}
                  disabled={isIdentityDisabled}
                  onSelectChange={(id) => { const sup = suppliers.find(s => String(s.id) === id); field.onChange(sup ? { id: sup.id, nome: sup.nome } : null); }} error={errors.fornacedor?.message} />
              )} />
            </div>

            {/* Campos de Stock só para contexto Local (Não Global) */}
            {!isGlobalCatalog && mode !== 'EDIT' && isStockEnabled && (
              <>
                <div className="col-span-12 md:col-span-6">
                  <Controller name="tempStock" control={control} render={({ field }) => (
                    <FormField label="Quantidade Inicial *" type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} error={errors.tempStock?.message} />
                  )} />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <Controller name="tempStockMin" control={control} render={({ field }) => (
                    <FormField label="Stock Mínimo Alerta *" type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} error={errors.tempStockMin?.message} />
                  )} />
                </div>
              </>
            )}

            <div className="col-span-12 mt-6 p-4 rounded-xl border-2 bg-slate-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isStockEnabled ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {isStockEnabled ? <Package size={22} /> : <ShieldCheck size={22} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tight">{isStockEnabled ? 'Gestão de Stock Activa' : 'Produto de Fluxo Livre'}</span>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      {isStockEnabled ? 'O sistema controlará quantidades nesta unidade.' : 'Ideal para serviços e produção ilimitada.'}
                    </span>
                  </div>
                </div>
                <Controller name="controlaStock" control={control} render={({ field }) => (
                  <button type="button" disabled={isIdentityDisabled} onClick={() => field.onChange(!field.value)} className={`relative h-7 w-12 rounded-full transition-colors ${field.value ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${field.value ? 'left-6' : 'left-1'}`} />
                  </button>
                )} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-6 border-t mt-4">
        <Button type="button" variant="ghost" onClick={() => setStep(prev => prev - 1)} disabled={step === 0 || isLoading} className="font-bold text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
        </Button>
        {step < totalSteps - 1 ? (
          <Button type="button" onClick={nextStep} disabled={isLoading} className="px-8 font-bold bg-slate-900">Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
        ) : (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 animate-pulse">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Pronto para {isGlobalCatalog ? 'Guardar no Catálogo' : isEditMode ? 'Atualizar' : 'Configurar na Unidade'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';
export default ProductForm;