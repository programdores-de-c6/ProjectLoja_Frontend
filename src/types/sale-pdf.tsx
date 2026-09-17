/**
 * ====================================================
 * SALE TYPES - VERSÃO UNIFICADA E SINCRONIZADA (JAVA DTO)
 * ====================================================
 */

export interface SaleResponseItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}




// ✅ ESTA É A INTERFACE OFICIAL (Plana como o seu JSON)
export interface SaleFinalizedResponse {
  id: number;
  numeroFactura: string;
  numeroAutorizacao?: string | null;
  dataVenda: string;
  nomeCliente: string;
  nifCliente: string | null;
  shopNome: string | null;
  shopNif: string | null;
  shopEndereco: string | null;
  shopContacto: string | null;
  shopEmail: string | null;
  shopLogo: string | null;
  subtotal: number | null;      // Pode vir null
  totalImposto: number | null;  // Pode vir null
  desconto: number | null;      // Pode vir null
  troco: number | null;         // Pode vir null
  valorRecebido: number | null; // Note o 'v' minúsculo conforme o JSON
  totalGeral: number;
  metodoPagamento: string;
  operador: string;
  itens: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

// ✅ Tornamos RecentSale um apelido (Alias) para a interface oficial
export type RecentSale = SaleFinalizedResponse;