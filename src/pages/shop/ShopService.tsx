/**
 * ====================================================
 * SHOP SERVICE - HOOK CUSTOMIZADO (API)
 * ====================================================
 * 
 * Serviço centralizado para gerir operações de lojas (Shops).
 * Segue rigorosamente o padrão implementado no LocationService:
 * - Utiliza a instância global de 'api' (Axios).
 * - Tratamento de erros integrado com 'showErrorToast'.
 * - Funções CRUD expostas via hook customizado para facilitar o uso em componentes.
 */

import api from '@/config/api'; // Instância global do Axios configurada no projeto
import { showErrorToast } from '@/utils/toast'; // Utilitário de notificações de erro
import axios from 'axios';

// ====================================================
// INTERFACES E TIPOS (ENTITY DEFINITION)
// ====================================================

export type ShopType = 'LOJA' | 'ARMAZEM' | 'GRAFICA';
/**
 * Interface principal que representa uma Loja no sistema.
 */
export interface Shop {
  id: string; // Identificador único da loja
  nome: string; // Nome oficial da loja
  numeroContribuite?: string; // NIF ou número de contribuinte fiscal
  email?: string; // Endereço de email de contacto
  contacto?: string; // Número de telefone ou telemóvel
  caixaPostal?: number; // Código ou número de caixa postal
  location?: { // Objeto de localização associado
    id: string; // ID da localidade
    nome: string; // Nome da localidade
  } | null;
  logo?: File | string | null; // Logotipo da loja (pode ser ficheiro ou URL string)
  
  logoUrl?: string; // URL direta para a imagem do logo (se aplicável)
  idlocation?: string; // ID da localidade (campo aplanado vindo da API)
  nomelocation?: string; // Nome da localidade (campo aplanado vindo da API)
    shopType: ShopType;
}

/**
 * Interface para os dados de entrada do formulário (Criação/Edição).
 */
export interface ShopFormData {
  id?: string; // ID da loja (usado apenas na edição)
  nome: string; // Nome da loja
  numeroContribuite?: string; // Número de contribuinte
  email?: string; // Email de contacto
  contacto?: string; // Contacto telefónico
  caixaPostal?: number; // Caixa postal
  location?: { id: string; nome: string } | null; // Localidade selecionada
  logo?: File | null; // Ficheiro de imagem selecionado para upload
    shopType: ShopType;
}


// ====================================================
// HOOK DO SERVIÇO (CUSTOM HOOK)
// ====================================================

/**
 * Hook personalizado que encapsula todas as operações de API para Lojas.
 * Permite reutilizar a lógica de pedidos HTTP em diferentes componentes de forma limpa.
 */
export const useShopService = () => {

  /**
   * Lista todas as lojas registadas no sistema.
   * @returns Promise contendo a lista de lojas.
   */
  const listar = async (): Promise<Shop[]> => {
    try {
      // Faz um pedido GET para listar as lojas
      const response = await api.get('/shop/list');
      return response.data; // Retorna os dados da resposta
    } catch (error) {
      console.error('Erro ao listar lojas:', error); // Regista o erro na consola para depuração
      showErrorToast('Não foi possível carregar a lista de lojas.'); // Exibe mensagem de erro ao utilizador
      throw error; // Lança o erro para ser tratado pelo componente se necessário
    }
  };

  /**
   * Procura uma loja específica pelo seu ID.
   * @param id Identificador único da loja.
   * @returns Promise contendo os dados da loja.
   */
  const listarId = async (id: string): Promise<Shop> => {
    try {
      // Faz um pedido GET para buscar uma loja específica pelo seu ID
      const response = await api.get(`/shop/listid/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar loja por ID:', error);
      showErrorToast('Não foi possível encontrar a loja selecionada.');
      throw error;
    }
  };

  /**
   * Cria uma nova loja no sistema, suportando upload de logotipo.
   * @param data Dados da loja provenientes do formulário.
   * @returns Promise contendo os dados da loja criada.
   */
  const criar = async (data: ShopFormData): Promise<Shop> => {
    try {
      // Cria um objeto FormData para suportar envio de ficheiros (Logo)
      const formData = new FormData();

      // Se houver um ficheiro de logo selecionado, adiciona-o ao FormData
      if (data.logo instanceof File) {
        formData.append('file', data.logo);
      }

      // Constrói o DTO (Data Transfer Object) conforme esperado pelo backend
      const shopDto = {
        nome: data.nome,
        numeroContribuite: data.numeroContribuite || null,
        email: data.email || null,
        contacto: data.contacto || null,
        caixaPostal: data.caixaPostal || null,
        location: data.location ? { id: data.location.id, nome: data.location.nome } : null,
        shopType: data.shopType,
      };

      // Adiciona o DTO como uma string JSON dentro de um Blob para o backend processar corretamente
      formData.append(
        'shopDto', 
        new Blob([JSON.stringify(shopDto)], { type: 'application/json' })
      );

      // Faz um pedido POST para criar a loja com cabeçalho de multipart/form-data
      const response = await api.post('/shop/create', formData, {
          headers: { 
        'Content-Type': 'multipart/form-data' 
      },
     
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      showErrorToast('Ocorreu um erro ao tentar criar a nova loja.');
      throw error;
    }
  };

  /**
   * Edita uma loja existente, permitindo atualizar o logotipo.
   * @param data Dados da loja atualizados provenientes do formulário.
   * @returns Promise contendo os dados da loja atualizada.
   */
  const editar = async (data: ShopFormData): Promise<Shop> => {
    try {
      // Constrói o DTO para atualização
      const shopDto = {
        id: data.id,
        nome: data.nome,
        numeroContribuite: data.numeroContribuite || null,
        email: data.email || null,
        contacto: data.contacto || null,
        caixaPostal: data.caixaPostal || null,
        location: data.location ? { id: data.location.id, nome: data.location.nome } : null,
        shopType: data.shopType,
      };

      // Faz um pedido PUT para atualizar os dados da loja enviando apenas o JSON (DTO)
      const response = await api.put('/shop/update', shopDto);

      return response.data;
    } catch (error) {
      console.error('Erro ao editar loja:', error);
      showErrorToast('Ocorreu um erro ao tentar atualizar os dados da loja.');
      throw error;
    }
  };

  /**
 * alterarLogo: Sincronizado com o Controller Java usando RequestPart.
 * @param id Identificador da loja
 * @param logo Ficheiro de imagem
 */
const alterarLogo = async (id: string | number, logo: File): Promise<void> => {
  try {
    const formData = new FormData();
    
    // 1. Enviamos o ficheiro (nome da chave: 'file')
    formData.append('file', logo);

    // 2. Enviamos o ID como um Blob JSON (nome da chave: 'id')
    // Isso garante que o Spring Boot @RequestPart consiga ler o valor corretamente
    formData.append(
      'id', 
      new Blob([JSON.stringify(id)], { type: 'application/json' })
    );

    // ✅ Chamada via POST para a rota configurada
    await api.post('/shop/upload-logo', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });
  } catch (error: unknown) {
    // Tratamento de erro rigoroso para depuração
    if (axios.isAxiosError(error) && error.response) {
        console.error("Erro no Servidor:", error.response.data);
    }
    showErrorToast('Erro ao atualizar o logotipo da loja.');
    throw error;
  }
};

  /**
   * Remove uma loja do sistema através do seu ID.
   * @param id Identificador único da loja a remover.
   */
  const deletar = async (id: string): Promise<void> => {
    try {
      // Faz um pedido DELETE passando o ID como parâmetro de consulta (query param)
      await api.delete('/shop/delete', { params: { id } });
    } catch (error) {
      console.error('Erro ao deletar loja:', error);
      showErrorToast('Não foi possível remover a loja. Verifique se existem dependências associadas.');
      throw error;
    }
  };

  /**
   * Lista todas as localidades disponíveis para preencher o campo de seleção (Select).
   * @returns Promise contendo a lista de localidades (ID e Nome).
   */
  const listarLocalidade = async (): Promise<{ id: string; nome: string }[]> => {
    try {
      // Reutiliza o endpoint de localidades
      const response = await api.get('/location/list');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar localidades para o shop:', error);
      showErrorToast('Erro ao carregar a lista de localidades.');
      throw error;
    }
  };

  // Expõe as funções do serviço para serem consumidas pelos componentes
  return { listar, listarId, criar, editar, alterarLogo, deletar, listarLocalidade };
};
