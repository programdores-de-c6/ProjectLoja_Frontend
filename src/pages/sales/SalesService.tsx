/**
 * ====================================================
 * SALES SERVICE - VERSÃO CORRIGIDA E SINCRONIZADA
 * ====================================================
 */

import { useMemo, useCallback } from 'react'; 
import api from '@/config/api';
import { showErrorToast } from '@/utils/toast';
import { RecentSale } from '@/types/sale-pdf'; 


// --- INTERFACES DE ENVIO ---
export interface CreateSaleFormData {
  customerId?: number;   
  customerName?: string;  
  customerNif?: string;
  shopId: number;          
  userId: number;          
  caixaId: number; 
  discountAmount: number;
  paymentMethod: string;   
  valorRecebido: number;
  subtotal: number;        
  totalImposto: number;
  discountValue: number; 
  totalGeral: number;
  troco: number;
  proformaId?: number;
  totalAntesDoDesconto: number; 
  discountType: 'PERCENTAGE' | 'FIXED';
  items: Array<{           
    productId: number;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}

// --- INTERFACES DE RESPOSTA ---
export interface SaleResponseItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ProFormaItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
}

export interface ProFormaResponse {
  id: number;
  numeroProforma: string;
  dataProforma: string;
  customerId?: number;
  customerName?: string;
  customerNif?: string;
  shopId: number;
  status: string;
  subtotal: number;
  totalImposto: number;
  discountValue: number;
  totalGeral: number;
  items: ProFormaItemResponse[];
}

export interface CreateProFormaFormData {
  customerId?: number;
  customerName?: string;
  customerNif?: string;
  shopId: number;
  employeeId?: number;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  items: Array<{ productId: number; quantity: number; unitPrice: number; taxRate: number }>;
}

export interface SaleFinalizedResponse {
  id: number;
  numeroFactura: string;
  dataVenda: string;
  nomeCliente: string;
  clienteNif?: string;
  shopNome: string;
  shopNif: string;
  shopEndereco: string;
  shopContacto: string;
  shopEmail: string;
  shopLogo?: string; 
  subtotal: number;
  totalImposto: number;
  desconto: number;
  totalGeral: number;
  metodoPagamento: string;
  operador: string;
  itens: SaleResponseItem[];
  numeroAutorizacao?: string;
}

export const useSalesService = () => {

  /**
   * CRIAR VENDA
   * Rota: POST /sales/create
   */
  const criar = useCallback(async (data: CreateSaleFormData): Promise<SaleFinalizedResponse> => {
    try {
      const response = await api.post('/sales/create', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      showErrorToast('Erro ao processar venda.');
      throw error;
    }
  }, []);

  /**
   * LISTAR VENDAS POR CAIXA (Histórico)
   * Rota: GET /sales/by-box/{id}
   */
  const listarPorCaixa = useCallback(async (caixaId: number): Promise<RecentSale[]> => {
    try {
      const response = await api.get(`/sales/by-box/${caixaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar histórico do caixa ${caixaId}:`, error);
      return [];
    }
  }, []);

  /**
   * ✅ GET BY ID (CORRIGIDO)
   * O erro 500 acontecia aqui! 
   * Adicionámos "/details/" para bater com @GetMapping("details/{saleId}") do Java.
   */
  const getById = useCallback(async (id: string): Promise<RecentSale> => {
    try {
      // ✅ Antes estava: api.get(`/sales/${id}`)
      // ✅ Agora está: 
      const response = await api.get(`/sales/details/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes da venda ${id}:`, error);
      showErrorToast('Erro ao carregar detalhes.');
      throw error;
    }
  }, []);

    const criarProForma = useCallback(async (data: CreateProFormaFormData): Promise<ProFormaResponse> => {
    const response = await api.post('/proformas', data);
    return response.data;
  }, []);

  const listarProFormas = useCallback(async (): Promise<ProFormaResponse[]> => {
    const response = await api.get('/proformas');
    return response.data;
  }, []);

  const obterProForma = useCallback(async (id: number): Promise<ProFormaResponse> => {
    const response = await api.get(`/proformas/${id}/convert`);
    return response.data;
  }, []);

  const cancelarProForma = useCallback(async (id: number): Promise<ProFormaResponse> => {
    const response = await api.patch(`/proformas/${id}/cancel`);
    return response.data;
  }, []);

  /**
   * CANCELAR VENDA
   */
  const cancelar = useCallback(async (id: number): Promise<void> => {
    try {
      await api.put(`/sales/cancel/${id}`);
    } catch (error) {
      console.error(`Erro ao cancelar venda:`, error);
      showErrorToast('Erro ao anular a venda.');
      throw error;
    }
  }, []);

  // useMemo para manter as referências das funções estáveis
  return useMemo(() => ({
    criar,
    criarProForma,
    listarPorCaixa,
    listarProFormas,
    obterProForma,
    cancelarProForma,
    getById,
    cancelar
  }), [criar, criarProForma, listarPorCaixa, listarProFormas, obterProForma, cancelarProForma, getById, cancelar]);
};