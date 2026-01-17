// useSaleLogic.js
import { useState, useMemo } from "react";

export const useSaleLogic = () => {
  // ===============================
  // ESTADO PRINCIPAL DA VENDA
  // ===============================
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null); // null = sem cliente
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("DINHEIRO");
  const [received, setReceived] = useState(0);
  const [status, setStatus] = useState("OPEN"); 
  // OPEN | SAVED | FINISHED

  // ===============================
  // PRODUTOS
  // ===============================
  const addProduct = (product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);

      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ===============================
  // CÁLCULOS
  // ===============================
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const total = useMemo(
    () => Math.max(subtotal - discount, 0),
    [subtotal, discount]
  );

  const troco = useMemo(
    () => Math.max(received - total, 0),
    [received, total]
  );

  // ===============================
  // AÇÕES DA VENDA
  // ===============================
  const saveSale = () => {
    if (items.length === 0) return;
    setStatus("SAVED");
  };

  const finalizeSale = () => {
    if (items.length === 0) {
      throw new Error("Venda sem produtos");
    }
    setStatus("FINISHED");
  };

  const clearSale = () => {
    setItems([]);
    setCliente(null);
    setDiscount(0);
    setPaymentMethod("DINHEIRO");
    setReceived(0);
    setStatus("OPEN");
  };

  return {
    items,
    cliente,
    setCliente,

    addProduct,
    updateQty,
    removeItem,

    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    received,
    setReceived,

    subtotal,
    total,
    troco,

    status,
    saveSale,
    finalizeSale,
    clearSale,
  };
};
