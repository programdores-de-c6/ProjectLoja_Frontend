/**
 * ====================================================
 * TAXES SERVICE - HOOK CUSTOMIZADO (API)
 * ====================================================
 * 
 * Serviço para gerir impostos.
 * Segue o padrão do LocationService e ShopService.
 */

import api from '@/config/api';
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES
// ====================================================

/**
 * Representa uma Série de numeração fiscal.
 */
export interface Taxes {
  id: number;
  imposto: string;
  baseCalculo: number;


}

/**
 * Dados para criação/edição de imposto.
 */
export interface TaxesFormData {
  id?: number;
  imposto: string;
  baseCalculo: number;
}

// ====================================================
// HOOK DO SERVIÇO
// ====================================================

export const useTaxesService = () => {

  const listar = async (): Promise<Taxes[]> => {
    try {
      const response = await api.get('/tax/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar impostos:', error);
      showErrorToast('Erro ao carregar a lista de impostos.');
      throw error;
    }
  };

  const criar = async (data: TaxesFormData): Promise<Taxes> => {
    try {
 const payload = {
        imposto: data.imposto,
        baseCalculo: data.baseCalculo,
      };

      const response = await api.post('/tax/create', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar imposto:', error);
      showErrorToast('Erro ao criar o novo imposto.');
      throw error;
    }
  };

  const editar = async (data: TaxesFormData): Promise<Taxes> => {
    try {
       const payload = {
        id: data.id,
        imposto: data.imposto,
        baseCalculo: data.baseCalculo,
      };
      const response = await api.put('/tax/update', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar imposto:', error);
      showErrorToast('Erro ao atualizar os dados do imposto.');
      throw error;
    }
  };

  const deletar = async (id: number): Promise<void> => {
    try {
      await api.delete('/tax/delete', { params: { id } });
    } catch (error) {
      console.error('Erro ao deletar imposto:', error);
      showErrorToast('Erro ao remover o imposto.');
      throw error;
    }
  };

  return { listar, criar, editar, deletar };
};
