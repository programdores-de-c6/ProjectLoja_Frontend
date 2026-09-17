/**
 * ====================================================
 * SERVIÇO DE LOCALIDADES (LocationService.tsx) - ATUALIZADO
 * ====================================================
 * 
 * Segue padrão do CategoryService:
 * - Usa api.ts global
 * - Tratamento de erros com showErrorToast
 * - Funções CRUD expostas via hook customizado
 */

import api from '@/config/api';
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES
// ====================================================

export interface Location {
  id: string;
  nome: string;
  sigla: string;
  distritoid: string;
  createdAt?: string;
  updatedAt?: string;
    nomedistrito?: string;
}

export interface LocationFormData {
  id?: string;
  nome: string;
  sigla: string;
  distritoid: string;
  distritoNome?: string;
 
}

export interface Distrito {
  id: string;
  nome: string;
}

// ====================================================
// HOOK CUSTOMIZADO
// ====================================================

export const useLocationService = () => {

  /**
   * Lista todas as localidades
   * GET /location/list
   */
  const listar = async (): Promise<Location[]> => {
    try {
      const response = await api.get('/location/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar localidades:', error);
      showErrorToast('Erro ao listar localidades.');
      throw error;
    }
  };

  /**
   * Lista todos os distritos
   * GET /distritos/list
   */
  const listarDistritos = async (): Promise<Distrito[]> => {
    try {
      const response = await api.get('/distritos/listar');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar distritos:', error);
      showErrorToast('Erro ao listar distritos.');
      throw error;
    }
  };

  /**
   * Cria uma nova localidade
   * POST /location/create
   */
  const criar = async (data: LocationFormData): Promise<Location> => {
    try {
      const payload = {
        nome: data.nome,
        sigla: data.sigla,
         district: data.distritoid
        ? { id: data.distritoid  }
        : null,
      };
      const response = await api.post('/location/create', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar localidade:', error);
      showErrorToast('Erro ao criar localidade.');
      throw error;
    }
  };

  /**
   * Edita uma localidade existente
   * PUT /location/update
   */
  const editar = async (data: LocationFormData): Promise<Location> => {
    try {
      const payload = {
        id: data.id,
        nome: data.nome,
        sigla: data.sigla,
       district: data.distritoid
        ? { id: data.distritoid  }
        : null,
      };
      const response = await api.put('/location/update', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar localidade:', error);
      showErrorToast('Erro ao editar localidade.');
      throw error;
    }
  };

  /**
   * Deleta uma localidade pelo ID
   * DELETE /location/delete/{id}
   */
  const deletar = async (id: string): Promise<void> => {
    try {
      await api.delete(`/location/delete`,{
params: { id: id }
      });
    } catch (error) {
      console.error('Erro ao deletar localidade:', error);
      showErrorToast('Erro ao deletar localidade.');
      throw error;
    }
  };

  return { listar, listarDistritos, criar, editar, deletar };
};