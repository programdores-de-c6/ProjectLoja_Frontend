import { create } from "zustand";

/**
 * Store global do POS
 * Responsável por:
 * - Sessão do utilizador
 * - Sessão de caixa
 * - Venda atual (carrinho)
 * - Totais e IVA
 */
export const usePosStore = create((set, get) => ({
  // ===============================
  // Sessão do utilizador
  // ===============================
  user: null, // { id, nome, lojaId }
  setUser: (user) => set({ user }),

  // ===============================
  // Sessão de Caixa
  // ===============================
  caixa: null, // { caixaId, status, valorAbertura }
  openCaixa: (caixa) => set({ caixa }),
  closeCaixa: () =>
    set((state) => ({
      caixa: state.caixa
        ? { ...state.caixa, status: "FECHADA" }
        : null,
    })),

  // ===============================
  // Venda atual (Carrinho)
  // ===============================
  items: [], 
  /**
   * item esperado:
   * {
   *   id,
   *   nome,
   *   price,
   *   iva,   // valor de IVA unitário
   *   qty
   * }
   */

  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.id === item.id);

      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }

      return {
        items: [...state.items, { ...item, qty: item.qty || 1 }],
      };
    }),

  updateQty: (id, qty) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.id === id ? { ...i, qty } : i
        )
        .filter((i) => i.qty > 0),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearItems: () => set({ items: [] }),

  // ===============================
  // Cliente
  // ===============================
  cliente: null, // { nome, nif }
  setCliente: (cliente) => set({ cliente }),

  // ===============================
  // Pagamento
  // ===============================
  desconto: 0,
  setDesconto: (desconto) => set({ desconto }),

  metodoPagamento: "DINHEIRO", // DINHEIRO | CARTAO | PIX
  setMetodoPagamento: (metodo) => set({ metodoPagamento: metodo }),

  valorRecebido: 0,
  setValorRecebido: (valor) => set({ valorRecebido: valor }),

  // ===============================
  // Totais calculados
  // ===============================
  getSubtotal: () =>
    get().items.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    ),

  getTotalIva: () =>
    get().items.reduce(
      (sum, i) => sum + (i.iva || 0) * i.qty,
      0
    ),

  getTotal: () =>
    get().getSubtotal() - get().desconto,

  getTroco: () => {
    const total = get().getTotal();
    const recebido = get().valorRecebido;

    if (get().metodoPagamento !== "DINHEIRO") return 0;
    return recebido > total ? recebido - total : 0;
  },
}));
