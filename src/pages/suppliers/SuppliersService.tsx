/**
 * ====================================================
 * SUPPLIER SERVICE - SERVIÇO DE API PARA FORNECEDORES
 * ====================================================
 * 
 * Este serviço abstrai todas as chamadas à API relacionadas com a gestão de fornecedores.
 * Segue o padrão de hooks customizados para facilitar o uso nos componentes React.
 * Implementa operações CRUD completas (Listar, Criar, Editar, Eliminar).
 */

// Importação da instância configurada do Axios para chamadas à API
import api from '@/config/api';
// Importação do utilitário para exibição de mensagens de erro
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES E TIPOS DE DADOS
// ====================================================

/**
 * Interface que representa a estrutura de um Fornecedor vinda da API.
 */
export interface Supplier {
  id?: string;                 // Identificador único do fornecedor
  nome: string;                // Nome do fornecedor
  numeroContribuite: string;   // NIF (Número de Contribuinte)
  email: string;               // Endereço de correio eletrónico
  contactoPrincipal: string;   // Número de telefone principal
  contactoSecudario?: string;  // Número de telefone secundário (opcional)
  idpais?: string;             // ID do país (campo aplanado vindo da API)
  nomepais?: string;           // Nome do país (campo aplanado vindo da API)
  logo?: string;               // Logo do fornecedor (se aplicável)
}

/**
 * Interface que representa os dados necessários para criar ou editar um Fornecedor.
 */
export interface SupplierFormData {
  id?: string;                 // ID opcional (usado apenas na edição)
  nome: string;                // Nome obrigatório
  numeroContribuite: string;   // NIF obrigatório
  email: string;               // Email
  contactoPrincipal: string;   // Telefone principal
  contactoSecudario?: string;  // Telefone secundário
  country?: { id: string; nome: string } | null; // País selecionado
  
}

/**
 * Interface para representar um País.
 */
export interface Country {
  id: string;
  nome: string;
}

// ====================================================
// HOOK CUSTOMIZADO: useSupplierService
// ====================================================

/**
 * Hook que fornece as funções de operação para o módulo de Fornecedores.
 */
export const useSupplierService = () => {

  /**
   * Função para listar todos os fornecedores cadastrados.
   * Rota: GET /supplier/list
   */
  const listar = async (): Promise<Supplier[]> => {
    try {
      const response = await api.get('/supplier/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      showErrorToast('Erro ao listar fornecedores.');
      throw error;
    }
  };

  /**
   * Função para listar todos os países.
   * Rota: GET /country/list
   */
  const listarPais = async (): Promise<Country[]> => {
    try {
      const response = await api.get('/country/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar países:', error);
      showErrorToast('Erro ao listar países.');
      throw error;
    }
  };

  /**
   * Função para criar um novo fornecedor.
   * Rota: POST /supplier/create
   */
  const criar = async (data: SupplierFormData): Promise<Supplier> => {
    try {
      const response = await api.post('/supplier/create', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      showErrorToast('Erro ao criar fornecedor.');
      throw error;
    }
  };

  /**
   * Função para atualizar um fornecedor existente.
   * Rota: PUT /supplier/update
   */
  const editar = async (data: SupplierFormData): Promise<Supplier> => {
    try {
      const response = await api.put('/supplier/update', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao editar fornecedor:', error);
      showErrorToast('Erro ao atualizar fornecedor.');
      throw error;
    }
  };

  /**
   * Função para remover um fornecedor pelo ID.
   * Rota: DELETE /supplier/delete?id={id}
   * Nota: No código antigo a rota era /shop/delete, mas seguindo a lógica deve ser /supplier/delete
   */
 const deletar = async (id: string | number): Promise<void> => {
  try {
    // ✅ Padronização: O ID vai no final da URL (Ex: /supplier/delete/5)
    // Isto torna a rota mais segura e fácil de ler nos logs do servidor.
    await api.delete(`/supplier/delete/${id}`);
  } catch (error: unknown) {
    // Regista o erro técnico na consola para o programador
    console.error('Erro ao eliminar fornecedor:', error);
    // Notifica o utilizador com uma mensagem amigável
    showErrorToast('Não foi possível remover o fornecedor. Verifique se ele está vinculado a produtos.');
    // Lança o erro para ser tratado pelo componente se necessário
    throw error;
  }
};

  return { listar, listarPais, criar, editar, deletar };
};
