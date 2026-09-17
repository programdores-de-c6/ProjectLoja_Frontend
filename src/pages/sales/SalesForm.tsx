/**
 * ====================================================
 * SALES FORM - APRESENTAÇÃO VISUAL DO PDV
 * ====================================================
 * RESPONSABILIDADE: Desenhar a interface, botões e cards.
 */

import React from 'react';
import { ShoppingCart, LogOut, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { SaleLogicReturn } from './useSaleLogic';
import { ProductDisplay } from './SalesPage';
import { User } from '@/types/auth';
import { CaixaSession } from '@/pages/caixa/CaixaService';
import { ReceiptFormat } from '@/utils/saleReceiptPdf';

import ProductSearch from './ProductSearch';
import CartTable from './CartTable';
import CustomerSelector from './CustomerSelector';
import { OpenCaixaModal } from '@/components/Modal/CaixaModals';

interface SalesFormProps {
  sale: SaleLogicReturn;        
  user: User | null;                   
  currentCaixa: CaixaSession | null;   
  isCaixaOpen: boolean;
  isLoadingCaixa: boolean;
  isProcessingSale: boolean;
  printFormat: ReceiptFormat;  
  setPrintFormat: (f: ReceiptFormat) => void;
  onOpenCheckout: () => void;
  onOpenCustomerModal: () => void;
  onOpenCloseCaixa: () => void;
  formattedProducts: ProductDisplay[]; 
  onAddProduct: (p: ProductDisplay) => void; 
  productsLoading: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const SalesForm: React.FC<SalesFormProps> = ({ 
  sale, user, currentCaixa, isCaixaOpen, isLoadingCaixa, isProcessingSale,
  printFormat, setPrintFormat, onOpenCheckout, onOpenCustomerModal,
  onOpenCloseCaixa, formattedProducts, onAddProduct, productsLoading, searchInputRef 
}) => {

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      
      {/* MODAL DE BLOQUEIO */}
      {!isLoadingCaixa && !isCaixaOpen && <OpenCaixaModal open={true} />}

      {/* CABEÇALHO */}
      <header className="bg-white border-b px-6 py-2 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-md text-white"><ShoppingCart size={20} /></div>
          <h1 className="text-lg font-bold text-slate-800">Sistema de Vendas</h1>
          <Badge className={isCaixaOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {isCaixaOpen ? `Caixa Aberto: #${currentCaixa?.id}` : "Caixa Fechado"}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right leading-tight border-r pr-4">
            <p className="text-[11px] font-bold text-slate-600 uppercase">{user?.nome}</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase">Loja {user?.idl}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500"><LogOut size={20} /></Button>
        </div>
      </header>

      {/* ÁREA DE OPERAÇÃO */}
      <main className="flex-1 overflow-hidden p-3 grid grid-cols-12 gap-3">
        
        {/* COLUNA ESQUERDA (BUSCA E CARRINHO) */}
        <div className="col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          <Card className="p-2 shrink-0 border-slate-200 shadow-sm">
            <ProductSearch 
              ref={searchInputRef}
              products={formattedProducts} 
              onProductSelected={onAddProduct} 
              isLoading={productsLoading} 
            />
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden bg-white shadow-sm border-slate-200">
            <div className="px-4 py-2 border-b bg-slate-50 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold uppercase text-slate-500">Itens no Carrinho</span>
              <Badge variant="secondary">{sale.items.length} ITENS</Badge>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {sale.items.length > 0 ? (
                <CartTable items={sale.items} onQuantityChange={sale.updateQty} onRemoveItem={sale.removeItem} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20">
                  <ShoppingCart size={80} />
                  <p className="font-bold uppercase text-lg">Vazio</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLUNA DIREITA (FINANCEIRO) */}
        <aside className="col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
          <div className="pt-1" />
          
          <Card className="shrink-0 shadow-sm border-slate-200 overflow-hidden">
            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest">Cliente</div>
            <div className="p-3">
              <CustomerSelector selectedCustomer={sale.cliente} onSelectCustomer={onOpenCustomerModal} onRemoveCustomer={() => sale.setCliente(null)}  nomeInformal={sale.nomeInformal}
  setNomeInformal={sale.setNomeInformal} />
            </div>
          </Card>

          <Card className="shrink-0 shadow-md border-slate-200 flex flex-col bg-white overflow-hidden mb-2">
            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest">Resumo Financeiro</div>
            <div className="p-4 space-y-3">
              
              <div className="flex items-center justify-around py-1 border-b border-slate-100 text-center">
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 font-black uppercase">Subtotal</p>
                  <p className="text-sm font-bold text-slate-700">{sale.subtotal.toFixed(2)}</p>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 mx-1" /> 
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 font-black uppercase">Impostos</p>
                  <p className="text-sm font-bold text-blue-600">{sale.totalTax.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between px-1">
                    Desc. <button onClick={() => sale.setDiscountType(sale.discountType === 'PERCENTAGE' ? 'FIXED' : 'PERCENTAGE')} className="text-blue-600 font-bold hover:underline">
                      ({sale.discountType === 'PERCENTAGE' ? '%' : 'Db'})
                    </button>
                  </label>
                  <Input type="number" value={sale.discount === 0 ? "" : sale.discount} onChange={e => sale.setDiscount(Number(e.target.value))} className="h-8 text-sm" placeholder="0" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 ml-1"><Printer size={12} /> Formato</label>
                  <div className="grid grid-cols-3 gap-0.5 bg-slate-100 p-0.5 rounded h-8">
                    {(['THERMAL', 'A5', 'A4'] as ReceiptFormat[]).map(fmt => (
                      <button key={fmt} type="button" onClick={() => setPrintFormat(fmt)} className={`text-[8px] font-black rounded ${printFormat === fmt ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        {fmt === 'THERMAL' ? 'POS' : fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg shadow-xl flex justify-between items-center text-white relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase z-10">Total Final</span>
                <div className="z-10 text-right leading-none">
                  <span className="text-3xl font-black text-emerald-400">{sale.total.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-emerald-500 ml-1 uppercase">dbs</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Método</label>
                  <Select value={sale.paymentMethod} onValueChange={sale.setPaymentMethod}>
                    <SelectTrigger className="h-8 text-xs bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DINHEIRO">DINHEIRO</SelectItem>
                      <SelectItem value="TRANSFERÊNCIA">TRANSFERÊNCIA</SelectItem>
                      <SelectItem value="CARTÃO">CARTÃO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Recebido</label>
                  <Input 
                    type="number" 
                    value={sale.received === 0 ? "" : sale.received} 
                    onFocus={e => e.target.select()}
                    // ====================================================
                    // ✅ LÓGICA DO ENTER PARA ABRIR O CHECKOUT
                    // ====================================================
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Valida: caixa aberto + tem itens + dinheiro suficiente (tolerância de 0.01 dbs)
                        if (isCaixaOpen && sale.items.length > 0 && sale.received >= (sale.total - 0.01)) {
                          onOpenCheckout(); 
                        } else if (sale.received < sale.total) {
                          // Se o dinheiro não chegar, o Enter não abre a próxima tela
                          console.warn("Valor recebido insuficiente.");
                        }
                      }
                      // Bloqueia teclas de sinais matemáticos inválidos
                      if (['-', '+', 'e'].includes(e.key)) e.preventDefault();
                    }}
                    onChange={e => sale.setReceived(Number(e.target.value))} 
                    className="h-8 text-sm font-bold text-emerald-600 bg-emerald-50/30 border-emerald-100" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              {sale.received > sale.total && (
                <div className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-100 text-orange-700">
                  <span className="text-[10px] font-black uppercase">Troco:</span>
                  <span className="text-sm font-black">{sale.troco.toFixed(2)} dbs</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={onOpenCheckout}
                  disabled={sale.items.length === 0 || isProcessingSale || !isCaixaOpen}
                  className={`w-full h-12 text-lg font-black shadow-lg flex flex-col leading-none 
                    ${!isCaixaOpen ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  <span>FINALIZAR (F8)</span>
                  <span className="text-[10px] font-normal opacity-70 mt-1 uppercase tracking-widest">Concluir Venda</span>
                </Button>
                
                <div className="flex gap-2 mt-2">
                   <button onClick={sale.clearSale} className="flex-1 text-[9px] text-slate-400 hover:text-red-500 font-bold uppercase py-1 hover:bg-red-50 transition-colors">Limpar</button>
                   <button onClick={onOpenCloseCaixa} className="flex-1 text-[9px] text-slate-400 hover:text-blue-500 font-bold uppercase py-1 border-l hover:bg-blue-50 transition-colors">Fechar Caixa</button>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default SalesForm;