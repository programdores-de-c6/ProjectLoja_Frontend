/**
 * ====================================================
 * USE AUTH - HOOK DE AUTENTICAÇÃO
 * ====================================================
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook para aceder ao contexto de autenticação.
 */
export const useAuth = () => {
  /**
   * Obtém o contexto actual.
   */
  const context = useContext(AuthContext);

  /**
   * Garante que o hook está a ser utilizado
   * dentro de um AuthProvider.
   */
  if (context === undefined) {
    throw new Error(
      "useAuth deve ser usado dentro de um AuthProvider"
    );
  }

  /**
   * Devolve os dados e funções de autenticação.
   */
  return context;
};