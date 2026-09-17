/**
 * ====================================================
 * CAIXA SERVICE - SINCRONIZADO COM BACKEND JAVA (Box)
 * ====================================================
 */

import api from "@/config/api";
import axios from "axios"; 
import { showErrorToast } from "@/utils/toast";

// 1. Interface fiel à entidade 'Box' do Java
export interface CaixaSession {
  id: number;
  valorInicial: number;
  valorFinal?: number;
   statusCaixa: string; 
  valorDia: number;
  dataAbertura: string;
  dataFecho?: string;
 nomeOperadorAbertura: string;
  nomeOperadorFecho: string;
  shopNome: string;
  shopNif: string;
  shopEndereco: string;

  // Mantemos as estruturas antigas caso a sua API de "active-session" ainda as use
  employeeOpened?: { 
    id: number; 
    nome?: string;
    shop?: {
      nome: string;
      numeroContribuite: string;
      nomelocation?: string;
      contacto?: string;
    }
  };
  employeeClosure?: { id: number; nome?: string }; 

}

// 2. Interface para abrir o caixa (Envia para o Controller)
export interface OpenCaixaFormData {
  // Enviamos como objeto para o Spring Boot mapear automaticamente para a Entidade
  employeeOpened: { id: number }; 
  valorInicial: number;
}

// 3. Interface para fechar o caixa
export interface CloseCaixaFormData {
  id: number;
  employeeId:  number ;
  valor: number;
}

export const useCaixaService = () => {

  /**
   * Função para abrir uma nova sessão de caixa.
   * Rota: POST api/sales-system/box/create
   */
  const abrirCaixa = async (data: OpenCaixaFormData): Promise<CaixaSession> => {
    try {
      // Ajustado para a rota 'box/create' que você mostrou no seu BoxController
      const response = await api.post("box/create", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      showErrorToast("Não foi possível abrir o caixa no servidor.");
      throw error;
    }
  };

  /**
   * Função para fechar uma sessão de caixa existente.
   * Rota: POST api/sales-system/box/fechar (ou conforme seu controller)
   */
  const fecharCaixa = async (data: CloseCaixaFormData): Promise<CaixaSession> => {
    try {
      const response = await api.post("box/fechar", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      showErrorToast("Não foi possível encerrar a sessão de caixa.");
      throw error;
    }
  };

  /**
   * Função vital para a PERSISTÊNCIA:
   * Busca se o funcionário já tem um caixa "ABERTO" no banco de dados.
   * Isso permite que ele continue a venda de ontem hoje usando o mesmo ID.
   */
  const getCaixaAbertoForUser = async (utilizador_id: string): Promise<CaixaSession | null> => {
    try {
      // Esta rota deve retornar a Box onde statusCaixa == ABERTO para este user
      const response = await api.get(`box/active-session`, {
        params: { utilizador_id },
      });
      
      // Se o Spring retornar 200 OK com dados, temos uma sessão ativa
      // Se retornar 204 No Content ou null, o caixa está fechado
      return response.data || null;
    } catch (error) {
      // Tratamento de erro seguro: se não encontrar ou der erro de rede, assume-se caixa fechado
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 204)) {
        return null; 
      }
      console.error("Erro ao verificar caixa aberto:", error);
      return null;
    }
  };

    const listarTodos = async (): Promise<CaixaSession[]> => {
    try {
      // Ajuste para a rota correta do seu controlador Java
      const response = await api.get("box/list-all"); 
      return response.data;
    } catch (error) {
      console.error("Erro ao listar todos os caixas:", error);
      return [];
    }
  };

  return { abrirCaixa, fecharCaixa, getCaixaAbertoForUser, listarTodos };
};