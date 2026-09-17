/**
 * ====================================================
 * SERIE SERVICE - HOOK CUSTOMIZADO (API)
 * ====================================================
 * 
 * Serviço para gerir séries de numeração fiscal.
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
export interface Serie {
  id: number;
  serie: string;
  numeroAutorizacao: string;
  ano: number;

  shop: string | null;   // nome da loja
  shops: number | null;  // id da loja

  ultimasequecia?: number;
}

/**
 * Dados para criação/edição de série.
 */
export interface SerieFormData {
  id?: number;
  serie: string;
  numeroautorizacao: string;
  ano: number;
  idshop?: string; // Opcional para edição
  nomeshop?: string; // Opcional para exibição
  shop: string; // ID da loja associada (string para validação mais simples)
}

// ====================================================
// HOOK DO SERVIÇO
// ====================================================

export const useSerieService = () => {

  const listar = async (): Promise<Serie[]> => {
    try {
      const response = await api.get('/series/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar séries:', error);
      showErrorToast('Erro ao carregar a lista de séries.');
      throw error;
    }
  };

  const criar = async (data: SerieFormData): Promise<Serie> => {
    try {
 const payload = {
        serie: data.serie,
        numeroAutorizacao: data.numeroautorizacao,
        ano: data.ano,
        shop:{id:data.shop}
      };

      const response = await api.post('/series/create', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar série:', error);
      showErrorToast('Erro ao criar a nova série.');
      throw error;
    }
  };

  const editar = async (data: SerieFormData): Promise<Serie> => {
    try {
       const payload = {
        id: data.id,
        serie: data.serie,
        numeroAutorizacao: data.numeroautorizacao,
        ano: data.ano,
        shop:{id:data.shop}
      };
      const response = await api.put('/series/update', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar série:', error);
      showErrorToast('Erro ao atualizar os dados da série.');
      throw error;
    }
  };

  const deletar = async (id: number): Promise<void> => {
    try {
      await api.delete('/series/delete', { params: { id } });
    } catch (error) {
      console.error('Erro ao deletar série:', error);
      showErrorToast('Erro ao remover a série.');
      throw error;
    }
  };

  return { listar, criar, editar, deletar };
};
