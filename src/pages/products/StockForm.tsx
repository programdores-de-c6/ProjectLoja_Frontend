/**
 * ====================================================
 * STOCK FORM - MOVIMENTAÇÃO DE CONTEXTO FIXO (REVISADO)
 * ====================================================
 * 
 * Versão final: Sem 'any', sem propriedades inválidas.
 * Exibe stock actual e previsão de saldo final.
 */

import { useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Info, PackagePlus, PackageMinus, ShieldCheck, Database } from 'lucide-react';

import FormField from '@/components/forms/FormField';
import { Badge } from '@/components/ui/badge'; // ✅ Utiliza o componente real do sistema
import { useAuth } from '@/contexts/useAuth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';

// --- INTERFACES ---

/** Interface de saída para o contrato do Backend que espera um array */
interface StockMoveOutput {
  distribuicaoStock: {
    storeId: string | number;
    storeName: string;
    stock: number;
    productId: string | number;
  }[];
}

const StockMoveSchema = z.object({
  storeId: z.union([z.string(), z.number()]).refine(val => val !== "" && val !== "0", "Unidade inválida"),
  stock: z.number().min(1, 'Mínimo 1 unidade'),
});

type StockMoveFormData = z.infer<typeof StockMoveSchema>;

interface StockFormProps {
  productId: string | number;
  productName?: string;
  currentStock: number; // Saldo actual vindo da ProductsPage
  mode: 'adicionar' | 'baixar';
  isLoading?: boolean;
}

export interface StockFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => StockMoveOutput;
}

const StockForm = forwardRef<StockFormRef, StockFormProps>(({ 
  productId, 
  productName, 
  currentStock, 
  mode, 
  isLoading 
}, ref) => {
  
  const { user } = useAuth(); 

  // 1. Configuração do formulário
  const { control, trigger, getValues, setValue, watch } = useForm<StockMoveFormData>({
    resolver: zodResolver(StockMoveSchema),
    defaultValues: { 
      storeId: user?.idl || "", 
      stock: 0 
    },
  });

  // Observa o valor digitado para calcular a previsão
  const inputValue = watch('stock') || 0;

  // ✅ Cálculo do saldo previsto em tempo real
  const previewStock = useMemo(() => {
    return mode === 'adicionar' ? currentStock + inputValue : currentStock - inputValue;
  }, [currentStock, inputValue, mode]);

  // Sincroniza a loja do contexto
  useEffect(() => {
    if (user?.idl) setValue('storeId', user.idl);
  }, [user, setValue]);

  // 2. ✅ MÉTODOS EXPOSTOS
  useImperativeHandle(ref, () => ({
    trigger,
    getValues: (): StockMoveOutput => {
      const formVal = getValues();
      return {
        distribuicaoStock: [
          {
            storeId: formVal.storeId,
            storeName: user?.loja || "Unidade Actual",
            stock: formVal.stock,
            productId: productId
          }
        ]
      };
    }
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner de Contexto com Stock Actual */}
      <Alert className={mode === 'baixar' ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            {mode === 'baixar' ? <PackageMinus size={18} className="text-amber-600" /> : <PackagePlus size={18} className="text-blue-600" />}
            <AlertDescription className="text-sm font-semibold ml-2 text-slate-800">
              Operação: <span className="font-bold text-blue-800 underline">{productName || 'Produto'}</span>
            </AlertDescription>
          </div>
          <Badge variant="outline" className="bg-white border-slate-300 text-slate-600 font-mono">
            Saldo Actual: {currentStock}
          </Badge>
        </div>
      </Alert>

      {/* Grid de Operação em 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
        
        {/* Unidade (Bloqueada) */}
        <div className="space-y-2">
           <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Unidade Actual</Label>
           <div className="h-10 px-3 flex items-center bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-500">
              <ShieldCheck size={14} className="mr-2 text-slate-400" /> {user?.loja}
           </div>
        </div>
        
        {/* Quantidade (Input) */}
        <div className="space-y-2">
           <Label className="text-[9px] font-black uppercase text-slate-600 ml-1">
             {mode === 'baixar' ? 'Quantidade a Baixar' : 'Quantidade a Somar'}
           </Label>
           <Controller
            name="stock"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="" // Propriedade obrigatória vazia pois o Label já está acima
                type="number"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={isLoading}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        {/* Previsão Final (Cálculo) */}
        <div className="space-y-2">
           <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Previsão Final</Label>
           <div className={`h-10 px-3 flex items-center border rounded-md text-sm font-black transition-colors ${
             previewStock < 0 
               ? 'bg-red-50 text-red-600 border-red-200' 
               : 'bg-green-50 text-green-700 border-green-200'
           }`}>
              <Database size={14} className="mr-2" /> {previewStock}
           </div>
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="flex items-start gap-3 p-4 bg-white border border-dashed rounded-xl text-slate-500">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed italic">
          Esta actualização afectará apenas a unidade <b>{user?.loja}</b>. 
          O novo saldo será de <b>{previewStock}</b> unidades após a confirmação.
        </p>
      </div>
    </div>
  );
});

StockForm.displayName = 'StockForm';
export default StockForm;