/**
 * ====================================================
 * AUTH TYPES - DEFINIÇÕES DE IDENTIDADE DO SISTEMA
 * ====================================================
 */

// Interface que representa o utilizador logado no sistema
export interface User {
  id: string;          // ID único do funcionário
  nome: string;        // Nome completo para exibição
  loja: string;        // Nome da unidade (Gráfica ou Loja)
  idl: string;         // ID da unidade (1 ou 2) para o cabeçalho X-Store-ID
  NivelAcesso: string; // ROLE_ADMIN, ROLE_MANAGER ou ROLE_USER
  accessToken: string; // Token JWT de acesso
  email: string;       // Email/Username do utilizador
  logo?: string;       // URL do logotipo da unidade selecionada
}

// Interface que define os métodos e estados disponíveis no Contexto
export interface AuthContextType {
  isAuthenticated: boolean;                                             // Estado de login
  user: User | null;                                                    // Dados do utilizador atual
  loading: boolean;                                                     // Estado de carregamento inicial
  login: (userInfo: User) => void;                                      // Função para entrar
  logout: () => Promise<void>;                                          // Função para sair (Back + Front)
  switchStore: (newId: string, newName: string, storeLogo?: string) => void; // Troca de loja para o Dono
  isAdmin: boolean;                                                     // Se o utilizador tem acesso administrativo global
  isManager: boolean;                                                   // Se o utilizador é gestor de loja
  isOperator: boolean;                                                  // Se o utilizador é operador/vendedor
}