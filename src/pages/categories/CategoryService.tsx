/**
 * ====================================================
 * SERVIÇO DE CATEGORIAS (CategoryService.tsx) - ATUALIZADO
 * ====================================================
 * 
 * Este serviço agora utiliza a instância global 'api' configurada
 * no arquivo src/config/api.ts.
 * 
 * BENEFÍCIOS:
 * - O Token e o IDL são anexados automaticamente em cada chamada.
 * - A lógica de Refresh Token funciona de forma transparente aqui.
 * - O código fica muito mais limpo e fácil de manter.
 */

import api from '@/config/api'; // Importando a instância global da API com segurança
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES (TIPOS)
// ====================================================

export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  id?: string;
  nome: string;
  descricao?: string;
}

// ====================================================
// HOOK CUSTOMIZADO useCategoryService
// ====================================================

export const useCategoryService = () => {
  
  // ====================================================
  // FUNÇÕES DE OPERAÇÃO (CRUD)
  // ====================================================

  /**
   * @function listar
   * Busca todas as categorias cadastradas no sistema.
   * Rota: /category/list
   */
  const listar = async (): Promise<Category[]> => {
    try {
      // Não precisamos mais passar headers manualmente! 
      // O interceptor no api.ts já faz isso por nós.
      const response = await api.get('/category/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showErrorToast('Erro ao listar categorias.');
      throw error;
    }
  };

  /**
   * @function criar
   * Cadastra uma nova categoria no sistema.
   * Rota: /category/create
   */
  const criar = async (data: CategoryFormData): Promise<Category> => {
    try {
      const payload = {
        nome: data.nome,
        descricao: data.descricao, 
      };

      const response = await api.post('/category/create', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      showErrorToast('Erro ao criar categoria.');
      throw error;
    }
  };

  /**
   * @function editar
   * Atualiza os dados de uma categoria existente.
   * Rota: /category/update
   */
  const editar = async (data: CategoryFormData): Promise<Category> => {
    try {
      const payload = {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao, 
      };
      const response = await api.put('/category/update', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      showErrorToast('Erro ao editar categoria.');
      throw error;
    }
  };

  /**
   * @function deletar
   * Remove uma categoria do sistema pelo ID.
   * Rota: /category/delete/{id}
   */
  const deletar = async (id: string): Promise<void> => {
    try {
      await api.delete(`/category/delete/${id}`);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      showErrorToast('Erro ao deletar categoria.');
      throw error;
    }
  };

  // Retorna as funções para serem usadas nos componentes (ex: CategoriesPage.tsx)
  return { listar, criar, editar, deletar };
};