/**
 * ====================================================
 * PRODUCT SEARCH - BUSCA INTELIGENTE DE PRODUTOS
 * ====================================================
 * 
 * Componente de pesquisa com sugestões em tempo real.
 * Corrigido para evitar erro de 'null' no preço unitário.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react';
import { Search, Barcode, X, Package, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Interface estrita do Produto para evitar o uso de 'any'
interface Product {
  id: string;
  nome: string;
  codigobarra: string;
  precoUnitario: number;
  stock: number;
  controlaStock: boolean; 
  taxRate: number;
}

interface ProductSearchProps {
  products: Product[];
  onProductSelected: (product: Product) => void;
  isLoading?: boolean;
}

const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  ({ products, onProductSelected, isLoading = false }, ref) => {
    
    // Estados internos para gerir a barra de pesquisa e sugestões
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fecha a lista de sugestões ao clicar fora do componente
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtra os produtos com base no que o utilizador digita (Nome ou Código de Barras)
    const filteredProducts = useMemo(() => {
      if (!searchTerm.trim() || !products) return [];
      const lowerSearchTerm = searchTerm.toLowerCase();
      return products
        .filter((p) => 
          p.nome.toLowerCase().includes(lowerSearchTerm) || 
          p.codigobarra?.toLowerCase().includes(lowerSearchTerm)
        )
        .slice(0, 8); // Limita a 8 sugestões para manter a performance
    }, [searchTerm, products]);

    /**
     * handleSelectProduct: Valida se o produto pode ser vendido antes de selecionar
     */
    const handleSelectProduct = useCallback((product: Product) => {
      // Bloqueia se o produto for físico (controlaStock) e o stock estiver zerado
      const isBlocked = product.controlaStock && product.stock <= 0;
      
      if (isBlocked) return;

      onProductSelected(product);
      setSearchTerm('');
      setShowSuggestions(false);
      setHighlightedIndex(0);
    }, [onProductSelected]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setShowSuggestions(e.target.value.length > 0);
      setHighlightedIndex(0);
    };

    // Navegação por teclado (Setas e Enter)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (filteredProducts.length === 0) return;
      switch (e.key) {
        case 'ArrowUp': 
          e.preventDefault(); 
          setHighlightedIndex((prev) => (prev === 0 ? filteredProducts.length - 1 : prev - 1)); 
          break;
        case 'ArrowDown': 
          e.preventDefault(); 
          setHighlightedIndex((prev) => (prev === filteredProducts.length - 1 ? 0 : prev + 1)); 
          break;
        case 'Enter': 
          e.preventDefault(); 
          handleSelectProduct(filteredProducts[highlightedIndex]); 
          break;
        case 'Escape': 
          e.preventDefault(); 
          setShowSuggestions(false); 
          break;
      }
    };

    const handleClearSearch = () => {
      setSearchTerm('');
      setShowSuggestions(false);
      if (typeof ref === 'object' && ref?.current) {
        ref.current.focus();
      }
    };

    return (
      <div className="relative w-full">
        {/* Barra de Pesquisa Principal */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={ref}
              type="text"
              placeholder="Pesquisar por nome ou código..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              disabled={isLoading}
              className="pl-10 h-11 text-base"
            />
            {searchTerm && (
              <button type="button" onClick={handleClearSearch} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center px-4 bg-slate-100 rounded-md">
            <Barcode className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        {/* Lista Suspensa de Sugestões */}
        {showSuggestions && filteredProducts.length > 0 && (
          <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto z-50 shadow-2xl border-slate-200">
            {filteredProducts.map((product, index) => {
              const isBlocked = product.controlaStock && product.stock <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  disabled={isBlocked}
                  className={`w-full px-4 py-3 text-left border-b last:border-b-0 transition-all flex flex-col gap-1 ${
                    index === highlightedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                  } ${isBlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-slate-800 uppercase">{product.nome}</span>
                    
                    {/* ✅ SOLUÇÃO DO ERRO: Garantimos que o preço não é null antes de formatar */}
                    <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                      {Number(product.precoUnitario ?? 0).toFixed(2)} DBS
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">CÓD: {product.codigobarra}</span>

                    <div className="flex items-center gap-1.5">
                      {product.controlaStock ? (
                        <>
                          <Package size={12} className={product.stock > 0 ? 'text-green-500' : 'text-red-500'} />
                          <span className={product.stock > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            STOCK: {product.stock}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} className="text-blue-500" />
                          <span className="font-black text-blue-600 uppercase">FLUXO LIVRE</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </Card>
        )}
      </div>
    );
  }
);

ProductSearch.displayName = 'ProductSearch';
export default ProductSearch;