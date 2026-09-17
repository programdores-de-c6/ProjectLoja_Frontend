import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ReceiptText } from 'lucide-react';
import { SaleFinalizedResponse } from '@/types/sale-pdf'; 

interface Props {
  sale: SaleFinalizedResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SaleDetailsModal: React.FC<Props> = ({ sale, isOpen, onClose }) => {
  // 1. Se não houver venda, não renderiza nada para evitar erro
  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 font-black uppercase">
            <ReceiptText className="h-5 w-5" /> Detalhes da Venda
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] text-slate-500">
            FACTURA: {sale.numeroFactura}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* CABEÇALHO DO DETALHE - USANDO NOMES PLANOS DO DTO */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-400 font-bold uppercase">Data:</span>
              <span className="font-semibold text-slate-700">
                {sale.dataVenda ? new Date(sale.dataVenda).toLocaleString() : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase">Cliente:</span>
              <span className="font-bold text-slate-700">{sale.nomeCliente?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-blue-600 font-medium">
              <span className="uppercase text-[9px] font-black">Loja:</span>
              <span>{sale.shopNome || 'LIVRARIA SÃO TOMÉ'}</span>
            </div>
          </div>

          {/* LISTA DE PRODUTOS */}
          <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase border-b sticky top-0 bg-white">
                <tr>
                  <th className="pb-1">Produto</th>
                  <th className="pb-1 text-center">Qtd</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* ✅ PROTEÇÃO: Se itens for null, usa array vazio para não dar erro de MAP */}
                {(sale.itens || []).map((item, idx) => (
                  <tr key={idx} className="text-slate-600">
                    <td className="py-2 uppercase font-medium">{item.productName}</td>
                    <td className="py-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 text-right font-bold text-slate-800">
                      {Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BLOCO DE TOTAIS */}
<div className="bg-slate-900 p-4 rounded-xl text-white shadow-inner space-y-2">
   <div className="flex justify-between text-[10px] uppercase font-bold opacity-50 mb-2 border-b border-slate-700 pb-1">
                <span>Método:</span>
                  <span>{sale.metodoPagamento}</span>
             </div>
  <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
    <span>Subtotal:</span>
    <span>{Number(sale.subtotal || 0).toFixed(2)} dbs</span>
  </div>
  <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
    <span>Impostos:</span>
    <span>{Number(sale.totalImposto || 0).toFixed(2)} dbs</span>
  </div>
  <div className="flex justify-between text-[10px] uppercase font-bold text-red-400">
    <span>Desconto:</span>
    <span>-{Number(sale.desconto || 0).toFixed(2)} dbs</span>
  </div>
  <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-400 border-t border-slate-700 pt-2">
    <span>Valor Entregue:</span>
    <span>{Number(sale.valorRecebido || 0).toFixed(2)} dbs</span>
  </div>
  <div className="flex justify-between text-[10px] uppercase font-bold text-orange-400">
    <span>Troco:</span>
    <span>{Number(sale.troco || 0).toFixed(2)} dbs</span>
  </div>
  
  <div className="flex justify-between items-end pt-2 border-t border-slate-700">
    <span className="text-xs font-black uppercase text-white tracking-widest">Total Geral</span>
    <span className="text-2xl font-black text-emerald-400 leading-none">
      {Number(sale.totalGeral).toFixed(2)} <small className="text-xs uppercase">dbs</small>
    </span>
  </div>
</div>

          <p className="text-center text-[9px] text-slate-400 uppercase font-bold tracking-widest">
            Vendedeor: {sale.operador}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};