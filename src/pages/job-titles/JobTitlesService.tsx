/**
 * ====================================================
 * JOB TITLES SERVICE - API SERVICE
 * ====================================================
 */

import api from '@/config/api';
import { useCallback } from 'react';
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES
// ====================================================

export interface JobTitle {
  id: number;
  nomecargo: string;
  descricao: string;
  valor:  number;
  accessLevel: string;
}

export interface JobTitlesFormData {
  id?: number;
  nomecargo: string;
  descricao?: string;
  valor?: number;
  accessLevel?: string;
}

const parseCurrencyToNumber = (value?: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  // Remove tudo que não seja número ou vírgula
  let cleaned = value.toString().replace(/[^\d,]/g, ""); // remove "Db", espaços e pontos de milhar
  cleaned = cleaned.replace(",", "."); // substitui vírgula decimal por ponto
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// ====================================================
// SERVICE
// ====================================================

export const useJobTitlesService = () => {

  const listar = useCallback(async (): Promise<JobTitle[]> => {
    try {
      const response = await api.get('/jobTitle/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar cargos:', error);
      showErrorToast('Erro ao carregar cargos.');
      throw error;
    }
  }, []);

  const criar = useCallback(async (data: JobTitlesFormData): Promise<JobTitle> => {
    try {
      const payload = {
        ...data,
        valor: parseCurrencyToNumber(data.valor),
      };
      const response = await api.post('/jobTitle/create', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      showErrorToast('Erro ao criar cargo.');
      throw error;
    }
  }, []);

  const editar = useCallback(async (data: JobTitlesFormData): Promise<JobTitle> => {
    try {
      const payload = {
        ...data,
        valor: parseCurrencyToNumber(data.valor),
      };
      const response = await api.put('/jobTitle/update', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar cargo:', error);
      showErrorToast('Erro ao atualizar cargo.');
      throw error;
    }
  }, []);

  const deletar = useCallback(async (id: number): Promise<void> => {
    try {
      await api.delete('/jobTitle/delete', { params: { id } });
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      showErrorToast('Erro ao remover cargo.');
      throw error;
    }
  }, []);

  return { listar, criar, editar, deletar };

};
