/**
 * ====================================================
 * SISTEMA DE NOTIFICAÇÕES TOAST
 * ====================================================
 * 
 * Centraliza todas as notificações do sistema:
 * - Mensagens de sucesso
 * - Mensagens de erro
 * - Mensagens informativas
 * - Configurações padronizadas
 */

import { toast } from 'sonner';

// ====================================================
// CONFIGURAÇÕES PADRÃO
// ====================================================

const DEFAULT_DURATION = 4000; // 4 segundos

// ====================================================
// FUNÇÕES DE NOTIFICAÇÃO
// ====================================================

/**
 * Exibe uma notificação de erro
 * Usada para falhas em operações, erros de validação, etc.
 */
export const showErrorToast = (message: string, duration: number = DEFAULT_DURATION) => {
  toast.error(message, {
    duration,
    position: "top-right",
  });
};

/**
 * Exibe uma notificação de sucesso
 * Usada para operações concluídas com êxito
 */
export const showSuccessToast = (message: string, duration: number = DEFAULT_DURATION) => {
  toast.success(message, {
    duration,
    position: "top-right",
  });
};

/**
 * Exibe uma notificação informativa
 * Usada para informações gerais ao usuário
 */
export const showInfoToast = (message: string, duration: number = DEFAULT_DURATION) => {
  toast.info(message, {
    duration,
    position: "top-right",
  });
};

/**
 * Exibe uma notificação de aviso
 * Usada para alertas e avisos importantes
 */
export const showWarningToast = (message: string, duration: number = DEFAULT_DURATION) => {
  toast.warning(message, {
    duration,
    position: "top-right",
  });
};

/**
 * Exibe uma notificação padrão
 * Usada para mensagens neutras
 */
export const showDefaultToast = (message: string, duration: number = DEFAULT_DURATION) => {
  toast(message, {
    duration,
    position: "top-right",
  });
};

/**
 * Exibe uma notificação de loading/promise
 * Usada para operações assíncronas
 */
export const showLoadingToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    position: "top-right",
  });
};