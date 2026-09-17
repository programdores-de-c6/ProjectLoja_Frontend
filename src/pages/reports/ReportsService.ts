import { useCallback } from 'react';
import api from '@/config/api';


// ====================================================
// FILTROS
// ====================================================

export interface ReportFilter {
  from?: string;
  to?: string;
  shopId?: number;
  boxId?: number;
  employeeId?: number;
  customerId?: number;
  productId?: number;
}


// ====================================================
// RESUMO
// ====================================================

export interface ReportSummary {
  salesCount: number;
  itemsCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  averageTicket: number;
}


// ====================================================
// RELATÓRIO DE VENDAS
// ====================================================

export interface SalesRow {
  saleId: number;

  numeroFactura?: string;
  serie?: string;
  dataVenda?: string;

  cliente?: string;
  nifCliente?: string;

  boxId?: number;
  operador?: string;

  quantidadeItens: number;

  subtotal: number;
  imposto: number;
  desconto: number;
  total: number;

  metodoPagamento?: string;
}


export interface DailySales {
  data: string;
  vendas: number;
  total: number;
}


export interface WeeklySales {
  semana: string;
  inicio: string;
  fim: string;
  vendas: number;
  total: number;
}


export interface MonthlySales {
  ano: number;
  mes: number;
  vendas: number;
  total: number;
}


export interface SalesPeriodReport {
  summary: ReportSummary;

  daily: DailySales[];

  weekly: WeeklySales[];

  monthly: MonthlySales[];

  rows: SalesRow[];
}


// ====================================================
// PAGAMENTOS
// ====================================================

export interface PaymentRow {
  metodo: string;
  vendas: number;
  total: number;
  percentagem: number;
}


export interface PaymentSummary {
  salesCount: number;
  total: number;
  averageTicket: number;
  mainMethod?: string;
}


export interface PaymentReport {
  summary: PaymentSummary;
  rows: PaymentRow[];
}


// ====================================================
// PRODUTOS MAIS VENDIDOS
// ====================================================

export interface TopProductRow {
  id: number;
  nome: string;
  quantidade: number;
  subtotal: number;
  total: number;
}


export interface TopProductsSummary {
  productsCount: number;
  itemsCount: number;
  subtotal: number;
  total: number;
}


export interface TopProductsReport {
  summary: TopProductsSummary;
  rows: TopProductRow[];
}


// ====================================================
// STOCK
// ====================================================

export interface StockRow {
  productId: number;
  produto: string;
  codigoBarra?: string;

  quantidade: number;
  minimo: number;

  preco: number;
  valorInventario: number;

  baixo: boolean;
  semStock: boolean;
}


export interface StockSummary {
  productsCount: number;
  stockBaixo: number;
  semStock: number;
  valorInventario: number;
}


export interface StockReport {
  summary: StockSummary;
  rows: StockRow[];
}


// ====================================================
// MOVIMENTOS DE STOCK
// ====================================================

export interface StockMovementRow {
  id: number;

  data?: string;

  productId?: number;
  produto?: string;

  tipo?: string;
  quantidade: number;

  motivo?: string;

  employeeId?: number;
  funcionario?: string;

  shopId?: number;
  loja?: string;
}


export interface StockMovementReport {
  movementsCount: number;
  totalQuantity: number;
  rows: StockMovementRow[];
}


// ====================================================
// FUNCIONÁRIOS
// ====================================================

export interface EmployeeRow {
  id: number;
  nome: string;

  vendas: number;
  total: number;
  ticketMedio: number;
}


export interface EmployeeReport {
  summary: ReportSummary;
  rows: EmployeeRow[];
}


// ====================================================
// CAIXAS
// ====================================================

export interface BoxRow {
  id: number;

  status?: string;

  openingDate?: string;
  closingDate?: string;

  openedBy?: string;
  closedBy?: string;

  openingValue: number;
  salesTotal: number;

  cashReceived: number;
  changeGiven: number;

  expectedClosingValue: number;
  closingValue: number;
  difference: number;

  salesCount: number;

  shop?: string;
}


export interface BoxReport {
  boxesCount: number;
  totalSales: number;
  rows: BoxRow[];
}


// ====================================================
// CLIENTES
// ====================================================

export interface CustomerRow {
  id: number;

  nome: string;
  nif?: string;

  compras: number;

  total: number;
  ticketMedio: number;

  primeiraCompra?: string;
  ultimaCompra?: string;

  frequenciaMediaDias: number;
}


export interface CustomerReport {
  customersCount: number;
  total: number;

  rows: CustomerRow[];
}


// ====================================================
// RELATÓRIO FINANCEIRO MENSAL
// ====================================================

export interface MonthlySaleRow {
  documentoNumero: number;

  documentoSerie?: string;
  documentoData?: string;

  nifConsumidor?: string;

  totalValorItens?: number;
  taxAplicavelItens?: number;

  codigoIsento?: number;
  quantItens?: number;

  descItens?: string;

  numeroDocumentoOrigem?: string;
  dataDocumentoOrigem?: string;

  tipoDocumento?: string;
}


export interface MonthlyReport {
  summary: ReportSummary;
  rows: MonthlySaleRow[];
}


// ====================================================
// RELATÓRIO DE CAIXA INDIVIDUAL
// ====================================================

export interface CashReport {
  boxId: number;

  status?: string;

  openingDate?: string;
  closingDate?: string;

  openedBy?: string;
  closedBy?: string;

  openingValue: number;

  salesTotal: number;

  cashReceived: number;
  changeGiven: number;

  expectedClosingValue: number;
  closingValue: number;
  difference: number;

  salesCount: number;

  paymentTotals: Record<string, number>;
}


// ====================================================
// CATÁLOGO LEGADO
// ====================================================
//
// Mantido temporariamente para compatibilidade com
// código existente. Os novos relatórios usam os
// endpoints específicos acima.
// ====================================================

export interface ReportsCatalog {

  summary: ReportSummary;

  payments: Array<{
    metodo: string;
    total: number;
  }>;

  topProducts: Array<{
    id: number;
    nome: string;
    quantidade: number;
    total: number;
  }>;

  stock: Array<{
    produto: string;
    quantidade: number;
    minimo: number;
    preco: number;
    baixo: boolean;
  }>;

  movements: Array<{
    data: string;
    produto: string;
    tipo: string;
    quantidade: number;
    motivo?: string;
    funcionario?: string;
  }>;

  employees: Array<{
    id: number;
    nome: string;
    vendas: number;
    total: number;
  }>;

  boxes: Array<{
    id: number;
    vendas: number;
    total: number;
  }>;

  productsCount: number;
  customersCount: number;
  employeesCount: number;
  boxesCount: number;
}


// ====================================================
// SERVICE
// ====================================================

export const useReportsService = () => {

  // ==================================================
  // RESUMO
  // ==================================================

  const getSummary = useCallback(
    async (
      params: ReportFilter
    ): Promise<ReportSummary> => {

      const response =
        await api.get<ReportSummary>(
          '/reports/summary',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // VENDAS POR PERÍODO
  // ==================================================

  const getSalesByPeriod = useCallback(
    async (
      params: ReportFilter
    ): Promise<SalesPeriodReport> => {

      const response =
        await api.get<SalesPeriodReport>(
          '/reports/sales-by-period',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // PAGAMENTOS
  // ==================================================

  const getPaymentMethods = useCallback(
    async (
      params: ReportFilter
    ): Promise<PaymentReport> => {

      const response =
        await api.get<PaymentReport>(
          '/reports/payment-methods',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // PRODUTOS MAIS VENDIDOS
  // ==================================================

  const getTopProducts = useCallback(
    async (
      params: ReportFilter
    ): Promise<TopProductsReport> => {

      const response =
        await api.get<TopProductsReport>(
          '/reports/top-products',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // STOCK
  // ==================================================

  const getStockReport = useCallback(
    async (
      params?: {
        shopId?: number;
        productId?: number;
      }
    ): Promise<StockReport> => {

      const response =
        await api.get<StockReport>(
          '/reports/stock',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // MOVIMENTOS DE STOCK
  // ==================================================

  const getStockMovements = useCallback(
    async (
      params: ReportFilter
    ): Promise<StockMovementReport> => {

      const response =
        await api.get<StockMovementReport>(
          '/reports/stock-movements',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // VENDAS POR FUNCIONÁRIO
  // ==================================================

  const getSalesByEmployee = useCallback(
    async (
      params: ReportFilter
    ): Promise<EmployeeReport> => {

      const response =
        await api.get<EmployeeReport>(
          '/reports/by-employee',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // VENDAS POR CAIXA
  // ==================================================

  const getSalesByBox = useCallback(
    async (
      params: ReportFilter
    ): Promise<BoxReport> => {

      const response =
        await api.get<BoxReport>(
          '/reports/by-box',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // CLIENTES
  // ==================================================

  const getCustomerReport = useCallback(
    async (
      params: ReportFilter
    ): Promise<CustomerReport> => {

      const response =
        await api.get<CustomerReport>(
          '/reports/customers',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // RECEITA MENSAL — FINANÇAS
  // ==================================================

  const getMonthlyFinancial = useCallback(
    async (
      year: number,
      month: number,
      shopId?: number
    ): Promise<MonthlyReport> => {

      const response =
        await api.get<MonthlyReport>(
          '/reports/monthly-financial',
          {
            params: {
              year,
              month,
              shopId,
            },
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // CAIXA INDIVIDUAL
  // ==================================================

  const getCashReport = useCallback(
    async (
      boxId: number
    ): Promise<CashReport> => {

      const response =
        await api.get<CashReport>(
          `/reports/cash/${boxId}`
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // CATÁLOGO LEGADO
  // ==================================================

  const getCatalog = useCallback(
    async (
      params: ReportFilter
    ): Promise<ReportsCatalog> => {

      const response =
        await api.get<ReportsCatalog>(
          '/reports/catalog',
          {
            params,
          }
        );

      return response.data;
    },
    []
  );


  // ==================================================
  // RETURN
  // ==================================================

  return {

    getSummary,

    getSalesByPeriod,

    getPaymentMethods,

    getTopProducts,

    getStockReport,

    getStockMovements,

    getSalesByEmployee,

    getSalesByBox,

    getCustomerReport,

    getMonthlyFinancial,

    getCashReport,

    getCatalog,

  };
};