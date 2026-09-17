/**
 * ====================================================
 * RECEIPT COMPONENT - IMPRESSÃO DE TALÃO PDV
 * ====================================================
 */

import React from 'react';
import { SaleFinalizedResponse, SaleResponseItem } from '../../pages/sales/SalesService';

interface ReceiptProps {
  sale: SaleFinalizedResponse;
}

export const Receipt: React.FC<ReceiptProps> = ({ sale }) => {
  // Bloqueio de segurança: se não houver dados, não renderiza
  if (!sale) return null;

  // ✅ CORRECÇÃO: Na sua interface 'SaleFinalizedResponse', o campo é 'itens' e não 'items'
  const itemsToPrint: SaleResponseItem[] = sale.itens || [];

  return (
    <div id="print-receipt" className="hidden print:block p-4 w-[80mm] bg-white text-black font-mono text-[10px] leading-tight">
      
      {/* CABEÇALHO - INFORMAÇÃO DA LOJA */}
      <div className="text-center border-b border-dashed pb-2 mb-2">
        <h2 className="text-sm font-bold uppercase">
          {sale.shopNome}
        </h2>
        <div className="text-[9px]">
          <p>NIF: {sale.shopNif}</p>
          <p>{sale.shopEndereco}</p>
          <p>{sale.shopEmail}</p>
        </div>

        <div className="mt-2 border-t border-dashed pt-1 uppercase">
          <p className="font-bold text-[11px]">Factura: {sale.numeroFactura}</p>
          <p>Data: {sale.dataVenda ? new Date(sale.dataVenda).toLocaleString('pt-PT') : ''}</p>
        </div>
      </div>

      {/* DADOS DO CLIENTE E OPERADOR */}
      <div className="mb-2 border-b border-dashed pb-1 text-[9px]">
        <p className="uppercase">
          <b>Cliente:</b> {sale.nomeCliente || 'Venda ao Público'}
        </p>
        {sale.clienteNif && <p><b>NIF:</b> {sale.clienteNif}</p>}
        <p className="uppercase">
          <b>Operador:</b> {sale.operador}
        </p>
      </div>

      {/* TABELA DE ITENS VENDIDOS */}
      <table className="w-full mb-2">
        <thead>
          <tr className="border-b border-dashed text-left">
            <th className="py-1">ARTIGO</th>
            <th className="text-center">QTD</th>
            <th className="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {itemsToPrint.map((item, index) => (
            <tr key={index}>
              <td className="py-1 uppercase text-[9px]">
                {item.productName}
              </td>
              <td className="text-center">
                {item.quantity}
              </td>
              <td className="text-right">
                {item.subtotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* RESUMO FINANCEIRO */}
      <div className="border-t border-dashed pt-2 space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{sale.subtotal.toFixed(2)} db</span>
        </div>
        
        {sale.totalImposto > 0 && (
          <div className="flex justify-between">
            <span>IMPOSTO (IVA):</span>
            <span>{sale.totalImposto.toFixed(2)} db</span>
          </div>
        )}

        {sale.desconto > 0 && (
          <div className="flex justify-between font-bold">
            <span>DESCONTO:</span>
            <span>-{sale.desconto.toFixed(2)} db</span>
          </div>
        )}

        {/* VALOR FINAL EM DESTAQUE */}
        <div className="flex justify-between text-[12px] font-black mt-2 border-t border-double pt-1">
          <span>TOTAL GERAL:</span>
          <span>{sale.totalGeral.toFixed(2)} db</span>
        </div>

        <div className="flex justify-between text-[8px] pt-1 font-bold">
          <span>MÉTODO PAGAMENTO:</span>
          <span className="uppercase">{sale.metodoPagamento}</span>
        </div>
      </div>

      {/* RODAPÉ FINAL */}
      <div className="text-center mt-6 border-t border-dashed pt-2">
        <p className="uppercase font-bold italic">Obrigado pela sua visita!</p>
        <p className="text-[7px] mt-1 text-slate-500">
          Processado por Software de Gestão v1.0
        </p>
      </div>
    </div>
  );
};