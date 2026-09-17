/**
 * ====================================================
 * RECENT SALES TABLE - VERSÃO BLINDADA (DTO + ENTIDADE)
 * ====================================================
 */

import React from 'react';
import { Printer, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

import  {TooltipProvider} from "@/components/ui/tooltip";
import { RecentSale } from '@/types/sale-pdf'; 

interface RecentSalesTableProps {
  sales: RecentSale[]; 
  onView: (sale: RecentSale) => void;      
  onPrint: (sale: RecentSale) => void;     
}

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ sales, onView, onPrint }) => {
  return (
    <TooltipProvider>
      <div className="w-full border rounded-md overflow-hidden bg-white shadow-sm">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm relative border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b shadow-sm z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Nº Factura</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Método</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => {
                // ✅ ACESSO DIRETO AOS CAMPOS PLANOS DO DTO
                const valorTotal = sale.totalGeral || 0;
                const dataHora = sale.dataVenda;
                const nomeDocliente = sale.nomeCliente || 'Venda ao Público';
                //const nifDoCliente = sale.nifCliente || 'Consumidor Final';
                const metodo = sale.metodoPagamento || '---';

                return (
                  <tr key={sale.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {dataHora ? new Date(dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">{sale.numeroFactura}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 uppercase">{nomeDocliente}</td>
                   
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      {Number(valorTotal).toFixed(2)} <small className="text-[9px]">dbs</small>
                    </td>
                    <td className="px-4 py-3 text-center uppercase text-[10px] font-bold text-slate-500">{metodo}</td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(sale)} className="h-8 w-8 text-blue-600">
                          <Eye size={16}/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onPrint(sale)} className="h-8 w-8 text-emerald-600">
                          <Printer size={16}/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};