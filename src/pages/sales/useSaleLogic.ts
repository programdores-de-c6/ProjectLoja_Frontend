/**
 * ====================================================
 * USE SALE LOGIC - HOOK CUSTOMIZADO PARA LÓGICA DE VENDA
 * ====================================================
 * 
 * Este hook centraliza toda a lógica de gerenciamento do carrinho de compras,
 * cálculos financeiros e estado da venda. Separa a lógica da apresentação.
 * 
 * 
 */

// Importações do React
import { useState, useMemo, useCallback } from 'react';
import { Customer } from '@/pages/Customer/CustomerService'; 
// ====================================================
// INTERFACES E TIPOS
// ====================================================

/**
 * Interface que representa um item no carrinho de compras
 */
export interface CartItem {
  // Identificador único do produto
  productId: string;
  // Nome do produto para exibição
  productName: string;
  // Preço unitário do produto no momento da adição
  unitPrice: number;
  // Quantidade de unidades no carrinho
  quantity: number;
  // Taxa de imposto aplicada ao produto (em decimal, ex: 0.23 para 23%)
  taxRate: number;
  // Quantidade de stock disponível do produto
  stock: number;
  controlaStock: boolean;
}



/**
 * Interface que representa os totais calculados da venda
 */
export interface SaleTotals {
  // Subtotal antes de impostos e descontos
  subtotal: number;
  // Valor total de impostos
  totalTax: number;
  // Valor total da venda (subtotal - desconto + impostos)
  total: number;
  // Troco a devolver ao cliente (recebido - total)
  troco: number;
  //Quanto o desconto valeu em dinheiro
  discountValue: number; 
  totalAntesDoDesconto: number; // Valor total antes da aplicação do desconto

}

/**
 * Interface que representa o estado completo da venda
 */
export interface SaleState {
  // Array de itens no carrinho
  items: CartItem[];
  // Cliente selecionado (null se nenhum)
  cliente: Customer | null;
  // Valor do desconto aplicado (em valor absoluto)
  discount: number;
  // Método de pagamento selecionado
  paymentMethod: string;
  // Valor recebido do cliente
  received: number;
  // Status da venda: OPEN (aberta) | SAVED (salva) | FINISHED (finalizada)
  status: 'OPEN' | 'SAVED' | 'FINISHED';
}
// ✅ ESTA É A INTERFACE QUE VOCÊ PRECISA PARA O SALESFORM
// Ela descreve tudo o que o seu Hook devolve no final.
export interface SaleLogicReturn {
  items: CartItem[];
  cliente: Customer | null;
  nomeInformal: string;
  setNomeInformal: (nome: string) => void;
  setCliente: (customer: Customer | null) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  discountType: 'PERCENTAGE' | 'FIXED';
  setDiscountType: (type: 'PERCENTAGE' | 'FIXED') => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  received: number;
  setReceived: (received: number) => void;
  status: 'OPEN' | 'SAVED' | 'FINISHED';
  subtotal: number;
  totalTax: number;
  total: number;
  troco: number;
 totalAntesDoDesconto: number;
  discountValue: number;
  addProduct: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  saveSale: () => void;
  finalizeSale: () => void;
  clearSale: () => void;
  loadItems: (items: CartItem[]) => void;
}
// ====================================================
// HOOK CUSTOMIZADO: useSaleLogic
// ====================================================

/**
 * Hook que fornece toda a lógica de gerenciamento de vendas.
 * Retorna estado, funções de manipulação e cálculos memoizados.
 */
export const useSaleLogic = (): SaleLogicReturn => {
  // ====================================================
  // ESTADO PRINCIPAL DA VENDA
  // ====================================================

  // Array de itens no carrinho
  const [items, setItems] = useState<CartItem[]>([]);
  // Cliente selecionado para a venda
  const [cliente, setCliente] = useState<Customer | null>(null);
  // Desconto aplicado à venda (em valor absoluto)
  const [discount, setDiscount] = useState<number>(0);
   const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  // Método de pagamento selecionado
  const [paymentMethod, setPaymentMethod] = useState<string>('DINHEIRO');
  // Valor recebido do cliente
  const [received, setReceived] = useState<number>(0);
  // Status da venda
  const [status, setStatus] = useState<'OPEN' | 'SAVED' | 'FINISHED'>('OPEN');
  //  Estado para o nome digitado na hora
  const [nomeInformal, setNomeInformal] = useState<string>('');

  // ====================================================
  // FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
  // ====================================================

  /**
   * Adiciona um produto ao carrinho ou incrementa a quantidade se já existir.
   * Verifica se há stock disponível antes de adicionar.
   */
  const addProduct = useCallback((product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      // Procura se o produto já existe no carrinho
      const exists = prev.find((i) => i.productId === product.productId);

      if (exists) {
        // Se existe, incrementa a quantidade (respeitando o stock)
        const newQuantity = exists.quantity + (product.quantity || 1);
        if (product.controlaStock && newQuantity > product.stock) {
          // Não permite ultrapassar o stock disponível
          console.warn(`Stock insuficiente para ${product.productName}`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: newQuantity }
            : i
        );
      }

      // Se não existe, adiciona como novo item
      if (product.controlaStock && product.stock === 0) {
        // Não permite adicionar se não há stock
        console.warn(`Produto ${product.productName} sem stock disponível`);
        return prev;
      }

      return [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
        },
      ];
    });
  }, []);

  /**
   * Atualiza a quantidade de um item no carrinho.
   * Remove o item se a quantidade for menor ou igual a 0.
   */
  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      // Se quantidade é 0 ou negativa, remove o item
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          // Garante que a quantidade não excede o stock
          const deveLimitarStock = i.controlaStock === true; 
          const finalQuantity  = deveLimitarStock ? Math.min(qty, i.stock) : qty;   // Se controlaStock for true, limita ao stock disponível
         
          return { ...i, quantity: finalQuantity };
        }
        return i;
      })
    );
  }, []);

  /**
   * Remove um item do carrinho pelo ID do produto.
   */
  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  // ====================================================
  // CÁLCULOS FINANCEIROS (MEMOIZADOS)
  // ====================================================

  /**
   * Calcula os totais da venda (subtotal, impostos, total, troco).
   * Memoizado para evitar recálculos desnecessários.
   */
  const totals = useMemo<SaleTotals>(() => {
    // Calcula o subtotal (soma de quantidade * preço)
    let currentSubtotal = 0;
    // Calcula o total de impostos
    let currentTotalTax = 0;

    // Itera sobre cada item do carrinho
    items.forEach((item) => {
      // Calcula o preço base do item (preço unitário * quantidade)
      const itemBasePrice = item.unitPrice * item.quantity;
      // Adiciona ao subtotal
      currentSubtotal += itemBasePrice;
      // Calcula e adiciona os impostos do item
      currentTotalTax += itemBasePrice * item.taxRate;
    });
  // 3. Onde o dado vai: Soma-se o bruto para ter a base do desconto
    const totalAntesDoDesconto = currentSubtotal + currentTotalTax;

     // 4. Aplicação do Desconto Híbrido
    let valorMonetarioDoDesconto = 0;
    if (discountType === 'PERCENTAGE') {
      // Se for %, calcula sobre o valor CHEIO (Subtotal + IVA)
      valorMonetarioDoDesconto = (totalAntesDoDesconto * discount) / 100;
    } else {
      // Se for FIXED, tira o valor direto (ex: 50 dobras)
      valorMonetarioDoDesconto = discount;
    }
 
    // Calcula o total final (subtotal com desconto + impostos)
    const total = Math.max(totalAntesDoDesconto - valorMonetarioDoDesconto, 0);
    // Calcula o troco (valor recebido - total)
    const troco = Math.max(received - total, 0);

    return {
      subtotal: currentSubtotal,
      totalTax: currentTotalTax,
      total,
      troco,
     totalAntesDoDesconto,
      discountValue: valorMonetarioDoDesconto
    };
    }, [items, discount, discountType, received]);

  // ====================================================
  // AÇÕES DE FINALIZAÇÃO DA VENDA
  // ====================================================

  /**
   * Salva a venda (muda o status para SAVED).
   * Verifica se há itens no carrinho.
   */
  const saveSale = useCallback(() => {
    if (items.length === 0) {
      // Não permite salvar venda vazia
      throw new Error('Não é possível salvar uma venda sem produtos');
    }
    setStatus('SAVED');
  }, [items.length]);

  /**
   * Finaliza a venda (muda o status para FINISHED).
   * Verifica se há itens no carrinho.
   */
  const finalizeSale = useCallback(() => {
    if (items.length === 0) {
      // Não permite finalizar venda vazia
      throw new Error('Não é possível finalizar uma venda sem produtos');
    }
    setStatus('FINISHED');
  }, [items.length]);

  /**
   * Limpa a venda (reseta todos os estados para os valores iniciais).
   * Usado após finalizar uma venda para começar uma nova.
   */
  const loadItems = useCallback((loadedItems: CartItem[]) => {
    setItems(loadedItems.filter(item => item.quantity > 0));
    setStatus('OPEN');
  }, []);

  const clearSale = useCallback(() => {
    setItems([]);
    setCliente(null);
    setDiscount(0);
    setPaymentMethod('DINHEIRO');
    setReceived(0);
    setNomeInformal(''); 
    setStatus('OPEN');
  }, []);

  // ====================================================
  // RETORNO DO HOOK
  // ====================================================

  return {
    // Estado do carrinho
    items,
    // Cliente selecionado
    cliente,
    setCliente,
    // Desconto
    discount,
    setDiscount,
    // Método de pagamento
    paymentMethod,
    setPaymentMethod,
    // Valor recebido
    received,
    setReceived,
    // Status da venda
    status,
    // Totais calculados
    ...totals,
    // Funções de manipulação do carrinho
    addProduct,
    updateQty,
    removeItem,
    // Funções de ação
    saveSale,
    finalizeSale,
    clearSale,
    loadItems,
    discountType,     // A SalesPage precisa deste valor para o texto do botão
    setDiscountType,  // A SalesPage precisa desta função para o clique do botão
     nomeInformal,
    setNomeInformal,
    
  };
};
