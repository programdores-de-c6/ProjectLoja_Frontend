import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  FileText,
  Loader2,
  RefreshCw,
  ShoppingCart,
  XCircle,
  Plus,
  ArrowLeft,
  Eye,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { ProductDisplay } from '@/pages/sales/SalesPage';

import {
  ProFormaPrintFormat,
} from '@/utils/proFormaReceiptPdf';

import { useAuth } from '@/contexts/useAuth';

import { useProducts } from '@/contexts/ProductContext';

import {
  useCustomerService,
  Customer,
} from '@/pages/Customer/CustomerService';

import {
  ProFormaResponse,
  useSalesService,
  CreateProFormaFormData,
} from '@/pages/sales/SalesService';

import { useSaleLogic } from '@/pages/sales/useSaleLogic';

import {
  useShopService,
  Shop,
} from '@/pages/shop/ShopService';

import type {
  ReportShop,
} from '@/utils/reportShopTypes';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  showErrorToast,
  showSuccessToast,
} from '@/utils/toast';

import ModalForm from '@/components/forms/ModalForm';

import ProFormaForm from './ProFormaForms';

import CustomerSelectionModal from '@/pages/sales/CustomerSelectionModal';

// ====================================================
// ESTADOS DA REQUISIÇÃO
// ====================================================

const statusLabel: Record<string, string> = {
  ABERTA: 'Aberta',
  CONVERTIDA: 'Convertida',
  CANCELADA: 'Cancelada',
};

// ====================================================
// COMPONENTE
// ====================================================

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  // ====================================================
  // SERVIÇO DE LOJA
  // ====================================================

  const { listarId } = useShopService();

  const [
    reportShop,
    setReportShop,
  ] = useState<Shop | undefined>(undefined);

  // ====================================================
  // DADOS NORMALIZADOS DA LOJA
  // ====================================================

  const reportShopData = useMemo<ReportShop | undefined>(
    () =>
      reportShop
        ? {
            id: reportShop.id,
            nome: reportShop.nome,
            numeroContribuite:
              reportShop.numeroContribuite,
            email: reportShop.email,
            contacto: reportShop.contacto,
            caixaPostal:
              reportShop.caixaPostal,
            nomelocation:
              reportShop.nomelocation,
            logoUrl:
              reportShop.logoUrl,
            logo:
              typeof reportShop.logo === 'string'
                ? reportShop.logo
                : null,
          }
        : undefined,
    [reportShop]
  );

  // ====================================================
  // PRODUTOS
  // ====================================================

  const {
    products: allProducts,
    loading: productsLoading,
  } = useProducts();

  // ====================================================
  // CLIENTES
  // ====================================================

  const {
    listar: listCustomers,
  } = useCustomerService();

  // ====================================================
  // SERVIÇOS DE REQUISIÇÃO
  // ====================================================

  const {
    listarProFormas,
    cancelarProForma,
    criarProForma,
  } = useSalesService();

  // ====================================================
  // CARRINHO
  // ====================================================

  const requestCart = useSaleLogic();

  // ====================================================
  // REFERÊNCIA DA PESQUISA
  // ====================================================

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  // ====================================================
  // ESTADOS DA LISTAGEM
  // ====================================================

  const [
    items,
    setItems,
  ] = useState<ProFormaResponse[]>([]);

  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    processingId,
    setProcessingId,
  ] = useState<number | null>(null);

  const [
    viewingId,
    setViewingId,
  ] = useState<number | null>(null);

  // ====================================================
  // ESTADOS DA CRIAÇÃO
  // ====================================================

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState<boolean>(false);

  const [
    isCustomerModalOpen,
    setIsCustomerModalOpen,
  ] = useState<boolean>(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState<boolean>(false);

  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>([]);

  // ====================================================
  // FORMATO DE IMPRESSÃO
  // ====================================================

  const [
    printFormat,
    setPrintFormat,
  ] = useState<ProFormaPrintFormat>('A4');

  // ====================================================
  // CARREGAR INFORMAÇÃO DA LOJA
  // ====================================================

  useEffect(() => {
    const loadReportShop = async () => {
      if (
        !user?.idl ||
        user.idl === '0'
      ) {
        setReportShop(undefined);
        return;
      }

      try {
        const shop = await listarId(
          String(user.idl)
        );

        setReportShop(shop);
      } catch (error) {
        console.error(
          'Erro ao carregar informação da loja:',
          error
        );

        setReportShop(undefined);
      }
    };

    void loadReportShop();
  }, [user?.idl]);

  // ====================================================
  // CARREGAR REQUISIÇÕES
  // ====================================================

  const loadRequests = useCallback(
    async () => {
      setLoading(true);

      try {
        const data =
          await listarProFormas();

        setItems(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error: unknown) {
        console.error(
          'Erro ao carregar requisições:',
          error
        );

        showErrorToast(
          'Não foi possível carregar as requisições.'
        );
      } finally {
        setLoading(false);
      }
    },
    [listarProFormas]
  );

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // ====================================================
  // CARREGAR CLIENTES
  // ====================================================

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data =
          await listCustomers();

        setCustomers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error: unknown) {
        console.error(
          'Erro ao carregar clientes:',
          error
        );

        showErrorToast(
          'Não foi possível carregar os clientes.'
        );
      }
    };

    void loadCustomers();
  }, []);

  // ====================================================
  // FORMATAR PRODUTOS
  // ====================================================

  const formattedProducts =
    useMemo(() => {
      return allProducts.map(
        (product) => {
          let price = 0;

          if (
            typeof product.precoUnitario ===
            'string'
          ) {
            price =
              parseFloat(
                product.precoUnitario
                  .replace('Db', '')
                  .replace(/\s/g, '')
                  .replace(',', '.')
              ) || 0;
          } else if (
            typeof product.precoUnitario ===
            'number'
          ) {
            price =
              product.precoUnitario;
          }

          return {
            id: String(product.id),

            nome: product.nome,

            codigobarra:
              product.codigobarra,

            precoUnitario: price,

            stock:
              Number(
                product.stock
              ) || 0,

            taxRate:
              product.taxa
                ? Number(
                    product.taxa
                  ) / 100
                : 0,

            controlaStock:
              product.controlaStock,
          };
        }
      );
    }, [
      allProducts,
    ]);

  // ====================================================
  // ABRIR NOVA REQUISIÇÃO
  // ====================================================

  const handleOpenCreate =
    useCallback(() => {
      requestCart.clearSale();

      setPrintFormat('A4');

      setIsCreateModalOpen(true);
    }, [requestCart]);

  // ====================================================
  // VER / REABRIR PRO FORMA
  // ====================================================

  const handleViewProForma =
    useCallback(
      async (
        request: ProFormaResponse
      ) => {
        if (!request) {
          return;
        }

        setViewingId(request.id);

        try {
          const {
            printProFormaPdf,
          } = await import(
            '@/utils/proFormaReceiptPdf'
          );

          printProFormaPdf(
            request,
            'A4',
            reportShopData
          );
        } catch (error: unknown) {
          console.error(
            'Erro ao abrir Pro Forma:',
            error
          );

          showErrorToast(
            'Não foi possível abrir a Pro Forma.'
          );
        } finally {
          setViewingId(null);
        }
      },
      [reportShopData]
    );

  // ====================================================
  // GUARDAR REQUISIÇÃO
  // ====================================================

  const handleSaveRequest =
    useCallback(
      async () => {
        // ------------------------------------------------
        // VALIDAR PRODUTOS
        // ------------------------------------------------

        if (
          requestCart.items.length === 0
        ) {
          showErrorToast(
            'Adicione pelo menos um produto à requisição.'
          );

          return;
        }

        // ------------------------------------------------
        // VALIDAR LOJA
        // ------------------------------------------------

        if (
          !user?.idl ||
          user.idl === '0'
        ) {
          showErrorToast(
            'Não foi possível identificar a loja da requisição.'
          );

          return;
        }

        // ------------------------------------------------
        // VALIDAR DADOS DA LOJA
        // ------------------------------------------------

        if (!reportShopData) {
          showErrorToast(
            'Não foi possível carregar os dados da loja.'
          );

          return;
        }

        setIsSaving(true);

        try {
          // =================================================
          // CLIENTE DA PRO FORMA
          // MESMA LÓGICA USADA NA VENDA
          // =================================================

          let finalCustomerName =
            'Venda ao Público';

          let finalCustomerNif =
            '999999999';

          let finalCustomerId:
            number | undefined =
            undefined;

          // -------------------------------------------------
          // CENÁRIO A
          // CLIENTE REGISTADO
          // -------------------------------------------------

          if (requestCart.cliente) {
            finalCustomerName =
              requestCart.cliente.nome;

            finalCustomerNif =
              requestCart.cliente.numeroContribuinte ||
              '999999999';

            const idStr =
              String(
                requestCart.cliente.id
              );

            // Cliente temporário não vai
            // para customerId.
            finalCustomerId =
              idStr.startsWith('TEMP_')
                ? undefined
                : Number(
                    requestCart.cliente.id
                  );
          }

          // -------------------------------------------------
          // CENÁRIO B
          // CLIENTE INFORMAL
          // -------------------------------------------------

          else if (
            requestCart.nomeInformal &&
            requestCart.nomeInformal.trim() !== ''
          ) {
            finalCustomerName =
              requestCart.nomeInformal.trim();

            finalCustomerNif =
              '999999999';

            // Cliente informal não possui
            // customerId registado.
            finalCustomerId =
              undefined;
          }

          // -------------------------------------------------
          // CENÁRIO C
          // SEM CLIENTE
          // Mantém:
          // Venda ao Público
          // NIF 999999999
          // -------------------------------------------------

          // =================================================
          // PAYLOAD
          // =================================================

          const proformaData:
            CreateProFormaFormData = {
              customerId:
                finalCustomerId,

              customerName:
                finalCustomerName,

              customerNif:
                finalCustomerNif,

              shopId:
                Number(user.idl),

              discountAmount:
                requestCart.discount,

              discountType:
                requestCart.discountType,

              items:
                requestCart.items.map(
                  (item) => ({
                    productId:
                      Number(
                        item.productId
                      ),

                    quantity:
                      item.quantity,

                    unitPrice:
                      item.unitPrice,

                    taxRate:
                      item.taxRate,
                  })
                ),
            };

          // =================================================
          // GUARDAR
          // =================================================

          const result =
            await criarProForma(
              proformaData
            );

          // =================================================
          // IMPRIMIR
          // =================================================

          const {
            printProFormaPdf,
          } = await import(
            '@/utils/proFormaReceiptPdf'
          );

          printProFormaPdf(
            result,
            printFormat,
            reportShopData
          );

          // =================================================
          // SUCESSO
          // =================================================

          showSuccessToast(
            'Requisição criada e documento gerado com sucesso.'
          );

          setIsCreateModalOpen(
            false
          );

          setIsCustomerModalOpen(
            false
          );

          requestCart.clearSale();

          await loadRequests();

        } catch (
          error: unknown
        ) {
          console.error(
            'Erro ao guardar requisição:',
            error
          );

          showErrorToast(
            'Não foi possível guardar a requisição.'
          );
        } finally {
          setIsSaving(false);
        }
      },
      [
        requestCart,
        user?.idl,
        criarProForma,
        loadRequests,
        printFormat,
        reportShopData,
      ]
    );

  // ====================================================
  // CANCELAR REQUISIÇÃO
  // ====================================================

  const handleCancel =
    useCallback(
      async (
        id: number
      ) => {
        const confirmed =
          window.confirm(
            'Cancelar esta requisição?'
          );

        if (!confirmed) {
          return;
        }

        setProcessingId(id);

        try {
          await cancelarProForma(id);

          showSuccessToast(
            'Requisição cancelada com sucesso.'
          );

          await loadRequests();
        } catch (
          error: unknown
        ) {
          console.error(
            'Erro ao cancelar requisição:',
            error
          );

          showErrorToast(
            'Não foi possível cancelar a requisição.'
          );
        } finally {
          setProcessingId(null);
        }
      },
      [
        cancelarProForma,
        loadRequests,
      ]
    );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6 animate-in fade-in duration-500">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* ==================================================
            CABEÇALHO
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate('/dashboard')
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>

              <div className="flex items-center gap-3">

                <FileText
                  className="h-7 w-7 text-blue-600"
                />

                <h1 className="text-2xl font-black text-slate-900 uppercase">
                  Requisições
                </h1>

              </div>

              <p className="mt-1 text-xs text-slate-500 font-medium">
                Gestão de requisições da unidade.
              </p>

            </div>

          </div>

          {/* BOTÕES */}

          <div className="flex gap-2">

            <Button
              onClick={
                handleOpenCreate
              }
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Requisição
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                void loadRequests()
              }
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Actualizar
            </Button>

          </div>

        </div>

        {/* ==================================================
            LISTAGEM
        ================================================== */}

        <Card className="border-slate-200 shadow-sm overflow-hidden">

          <CardHeader className="bg-white border-b">

            <CardTitle className="text-sm font-bold text-slate-500 uppercase">
              Histórico de Requisições
            </CardTitle>

          </CardHeader>

          <CardContent className="p-0">

            {loading ? (

              <div className="flex flex-col items-center justify-center py-20 gap-4">

                <Loader2
                  className="h-8 w-8 animate-spin text-blue-600"
                />

              </div>

            ) : items.length === 0 ? (

              <div className="py-20 text-center">

                <p className="text-sm text-slate-500">
                  Nenhuma requisição encontrada.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                  <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase text-[10px]">

                    <tr>

                      <th className="p-4">
                        Número
                      </th>

                      <th className="p-4">
                        Data
                      </th>

                      <th className="p-4">
                        Cliente
                      </th>

                      <th className="p-4 text-right">
                        Total
                      </th>

                      <th className="p-4 text-center">
                        Estado
                      </th>

                      <th className="p-4 text-right">
                        Acções
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {items.map(
                      (request) => (

                        <tr
                          key={request.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >

                          {/* NÚMERO */}

                          <td className="p-4 font-bold text-blue-600">

                            {
                              request.numeroProforma
                            }

                          </td>

                          {/* DATA */}

                          <td className="p-4 text-slate-600">

                            {request.dataProforma
                              ? new Date(
                                  request.dataProforma
                                ).toLocaleDateString(
                                  'pt-PT'
                                )
                              : '-'}

                          </td>

                          {/* CLIENTE */}

                          <td className="p-4 uppercase text-xs font-bold">

                            {
                              request.customerName ||
                              'Venda ao Público'
                            }

                          </td>

                          {/* TOTAL */}

                          <td className="p-4 text-right font-black">

                            {Number(
                              request.totalGeral ?? 0
                            ).toFixed(2)}{' '}
                            Db

                          </td>

                          {/* ESTADO */}

                          <td className="p-4 text-center">

                            <Badge
                              variant={
                                request.status ===
                                'ABERTA'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {
                                statusLabel[
                                  request.status
                                ] ||
                                request.status
                              }
                            </Badge>

                          </td>

                          {/* ACÇÕES */}

                          <td className="p-4 text-right">

                            <div className="flex justify-end gap-2">

                              {/* VER */}

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  viewingId ===
                                  request.id
                                }
                                onClick={() =>
                                  void handleViewProForma(
                                    request
                                  )
                                }
                                title="Ver / imprimir Pro Forma"
                                className="h-8 text-[10px] font-bold uppercase border-blue-200 text-blue-600 hover:bg-blue-50"
                              >

                                {viewingId ===
                                request.id ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                )}

                                Ver

                              </Button>

                              {/* CONVERTER */}

                              <Button
                                size="sm"
                                disabled={
                                  request.status !==
                                  'ABERTA'
                                }
                                onClick={() =>
                                  navigate(
                                    `/sales?proformaId=${request.id}`
                                  )
                                }
                                variant="outline"
                                className="h-8 text-[10px] font-bold uppercase"
                              >

                                <ShoppingCart
                                  className="mr-1 h-3.5 w-3.5"
                                />

                                Converter

                              </Button>

                              {/* CANCELAR */}

                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  request.status !==
                                    'ABERTA' ||
                                  processingId ===
                                    request.id
                                }
                                onClick={() =>
                                  void handleCancel(
                                    request.id
                                  )
                                }
                                className="h-8 text-red-400 text-[10px] font-bold uppercase"
                              >

                                {processingId ===
                                request.id ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle
                                    className="mr-1 h-3.5 w-3.5"
                                  />
                                )}

                                Cancelar

                              </Button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>

      </div>

      {/* ====================================================
          MODAL DA NOVA REQUISIÇÃO
      ==================================================== */}

      <ModalForm
        open={
          isCreateModalOpen
        }
        onClose={() =>
          setIsCreateModalOpen(
            false
          )
        }
        title=""
        size="full"
        onSubmit={undefined}
        className="p-0 overflow-hidden"
        contentClassName="p-0 border-none bg-transparent shadow-none"
      >

        <ProFormaForm

          sale={
            requestCart
          }

          user={
            user
          }

          shop={
            reportShopData
          }

          formattedProducts={
            formattedProducts
          }

          onAddProduct={(
            product: ProductDisplay
          ) => {

            requestCart.addProduct({
              productId:
                product.id,

              productName:
                product.nome,

              unitPrice:
                product.precoUnitario,

              taxRate:
                product.taxRate,

              stock:
                product.stock,

              controlaStock:
                product.controlaStock,
            });

          }}

          onSaveProForma={() =>
            void handleSaveRequest()
          }

          isProcessing={
            isSaving
          }

          productsLoading={
            productsLoading
          }

          searchInputRef={
            searchInputRef
          }

          onOpenCustomerModal={() =>
            setIsCustomerModalOpen(
              true
            )
          }

          printFormat={
            printFormat
          }

          setPrintFormat={
            setPrintFormat
          }

          onClose={() =>
            setIsCreateModalOpen(
              false
            )
          }

        />

      </ModalForm>

      {/* ====================================================
          MODAL DE SELECÇÃO DE CLIENTE
      ==================================================== */}

      <CustomerSelectionModal

        isOpen={
          isCustomerModalOpen
        }

        onClose={() =>
          setIsCustomerModalOpen(
            false
          )
        }

        onSelect={(
          customer
        ) => {

          requestCart.setCliente(
            customer
          );

          setIsCustomerModalOpen(
            false
          );

        }}

        customers={
          customers
        }

      />

    </div>
  );
};

export default RequestsPage;