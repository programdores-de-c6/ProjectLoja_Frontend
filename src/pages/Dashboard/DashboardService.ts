// Adicionar ao src/pages/reports/ReportsService.ts
// ou, preferencialmente, criar src/pages/dashboard/DashboardService.ts

import { useCallback } from 'react';
import api from '@/config/api';

export interface DashboardSummary {
  salesToday: number;
  totalToday: number;
  salesMonth: number;
  totalMonth: number;
  averageTicket: number;
  itemsSold: number;
  openBoxes: number;
  lowStock: number;
  outOfStock: number;
}

export interface DashboardDailyPoint {
  date: string;
  sales: number;
  total: number;
}

export interface DashboardPaymentPoint {
  metodo: string;
  vendas: number;
  total: number;
  percentagem: number;
}

export interface DashboardTopProduct {
  productId: number;
  nome: string;
  quantidade: number;
  total: number;
  shopName?: string;
}

export interface DashboardRecentSale {
  saleId: number;
  numeroFactura?: string;
  serie?: string;
  dataVenda?: string;
  cliente?: string;
  total: number;
  metodoPagamento?: string;
  shopName?: string;
  boxId?: number;
  operador?: string;
}

export interface DashboardOpenBox {
  boxId: number;
  shopName?: string;
  openedBy?: string;
  openingDate?: string;
  openingValue: number;
}

export interface DashboardYesterdayClosing {
  boxId: number;
  shopName?: string;
  closingDate?: string;
  closingValue: number;
  closedBy?: string;
}

export interface DashboardShop {
  shopId: number;
  shopName: string;
  todayTotal: number;
  todaySales: number;
  monthTotal: number;
  monthSales: number;
  openBoxes: number;
  lowStock: number;
  outOfStock: number;
}

export interface DashboardResponse {
  scope: 'GLOBAL' | 'SHOP' | 'OPERATOR';
  shopId?: number | null;
  shopName: string;
  summary: DashboardSummary;
  salesByDay: DashboardDailyPoint[];
  payments: DashboardPaymentPoint[];
  topProducts: DashboardTopProduct[];
  recentSales: DashboardRecentSale[];
  openBoxes: DashboardOpenBox[];
  yesterdayClosings: DashboardYesterdayClosing[];
  shops: DashboardShop[];
}

export const useDashboardService = () => {

  const getDashboard =
    useCallback(
      async (): Promise<DashboardResponse> => {

        const response =
          await api.get<DashboardResponse>(
            '/dashboard'
          );

        return response.data;

      },
      []
    );

  return {
    getDashboard,
  };
};
