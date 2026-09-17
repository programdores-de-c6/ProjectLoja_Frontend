/* eslint-disable react-refresh/only-export-components */
/**
 * ====================================================
 * CONTEXTO DE CAIXA - GESTÃO GLOBAL DA SESSÃO
 * ====================================================
 *
 * Regras:
 * - Sem autenticação: não procura caixa.
 * - Admin em VISÃO GLOBAL (idl = "0"): não procura caixa.
 * - Loja seleccionada: procura o caixa aberto do utilizador.
 * - Quando a loja muda, a sessão do caixa é sincronizada novamente.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
  useCallback,
} from "react";

import { useAuth } from "./useAuth";
import {
  useCaixaService,
  type CaixaSession,
} from "@/pages/caixa/CaixaService";

export interface CaixaContextType {
  currentCaixa: CaixaSession | null;
  isCaixaOpen: boolean;
  isLoadingCaixa: boolean;
  refreshCaixa: () => Promise<void>;
  setCaixa: (caixa: CaixaSession | null) => void;
}

const CaixaContextInternal =
  createContext<CaixaContextType | undefined>(
    undefined
  );

export const useCaixa = () => {
  const context =
    useContext(CaixaContextInternal);

  if (context === undefined) {
    throw new Error(
      "useCaixa deve ser usado dentro de um CaixaProvider"
    );
  }

  return context;
};

interface CaixaProviderProps {
  children: ReactNode;
}

export const CaixaProvider: React.FC<
  CaixaProviderProps
> = ({
  children,
}) => {

  const [
    currentCaixa,
    setCurrentCaixa,
  ] = useState<CaixaSession | null>(
    null
  );

  const [
    isLoadingCaixa,
    setIsLoadingCaixa,
  ] = useState(
    true
  );

  /**
   * Indica se a inicialização da sessão de caixa deste
   * ciclo já terminou.
   *
   * É importante para não bloquear os children na visão
   * global do Admin, onde não existe uma loja operacional.
   */
  const [
    hasInitialized,
    setHasInitialized,
  ] = useState(
    false
  );

  /**
   * Guarda a loja para a qual a última consulta
   * de caixa foi efectivamente realizada.
   *
   * null = nenhuma loja operacional verificada.
   */
  const [
    lastIdlChecked,
    setLastIdlChecked,
  ] = useState<string | null>(
    null
  );

  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const {
    getCaixaAbertoForUser,
  } = useCaixaService();


  /**
   * ==================================================
   * REFRESH DA SESSÃO DE CAIXA
   * ==================================================
   */
  const refreshCaixa =
    useCallback(
      async () => {

        /**
         * ADMIN EM VISÃO GLOBAL
         * ----------------------------------------------
         * idl = "0" significa que não existe uma loja
         * operacional seleccionada.
         *
         * NÃO fazemos pedido ao backend para procurar
         * caixa, porque ainda não há contexto de loja.
         */
        if (
          !isAuthenticated
          || !user?.id
          || !user?.idl
          || String(user.idl) === "0"
        ) {

          setCurrentCaixa(
            null
          );

          setLastIdlChecked(
            null
          );

          setIsLoadingCaixa(
            false
          );

          /**
           * Muito importante:
           * marca a inicialização como concluída.
           * Caso contrário o Provider ficaria preso em
           * "Sincronizando Sessão...".
           */
          setHasInitialized(
            true
          );

          return;
        }


        /**
         * Há uma loja operacional válida.
         */
        setIsLoadingCaixa(
          true
        );

        try {

          const caixaRecuperado =
            await getCaixaAbertoForUser(
              String(
                user.id
              )
            );

          setCurrentCaixa(
            caixaRecuperado
          );

          setLastIdlChecked(
            String(
              user.idl
            )
          );

        } catch (
          error
        ) {

          console.error(
            "Erro ao sincronizar sessão de caixa:",
            error
          );

          setCurrentCaixa(
            null
          );

          /**
           * A consulta daquela loja terminou,
           * mesmo tendo falhado.
           */
          setLastIdlChecked(
            String(
              user.idl
            )
          );

        } finally {

          setIsLoadingCaixa(
            false
          );

          setHasInitialized(
            true
          );
        }

      },
      [
        isAuthenticated,
        user?.id,
        user?.idl,
        getCaixaAbertoForUser,
      ]
    );


  /**
   * ==================================================
   * EFEITO PRINCIPAL
   * ==================================================
   */
  useEffect(
    () => {

      if (authLoading) {
        return;
      }


      /**
       * UTILIZADOR NÃO AUTENTICADO
       */
      if (!isAuthenticated) {

        setCurrentCaixa(
          null
        );

        setLastIdlChecked(
          null
        );

        setIsLoadingCaixa(
          false
        );

        setHasInitialized(
          false
        );

        return;
      }


      const idl =
        user?.idl
          ? String(user.idl)
          : null;


      /**
       * ADMIN EM VISÃO GLOBAL / SEM LOJA
       *
       * Não deve bloquear o sistema nem fazer consulta
       * ao caixa.
       */
      if (
        !idl
        || idl === "0"
      ) {

        setCurrentCaixa(
          null
        );

        setLastIdlChecked(
          null
        );

        setIsLoadingCaixa(
          false
        );

        setHasInitialized(
          true
        );

        return;
      }


      /**
       * LOJA OPERACIONAL
       *
       * Só consulta novamente quando:
       * - ainda não verificámos esta loja; ou
       * - o Admin mudou de loja.
       */
      if (
        user?.id
        && idl !== lastIdlChecked
      ) {

        void refreshCaixa();

      }

    },
    [
      authLoading,
      isAuthenticated,
      user?.id,
      user?.idl,
      lastIdlChecked,
      refreshCaixa,
    ]
  );


  /**
   * ==================================================
   * DEFINIÇÃO MANUAL DA CAIXA
   * ==================================================
   *
   * Usado pelos modais de abertura/fecho.
   */
  const setCaixa =
    useCallback(
      (
        caixa: CaixaSession | null
      ) => {

        setCurrentCaixa(
          caixa
        );

        setIsLoadingCaixa(
          false
        );

        setHasInitialized(
          true
        );

        /**
         * Só guardamos a loja como verificada quando
         * existe uma loja operacional.
         */
        if (
          user?.idl
          && String(user.idl) !== "0"
        ) {

          setLastIdlChecked(
            String(
              user.idl
            )
          );

        } else {

          setLastIdlChecked(
            null
          );
        }

      },
      [
        user?.idl,
      ]
    );


  /**
   * ==================================================
   * CONTEXT VALUE
   * ==================================================
   */
  const contextValue: CaixaContextType = {
    currentCaixa,

    isCaixaOpen:
      !!currentCaixa?.id,

    isLoadingCaixa,

    refreshCaixa,

    setCaixa,
  };


  /**
   * ==================================================
   * RENDER
   * ==================================================
   *
   * Durante a autenticação real, aguardamos.
   *
   * Na visão global do Admin, nunca bloqueamos os
   * children por causa de caixa.
   */
  return (
    <CaixaContextInternal.Provider
      value={
        contextValue
      }
    >

      {isLoadingCaixa
        && isAuthenticated
        && !hasInitialized ? (

        <div
          className="
            h-screen
            w-screen
            flex
            flex-col
            items-center
            justify-center
            bg-slate-50
            gap-4
          "
        >

          <div
            className="
              w-12
              h-12
              border-4
              border-blue-600
              border-t-transparent
              rounded-full
              animate-spin
            "
          />

          <p
            className="
              text-xs
              font-black
              text-slate-400
              uppercase
              tracking-widest
              animate-pulse
            "
          >
            Sincronizando Sessão...
          </p>

        </div>

      ) : (

        children

      )}

    </CaixaContextInternal.Provider>
  );
};

