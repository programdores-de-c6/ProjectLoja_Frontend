/**
 * ====================================================
 * EMPLOYEE SERVICE - SERVIÇO DE API PARA FUNCIONÁRIOS
 * ====================================================
 * 
 * Este serviço abstrai todas as chamadas à API relacionadas com a gestão de funcionários.
 * Implementa operações CRUD completas e mapeamento de dados para o backend (DTO).
 */

import api from '@/config/api';
import axios from 'axios';
import { useCallback } from 'react';
import { showErrorToast } from '@/utils/toast';

// ====================================================
// INTERFACES E TIPOS DE DADOS
// ====================================================

/**
 * Interface que representa a estrutura de um Funcionário vinda da API.
 */
export interface Employee {
  // Identificadores
  id: string | number;
  nome: string;
  
  // Documentação e Identificação
  numeroBi: string;
  numeroContribuinte: string;
  
  // Informações de Contacto
  email: string | null;
  contactoPrincipal: string;
  contactoSecudario: string | null;
  
  // Dados Pessoais e Datas
  gender: 'M' | 'F' | string;
  dataNascimento: string;
  dataAdmissao: string;
  
  // Localização (A API envia o ID e o Nome em campos separados)
  location?: number;       // ID da Localidade
  locations?: string;     // Nome da Localidade
  
  // Loja (A API envia o ID e o Nome em campos separados)
  shop?: number;          // ID da Loja
  shops?: string;         // Nome da Loja
  shop2?: {               // Objeto completo da Loja se disponível
    id: number;
    nome: string;
    numeroContribuite?: string;
    email?: string;
    contacto?: string;
  } | null;

  // Função e Acessos
  jobtitle?: number;      // ID do Cargo
  jobTitle?: string;      // Nome do Cargo
  accessLevel?: string;   // Ex: "ROLE_ADMIN", "0", "NO_ACCESS"
  
  // Estado e Media
  status: 'ACTIVO' | 'INATIVO' | string;
  logoUrl: string | null; // URL da foto/avatar
  
  // Outros campos identificados na resposta da API
  username?: string;
  salaaryBases?: string;  // Ex: "Db 10.000,00"
}

/**
 * Interface que representa os dados do formulário para criação/edição.
 */
export interface EmployeeFormData {
  id?: string | number;
  nome: string;
  bi: string;
  contribuinte: string;
  email?: string;
  contactoprincipal: string;
  contactosecudario?: string;
  dataNascimento: string;
  dataAdmissao: string;
  sexo: string;
  imagem?: File | string | null;
  
  // Objetos para os componentes de Select/Combobox
  loja: { id: string | number; nome: string } | null;
  localidade: { id: string | number; nome: string } | null;
  funcao: { 
    id: string | number; 
    nomecargo: string; 
    accessLevel: string 
  } | null;
  
  username?: string;
  password?: string;
}

// ====================================================
// HOOK CUSTOMIZADO: useEmployeeService
// ====================================================

export const useEmployeeService = () => {

  // As funções abaixo usam useCallback para garantir que a referência não mude
  // entre renders. Isso é importante para componentes que usam essas funções
  // em useEffect, evitando loops infinitos de carregamento.
  /**
   * Lista todos os funcionários.
   */
  const listar = useCallback(async (): Promise<Employee[]> => {
    try {
      const res = await api.get('/employee/list');
      return res.data;
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      showErrorToast('Erro ao carregar funcionários.');
      throw error;
    }
  }, []);

  /**
   * Obtém detalhes de um funcionário pelo ID.
   * Corrigido: Retorna Promise<Employee> e usa template string correta.
   */
  const listarId = useCallback(async (id: string): Promise<Employee> => {
    try {
      const res = await api.get(`/employee/listid/${id}`);
      return res.data;
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      showErrorToast('Erro ao carregar detalhes do funcionário.');
      throw error;
    }
  }, []);

  /**
   * Mapeia os dados do formulário para o formato esperado pelo Backend (DTO).
   * Resolve as inconsistências de nomes de campos (bi -> numeroBi, etc).
   */
  const mapToDTO = (data: EmployeeFormData) => {
  // Verifica se o nível de acesso é admin para tratar a loja
  const isAdmin = data.funcao?.accessLevel === 'ROLE_ADMIN';

  return {
    id: data.id,
    nome: data.nome,
    numeroBi: data.bi,
    numeroContribuinte: data.contribuinte,
    email: data.email || null,
    contactoPrincipal: data.contactoprincipal,
    contactoSecudario: data.contactosecudario || null,
    gender: data.sexo,
    dataNascimento: data.dataNascimento,
    dataAdmissao: data.dataAdmissao,
    username: data.username || null,
    senha: data.password || null,
    
    // ✅ REGRA DE OURO: Se for Admin, a loja vai como NULL (Global)
    shop: isAdmin ? null : (data.loja?.id || null), 
    
    location: data.localidade?.id || null,
    role: data.funcao?.id || null
  };
};

  /**
   * Cria um novo funcionário com suporte a upload de imagem.
   */
  const criar = useCallback(async (data: EmployeeFormData): Promise<Employee> => {
    try {
      const formData = new FormData();
      
      // Adiciona o ficheiro de imagem se existir
      if (data.imagem instanceof File) {
        formData.append('file', data.imagem);
      }

      // Converte o DTO para Blob JSON para o multipart/form-data
      const dto = mapToDTO(data);
      formData.append(
        'employeeDTO',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      );

   
const res = await api.post('/employee/create', formData, {
    headers: {
        "Content-Type": "multipart/form-data"
    }
});
      return res.data;
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      showErrorToast('Erro ao criar funcionário.');
      throw error;
    }
  }, []);

  /**
   * Atualiza um funcionário existente.
   */
  const editar = useCallback(async (data: EmployeeFormData): Promise<Employee> => {
    try {
      const dto = mapToDTO(data);

      const res = await api.put('/employee/update', dto, {
        headers: { 'Content-Type': 'application/json' }
      });

      return res.data;
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      showErrorToast('Erro ao atualizar funcionário.');
      throw error;
    }
  }, []);

  /**
   * Remove um funcionário pelo ID.
   */
  const deletar = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete('/employee/delete', { params: { id } });
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      showErrorToast('Erro ao remover funcionário.');
      throw error;
    }
  }, []);

  /**
   * Atualiza apenas a foto do funcionário.
   * Usa multipart/form-data para enviar o ficheiro em RequestPart.
   */
  const alterarFoto = useCallback(async (id: string | number, foto: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', foto);
      formData.append('id', String(id));

      await api.post('/employee/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Erro no servidor ao atualizar foto do funcionário:', error.response.data);
      }
      showErrorToast('Erro ao atualizar a foto do funcionário.');
      throw error;
    }
  }, []);

  // Funções auxiliares para carregar dados dos selects
  const listarLocalidades = useCallback(async () => {
    const res = await api.get('/location/list');
    return res.data;
  }, []);

  const listarLojas = useCallback(async () => {
    const res = await api.get('/shop/list');
    return res.data;
  }, []);

  const listarFuncoes = useCallback(async () => {
    const res = await api.get('/role/list');
    return res.data;
  }, []);

  return {
    listar,
    listarId,
    criar,
    editar,
    deletar,
    listarLocalidades,
    listarLojas,
    listarFuncoes,
    alterarFoto
  };
};
