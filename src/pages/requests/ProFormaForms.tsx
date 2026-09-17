/**
 * ====================================================
 * PRO FORMA / REQUISIÇÃO FORM - FORMULÁRIO DE PROPOSTA
 * ====================================================
 *
 * Reutiliza a lógica visual do módulo Sales:
 * - pesquisa de produtos;
 * - carrinho;
 * - selecção de cliente;
 * - totais.
 *
 * Não contém funcionalidades próprias do PDV:
 * - caixa;
 * - pagamento;
 * - valor recebido;
 * - troco;
 * - finalização de venda.
 */

import React from 'react';

import {
  FileText,
  ShoppingCart,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Card } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';

import ProductSearch from '../sales/ProductSearch';

import CartTable from '../sales/CartTable';

import { ProductDisplay } from '../sales/SalesPage';

import { SaleLogicReturn } from '../sales/useSaleLogic';

import { User } from '@/types/auth';

import {
  ProFormaPrintFormat,
} from '@/utils/proFormaReceiptPdf';

import type {
  ReportShop,
} from '@/utils/reportShopTypes';

// ====================================================
// PROPS
// ====================================================

interface ProFormaFormProps {
  sale: SaleLogicReturn;

  user: User | null;

  shop?: ReportShop;

  formattedProducts: ProductDisplay[];

  onAddProduct: (
    product: ProductDisplay
  ) => void;

  onSaveProForma: () => void;

  isProcessing: boolean;

  productsLoading: boolean;

  searchInputRef:
    React.RefObject<HTMLInputElement>;

  printFormat: ProFormaPrintFormat;

  setPrintFormat:
    React.Dispatch<
      React.SetStateAction<ProFormaPrintFormat>
    >;

  onOpenCustomerModal: () => void;

  onClose: () => void;
}

// ====================================================
// COMPONENTE
// ====================================================

const ProFormaForm: React.FC<
  ProFormaFormProps
> = ({
  sale,
  user,
  shop,
  formattedProducts,
  onAddProduct,
  onSaveProForma,
  isProcessing,
  productsLoading,
  searchInputRef,
  printFormat,
  setPrintFormat,
  onOpenCustomerModal,
  onClose,
}) => {

  const currentShop =
    shop?.nome ||
    user?.loja ||
    'Visão Global';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0 bg-[#f8fafc] overflow-hidden font-sans border-t">

      {/* ====================================================
          CABEÇALHO
      ==================================================== */}

      <header className="bg-white border-b px-6 py-2 flex justify-between items-center shrink-0 shadow-sm z-10">

        <div className="flex items-center gap-3">

          <div className="bg-blue-600 p-1.5 rounded-md text-white">
            <FileText size={20} />
          </div>

          <h1 className="text-lg font-bold text-slate-800 uppercase italic">
            Nova Requisição
          </h1>

          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Modo de Requisição
          </Badge>

        </div>

        <div className="flex items-center gap-4">

          <div className="text-right leading-tight border-r pr-4">

            <p className="text-[11px] font-bold text-slate-600 uppercase">
              {user?.nome}
            </p>

            <p className="text-[10px] text-blue-600 font-bold uppercase">
              {currentShop}
            </p>

          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={
              onClose
            }
            className="h-8 w-8 text-slate-400 hover:text-red-500"
          >
            <X size={20} />
          </Button>

        </div>

      </header>

      {/* ====================================================
          ÁREA PRINCIPAL
      ==================================================== */}

      <main className="flex-1 min-h-0 overflow-hidden p-3 grid grid-cols-12 gap-3">

        {/* ====================================================
            ESQUERDA
        ==================================================== */}

        <div className="col-span-8 flex flex-col gap-3 h-full min-h-0 overflow-hidden">

          <Card className="p-2 shrink-0 border-slate-200 shadow-sm">

            <ProductSearch
              ref={searchInputRef}
              products={
                formattedProducts
              }
              onProductSelected={
                onAddProduct
              }
              isLoading={
                productsLoading
              }
            />

          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden bg-white shadow-sm border-slate-200">

            <div className="px-4 py-2 border-b bg-slate-50 flex justify-between items-center shrink-0">

              <span className="text-[10px] font-bold uppercase text-slate-500">
                Produtos da Requisição
              </span>

              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700"
              >
                {sale.items.length}{' '}
                ARTIGOS
              </Badge>

            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">

              {sale.items.length >
              0 ? (

                <CartTable
                  items={
                    sale.items
                  }
                  onQuantityChange={
                    sale.updateQty
                  }
                  onRemoveItem={
                    sale.removeItem
                  }
                />

              ) : (

                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20">

                  <ShoppingCart
                    size={80}
                  />

                  <p className="font-bold uppercase text-lg italic">
                    Requisição Vazia
                  </p>

                </div>

              )}

            </div>

          </Card>

        </div>

        {/* ====================================================
            DIREITA
        ==================================================== */}

        <aside className="col-span-4 flex flex-col gap-3 h-full min-h-0 overflow-y-auto pr-1 custom-scrollbar pb-2">

          {/* CLIENTE */}

          <Card className="shrink-0 shadow-sm border-slate-200 overflow-hidden">

            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
              Cliente / Entidade
            </div>

            <div className="p-3">

              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  {sale.cliente ? (

                    <>
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {
                          sale.cliente.nome
                        }
                      </p>

                      <p className="text-[10px] text-slate-400 uppercase">
                        {
                          sale.cliente
                            .numeroContribuinte ||
                          'NIF não informado'
                        }
                      </p>
                    </>

                  ) : sale.nomeInformal ? (

                    <>
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {
                          sale.nomeInformal
                        }
                      </p>

                      <p className="text-[10px] text-slate-400 uppercase">
                        Cliente informal
                      </p>
                    </>

                  ) : (

                    <p className="text-xs text-slate-400">
                      Nenhum cliente seleccionado
                    </p>

                  )}

                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    onOpenCustomerModal
                  }
                  className="shrink-0 text-[10px] font-bold uppercase"
                >
                  Pesquisar
                </Button>

              </div>

            </div>

          </Card>

          {/* CLIENTE INFORMAL */}

          <Card className="shrink-0 shadow-sm border-slate-200 overflow-hidden">

            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Cliente informal
            </div>

            <div className="p-3">

              <Input
                value={
                  sale.nomeInformal
                }
                onChange={(
                  event
                ) =>
                  sale.setNomeInformal(
                    event.target.value
                  )
                }
                placeholder="Digite o nome..."
                className="h-9 text-sm"
              />

            </div>

          </Card>

          {/* FORMATO */}

          <Card className="shrink-0 shadow-sm border-slate-200 overflow-hidden">

            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
              Formato de impressão
            </div>

            <div className="p-3 grid grid-cols-2 gap-2">

              {(
                ['A4', 'A5'] as ProFormaPrintFormat[]
              ).map(
                (
                  format
                ) => (

                  <Button
                    key={
                      format
                    }
                    type="button"
                    variant={
                      printFormat ===
                      format
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setPrintFormat(
                        format
                      )
                    }
                    className="h-9 text-xs font-bold"
                  >
                    {format}
                  </Button>

                )
              )}

            </div>

          </Card>

          {/* RESUMO */}

          <Card className="shrink-0 shadow-md border-slate-200 flex flex-col bg-white overflow-hidden">

            <div className="px-3 py-1 bg-slate-50 border-b text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
              Totais da Requisição
            </div>

            <div className="p-4 space-y-4">

              <div className="flex items-center justify-around py-2 border-b border-slate-100 text-center">

                <div className="flex-1">

                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                    Subtotal
                  </p>

                  <p className="text-sm font-bold text-slate-700">
                    {sale.subtotal.toFixed(
                      2
                    )}
                  </p>

                </div>

                <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                <div className="flex-1">

                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                    Impostos
                  </p>

                  <p className="text-sm font-bold text-blue-600">
                    {sale.totalTax.toFixed(
                      2
                    )}
                  </p>

                </div>

              </div>

              {/* DESCONTO */}

              <div className="space-y-1 px-1">

                <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">

                  Desconto

                  <button
                    type="button"
                    onClick={() =>
                      sale.setDiscountType(
                        sale.discountType ===
                        'PERCENTAGE'
                          ? 'FIXED'
                          : 'PERCENTAGE'
                      )
                    }
                    className="text-blue-600 font-bold hover:underline"
                  >
                    (
                    {sale.discountType ===
                    'PERCENTAGE'
                      ? '%'
                      : 'Db'}
                    )
                  </button>

                </label>

                <Input
                  type="number"
                  value={
                    sale.discount ||
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    sale.setDiscount(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="h-9 text-sm font-bold"
                  placeholder="0.00"
                />

              </div>

              {/* TOTAL */}

              <div className="bg-slate-900 p-5 rounded-xl shadow-xl flex justify-between items-center text-white relative overflow-hidden mt-4">

                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                  <FileText size={80} />
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase z-10">
                  Valor Total
                </span>

                <div className="z-10 text-right leading-none">

                  <span className="text-4xl font-black text-blue-400 tracking-tighter">
                    {sale.total.toFixed(
                      2
                    )}
                  </span>

                  <span className="text-[10px] font-bold text-blue-500 ml-1 uppercase">
                    Db
                  </span>

                </div>

              </div>

              {/* GUARDAR */}

              <div className="pt-2">

                <Button
                  onClick={
                    onSaveProForma
                  }
                  disabled={
                    sale.items.length ===
                      0 ||
                    isProcessing
                  }
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase shadow-lg flex flex-col gap-1 rounded-xl"
                >

                  <span className="text-lg">
                    Criar Requisição
                  </span>

                  <span className="text-[9px] font-normal opacity-70 tracking-widest">
                    Guardar no arquivo
                  </span>

                </Button>

                <button
                  type="button"
                  onClick={
                    sale.clearSale
                  }
                  className="w-full mt-3 text-[9px] text-slate-400 hover:text-red-500 font-bold uppercase transition-colors"
                >
                  Limpar Requisição
                </button>

              </div>

            </div>

          </Card>

        </aside>

      </main>

    </div>
  );
};

export default ProFormaForm;