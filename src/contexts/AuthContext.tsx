/**
 * ====================================================
 * AUTH CONTEXT - PROVEDOR DE AUTENTICAÇÃO
 * ====================================================
 */

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import api from "@/config/api";
import { User, AuthContextType } from "@/types/auth";

/**
 * Contexto de autenticação.
 *
 * O contexto é exportado porque o hook useAuth,
 * que está num ficheiro separado, precisa de o consumir.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * AuthProvider:
 * Componente responsável por manter o estado global
 * da autenticação do utilizador.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /**
   * Utilizador actualmente autenticado.
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * Indica se existe uma sessão autenticada.
   */
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Indica se a recuperação da sessão ainda está a decorrer.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * ====================================================
   * LOGOUT
   * ====================================================
   *
   * Encerra a sessão no Backend e limpa os dados locais.
   */
  const logout = useCallback(async () => {
    try {
      /**
       * Informa o Backend de que a sessão terminou.
       */
      await api.post("/employee/logout");
    } catch (error: unknown) {
      /**
       * Mesmo que o servidor falhe,
       * a sessão local será limpa.
       */
      console.warn(
        "Servidor não respondeu ao logout, limpando localmente.",
        error
      );
    } finally {
      /**
       * Remove o utilizador do estado React.
       */
      setUser(null);

      /**
       * Marca a sessão como encerrada.
       */
      setIsAuthenticated(false);

      /**
       * Limpa os dados persistidos no navegador.
       */
      localStorage.clear();

      /**
       * Redirecciona para a página de login.
       */
      window.location.href = "/login";
    }
  }, []);

  /**
   * ====================================================
   * AUTH EXPIRED
   * ====================================================
   *
   * O api.ts dispara este evento quando o Refresh Token
   * não consegue renovar a sessão.
   */
  useEffect(() => {
    /**
     * Handler executado quando a sessão expira.
     */
    const handleAuthError = () => {
      void logout();
    };

    /**
     * Regista o listener global.
     */
    window.addEventListener("auth-expired", handleAuthError);

    /**
     * Remove o listener quando o componente desmonta.
     */
    return () => {
      window.removeEventListener("auth-expired", handleAuthError);
    };
  }, [logout]);

  /**
   * ====================================================
   * RECUPERAÇÃO DA SESSÃO
   * ====================================================
   *
   * Tenta restaurar a sessão guardada no localStorage
   * quando a aplicação é iniciada ou actualizada.
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        /**
         * Recupera o utilizador guardado.
         */
        const storedUser = localStorage.getItem("userData");

        /**
         * Recupera o Access Token.
         */
        const token = localStorage.getItem("token");

        /**
         * Só restaura a sessão se existirem ambos.
         */
        if (storedUser && token) {
          /**
           * Converte o JSON para o objecto User.
           */
          const parsedUser: User = JSON.parse(storedUser);

          /**
           * Restaura o utilizador no estado React.
           */
          setUser(parsedUser);

          /**
           * Marca a sessão como autenticada.
           */
          setIsAuthenticated(true);
        }
      } catch (error: unknown) {
        /**
         * Se os dados guardados estiverem inválidos,
         * encerra a sessão.
         */
        console.error("Erro ao recuperar a sessão:", error);
        void logout();
      } finally {
        /**
         * Termina o estado de carregamento.
         */
        setLoading(false);
      }
    };

    /**
     * Executa a recuperação.
     */
    initAuth();
  }, [logout]);

  /**
   * ====================================================
   * LOGIN
   * ====================================================
   *
   * Guarda o utilizador devolvido pelo Backend
   * e persiste os dados necessários para um F5.
   */
  const login = useCallback((userInfo: User) => {
    /**
     * Guarda o utilizador em memória.
     */
    setUser(userInfo);

    /**
     * Marca como autenticado.
     */
    setIsAuthenticated(true);

    /**
     * Guarda o Access Token.
     */
    localStorage.setItem("token", userInfo.accessToken);

    /**
     * Guarda o ID da loja actual.
     */
    localStorage.setItem("idl", userInfo.idl);

    /**
     * Guarda o nível de acesso.
     */
    localStorage.setItem("NivelAcesso", userInfo.NivelAcesso);

    /**
     * Guarda todos os dados do utilizador.
     */
    localStorage.setItem("userData", JSON.stringify(userInfo));
  }, []);

  /**
   * ====================================================
   * ALTERAR LOJA
   * ====================================================
   *
   * Permite trocar a loja activa mantendo o mesmo utilizador.
   */
  const switchStore = useCallback(
    (
      newStoreId: string,
      newStoreName: string,
      storeLogo?: string
    ) => {
      /**
       * Só podemos alterar a loja se existir utilizador.
       */
      if (!user) {
        return;
      }

      /**
       * Cria uma nova versão do utilizador
       * com a loja seleccionada.
       */
      const updatedUser: User = {
        ...user,
        idl: newStoreId,
        loja: newStoreName,
        logo: storeLogo || user.logo,
      };

      /**
       * Actualiza o estado React.
       */
      setUser(updatedUser);

      /**
       * Actualiza a loja persistida.
       */
      localStorage.setItem("idl", newStoreId);

      /**
       * Actualiza os dados persistidos do utilizador.
       */
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    },
    [user]
  );

  /**
   * ====================================================
   * PERMISSÕES
   * ====================================================
   *
   * Calculadas a partir do NivelAcesso do utilizador.
   */
  const isAdmin = user?.NivelAcesso === "ROLE_ADMIN";

  const isManager = user?.NivelAcesso === "ROLE_MANAGER";

  const isOperator = user?.NivelAcesso === "ROLE_USER";

  /**
   * ====================================================
   * VALOR DO CONTEXTO
   * ====================================================
   */
  const contextValue: AuthContextType = {
    /**
     * Estado da autenticação.
     */
    isAuthenticated,

    /**
     * Utilizador autenticado.
     */
    user,

    /**
     * Estado de carregamento.
     */
    loading,

    /**
     * Função de login.
     */
    login,

    /**
     * Função de logout.
     */
    logout,

    /**
     * Função para alterar a loja.
     */
    switchStore,

    /**
     * Permissão de administrador.
     */
    isAdmin,

    /**
     * Permissão de gerente.
     */
    isManager,

    /**
     * Permissão de operador.
     */
    isOperator,
  };

  /**
   * ====================================================
   * RENDER
   * ====================================================
   */
  return (
    <AuthContext.Provider value={contextValue}>
      {
        /**
         * Só renderiza a aplicação depois
         * de terminar a recuperação da sessão.
         */
        !loading && children
      }
    </AuthContext.Provider>
  );
};