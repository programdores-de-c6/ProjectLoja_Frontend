/**
 * ====================================================
 * CUSTOMER SERVICE - SERVIÇO DE API PARA CLIENTES
 * ====================================================
 * 
 * Este serviço abstrai todas as chamadas à API relacionadas com a gestão de clientes.
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
 * Interface que representa a estrutura de um Cliente vinda da API.
 */
export interface Customer {
  id?: string;                 // Identificador único do cliente
  nome: string;               // Nome completo do cliente
  numeroContribuinte: string;       // Número de Identificação Fiscal (NIF)
  email: string;              // Endereço de correio eletrónico
  contactoPrincipal: string;  // Número de telefone principal
  contactoSecudario?: string; // Número de telefone secundário (opcional)
  location: string;         // Nome da localidade/cidade do cliente
  ativo: boolean;             // Estado do cliente no sistema (ativo/inativo)
  faturamentoTotal?: number;  // Valor total acumulado de compras (opcional)
  idLocations?: string; // ID da localidade (campo aplanado vindo da API)
  nomeLocations?: string; // Nome da localidade (campo aplanado vindo da API)
  

}

/**
 * Interface que representa os dados necessários para criar ou editar um Cliente.
 */
export interface CustomerFormData {
  id?: string;                 // ID opcional (usado apenas na edição)
  nome: string;                // Nome completo obrigatório
  numeroContribuinte: string;        // NIF obrigatório (9 dígitos)
  email: string;               // Email obrigatório
  contactoPrincipal: string;   // Telefone principal obrigatório
  contactoSecudario?: string;  // Telefone secundário opcional
 location?: { id: string; nome: string } | null; // Localidade selecionada 
 
}    

// ====================================================
// HOOK CUSTOMIZADO: useCustomerService
// ====================================================

/**
 * Hook que fornece as funções de operação para o módulo de Clientes.
 */
export const useCustomerService = () => {

  /**
   * Função para listar todos os clientes cadastrados.
   * Rota: GET /customer/list
   */
  const listar = async (): Promise<Customer[]> => {
    try {
      // Faz a requisição GET para o endpoint de listagem
      const response = await api.get('/customer/list');
      // Retorna os dados da resposta (array de clientes)
      return response.data;
    } catch (error) {
      // Regista o erro na consola para depuração
      console.error('Erro ao listar clientes:', error);
      // Exibe mensagem visual de erro para o utilizador
      showErrorToast('Erro ao listar clientes.');
      // Propaga o erro para ser tratado no componente
      throw error;
    }
  };

  /**
   * Função para criar um novo cliente no sistema.
   * Rota: POST /customer/create
   */
  const criar = async (data: CustomerFormData): Promise<Customer> => {
    try {
      const payload = {
        ...data,
        location: data.location ? { id: data.location.id } : null,
      };

      // Envia os dados do formulário via POST com apenas o ID da localidade
      const response = await api.post('/customer/create', payload);
      // Retorna o cliente criado pela API
      return response.data;
    } catch (error) {
      // Regista o erro na consola
      console.error('Erro ao criar cliente:', error);
      // Exibe mensagem visual de erro para o utilizador
      showErrorToast('Erro ao criar cliente.');
      // Propaga o erro
      throw error;
    }
  };

  /**
   * Função para atualizar os dados de um cliente existente.
   * Rota: PUT /customer/update
   */
  const editar = async (data: CustomerFormData): Promise<Customer> => {
    try {
      const payload = {
        ...data,
        location: data.location ? { id: data.location.id } : null,
      };

      // Envia os dados atualizados via PUT com apenas o ID da localidade
      const response = await api.put('/customer/update', payload);
      // Retorna o cliente atualizado
      return response.data;
    } catch (error) {
      // Regista o erro na consola
      console.error('Erro ao editar cliente:', error);
      // Exibe mensagem visual de erro
      showErrorToast('Erro ao atualizar cliente.');
      // Propaga o erro
      throw error;
    }
  };

  /**
   * Função para remover um cliente do sistema pelo ID.
   * Rota: DELETE /customer/delete?id={id}
   */
  const deletar = async (id: string): Promise<void> => {
    try {
      // Executa a remoção enviando o ID como parâmetro de consulta
      await api.delete('/customer/delete', { params: { id } });
    } catch (error) {
      // Regista o erro na consola
      console.error('Erro ao deletar cliente:', error);
      // Exibe mensagem visual de erro
      showErrorToast('Erro ao remover cliente.');
      // Propaga o erro
      throw error;
    }
  };

  // Retorna as funções para serem consumidas pelos componentes React
  return { listar, criar, editar, deletar };
};