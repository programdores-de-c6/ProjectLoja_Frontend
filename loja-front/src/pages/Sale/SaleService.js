// ======================================================
// IMPORTAÇÕES
// ======================================================

import api from "../../service/Api";

// ======================================================
// HOOK useSaleService
// Responsável por comunicação com a API de vendas
// ======================================================

export const useSaleService = () => {

  /**
   * Cria uma nova venda
   */
  const createSale = async (payload) => {
    const response = await api.post("/sale/create", payload);
    return response.data;
  };

  return {
    createSale,
  };
};
