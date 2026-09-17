/**
 * ====================================================
 * CONTEXTO DE PRODUTOS - VERSÃO ESTÁVEL (SEM LOOP)
 * ====================================================
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useProductService, Product } from "@/pages/products/ProductsService";
import { useAuth } from "@/contexts/useAuth";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  updateStock: (productId: string | number, qtySold: number) => void;
  getProductById: (id: string | number) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts deve ser usado dentro de um ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. IMPORTANTE: Pegamos apenas o que precisamos da Auth
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  
  // 2. IMPORTANTE: O Service deve ser instanciado aqui, mas não deve ser
  // uma dependência direta do useCallback se ele não for memorizado no arquivo dele.
  const { listar } = useProductService();

  /**
   * fetchProducts: Função para carregar os dados.
   * ✅ CORREÇÃO DO LOOP: Removido o objeto 'productService' das dependências.
   * Usamos apenas a função 'listar'.
   */
  const fetchProducts = useCallback(async () => {
    // 🛡️ BLOQUEIO: Não faz requisição se não estiver logado.
    // Isso resolve o problema de requisições "fantasmagóricas" antes do login.
    if (!isAuthenticated) {
        setProducts([]);
        return;
    }

    setLoading(true);
    try {
      const data = await listar();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
    // A dependência agora é estável (isAuthenticated)
  }, [isAuthenticated]);

  /**
   * EFEITO DE INICIALIZAÇÃO:
   * ✅ CORREÇÃO DO LOOP: Este efeito agora só dispara quando o estado do LOGIN muda.
   */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProducts();
    }
  }, [authLoading, isAuthenticated, user?.idl, fetchProducts]); // 🚀 fetchProducts removido daqui para quebrar o loop

  /**
   * updateStock: Atualiza a interface em tempo real após a venda.
   */
  const updateStock = useCallback((productId: string | number, qtySold: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (Number(product.id) === Number(productId)) {
          // Se o produto NÃO controla stock (ex: Serviço), não subtraímos nada.
          if (product.controlaStock === false) return product;

          return {
            ...product,
            stock: Math.max(0, product.stock - qtySold),
          };
        }
        return product;
      })
    );
  }, []);

  const getProductById = useCallback((id: string | number): Product | undefined => {
    return products.find((p) => Number(p.id) === Number(id));
  }, [products]);

  const getProductByBarcode = useCallback((barcode: string): Product | undefined => {
    return products.find((p) => p.codigobarra === barcode);
  }, [products]);

  // Memoriza o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({
    products,
    loading,
    updateStock,
    getProductById,
    getProductByBarcode,
    refreshProducts: fetchProducts,
  }), [products, loading, updateStock, getProductById, getProductByBarcode, fetchProducts]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};