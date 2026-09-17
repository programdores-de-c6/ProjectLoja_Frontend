/**
 * ====================================================
 * CHECKOUT MODAL - VERSÃO OTIMIZADA (LISTA AMPLIADA)
 * ====================================================
 */

import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, User, ShoppingCart, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  stock: number;
}

interface Customer {
  id?: string;
  nome: string;
  nif?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  items: CartItem[];
  selectedCustomer: Customer | null;
  subtotal: number;
  totalTax: number;
  total: number;
  discount: number;
  paymentMethod: string;
  received: number;
  troco: number;

  isProcessing?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  selectedCustomer,
  subtotal,
  totalTax,
  total,
  paymentMethod,
  received,
  troco,
  discount,
  isProcessing = false,
}) => {
   //  Estado de segurança para evitar o "duplo clique" do Enter
  const [isReady, setIsReady] = React.useState(false);
   React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // Quando o modal abre, espera 500ms para permitir o uso do teclado
      timer = setTimeout(() => setIsReady(true), 500);
    } else {
      setIsReady(false); // Reseta quando o modal fecha
    }
    return () => clearTimeout(timer);
  }, [isOpen]);
  // Lógica de validação (Botão desativado se o valor recebido for insuficiente)
  const validationIssues = useMemo(() => {
    const issues: string[] = [];
      // Se o carrinho estiver vazio, bloqueia
    if (items.length === 0) issues.push('Carrinho vazio');
    
    // Validação de pagamento (Só bloqueia se for Dinheiro e valor < total)     // Se for dinheiro e o valor for menor que a conta, bloqueia
    if (received < total && (paymentMethod === 'DINHEIRO' || paymentMethod === 'CASH')) {
      issues.push(`Valor insuficiente. Faltam ${(total - received).toFixed(2)} dbs`);
    }
    return issues;
  }, [items.length, total, received, paymentMethod]);
// 2. A REGRA: O botão só fica ativo se não houver erros e não estiver já a processar
  const canConfirm = validationIssues.length === 0 && !isProcessing;
 // ====================================================
  // 3. O ATALHO (ENTER): Escuta o teclado enquanto o modal está aberto
  // ====================================================
 React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Só confirma se: Tecla Enter + Modal Aberto + Delay de segurança passou + Sem erros
      if (e.key === 'Enter' && isOpen && isReady && canConfirm && !isProcessing) {
        e.preventDefault();
        onConfirm();
      }
    };
    // Ativa o "ouvinte" global
    window.addEventListener('keydown', handleKeyDown);

    // Limpa o "ouvinte" quando o modal fecha (Limpeza de memória)
   return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isReady, canConfirm, isProcessing, onConfirm]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        
        {/* CABEÇALHO COMPACTO */}
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Revisão da Venda
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4 py-3 gap-3 bg-slate-50/30">
          
          {/* 1. CLIENTE (MUITO COMPACTO) */}
          <div className="border border-blue-100 rounded-lg p-2 bg-blue-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Cliente:</span>
                <span className="font-semibold text-xs text-slate-700">
                  {selectedCustomer?.nome || "Venda ao Público"}
                </span>
              </div>
              {selectedCustomer?.nif && (
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-600 font-bold">
                  NIF: {selectedCustomer.nif}
                </span>
              )}
            </div>
          </div>

          {/* 2. LISTA DE PRODUTOS (AUMENTADA - OCUPA A MAIOR PARTE) */}
          <div className="flex-[3] flex flex-col min-h-0 border rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-1.5 border-b flex justify-between items-center">
               <span className="text-[10px] font-bold uppercase text-slate-400">Detalhes dos Itens</span>
               <span className="text-[10px] font-bold text-slate-400">{items.length} Itens</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm pb-2 border-b border-slate-50 last:border-0">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700 leading-none">{item.productName}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.quantity} un. x {item.unitPrice.toFixed(2)} dbs
                      </p>
                    </div>
                    <p className="font-black text-slate-800 tracking-tight">
                      {(item.unitPrice * item.quantity).toFixed(2)} dbs
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 3. RESUMO TOTAIS E PAGAMENTO (DIMINUÍDOS) */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {/* Card Totais */}
            <div className="border rounded-lg p-2 bg-slate-50 space-y-0.5">
               <div className="flex justify-between text-[10px] text-slate-500">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} dbs</span>
              </div>
              <div className="flex justify-between text-[10px] text-blue-500 font-medium">
                <span>Imposto (IVA)</span>
                <span>{totalTax.toFixed(2)} dbs</span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500 font-medium">
  <span>Desconto</span>
  <span>-{discount.toFixed(2)} dbs</span>
</div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200 mt-1">
                <span className="text-slate-600 text-xs">TOTAL</span>
                <span className="text-blue-700">{total.toFixed(2)} dbs</span>
              </div>
            </div>

            {/* Card Pagamento */}
            <div className="border border-emerald-100 rounded-lg p-2 bg-emerald-50/30 space-y-0.5">
               <div className="flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 uppercase font-bold text-[9px]">
                  <CreditCard className="h-2.5 w-2.5" /> {paymentMethod}
                </span>
                <span>{received.toFixed(2)} dbs</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-emerald-100 mt-1 text-emerald-700">
                <span className="text-xs uppercase">Troco</span>
                <span>{troco.toFixed(2)} dbs</span>
              </div>
            </div>
          </div>

          {/* 4. ALERTA DE STATUS (MUITO PEQUENO) */}
          <div className="shrink-0">
            {validationIssues.length > 0 ? (
              <Alert variant="destructive" className="py-1 px-3 border-red-200 bg-red-50 rounded-md">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-[11px] font-bold">
                  {validationIssues[0]}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-md border border-emerald-100 shadow-inner">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">Venda verificada. Clique abaixo para emitir o talão.</span>
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ FIXO */}
        <DialogFooter className="p-4 pt-2 border-t bg-white flex flex-row items-center justify-end gap-3 shrink-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-xs text-slate-400 hover:bg-slate-50"
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-10 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100"
          >
            {isProcessing ? "A processar..." : "FINALIZAR VENDA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;