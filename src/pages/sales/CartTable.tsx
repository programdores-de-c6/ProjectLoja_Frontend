/**
 * ====================================================
 * CART TABLE - TABELA DE ITENS DO CARRINHO (PROTEGIDA)
 * ====================================================
 */

import React, { useCallback } from 'react'; // Importação do React e Hooks
import { Minus, Plus, Trash2 } from 'lucide-react'; // Ícones para botões
import { Button } from '@/components/ui/button'; // Componente de botão Shadcn
import { Input } from '@/components/ui/input'; // Componente de input Shadcn
import { Card } from '@/components/ui/card'; // Componente de Card
import { ScrollArea } from '@/components/ui/scroll-area'; // Componente de scroll

// Interface para definir os dados do produto no carrinho (Strict Typing)
interface CartItem {
  productId: string; // ID único do produto
  productName: string; // Nome do produto
  unitPrice: number; // Preço por unidade
  quantity: number; // Quantidade atual
  taxRate: number; // Taxa de imposto
  stock: number; // Stock físico disponível
  controlaStock: boolean; // Flag de exceção (Serviço ou Produto)
}

// Interface para as propriedades que o componente recebe
interface CartTableProps {
  items: CartItem[]; // Lista de produtos no carrinho
  onQuantityChange: (productId: string, quantity: number) => void; // Função para alterar qtd
  onRemoveItem: (productId: string) => void; // Função para remover item
  isLoading?: boolean; // Estado de carregamento
}

const CartTable: React.FC<CartTableProps> = ({
  items,
  onQuantityChange,
  onRemoveItem,
  isLoading = false,
}) => {

  // Função para aumentar a quantidade em +1 via botão externo
  const handleIncrement = useCallback(
    (item: CartItem) => {
      // Regra: aumenta se for livre ou se a quantidade atual for menor que o stock
      if (!item.controlaStock || item.quantity < item.stock) {
        onQuantityChange(item.productId, item.quantity + 1);
      }
    },
    [onQuantityChange]
  );

  // Função para diminuir a quantidade em -1 via botão externo
  const handleDecrement = useCallback(
    (item: CartItem) => {
      if (item.quantity === 1) {
        onRemoveItem(item.productId); // Se chegar a 1, remove o item da lista
      } else {
        onQuantityChange(item.productId, item.quantity - 1);
      }
    },
    [onQuantityChange, onRemoveItem]
  );

  // Função para processar a digitação direta no teclado
  const handleDirectQuantityChange = useCallback(
    (productId: string, value: string, stock: number, controlaStock: boolean) => {
      const newQuantity = parseInt(value, 10); // Converte texto para número
      if (isNaN(newQuantity) || newQuantity < 1) return; // Valida se é positivo

      // Se controla stock, trava no limite do armazém. Senão, aceita até 999.
      const limite = controlaStock ? stock : 999;
      const validQuantity = Math.min(newQuantity, limite);
      
      onQuantityChange(productId, validQuantity);
    },
    [onQuantityChange]
  );

  // Exibe aviso se o carrinho não tiver produtos
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50">
        <p className="text-slate-400 font-bold uppercase text-[10px]">Carrinho Vazio</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <ScrollArea className="h-[450px]">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-20 border-b">
            <tr className="text-[10px] uppercase text-slate-500 font-black">
              <th className="px-4 py-3 text-left">Descrição do Artigo</th>
              <th className="px-4 py-3 text-right">Preço</th>
              <th className="px-4 py-3 text-center">Quantidades</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {items.map((item) => {
              // ✅ PROTEÇÃO: Garante que o preço unitário nunca seja null para o cálculo
              const safePrice = item.unitPrice ?? 0;
              const itemSubtotal = safePrice * item.quantity; 
              const isPlusDisabled = item.controlaStock && item.quantity >= item.stock; 

              return (
                <tr key={item.productId} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-xs text-slate-800 uppercase leading-none mb-1">
                      {item.productName}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">IVA: {(item.taxRate * 100).toFixed(0)}%</div>
                  </td>

                  <td className="px-4 py-3 text-right text-xs text-slate-600 font-medium">
                    {/* ✅ PROTEÇÃO: Formata o preço com segurança */}
                    {safePrice.toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrement(item)}
                        disabled={isLoading}
                        className="h-7 w-7 border-slate-200"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleDirectQuantityChange(
                            item.productId,
                            e.target.value,
                            item.stock,
                            item.controlaStock
                          )
                        }
                        disabled={isLoading}
                        className="h-7 w-20 text-center text-xs font-black border-slate-200 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrement(item)}
                        disabled={isLoading || isPlusDisabled}
                        className="h-7 w-7 border-slate-200"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-xs font-black text-slate-900">
                    {/* ✅ PROTEÇÃO: Subtotal agora é seguro */}
                    {itemSubtotal.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-slate-300 hover:text-red-500 rounded-full"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </Card>
  );
};

export default CartTable;