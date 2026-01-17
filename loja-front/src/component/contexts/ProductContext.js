import React, { createContext, useContext, useState } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Atualiza a lista de produtos carregada pelo service
  const setProductList = (list) => setProducts(list);

  // Atualiza estoque local após venda
  const updateStock = (id, qtySold) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, stock: p.stock - qtySold >= 0 ? p.stock - qtySold : 0 }
          : p
      )
    );
  };

  return (
    <ProductContext.Provider value={{ products, loading, setProductList, updateStock }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
