import { useCallback } from 'react';

import api from '@/config/api';

export interface ReportSummary {
  salesCount: number;
  itemsCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  averageTicket: number;
}

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

  paymentTotals: Record<
    string,
    number
  >;
}

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

export const useReportsService = () => {
  const getCashReport = useCallback(
    async (
      boxId: number
    ) => {
      const response =
        await api.get<CashReport>(
          `/reports/cash/${boxId}`
        );

      return response.data;
    },
    []
  );

  const getCatalog = useCallback(
    async (
      params: {
        from?: string;
        to?: string;
        shopId?: number;
      }
    ) => {
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

  const getSummary = useCallback(
    async (
      params: {
        from?: string;
        to?: string;
        shopId?: number;
      }
    ) => {
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

  const getMonthlySales = useCallback(
    async (
      year: number,
      month: number,
      shopId?: number
    ) => {
      const response =
        await api.get<MonthlyReport>(
          '/reports/monthly-sales',
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

  return {
    getCashReport,
    getCatalog,
    getSummary,
    getMonthlySales,
  };
};