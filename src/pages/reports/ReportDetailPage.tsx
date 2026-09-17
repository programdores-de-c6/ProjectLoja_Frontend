/**
 * ====================================================
 * REPORT DETAIL PAGE
 * RELATÓRIOS DE VENDAS E PAGAMENTOS
 * ====================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/useAuth';

import {
  useShopService,
  Shop,
} from '@/pages/shop/ShopService';

import {
  showErrorToast,
  showSuccessToast,
} from '@/utils/toast';

import type { ReportShop } from '@/utils/reportShopTypes';

import {
  ReportSummary,
  SalesPeriodReport,
  PaymentReport,
  TopProductsReport,
  StockReport,
  StockMovementReport,
  EmployeeReport,
  BoxReport,
  MonthlyReport,
  CustomerReport,
  useReportsService,
} from './ReportsService';

import {
  printSalesReportPdf,
} from '@/utils/salesReportPdf';

import {
  exportSalesReportExcel,
} from '@/utils/salesReportExcel';

import {
  printPaymentReportPdf,
} from '@/utils/paymentReportPdf';

import {
  exportPaymentReportExcel,
} from '@/utils/paymentReportExcel';
import {
  printTopProductsReportPdf,
} from '@/utils/topProductsReportPdf';

import {
  exportTopProductsReportExcel,
} from '@/utils/topProductsReportExcel';

import {
  printStockReportPdf,
} from '@/utils/stockReportPdf';

import {
  exportStockReportExcel,
} from '@/utils/stockReportExcel';

import {
  printStockMovementsReportPdf,
} from '@/utils/stockMovementsReportPdf';

import {
  exportStockMovementsReportExcel,
} from '@/utils/stockMovementsReportExcel';

import {
  printEmployeeReportPdf,
} from '@/utils/employeeReportPdf';

import {
  exportEmployeeReportExcel,
} from '@/utils/employeeReportExcel';

import {
  printBoxReportPdf,
} from '@/utils/boxReportPdf';

import {
  exportBoxReportExcel,
} from '@/utils/boxReportExcel';

import {
  exportMonthlyFinancialReportExcel,
} from '@/utils/monthlyFinancialReportExcel';


import {
  printCustomerReportPdf,
} from '@/utils/customerReportPdf';

import {
  exportCustomerReportExcel,
} from '@/utils/customerReportExcel';

// ====================================================
// DEFINIÇÕES
// ====================================================

interface ReportDefinition {
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}


const definitions: Record<
  string,
  ReportDefinition
> = {

  sales: {
    title: 'Relatório de Vendas',
    description:
      'Vendas realizadas, indicadores financeiros e evolução do período.',
    icon: BarChart3,
  },

  payments: {
    title: 'Relatório de Pagamentos',
    description:
      'Valores recebidos por método de pagamento.',
    icon: CreditCard,
  },

  products: {
    title: 'Relatório de Produtos',
    description:
      'Produtos mais vendidos e respectiva facturação.',
    icon: Package,
  },

  stock: {
    title: 'Relatório de Stock',
    description:
      'Stock disponível, stock baixo e produtos sem stock.',
    icon: Package,
  },

  movements: {
    title: 'Relatório de Movimentos',
    description:
      'Entradas, saídas, transferências e ajustes de stock.',
    icon: FileText,
  },

  employees: {
    title: 'Relatório de Funcionários',
    description:
      'Vendas e desempenho por funcionário.',
    icon: Users,
  },

  boxes: {
    title: 'Relatório de Caixas',
    description:
      'Abertura, fecho, vendas e diferenças.',
    icon: WalletCards,
  },

  customers: {
    title: 'Relatório de Clientes',
    description:
      'Clientes com maior volume de compras.',
    icon: Users,
  },

  'monthly-financial': {
    title: 'Receita Mensal — Finanças',
    description:
      'Receita mensal para exportação financeira.',
    icon: FileSpreadsheet,
  },

};


// ====================================================
// PAGINAÇÃO
// ====================================================

const PAGE_SIZE = 20;


// ====================================================
// COMPONENTE
// ====================================================

const ReportDetailPage: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const {
    listarId,
  } = useShopService();

  const [
    reportShop,
    setReportShop,
  ] = useState<Shop | undefined>(
    undefined
  );


  // ==================================================
  // SERVICES
  // ==================================================

  const {
  getSalesByPeriod,
  getPaymentMethods,
  getTopProducts,
  getStockReport,
  getStockMovements,
  getSalesByEmployee,
  getSalesByBox,
  getMonthlyFinancial,
  getCustomerReport,
} = useReportsService();

  // ==================================================
  // RELATÓRIO ACTUAL
  // ==================================================

  const reportKey =
    location.pathname.split('/').pop() ||
    'sales';


  const definition =
    definitions[reportKey] ||
    definitions.sales;


  const Icon =
    definition.icon;


  // ==================================================
  // DATAS
  // ==================================================

  const formatDateInput =
    (date: Date): string => {

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, '0');

      const day =
        String(
          date.getDate()
        ).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };


  const getFirstDayOfMonth =
    (): Date => {

      const now =
        new Date();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    };


  const getLastDayOfMonth =
    (): Date => {

      const now =
        new Date();

      return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      );
    };


  const [
    from,
    setFrom,
  ] = useState(
    () =>
      formatDateInput(
        getFirstDayOfMonth()
      )
  );


  const [
    to,
    setTo,
  ] = useState(
    () =>
      formatDateInput(
        getLastDayOfMonth()
      )
  );



  const reportShopData = useMemo<ReportShop | undefined>(
    () =>
      reportShop
        ? {
            id: reportShop.id,
            nome: reportShop.nome,
            numeroContribuite: reportShop.numeroContribuite,
            email: reportShop.email,
            contacto: reportShop.contacto,
            caixaPostal: reportShop.caixaPostal,
            nomelocation: reportShop.nomelocation,
            logoUrl: reportShop.logoUrl,
            logo:
              typeof reportShop.logo === 'string'
                ? reportShop.logo
                : null,
          }
        : undefined,
    [reportShop]
  );

  const reportShopName =
    reportShopData?.nome ||
    reportShopData?.nome ||
    'Visão Global';

  // ==================================================
  // RELATÓRIO DE VENDAS
  // ==================================================

  const [
    salesReport,
    setSalesReport,
  ] = useState<SalesPeriodReport | null>(
    null
  );


  // ==================================================
  // RELATÓRIO DE PAGAMENTOS
  // ==================================================

  const [
    paymentReport,
    setPaymentReport,
  ] = useState<PaymentReport | null>(
    null
  );

const [
  productsReport,
  setProductsReport,
] = useState<TopProductsReport | null>(
  null
);

  // ==================================================
  // RELATÓRIO DE STOCK
  // ==================================================

  const [
    stockReport,
    setStockReport,
  ] = useState<StockReport | null>(
    null
  );

  // ==================================================
  // RELATÓRIO DE MOVIMENTOS
  // ==================================================

  const [
    stockMovementsReport,
    setStockMovementsReport,
  ] = useState<StockMovementReport | null>(null);

  const [stockMovementSearch, setStockMovementSearch] = useState('');
  const [stockMovementType, setStockMovementType] = useState<
    'TODOS' | 'ENTRADA' | 'SAÍDA' | 'TRANSFERENCIA' | 'AJUSTE'
  >('TODOS');
  const [stockMovementPage, setStockMovementPage] = useState(1);

  // ==================================================
  // RELATÓRIO DE FUNCIONÁRIOS
  // ==================================================

  const [
    employeeReport,
    setEmployeeReport,
  ] = useState<EmployeeReport | null>(null);

  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState('');

  const [
    employeePage,
    setEmployeePage,
  ] = useState(1);

  // ==================================================
  // RELATÓRIO DE CAIXAS
  // ==================================================

  const [
    boxReport,
    setBoxReport,
  ] = useState<BoxReport | null>(null);

  const [
    boxSearch,
    setBoxSearch,
  ] = useState('');

  const [
    boxPage,
    setBoxPage,
  ] = useState(1);

  // ==================================================
  // RECEITA MENSAL — FINANÇAS
  // ==================================================

  const now = new Date();

  const [
    financialYear,
    setFinancialYear,
  ] = useState(
    now.getFullYear()
  );

  const [
    financialMonth,
    setFinancialMonth,
  ] = useState(
    now.getMonth() + 1
  );

  const [
    monthlyFinancialReport,
    setMonthlyFinancialReport,
  ] = useState<MonthlyReport | null>(null);

  // ==================================================
  // RELATÓRIO DE CLIENTES
  // ==================================================

  const [
    customerReport,
    setCustomerReport,
  ] = useState<CustomerReport | null>(null);

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState('');

  const [
    customerPage,
    setCustomerPage,
  ] = useState(1);

  // ==================================================
  // FILTROS DA TABELA DE STOCK
  // ==================================================

  const [stockSearch, setStockSearch] = useState('');

  const [stockStatus, setStockStatus] = useState<'TODOS' | 'NORMAL' | 'BAIXO' | 'SEM_STOCK'>('TODOS');
  // ==================================================
  // LOADING
  // ==================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==================================================
  // PAGINAÇÃO
  // ==================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  // ==================================================
  // LOJA
  // ==================================================

  const shopId =
    useMemo(() => {

      const id =
        Number(user?.idl);

      if (
        !Number.isInteger(id)
        || id <= 0
      ) {
        return undefined;
      }

      return id;

    }, [
      user?.idl,
    ]);


  // ==================================================
  // CARREGAR DADOS DA LOJA PARA PDF / EXCEL
  // ==================================================

  useEffect(() => {

    const loadReportShop = async () => {

      if (!shopId) {
        setReportShop(undefined);
        return;
      }

      try {

        const shop =
          await listarId(
            String(shopId)
          );

        setReportShop(shop);

      } catch (error) {

        console.error(
          'Erro ao carregar dados da loja para os relatórios:',
          error
        );

        setReportShop(undefined);
      }
    };

    void loadReportShop();

    // listarId é criado dentro do hook do serviço.
    // O carregamento depende efectivamente apenas da loja seleccionada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shopId,
  ]);


  // ==================================================
  // MOEDA
  // ==================================================

  const money =
    useCallback(
      (
        value?: number
      ): string => {

        return `${Number(
          value ?? 0
        ).toLocaleString(
          'pt-PT',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} Db`;

      },
      []
    );


  // ==================================================
  // CARREGAR VENDAS
  // ==================================================

  const loadSales =
    useCallback(
      async () => {

        if (
          !from ||
          !to
        ) {

          showErrorToast(
            'Indique o período do relatório.'
          );

          return;
        }


        if (
          from > to
        ) {

          showErrorToast(
            'A data inicial não pode ser superior à data final.'
          );

          return;
        }


        setLoading(true);


        try {

          const result =
            await getSalesByPeriod({

              from,
              to,
              shopId,

            });


          setSalesReport(
            result
          );


          setCurrentPage(
            1
          );


        } catch (
          error: unknown
        ) {

          console.error(
            'Erro ao carregar relatório de vendas:',
            error
          );


          setSalesReport(
            null
          );


          showErrorToast(
            'Não foi possível carregar o relatório de vendas.'
          );

        } finally {

          setLoading(false);

        }

      },
      [
        from,
        to,
        shopId,
        getSalesByPeriod,
      ]
    );


  // ==================================================
  // CARREGAR PAGAMENTOS
  // ==================================================

  const loadPayments =
    useCallback(
      async () => {

        if (
          !from ||
          !to
        ) {

          showErrorToast(
            'Indique o período do relatório.'
          );

          return;
        }


        if (
          from > to
        ) {

          showErrorToast(
            'A data inicial não pode ser superior à data final.'
          );

          return;
        }


        setLoading(true);


        try {

          const result =
            await getPaymentMethods({

              from,
              to,
              shopId,

            });


          setPaymentReport(
            result
          );


        } catch (
          error: unknown
        ) {

          console.error(
            'Erro ao carregar relatório de pagamentos:',
            error
          );


          setPaymentReport(
            null
          );


          showErrorToast(
            'Não foi possível carregar o relatório de pagamentos.'
          );

        } finally {

          setLoading(false);

        }

      },
      [
        from,
        to,
        shopId,
        getPaymentMethods,
      ]
    );
const loadProducts = useCallback(
  async () => {

    if (!from || !to) {

      showErrorToast(
        'Indique o período do relatório.'
      );

      return;
    }

    if (from > to) {

      showErrorToast(
        'A data inicial não pode ser superior à data final.'
      );

      return;
    }

    setLoading(true);

    try {

      const result =
        await getTopProducts({
          from,
          to,
          shopId,
        });

      setProductsReport(
        result
      );

    } catch (error: unknown) {

      console.error(
        'Erro ao carregar relatório de produtos:',
        error
      );

      setProductsReport(
        null
      );

      showErrorToast(
        'Não foi possível carregar o relatório de produtos.'
      );

    } finally {

      setLoading(false);

    }

  },
  [
    from,
    to,
    shopId,
    getTopProducts,
  ]
);


// ==================================================
// CARREGAR STOCK
// ==================================================

const loadStock = useCallback(
  async () => {

    setLoading(true);

    try {

      const result = await getStockReport({
        shopId,
      });

      setStockReport(result);

    } catch (error: unknown) {

      console.error(
        'Erro ao carregar relatório de stock:',
        error
      );

      setStockReport(null);

      showErrorToast(
        'Não foi possível carregar o relatório de stock.'
      );

    } finally {

      setLoading(false);

    }

  },
  [
    shopId,
    getStockReport,
  ]
);


// ==================================================
// CARREGAR MOVIMENTOS DE STOCK
// ==================================================

const loadStockMovements = useCallback(
  async () => {

    if (!from || !to) {
      showErrorToast('Indique o período do relatório.');
      return;
    }

    if (from > to) {
      showErrorToast('A data inicial não pode ser superior à data final.');
      return;
    }

    setLoading(true);

    try {
      const result = await getStockMovements({
        from,
        to,
        shopId,
      });

      setStockMovementsReport(result);
      setStockMovementPage(1);

    } catch (error: unknown) {

      console.error(
        'Erro ao carregar movimentos de stock:',
        error
      );

      setStockMovementsReport(null);

      showErrorToast(
        'Não foi possível carregar os movimentos de stock.'
      );

    } finally {
      setLoading(false);
    }

  },
  [
    from,
    to,
    shopId,
    getStockMovements,
  ]
);

  // ==================================================
  // CARREGAR FUNCIONÁRIOS
  // ==================================================

  const loadEmployees = useCallback(
    async () => {

      if (!from || !to) {
        showErrorToast(
          'Indique o período do relatório.'
        );
        return;
      }

      if (from > to) {
        showErrorToast(
          'A data inicial não pode ser superior à data final.'
        );
        return;
      }

      setLoading(true);

      try {

        const result =
          await getSalesByEmployee({
            from,
            to,
            shopId,
          });

        setEmployeeReport(result);
        setEmployeePage(1);

      } catch (error: unknown) {

        console.error(
          'Erro ao carregar relatório de funcionários:',
          error
        );

        setEmployeeReport(null);

        showErrorToast(
          'Não foi possível carregar o relatório de funcionários.'
        );

      } finally {

        setLoading(false);

      }
    },
    [
      from,
      to,
      shopId,
      getSalesByEmployee,
    ]
  );


  // ==================================================
  // CARREGAR CAIXAS
  // ==================================================

  const loadBoxes =
    useCallback(
      async () => {

        if (!from || !to) {

          showErrorToast(
            'Indique o período do relatório.'
          );

          return;
        }

        if (from > to) {

          showErrorToast(
            'A data inicial não pode ser superior à data final.'
          );

          return;
        }

        setLoading(true);

        try {

          const result =
            await getSalesByBox({
              from,
              to,
              shopId,
            });

          setBoxReport(
            result
          );

          setBoxPage(1);

        } catch (error: unknown) {

          console.error(
            'Erro ao carregar relatório de caixas:',
            error
          );

          setBoxReport(null);

          showErrorToast(
            'Não foi possível carregar o relatório de caixas.'
          );

        } finally {

          setLoading(false);

        }

      },
      [
        from,
        to,
        shopId,
        getSalesByBox,
      ]
    );


  // ==================================================
  // CARREGAR RECEITA MENSAL — FINANÇAS
  // ==================================================

  const loadMonthlyFinancial =
    useCallback(
      async () => {

        if (
          !Number.isInteger(financialYear) ||
          financialYear < 2000 ||
          financialYear > 2100
        ) {

          showErrorToast(
            'Indique um ano válido.'
          );

          return;
        }

        if (
          !Number.isInteger(financialMonth) ||
          financialMonth < 1 ||
          financialMonth > 12
        ) {

          showErrorToast(
            'Indique um mês válido.'
          );

          return;
        }

        setLoading(true);

        try {

          const result =
            await getMonthlyFinancial(
              financialYear,
              financialMonth,
              shopId
            );

          setMonthlyFinancialReport(
            result
          );

        } catch (error: unknown) {

          console.error(
            'Erro ao carregar receita mensal para Finanças:',
            error
          );

          setMonthlyFinancialReport(
            null
          );

          showErrorToast(
            'Não foi possível preparar a receita mensal para Finanças.'
          );

        } finally {

          setLoading(false);

        }

      },
      [
        financialYear,
        financialMonth,
        shopId,
        getMonthlyFinancial,
      ]
    );


  // ==================================================
  // CARREGAR CLIENTES
  // ==================================================

  const loadCustomers =
    useCallback(
      async () => {

        if (!from || !to) {
          showErrorToast(
            'Indique o período do relatório.'
          );
          return;
        }

        if (from > to) {
          showErrorToast(
            'A data inicial não pode ser superior à data final.'
          );
          return;
        }

        setLoading(true);

        try {

          const result =
            await getCustomerReport({
              from,
              to,
              shopId,
            });

          setCustomerReport(result);
          setCustomerPage(1);

        } catch (error: unknown) {

          console.error(
            'Erro ao carregar relatório de clientes:',
            error
          );

          setCustomerReport(null);

          showErrorToast(
            'Não foi possível carregar o relatório de clientes.'
          );

        } finally {

          setLoading(false);

        }

      },
      [
        from,
        to,
        shopId,
        getCustomerReport,
      ]
    );


  // ==================================================
  // CARGA INICIAL
  // ==================================================

useEffect(
    () => {

      if (reportKey === 'sales') {
        void loadSales();
      } else if (reportKey === 'payments') {
        void loadPayments();
      } else if (reportKey === 'products') {
        void loadProducts();
      } else if (reportKey === 'stock') {
        void loadStock();
      } else if (reportKey === 'movements') {
        void loadStockMovements();
      } else if (reportKey === 'employees') {
        void loadEmployees();
      } else if (reportKey === 'boxes') {
        void loadBoxes();
      } else if (reportKey === 'monthly-financial') {
        void loadMonthlyFinancial();
      } else if (reportKey === 'customers') {
        void loadCustomers();
      }

    },
    [
      reportKey,
      loadSales,
      loadPayments,
      loadProducts,
      loadStock,
      loadStockMovements,
      loadEmployees,
      loadBoxes,
      loadMonthlyFinancial,
      loadCustomers,
    ]
  );

  // ==================================================
  // VENDAS
  // ==================================================



    const salesRows = useMemo(
  () => salesReport?.rows ?? [],
  [salesReport?.rows]
);

  const salesTotalPages =
    Math.max(
      1,
      Math.ceil(
        salesRows.length /
        PAGE_SIZE
      )
    );


  const paginatedSales =
    useMemo(
      () => {

        const start =
          (
            currentPage -
            1
          ) *
          PAGE_SIZE;


        return salesRows.slice(
          start,
          start + PAGE_SIZE
        );

      },
      [
        salesRows,
        currentPage,
      ]
    );


  useEffect(
    () => {

      if (
        reportKey === 'sales'
        && currentPage >
           salesTotalPages
      ) {

        setCurrentPage(
          salesTotalPages
        );
      }

    },
    [
      reportKey,
      currentPage,
      salesTotalPages,
    ]
  );


  // ==================================================
  // PAGAMENTOS
  // ==================================================

  

  // ==================================================
  // TOTAL DA PÁGINA DE VENDAS
  // ==================================================

  const salesPageTotals =
    useMemo(
      () => {

        return paginatedSales.reduce(
          (
            acc,
            row
          ) => {

            acc.items += Number(
              row.quantidadeItens ?? 0
            );

            acc.subtotal += Number(
              row.subtotal ?? 0
            );

            acc.tax += Number(
              row.imposto ?? 0
            );

            acc.discount += Number(
              row.desconto ?? 0
            );

            acc.total += Number(
              row.total ?? 0
            );

            return acc;

          },
          {
            items: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
          }
        );

      },
      [
        paginatedSales,
      ]
    );


  // ==================================================
  // MELHOR DIA
  // ==================================================

  const bestDay =
    useMemo(
      () => {

        if (
          !salesReport?.daily?.length
        ) {

          return null;

        }


        return [
          ...salesReport.daily,
        ].sort(
          (
            a,
            b
          ) =>
            Number(
              b.total ?? 0
            ) -
            Number(
              a.total ?? 0
            )
        )[0];

      },
      [
        salesReport?.daily,
      ]
    );


  // ==================================================
  // MÉDIA DIÁRIA
  // ==================================================

  const averageDaily =
    useMemo(
      () => {

        const daily =
          salesReport?.daily ?? [];


        if (
          !daily.length
        ) {

          return 0;

        }


        const total =
          daily.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.total ?? 0
              ),
            0
          );


        return (
          total /
          daily.length
        );

      },
      [
        salesReport?.daily,
      ]
    );

// ==================================================
// PDF VENDAS
// ==================================================

const handleSalesPdf = useCallback(
  () => {
    if (!salesReport) {
      return;
    }

    printSalesReportPdf(
      salesReport,
      from,
      to,
      reportShopData
    );
  },
  [
    salesReport,
    from,
    to,
    reportShopData,
  ]
);

// ==================================================
// EXCEL VENDAS
// ==================================================

const handleSalesExcel = useCallback(
  () => {
    if (!salesReport) {
      return;
    }

    try {
      exportSalesReportExcel(
        salesReport,
        from,
        to,
        reportShopData
      );

      showSuccessToast(
        'Relatório Excel exportado com sucesso.'
      );
    } catch (error: unknown) {
      console.error(
        'Erro ao exportar Excel:',
        error
      );

      showErrorToast(
        'Não foi possível exportar o relatório para Excel.'
      );
    }
  },
  [
    salesReport,
    from,
    to,
    reportShopData,
  ]
);


  // ==================================================
  // PDF PAGAMENTOS
  // ==================================================

  const handlePaymentPdf =
    useCallback(
      () => {

        if (
          !paymentReport
        ) {

          return;

        }


        printPaymentReportPdf(
          paymentReport,
          from,
          to,
          reportShopData
        );
       

      },
      [
        paymentReport,
        from,
        to,
        reportShopData,
      ]
    );


  // ==================================================
  // EXCEL PAGAMENTOS
  // ==================================================

  const handlePaymentExcel =
    useCallback(
      () => {

        if (
          !paymentReport
        ) {

          return;

        }


        try {

          exportPaymentReportExcel(
            paymentReport,
            from,
            to,
            reportShopData
          );


          showSuccessToast(
            'Relatório Excel exportado com sucesso.'
          );


        } catch (
          error: unknown
        ) {

          console.error(
            'Erro ao exportar Excel de pagamentos:',
            error
          );


          showErrorToast(
            'Não foi possível exportar o relatório de pagamentos.'
          );
        }

      },
      [
        paymentReport,
        from,
        to,
      reportShopData
      ]
    );

const handleProductsPdf = useCallback(
  () => {

    if (!productsReport) {
      return;
    }

    printTopProductsReportPdf(
      productsReport,
      from,
      to,
    reportShopData
    );

  },
  [
    productsReport,
    from,
    to,
 reportShopData
  ]
);


const handleProductsExcel = useCallback(
  () => {

    if (!productsReport) {
      return;
    }

    try {

      exportTopProductsReportExcel(
        productsReport,
        from,
        to,
        reportShopData
      );

      showSuccessToast(
        'Relatório de produtos exportado com sucesso.'
      );

    } catch (error: unknown) {

      console.error(
        'Erro ao exportar Excel de produtos:',
        error
      );

      showErrorToast(
        'Não foi possível exportar o relatório de produtos.'
      );
    }

  },
  [
    productsReport,
    from,
    to,
    reportShopData,
  ]
);
// ==================================================
// RELATÓRIO FILTRADO DE STOCK
// ==================================================

const filteredStockReport = useMemo<StockReport | null>(() => {

  if (!stockReport) {
    return null;
  }

  const query = stockSearch.trim().toLocaleLowerCase('pt-PT');

  const rows = (stockReport.rows ?? []).filter((row) => {

    const matchesSearch =
      !query ||
      String(row.produto ?? '').toLocaleLowerCase('pt-PT').includes(query) ||
      String(row.codigoBarra ?? '').toLocaleLowerCase('pt-PT').includes(query);

    if (!matchesSearch) {
      return false;
    }

    switch (stockStatus) {
      case 'NORMAL':
        return !row.semStock && !row.baixo;

      case 'BAIXO':
        return !row.semStock && row.baixo;

      case 'SEM_STOCK':
        return row.semStock;

      default:
        return true;
    }
  });

  const productsCount = rows.length;
  const stockBaixo = rows.filter((row) => !row.semStock && row.baixo).length;
  const semStock = rows.filter((row) => row.semStock).length;
  const valorInventario = rows.reduce(
    (sum, row) => sum + Number(row.valorInventario ?? 0),
    0
  );

  return {
    summary: {
      productsCount,
      stockBaixo,
      semStock,
      valorInventario,
    },
    rows,
  };
}, [stockReport, stockSearch, stockStatus]);


const stockReplenishment = useMemo(() => {

  const rows = filteredStockReport?.rows ?? [];

  return {
    products: rows.filter(
      (row) => Number(row.minimo ?? 0) > Number(row.quantidade ?? 0)
    ).length,
    units: rows.reduce(
      (sum, row) =>
        sum + Math.max(
          0,
          Number(row.minimo ?? 0) - Number(row.quantidade ?? 0)
        ),
      0
    ),
  };
}, [filteredStockReport]);


const stockFilterLabel = useMemo(() => {

  const statusLabel =
    stockStatus === 'BAIXO'
      ? 'Stock baixo'
      : stockStatus === 'SEM_STOCK'
        ? 'Sem stock'
        : stockStatus === 'NORMAL'
          ? 'Normal'
          : 'Todos';

  const searchLabel = stockSearch.trim();

  if (searchLabel) {
    return `${statusLabel} — pesquisa: ${searchLabel}`;
  }

  return statusLabel;
}, [stockSearch, stockStatus]);


// ==================================================
// FILTROS DOS MOVIMENTOS
// ==================================================

const filteredStockMovements = useMemo(() => {
  const rows = stockMovementsReport?.rows ?? [];
  const query = stockMovementSearch.trim().toLocaleLowerCase('pt-PT');

  return rows.filter((row) => {
    const typeMatches =
      stockMovementType === 'TODOS' ||
      (row.tipo ?? '').toLocaleUpperCase('pt-PT') === stockMovementType;

    if (!typeMatches) return false;
    if (!query) return true;

    return [row.produto, row.funcionario, row.motivo, row.loja, row.tipo]
      .filter(Boolean)
      .some((value) =>
        String(value).toLocaleLowerCase('pt-PT').includes(query)
      );
  });
}, [stockMovementsReport, stockMovementSearch, stockMovementType]);

const stockMovementTotals = useMemo(() => {
  const rows = filteredStockMovements;
  const sumType = (type: string) =>
    rows
      .filter((row) => (row.tipo ?? '').toLocaleUpperCase('pt-PT') === type)
      .reduce((sum, row) => sum + Number(row.quantidade ?? 0), 0);

  return {
    entries: sumType('ENTRADA'),
    exits: sumType('SAÍDA'),
    transfers: sumType('TRANSFERENCIA'),
    adjustments: sumType('AJUSTE'),
    total: rows.reduce((sum, row) => sum + Number(row.quantidade ?? 0), 0),
  };
}, [filteredStockMovements]);

const stockMovementTotalPages = Math.max(
  1,
  Math.ceil(filteredStockMovements.length / PAGE_SIZE)
);

const paginatedStockMovements = useMemo(() => {
  const start = (stockMovementPage - 1) * PAGE_SIZE;
  return filteredStockMovements.slice(start, start + PAGE_SIZE);
}, [filteredStockMovements, stockMovementPage]);

useEffect(() => {
  setStockMovementPage(1);
}, [stockMovementSearch, stockMovementType]);

useEffect(() => {
  if (stockMovementPage > stockMovementTotalPages) {
    setStockMovementPage(stockMovementTotalPages);
  }
}, [stockMovementPage, stockMovementTotalPages]);

const stockMovementFilterLabel = useMemo(() => {
  const parts: string[] = [];
  if (stockMovementType !== 'TODOS') parts.push(stockMovementType);
  if (stockMovementSearch.trim()) parts.push(`pesquisa: ${stockMovementSearch.trim()}`);
  return parts.length ? parts.join(' — ') : 'Todos';
}, [stockMovementSearch, stockMovementType]);

const handleStockMovementsPdf = useCallback(() => {
  if (!stockMovementsReport) return;

  printStockMovementsReportPdf(
    {
      ...stockMovementsReport,
      rows: filteredStockMovements,
      movementsCount: filteredStockMovements.length,
      totalQuantity: stockMovementTotals.total,
    },
    reportShopData,
    stockMovementFilterLabel,
    from,
    to
  );
}, [
  stockMovementsReport, filteredStockMovements,
  stockMovementTotals.total, reportShopData,
  stockMovementFilterLabel, from, to
]);

const handleStockMovementsExcel = useCallback(() => {
  if (!stockMovementsReport) return;

  try {
    exportStockMovementsReportExcel(
      {
        ...stockMovementsReport,
        rows: filteredStockMovements,
        movementsCount: filteredStockMovements.length,
        totalQuantity: stockMovementTotals.total,
      },
      reportShopData,
      stockMovementFilterLabel,
      from,
      to
    );

    showSuccessToast(
      'Relatório de movimentos de stock exportado com sucesso.'
    );
  } catch (error: unknown) {
    console.error(
      'Erro ao exportar movimentos de stock:',
      error
    );

    showErrorToast(
      'Não foi possível exportar o relatório de movimentos.'
    );
  }
}, [
  stockMovementsReport, filteredStockMovements,
  stockMovementTotals.total, reportShopData,
  stockMovementFilterLabel, from, to
]);

// ==================================================
// PDF STOCK
// ==================================================

const handleStockPdf = useCallback(
  () => {

    if (!filteredStockReport) {
      return;
    }

    printStockReportPdf(
      filteredStockReport,
      reportShopData,
      stockFilterLabel
    );
  },
  [filteredStockReport, reportShopData, stockFilterLabel]
);


// ==================================================
// EXCEL STOCK
// ==================================================

const handleStockExcel = useCallback(
  () => {

    if (!filteredStockReport) {
      return;
    }

    try {

      exportStockReportExcel(
        filteredStockReport,
        reportShopData,
        stockFilterLabel
      );

      showSuccessToast(
        'Relatório de stock exportado com sucesso.'
      );

    } catch (error: unknown) {

      console.error(
        'Erro ao exportar Excel de stock:',
        error
      );

      showErrorToast(
        'Não foi possível exportar o relatório de stock.'
      );
    }
  },
  [filteredStockReport, reportShopData, stockFilterLabel]
);


  // ==================================================
  // RESUMO VENDAS
  // ==================================================

  const renderSalesSummary =
    (
      summary: ReportSummary
    ) => {

      return (

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Facturas
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-3xl
                  font-black
                  text-slate-900
                "
              >
                {summary.salesCount}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Itens vendidos
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-3xl
                  font-black
                  text-slate-900
                "
              >
                {summary.itemsCount}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Impostos
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-2xl
                  font-black
                  text-slate-800
                "
              >
                {money(summary.tax)}
              </p>

            </CardContent>

          </Card>


          <Card
            className="
              border-emerald-200
              bg-emerald-50/40
            "
          >

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-emerald-600
                "
              >
                Total facturado
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-2xl
                  font-black
                  text-emerald-700
                "
              >
                {money(summary.total)}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Subtotal
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-xl
                  font-black
                "
              >
                {money(summary.subtotal)}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Descontos
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-xl
                  font-black
                "
              >
                {money(summary.discount)}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Ticket médio
              </CardTitle>

            </CardHeader>


            <CardContent>

              <p
                className="
                  text-xl
                  font-black
                "
              >
                {money(summary.averageTicket)}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader
              className="pb-2"
            >

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Melhor dia
              </CardTitle>

            </CardHeader>


            <CardContent>

              {bestDay ? (

                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >

                    {new Date(
                      bestDay.data
                    ).toLocaleDateString(
                      'pt-PT'
                    )}

                  </p>


                  <p
                    className="
                      text-lg
                      font-black
                      text-blue-700
                    "
                  >

                    {money(
                      bestDay.total
                    )}

                  </p>

                </div>

              ) : (

                <p
                  className="
                    text-xl
                    font-black
                  "
                >
                  -
                </p>

              )}

            </CardContent>

          </Card>

        </div>
      );
    };


  // ==================================================
  // EVOLUÇÃO DIÁRIA
  // ==================================================

  const renderDaily =
    () => {

      const data =
        salesReport?.daily ?? [];


      if (
        !data.length
      ) {

        return (

          <Card>

            <CardContent
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
                text-sm
                text-slate-400
              "
            >
              Não existem dados diários.
            </CardContent>

          </Card>
        );
      }


      const max =
        Math.max(
          ...data.map(
            item =>
              Number(
                item.total ?? 0
              )
          ),
          1
        );


      return (

        <Card>

          <CardHeader>

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <CardTitle>
                  Evolução diária
                </CardTitle>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Facturação por dia.
                </p>

              </div>


              <TrendingUp
                className="
                  h-5
                  w-5
                  text-blue-600
                "
              />

            </div>

          </CardHeader>


          <CardContent>

            <div
              className="
                max-h-[360px]
                space-y-3
                overflow-y-auto
                pr-2
              "
            >

              {data.map(
                item => {

                  const value =
                    Number(
                      item.total ?? 0
                    );


                  const percentage =
                    (
                      value /
                      max
                    ) *
                    100;


                  return (

                    <div
                      key={item.data}
                      className="space-y-1"
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className="
                              w-[80px]
                              text-xs
                              font-semibold
                              text-slate-600
                            "
                          >
                            {new Date(
                              item.data
                            ).toLocaleDateString(
                              'pt-PT'
                            )}
                          </span>


                          <span
                            className="
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {item.vendas} venda(s)
                          </span>

                        </div>


                        <span
                          className="
                            text-xs
                            font-black
                            text-slate-800
                          "
                        >
                          {money(value)}
                        </span>

                      </div>


                      <div
                        className="
                          h-2
                          overflow-hidden
                          rounded-full
                          bg-slate-100
                        "
                      >

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-blue-600
                          "
                          style={{
                            width:
                              `${Math.max(
                                percentage,
                                2
                              )}%`,
                          }}
                        />

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          </CardContent>

        </Card>
      );
    };


  // ==================================================
  // EVOLUÇÃO SEMANAL
  // ==================================================

  const renderWeekly =
    () => {

      const data =
        salesReport?.weekly ?? [];


      return (

        <Card>

          <CardHeader>

            <CardTitle>
              Evolução semanal
            </CardTitle>

          </CardHeader>


          <CardContent className="p-0">

            {data.length === 0 ? (

              <div
                className="
                  p-6
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                Não existem dados semanais.
              </div>

            ) : (

              <div
                className="
                  max-h-[320px]
                  overflow-y-auto
                "
              >

                <table
                  className="
                    w-full
                    text-sm
                  "
                >

                  <thead
                    className="
                      sticky
                      top-0
                      border-b
                      bg-slate-50
                    "
                  >

                    <tr>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Semana
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Período
                      </th>

                      <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                        Vendas
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                      divide-slate-100
                    "
                  >

                    {data.map(
                      item => (

                        <tr
                          key={item.semana}
                          className="
                            hover:bg-slate-50
                          "
                        >

                          <td
                            className="
                              p-3
                              font-bold
                              text-blue-600
                            "
                          >
                            {item.semana}
                          </td>


                          <td
                            className="
                              p-3
                              text-slate-600
                            "
                          >

                            {new Date(
                              item.inicio
                            ).toLocaleDateString(
                              'pt-PT'
                            )}

                            {' — '}

                            {new Date(
                              item.fim
                            ).toLocaleDateString(
                              'pt-PT'
                            )}

                          </td>


                          <td
                            className="
                              p-3
                              text-center
                              font-semibold
                            "
                          >
                            {item.vendas}
                          </td>


                          <td
                            className="
                              p-3
                              text-right
                              font-black
                            "
                          >
                            {money(
                              item.total
                            )}
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
      );
    };


  // ==================================================
  // EVOLUÇÃO MENSAL
  // ==================================================

  const renderMonthly =
    () => {

      const data =
        salesReport?.monthly ?? [];


      return (

        <Card>

          <CardHeader>

            <CardTitle>
              Evolução mensal
            </CardTitle>

          </CardHeader>


          <CardContent className="p-0">

            {data.length === 0 ? (

              <div
                className="
                  p-6
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                Não existem dados mensais.
              </div>

            ) : (

              <div
                className="
                  max-h-[320px]
                  overflow-y-auto
                "
              >

                <table
                  className="
                    w-full
                    text-sm
                  "
                >

                  <thead
                    className="
                      sticky
                      top-0
                      border-b
                      bg-slate-50
                    "
                  >

                    <tr>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Ano
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Mês
                      </th>

                      <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                        Vendas
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                      divide-slate-100
                    "
                  >

                    {data.map(
                      item => (

                        <tr
                          key={
                            `${item.ano}-${item.mes}`
                          }
                          className="
                            hover:bg-slate-50
                          "
                        >

                          <td className="p-3 font-semibold">
                            {item.ano}
                          </td>


                          <td className="p-3">

                            {String(
                              item.mes
                            ).padStart(
                              2,
                              '0'
                            )}

                          </td>


                          <td
                            className="
                              p-3
                              text-center
                              font-semibold
                            "
                          >
                            {item.vendas}
                          </td>


                          <td
                            className="
                              p-3
                              text-right
                              font-black
                            "
                          >
                            {money(
                              item.total
                            )}
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
      );
    };


  // ==================================================
  // TABELA DE VENDAS
  // ==================================================

  const renderSalesTable =
    () => {

      return (

        <Card
          className="
            overflow-hidden
            border-slate-200
            shadow-sm
          "
        >

          <CardHeader>

            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <CardTitle>
                  Detalhe das vendas
                </CardTitle>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Uma linha corresponde a uma factura.
                </p>

              </div>


              <Badge variant="secondary">

                {salesRows.length}{' '}
                documento(s)

              </Badge>

            </div>

          </CardHeader>


          <CardContent className="p-0">

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  min-w-[1250px]
                  text-sm
                "
              >

                <thead
                  className="
                    border-b
                    bg-slate-50
                  "
                >

                  <tr>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Factura
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Data
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Cliente
                    </th>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      Caixa
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Operador
                    </th>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      Qtd.
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Subtotal
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Imposto
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Desconto
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Total
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Pagamento
                    </th>

                  </tr>

                </thead>


                <tbody
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {paginatedSales.map(
                    row => (

                      <tr
                        key={row.saleId}
                        className="
                          transition-colors
                          hover:bg-slate-50
                        "
                      >

                        <td className="p-3">

                          <span
                            className="
                              font-bold
                              text-blue-600
                            "
                          >
                            {row.numeroFactura || '-'}
                          </span>

                        </td>


                        <td className="p-3">

                          {row.dataVenda
                            ? new Date(
                                row.dataVenda
                              ).toLocaleDateString(
                                'pt-PT'
                              )
                            : '-'}

                        </td>


                        <td className="p-3">

                          <div
                            className="
                              flex
                              flex-col
                            "
                          >

                            <span
                              className="
                                font-semibold
                                text-slate-700
                              "
                            >
                              {row.cliente ||
                                'Venda ao Público'}
                            </span>


                            {row.nifCliente && (

                              <span
                                className="
                                  text-[10px]
                                  text-slate-400
                                "
                              >
                                NIF: {row.nifCliente}
                              </span>

                            )}

                          </div>

                        </td>


                        <td
                          className="
                            p-3
                            text-center
                            font-semibold
                          "
                        >
                          {row.boxId ?? '-'}
                        </td>


                        <td className="p-3">

                          {row.operador || '-'}

                        </td>


                        <td
                          className="
                            p-3
                            text-center
                            font-bold
                          "
                        >
                          {row.quantidadeItens}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                          "
                        >
                          {money(
                            row.subtotal
                          )}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                          "
                        >
                          {money(
                            row.imposto
                          )}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                          "
                        >
                          {money(
                            row.desconto
                          )}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                            font-black
                          "
                        >
                          {money(
                            row.total
                          )}
                        </td>


                        <td className="p-3">

                          <Badge variant="outline">

                            {row.metodoPagamento ||
                              '-'}

                          </Badge>

                        </td>

                      </tr>

                    )
                  )}


                  {/* TOTAL DA PÁGINA */}

                  {paginatedSales.length > 0 && (

                    <tr
                      className="
                        border-t-2
                        bg-slate-50
                      "
                    >

                      <td
                        colSpan={5}
                        className="
                          p-3
                          text-right
                          text-[10px]
                          font-black
                          uppercase
                          text-slate-500
                        "
                      >
                        Total desta página
                      </td>


                      <td
                        className="
                          p-3
                          text-center
                          font-black
                        "
                      >
                        {salesPageTotals.items}
                      </td>


                      <td
                        className="
                          p-3
                          text-right
                          font-black
                        "
                      >
                        {money(
                          salesPageTotals.subtotal
                        )}
                      </td>


                      <td
                        className="
                          p-3
                          text-right
                          font-black
                        "
                      >
                        {money(
                          salesPageTotals.tax
                        )}
                      </td>


                      <td
                        className="
                          p-3
                          text-right
                          font-black
                        "
                      >
                        {money(
                          salesPageTotals.discount
                        )}
                      </td>


                      <td
                        className="
                          p-3
                          text-right
                          font-black
                          text-emerald-700
                        "
                      >
                        {money(
                          salesPageTotals.total
                        )}
                      </td>


                      <td />

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            {/* PAGINAÇÃO */}

            {salesRows.length > PAGE_SIZE && (

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  bg-white
                  p-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >

                  A mostrar{' '}

                  <strong>
                    {
                      (
                        (
                          currentPage - 1
                        ) *
                        PAGE_SIZE
                      ) + 1
                    }
                  </strong>

                  {' — '}

                  <strong>
                    {Math.min(
                      currentPage *
                        PAGE_SIZE,
                      salesRows.length
                    )}
                  </strong>

                  {' de '}

                  <strong>
                    {salesRows.length}
                  </strong>

                  {' documentos'}

                </p>


                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        page =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                  >
                    Anterior
                  </Button>


                  <span
                    className="
                      min-w-[120px]
                      text-center
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    Página{' '}
                    {currentPage}{' '}
                    de{' '}
                    {salesTotalPages}
                  </span>


                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      currentPage ===
                      salesTotalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        page =>
                          Math.min(
                            salesTotalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    Seguinte
                  </Button>

                </div>

              </div>

            )}

          </CardContent>

        </Card>
      );
    };


  // ==================================================
  // RELATÓRIO DE VENDAS
  // ==================================================

  const renderSalesReport =
    () => {

      if (loading) {

        return (

          <Card>

            <CardContent
              className="
                flex
                min-h-[350px]
                items-center
                justify-center
              "
            >

              <Loader2
                className="
                  h-8
                  w-8
                  animate-spin
                  text-blue-600
                "
              />

            </CardContent>

          </Card>

        );
      }


      if (!salesReport) {

        return (

          <Card>

            <CardContent
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
              "
            >

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Gere o relatório para visualizar os resultados.
              </p>

            </CardContent>

          </Card>
        );
      }


      return (

        <div className="space-y-6">

          {renderSalesSummary(
            salesReport.summary
          )}


          <div
            className="
              grid
              gap-6
              xl:grid-cols-2
            "
          >

            {renderDaily()}


            <Card>

              <CardHeader>

                <CardTitle>
                  Indicadores de análise
                </CardTitle>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Destaques do período seleccionado.
                </p>

              </CardHeader>


              <CardContent>

                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      py-3
                    "
                  >

                    <span className="text-sm text-slate-500">
                      Média diária
                    </span>

                    <strong>
                      {money(
                        averageDaily
                      )}
                    </strong>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      py-3
                    "
                  >

                    <span className="text-sm text-slate-500">
                      Melhor dia
                    </span>

                    <strong>

                      {bestDay
                        ? new Date(
                            bestDay.data
                          ).toLocaleDateString(
                            'pt-PT'
                          )
                        : '-'}

                    </strong>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      py-3
                    "
                  >

                    <span className="text-sm text-slate-500">
                      Facturação do melhor dia
                    </span>

                    <strong
                      className="text-blue-700"
                    >

                      {bestDay
                        ? money(
                            bestDay.total
                          )
                        : '-'}

                    </strong>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      py-3
                    "
                  >

                    <span className="text-sm text-slate-500">
                      Total de facturas
                    </span>

                    <strong>
                      {salesRows.length}
                    </strong>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      py-3
                    "
                  >

                    <span className="font-bold">
                      Total facturado
                    </span>

                    <strong
                      className="
                        text-lg
                        text-emerald-700
                      "
                    >
                      {money(
                        salesReport.summary.total
                      )}
                    </strong>

                  </div>

                </div>

              </CardContent>

            </Card>

          </div>


          <div
            className="
              grid
              gap-6
              xl:grid-cols-2
            "
          >

            {renderWeekly()}

            {renderMonthly()}

          </div>


          {renderSalesTable()}

        </div>
      );
    };


  // ==================================================
  // RELATÓRIO DE PAGAMENTOS
  // ==================================================

  const renderPaymentReport =
    () => {

      if (loading) {

        return (

          <Card>

            <CardContent
              className="
                flex
                min-h-[350px]
                items-center
                justify-center
              "
            >

              <Loader2
                className="
                  h-8
                  w-8
                  animate-spin
                  text-blue-600
                "
              />

            </CardContent>

          </Card>
        );
      }


      if (!paymentReport) {

        return (

          <Card>

            <CardContent
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
              "
            >

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Gere o relatório para visualizar os resultados.
              </p>

            </CardContent>

          </Card>
        );
      }


      const summary =
        paymentReport.summary;


      const rows =
        paymentReport.rows ?? [];


      const max =
        Math.max(
          ...rows.map(
            row =>
              Number(
                row.total ?? 0
              )
          ),
          1
        );


      return (

        <div className="space-y-6">

          {/* ==================================================
              RESUMO
          ================================================== */}

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <Card>

              <CardHeader className="pb-2">

                <CardTitle
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    text-slate-400
                  "
                >
                  Vendas
                </CardTitle>

              </CardHeader>


              <CardContent>

                <p
                  className="
                    text-3xl
                    font-black
                    text-slate-900
                  "
                >
                  {summary.salesCount}
                </p>

              </CardContent>

            </Card>


            <Card
              className="
                border-emerald-200
                bg-emerald-50/40
              "
            >

              <CardHeader className="pb-2">

                <CardTitle
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    text-emerald-600
                  "
                >
                  Total recebido
                </CardTitle>

              </CardHeader>


              <CardContent>

                <p
                  className="
                    text-2xl
                    font-black
                    text-emerald-700
                  "
                >
                  {money(
                    summary.total
                  )}
                </p>

              </CardContent>

            </Card>


            <Card>

              <CardHeader className="pb-2">

                <CardTitle
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    text-slate-400
                  "
                >
                  Ticket médio
                </CardTitle>

              </CardHeader>


              <CardContent>

                <p
                  className="
                    text-2xl
                    font-black
                  "
                >
                  {money(
                    summary.averageTicket
                  )}
                </p>

              </CardContent>

            </Card>


            <Card>

              <CardHeader className="pb-2">

                <CardTitle
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    text-slate-400
                  "
                >
                  Método principal
                </CardTitle>

              </CardHeader>


              <CardContent>

                <p
                  className="
                    text-xl
                    font-black
                    text-blue-700
                  "
                >
                  {summary.mainMethod ||
                    '-'}
                </p>

              </CardContent>

            </Card>

          </div>


          {/* ==================================================
              DISTRIBUIÇÃO
          ================================================== */}

          <Card>

            <CardHeader>

              <CardTitle>
                Distribuição por método de pagamento
              </CardTitle>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Valores recebidos no período seleccionado.
              </p>

            </CardHeader>


            <CardContent>

              {rows.length === 0 ? (

                <div
                  className="
                    py-10
                    text-center
                    text-sm
                    text-slate-400
                  "
                >
                  Não existem pagamentos no período seleccionado.
                </div>

              ) : (

                <div className="space-y-6">

                  {rows.map(
                    row => {

                      const total =
                        Number(
                          row.total ?? 0
                        );


                      const percentage =
                        Number(
                          row.percentagem ?? 0
                        );


                      const barWidth =
                        (
                          total /
                          max
                        ) *
                        100;


                      return (

                        <div
                          key={row.metodo}
                          className="space-y-2"
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <span
                                className="
                                  font-bold
                                  text-slate-700
                                "
                              >
                                {row.metodo}
                              </span>


                              <Badge
                                variant="outline"
                              >
                                {row.vendas}{' '}
                                vendas
                              </Badge>

                            </div>


                            <div
                              className="
                                text-right
                              "
                            >

                              <p
                                className="
                                  font-black
                                  text-slate-900
                                "
                              >
                                {money(total)}
                              </p>


                              <p
                                className="
                                  text-[10px]
                                  text-slate-400
                                "
                              >
                                {percentage.toFixed(
                                  2
                                )}%
                              </p>

                            </div>

                          </div>


                          <div
                            className="
                              h-3
                              overflow-hidden
                              rounded-full
                              bg-slate-100
                            "
                          >

                            <div
                              className="
                                h-full
                                rounded-full
                                bg-blue-600
                                transition-all
                              "
                              style={{
                                width:
                                  `${Math.max(
                                    barWidth,
                                    2
                                  )}%`,
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </CardContent>

          </Card>


          {/* ==================================================
              TABELA
          ================================================== */}

          <Card>

            <CardHeader>

              <CardTitle>
                Detalhe dos pagamentos
              </CardTitle>

            </CardHeader>


            <CardContent className="p-0">

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    text-sm
                  "
                >

                  <thead
                    className="
                      border-b
                      bg-slate-50
                    "
                  >

                    <tr>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Método
                      </th>

                      <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                        Vendas
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Percentagem
                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                      divide-slate-100
                    "
                  >

                    {rows.map(
                      row => (

                        <tr
                          key={row.metodo}
                          className="
                            hover:bg-slate-50
                          "
                        >

                          <td
                            className="
                              p-3
                              font-bold
                              text-slate-700
                            "
                          >
                            {row.metodo}
                          </td>


                          <td
                            className="
                              p-3
                              text-center
                              font-semibold
                            "
                          >
                            {row.vendas}
                          </td>


                          <td
                            className="
                              p-3
                              text-right
                              font-black
                            "
                          >
                            {money(
                              row.total
                            )}
                          </td>


                          <td
                            className="
                              p-3
                              text-right
                              font-semibold
                            "
                          >
                            {Number(
                              row.percentagem ?? 0
                            ).toFixed(
                              2
                            )}%
                          </td>

                        </tr>

                      )
                    )}


                    {rows.length > 0 && (

                      <tr
                        className="
                          border-t-2
                          bg-slate-50
                        "
                      >

                        <td
                          className="
                            p-3
                            text-right
                            font-black
                            uppercase
                            text-[10px]
                            text-slate-500
                          "
                        >
                          Total
                        </td>


                        <td
                          className="
                            p-3
                            text-center
                            font-black
                          "
                        >
                          {summary.salesCount}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                            font-black
                            text-emerald-700
                          "
                        >
                          {money(
                            summary.total
                          )}
                        </td>


                        <td
                          className="
                            p-3
                            text-right
                            font-black
                          "
                        >
                          100,00%
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </CardContent>

          </Card>

        </div>
      );
    };


  // ==================================================
  // RELATÓRIO DE PRODUTOS
  // ==================================================

  const renderProductsReport = () => {

    if (loading) {
      return (
        <Card>
          <CardContent className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      );
    }

    if (!productsReport) {
      return (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center text-center">
            <p className="text-sm text-slate-500">
              Gere o relatório para visualizar os resultados.
            </p>
          </CardContent>
        </Card>
      );
    }

    const summary = productsReport.summary;
    const rows = productsReport.rows ?? [];

    const topByQuantity = rows.length > 0 ? rows[0] : null;
    const topByRevenue = rows.length > 0
      ? [...rows].sort((a, b) => Number(b.total ?? 0) - Number(a.total ?? 0))[0]
      : null;

    return (
      <div className="space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Produtos vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900">
                {summary.productsCount ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Unidades vendidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900">
                {summary.itemsCount ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Subtotal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-slate-800">
                {money(summary.subtotal)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-600">
                Facturação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-emerald-700">
                {money(summary.total)}
              </p>
            </CardContent>
          </Card>
        </div>

        {rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Destaques</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Principais resultados do período seleccionado.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-[10px] font-black uppercase text-blue-500">
                    Mais vendido
                  </p>
                  <p className="mt-1 font-black text-blue-900">
                    {topByQuantity?.nome || '-'}
                  </p>
                  <p className="mt-1 text-sm font-bold text-blue-700">
                    {topByQuantity?.quantidade ?? 0} unidade(s)
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-black uppercase text-emerald-500">
                    Maior facturação
                  </p>
                  <p className="mt-1 font-black text-emerald-900">
                    {topByRevenue?.nome || '-'}
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {money(topByRevenue?.total)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Média por produto
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-800">
                    {money(
                      Number(summary.productsCount ?? 0) > 0
                        ? Number(summary.total ?? 0) / Number(summary.productsCount)
                        : 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Produtos mais vendidos</CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Cada linha representa um produto vendido no período.
                </p>
              </div>
              <Badge variant="secondary">
                {rows.length} produto(s)
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">#</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Produto</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">Quantidade</th>
                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">Subtotal</th>
                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">Facturação</th>
                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-sm text-slate-400">
                        Não existem produtos vendidos neste período.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const percentage = Number(summary.total ?? 0) > 0
                        ? (Number(row.total ?? 0) / Number(summary.total ?? 0)) * 100
                        : 0;

                      return (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="p-3 text-center font-black text-blue-600">
                            {index + 1}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {row.nome || '-'}
                          </td>
                          <td className="p-3 text-center font-black">
                            {row.quantidade ?? 0}
                          </td>
                          <td className="p-3 text-right">
                            {money(row.subtotal)}
                          </td>
                          <td className="p-3 text-right font-black">
                            {money(row.total)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {percentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {rows.length > 0 && (
                    <tr className="border-t-2 bg-slate-50">
                      <td colSpan={2} className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total
                      </td>
                      <td className="p-3 text-center font-black">
                        {summary.itemsCount ?? 0}
                      </td>
                      <td className="p-3 text-right font-black">
                        {money(summary.subtotal)}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700">
                        {money(summary.total)}
                      </td>
                      <td className="p-3 text-right font-black">
                        100,00%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };


  // ==================================================
  // RELATÓRIO DE STOCK
  // ==================================================

  const renderStockReport = () => {

    if (loading) {
      return (
        <Card>
          <CardContent className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      );
    }

    if (!stockReport || !filteredStockReport) {
      return (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center text-center">
            <p className="text-sm text-slate-500">
              Não foi possível carregar o relatório de stock.
            </p>
          </CardContent>
        </Card>
      );
    }

    const fullSummary = stockReport.summary;
    const summary = filteredStockReport.summary;
    const rows = filteredStockReport.rows ?? [];

    return (
      <div className="space-y-6">

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Posição actual do stock
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {reportShopName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => void loadStock()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!filteredStockReport || loading}
                  onClick={handleStockPdf}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  PDF / Imprimir
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!filteredStockReport || loading}
                  onClick={handleStockExcel}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">
                {summary.productsCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                de {fullSummary.productsCount} no stock
              </p>
            </CardContent>
          </Card>

          <Card
            className={summary.stockBaixo > 0 ? 'border-amber-200 bg-amber-50/40' : ''}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Stock baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-black ${summary.stockBaixo > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {summary.stockBaixo}
              </p>
            </CardContent>
          </Card>

          <Card
            className={summary.semStock > 0 ? 'border-red-200 bg-red-50/40' : ''}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Sem stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-black ${summary.semStock > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                {summary.semStock}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-600">
                Valor do inventário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-emerald-700">
                {money(summary.valorInventario)}
              </p>
            </CardContent>
          </Card>

        </div>

        {stockReplenishment.products > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-amber-900">
                  Reposição recomendada
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  {stockReplenishment.products} produto(s) estão abaixo do stock mínimo, totalizando {stockReplenishment.units} unidade(s) para repor até ao mínimo definido.
                </p>
              </div>

              <Badge className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-100">
                Lista de reposição
              </Badge>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Pesquisar produto ou código
                </label>
                <Input
                  value={stockSearch}
                  onChange={(event) => {
                    setStockSearch(event.target.value);
                  }}
                  placeholder="Ex.: Vela de Baptismo ou 34568990"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Estado
                </label>
                <select
                  value={stockStatus}
                  onChange={(event) => {
                    setStockStatus(
                      event.target.value as 'TODOS' | 'NORMAL' | 'BAIXO' | 'SEM_STOCK'
                    );
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="TODOS">Todos</option>
                  <option value="NORMAL">Normal</option>
                  <option value="BAIXO">Stock baixo</option>
                  <option value="SEM_STOCK">Sem stock</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStockSearch('');
                    setStockStatus('TODOS');
                  }}
                  disabled={!stockSearch && stockStatus === 'TODOS'}
                  className="w-full lg:w-auto"
                >
                  Limpar
                </Button>
              </div>

            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge variant="secondary">
                {rows.length} resultado(s)
              </Badge>
              <span>Filtro: {stockFilterLabel}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Stock actual</CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Consulte, pesquise e filtre o stock disponível por produto.
                </p>
              </div>
              <Badge variant="secondary">
                {rows.length} produto(s)
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Produto</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Código</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">Quantidade</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">Mínimo</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">A repor</th>
                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">Preço</th>
                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">Inventário</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">Estado</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-sm text-slate-400">
                        Não existem produtos para os filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const toReplenish = Math.max(
                        0,
                        Number(row.minimo ?? 0) - Number(row.quantidade ?? 0)
                      );

                      return (
                        <tr
                          key={`${row.productId}-${row.codigoBarra ?? ''}`}
                          className="hover:bg-slate-50"
                        >

                          <td className="p-3 font-semibold text-slate-700">
                            {row.produto}
                          </td>

                          <td className="p-3 text-slate-500">
                            {row.codigoBarra || '-'}
                          </td>

                          <td className={`p-3 text-center font-black ${row.semStock ? 'text-red-700' : row.baixo ? 'text-amber-700' : 'text-slate-900'}`}>
                            {row.quantidade}
                          </td>

                          <td className="p-3 text-center text-slate-600">
                            {row.minimo}
                          </td>

                          <td className={`p-3 text-center font-black ${toReplenish > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {toReplenish}
                          </td>

                          <td className="p-3 text-right">
                            {money(row.preco)}
                          </td>

                          <td className="p-3 text-right font-black">
                            {money(row.valorInventario)}
                          </td>

                          <td className="p-3 text-center">
                            {row.semStock ? (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                Sem stock
                              </Badge>
                            ) : row.baixo ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                Stock baixo
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                Normal
                              </Badge>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}

                  {rows.length > 0 && (
                    <tr className="border-t-2 bg-slate-50">
                      <td colSpan={2} className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total
                      </td>
                      <td className="p-3 text-center font-black">
                        {rows.reduce((sum, row) => sum + Number(row.quantidade ?? 0), 0)}
                      </td>
                      <td />
                      <td className="p-3 text-center font-black text-amber-700">
                        {stockReplenishment.units}
                      </td>
                      <td />
                      <td className="p-3 text-right font-black text-emerald-700">
                        {money(summary.valorInventario)}
                      </td>
                      <td />
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };


  // ==================================================
  // RELATÓRIO DE MOVIMENTOS DE STOCK
  // ==================================================

  const renderStockMovementsReport = () => {

    if (loading) {
      return (
        <Card>
          <CardContent className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      );
    }

    if (!stockMovementsReport) {
      return (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center text-center">
            <p className="text-sm text-slate-500">
              Gere o relatório para visualizar os movimentos de stock.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">Movimentos</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-black">{filteredStockMovements.length}</p></CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-600">Entradas</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-black text-emerald-700">+{stockMovementTotals.entries}</p></CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-red-600">Saídas</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-black text-red-700">{stockMovementTotals.exits}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">Quantidade movimentada</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-black">{stockMovementTotals.total}</p></CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Detalhe dos movimentos</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Cada linha representa um movimento registado no stock.</p>
              </div>
              <Badge variant="secondary">{filteredStockMovements.length} movimento(s)</Badge>
            </div>
          </CardHeader>

          <CardContent className="border-y p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Input
                value={stockMovementSearch}
                onChange={(e) => setStockMovementSearch(e.target.value)}
                placeholder="Pesquisar produto, funcionário, motivo ou loja..."
              />

              <select
                value={stockMovementType}
                onChange={(e) => setStockMovementType(e.target.value as typeof stockMovementType)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos os movimentos</option>
                <option value="ENTRADA">Entradas</option>
                <option value="SAÍDA">Saídas</option>
                <option value="TRANSFERENCIA">Transferências</option>
                <option value="AJUSTE">Ajustes</option>
              </select>

              <Button
                type="button"
                variant="outline"
                disabled={!stockMovementSearch && stockMovementType === 'TODOS'}
                onClick={() => { setStockMovementSearch(''); setStockMovementType('TODOS'); }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Data</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Produto</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Tipo</th>
                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">Quantidade</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Motivo</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Funcionário</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">Loja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStockMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-sm text-slate-400">
                        Não existem movimentos para os filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedStockMovements.map((row) => {
                      const tipo = row.tipo?.toLocaleUpperCase('pt-PT') ?? 'N/D';
                      const badgeClass =
                        tipo === 'ENTRADA'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : tipo === 'SAÍDA'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : tipo === 'AJUSTE'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100';

                      return (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="p-3 whitespace-nowrap">{row.data ? new Date(row.data).toLocaleString('pt-PT') : '-'}</td>
                          <td className="p-3 font-semibold text-slate-700">{row.produto || '-'}</td>
                          <td className="p-3"><Badge className={badgeClass}>{tipo}</Badge></td>
                          <td className="p-3 text-center font-black">{row.quantidade}</td>
                          <td className="p-3 text-slate-600">{row.motivo || '-'}</td>
                          <td className="p-3 text-slate-600">{row.funcionario || '-'}</td>
                          <td className="p-3 text-slate-600">{row.loja || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredStockMovements.length > 0 && (
              <div className="flex flex-col gap-3 border-t bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Mostrando {((stockMovementPage - 1) * PAGE_SIZE) + 1}–{Math.min(stockMovementPage * PAGE_SIZE, filteredStockMovements.length)} de {filteredStockMovements.length}
                </p>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={stockMovementPage <= 1} onClick={() => setStockMovementPage((page) => Math.max(1, page - 1))}>
                    Anterior
                  </Button>
                  <Badge variant="secondary">{stockMovementPage} / {stockMovementTotalPages}</Badge>
                  <Button type="button" variant="outline" size="sm" disabled={stockMovementPage >= stockMovementTotalPages} onClick={() => setStockMovementPage((page) => Math.min(stockMovementTotalPages, page + 1))}>
                    Seguinte
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  // ==================================================
  // FUNCIONÁRIOS — PESQUISA E PAGINAÇÃO
  // ==================================================

const employeeRows = useMemo(
  () => employeeReport?.rows ?? [],
  [employeeReport?.rows]
);
  const filteredEmployees =
    useMemo(
      () => {

        const query =
          employeeSearch
            .trim()
            .toLocaleLowerCase('pt-PT');

        if (!query) {
          return employeeRows;
        }

        return employeeRows.filter(
          row =>
            String(row.nome ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
        );

      },
      [
        employeeRows,
        employeeSearch,
      ]
    );

  const employeeTotalPages =
    Math.max(
      1,
      Math.ceil(
        filteredEmployees.length /
        PAGE_SIZE
      )
    );

  const paginatedEmployees =
    useMemo(
      () => {

        const start =
          (employeePage - 1) *
          PAGE_SIZE;

        return filteredEmployees.slice(
          start,
          start + PAGE_SIZE
        );

      },
      [
        filteredEmployees,
        employeePage,
      ]
    );

  useEffect(
    () => {

      if (
        reportKey === 'employees'
        && employeePage >
           employeeTotalPages
      ) {
        setEmployeePage(
          employeeTotalPages
        );
      }

    },
    [
      reportKey,
      employeePage,
      employeeTotalPages,
    ]
  );


  // ==================================================
  // PDF / EXCEL FUNCIONÁRIOS
  // ==================================================

  const handleEmployeePdf =
    useCallback(
      () => {

        if (!employeeReport) {
          return;
        }

        printEmployeeReportPdf(
          employeeReport,
          from,
          to,
          reportShopData
        );

      },
      [
        employeeReport,
        from,
        to,
        reportShopData,
      ]
    );


  const handleEmployeeExcel =
    useCallback(
      () => {

        if (!employeeReport) {
          return;
        }

        try {

          exportEmployeeReportExcel(
            employeeReport,
            from,
            to,
            reportShopData
          );

          showSuccessToast(
            'Relatório de funcionários exportado com sucesso.'
          );

        } catch (error: unknown) {

          console.error(
            'Erro ao exportar Excel de funcionários:',
            error
          );

          showErrorToast(
            'Não foi possível exportar o relatório de funcionários.'
          );
        }

      },
      [
        employeeReport,
        from,
        to,
        reportShopData,
      ]
    );


  // ==================================================
  // RELATÓRIO DE FUNCIONÁRIOS
  // ==================================================

  const renderEmployeeReport = () => {

    if (loading) {
      return (
        <Card>
          <CardContent className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      );
    }

    if (!employeeReport) {
      return (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center text-center">
            <p className="text-sm text-slate-500">
              Gere o relatório para visualizar os resultados.
            </p>
          </CardContent>
        </Card>
      );
    }

    const summary =
      employeeReport.summary;

    const topEmployee =
      [...employeeRows].sort(
        (a, b) =>
          Number(b.total ?? 0) -
          Number(a.total ?? 0)
      )[0];

    return (
      <div className="space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">
                {employeeRows.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">
                {summary.salesCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                Ticket médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black">
                {money(summary.averageTicket)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-600">
                Total facturado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-emerald-700">
                {money(summary.total)}
              </p>
            </CardContent>
          </Card>

        </div>

        {topEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Destaque do período</CardTitle>
              <p className="text-xs text-slate-500">
                Funcionário com maior facturação no período seleccionado.
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-black uppercase text-emerald-600">
                    Maior facturação
                  </p>
                  <p className="mt-1 font-black text-emerald-900">
                    {topEmployee.nome}
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {money(topEmployee.total)}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-[10px] font-black uppercase text-blue-600">
                    Vendas
                  </p>
                  <p className="mt-1 text-xl font-black text-blue-900">
                    {topEmployee.vendas}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Ticket médio
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-800">
                    {money(topEmployee.ticketMedio)}
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

        <Card>

          <CardContent className="p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex-1">

                <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">
                  Pesquisar funcionário
                </label>

                <Input
                  value={employeeSearch}
                  onChange={(event) => {
                    setEmployeeSearch(event.target.value);
                    setEmployeePage(1);
                  }}
                  placeholder="Nome do funcionário..."
                />

              </div>

              <p className="text-xs text-slate-500">
                {filteredEmployees.length} funcionário(s)
              </p>

            </div>

          </CardContent>

        </Card>


        <Card className="overflow-hidden border-slate-200 shadow-sm">

          <CardHeader>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <CardTitle>Vendas por funcionário</CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Número de vendas e facturação por operador de caixa.
                </p>
              </div>

              <Badge variant="secondary">
                {filteredEmployees.length} funcionário(s)
              </Badge>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-sm">

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      #
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Funcionário
                    </th>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      Vendas
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Facturação
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Ticket médio
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      % Total
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {paginatedEmployees.length === 0 ? (

                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-sm text-slate-400"
                      >
                        Não existem funcionários para os filtros seleccionados.
                      </td>
                    </tr>

                  ) : (

                    paginatedEmployees.map(
                      (row, index) => {

                        const percentage =
                          Number(summary.total ?? 0) > 0
                            ? (
                                Number(row.total ?? 0) /
                                Number(summary.total ?? 0)
                              ) * 100
                            : 0;

                        const position =
                          (
                            (employeePage - 1) *
                            PAGE_SIZE
                          ) + index + 1;

                        return (

                          <tr
                            key={row.id}
                            className="hover:bg-slate-50"
                          >

                            <td className="p-3 text-center font-black text-blue-600">
                              {position}
                            </td>

                            <td className="p-3 font-bold text-slate-700">
                              {row.nome}
                            </td>

                            <td className="p-3 text-center font-black">
                              {row.vendas}
                            </td>

                            <td className="p-3 text-right font-black">
                              {money(row.total)}
                            </td>

                            <td className="p-3 text-right">
                              {money(row.ticketMedio)}
                            </td>

                            <td className="p-3 text-right font-semibold">
                              {percentage.toFixed(2)}%
                            </td>

                          </tr>

                        );
                      }
                    )

                  )}

                </tbody>

              </table>

            </div>


            {filteredEmployees.length > PAGE_SIZE && (

              <div className="flex flex-col gap-3 border-t bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-500">
                  A mostrar{' '}
                  <strong>
                    {(
                      (employeePage - 1) *
                      PAGE_SIZE
                    ) + 1}
                  </strong>
                  {' — '}
                  <strong>
                    {Math.min(
                      employeePage *
                        PAGE_SIZE,
                      filteredEmployees.length
                    )}
                  </strong>
                  {' de '}
                  <strong>
                    {filteredEmployees.length}
                  </strong>
                  {' funcionários'}
                </p>

                <div className="flex items-center gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={employeePage === 1}
                    onClick={() =>
                      setEmployeePage(
                        page =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                  >
                    Anterior
                  </Button>

                  <Badge variant="secondary">
                    {employeePage} / {employeeTotalPages}
                  </Badge>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      employeePage ===
                      employeeTotalPages
                    }
                    onClick={() =>
                      setEmployeePage(
                        page =>
                          Math.min(
                            employeeTotalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    Seguinte
                  </Button>

                </div>

              </div>

            )}

          </CardContent>

        </Card>

      </div>
    );
  };


  // ==================================================
  // CAIXAS — PESQUISA E PAGINAÇÃO
  // ==================================================

const boxRows = useMemo(
  () => boxReport?.rows ?? [],
  [boxReport?.rows]
);

  const filteredBoxes =
    useMemo(
      () => {

        const query =
          boxSearch
            .trim()
            .toLocaleLowerCase('pt-PT');

        if (!query) {
          return boxRows;
        }

        return boxRows.filter(
          row =>
            String(row.id ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
            ||
            String(row.status ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
            ||
            String(row.openedBy ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
            ||
            String(row.closedBy ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
            ||
            String(row.shop ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
        );

      },
      [
        boxRows,
        boxSearch,
      ]
    );

  const boxTotalPages =
    Math.max(
      1,
      Math.ceil(
        filteredBoxes.length /
        PAGE_SIZE
      )
    );

  const paginatedBoxes =
    useMemo(
      () => {

        const start =
          (boxPage - 1) *
          PAGE_SIZE;

        return filteredBoxes.slice(
          start,
          start + PAGE_SIZE
        );

      },
      [
        filteredBoxes,
        boxPage,
      ]
    );

  useEffect(
    () => {

      if (
        reportKey === 'boxes'
        && boxPage > boxTotalPages
      ) {

        setBoxPage(
          boxTotalPages
        );

      }

    },
    [
      reportKey,
      boxPage,
      boxTotalPages,
    ]
  );


  // ==================================================
  // PDF / EXCEL CAIXAS
  // ==================================================

  const handleBoxPdf =
    useCallback(
      () => {

        if (!boxReport) {
          return;
        }

        printBoxReportPdf(
          boxReport,
          from,
          to,
          reportShopData
        );

      },
      [
        boxReport,
        from,
        to,
        reportShopData,
      ]
    );


  const handleBoxExcel =
    useCallback(
      () => {

        if (!boxReport) {
          return;
        }

        try {

          exportBoxReportExcel(
            boxReport,
            from,
            to,
            reportShopData
          );

          showSuccessToast(
            'Relatório de caixas exportado com sucesso.'
          );

        } catch (error: unknown) {

          console.error(
            'Erro ao exportar Excel de caixas:',
            error
          );

          showErrorToast(
            'Não foi possível exportar o relatório de caixas.'
          );

        }

      },
      [
        boxReport,
        from,
        to,
        reportShopData,
      ]
    );


  // ==================================================
  // RELATÓRIO DE CAIXAS
  // ==================================================

  const renderBoxReport = () => {

    if (loading) {

      return (
        <Card>

          <CardContent
            className="
              flex
              min-h-[350px]
              items-center
              justify-center
            "
          >

            <Loader2
              className="
                h-8
                w-8
                animate-spin
                text-blue-600
              "
            />

          </CardContent>

        </Card>
      );

    }


    if (!boxReport) {

      return (
        <Card>

          <CardContent
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
              text-center
            "
          >

            <p className="text-sm text-slate-500">
              Gere o relatório para visualizar os resultados.
            </p>

          </CardContent>

        </Card>
      );

    }


    const totalSales =
      Number(
        boxReport.totalSales ?? 0
      );


    const closedBoxes =
      boxRows.filter(
        row =>
          String(
            row.status ?? ''
          ).toLocaleUpperCase('pt-PT')
            .includes('FECH')
      ).length;


    const totalDifference =
      boxRows.reduce(
        (
          sum,
          row
        ) =>
          sum +
          Number(
            row.difference ?? 0
          ),
        0
      );


    const bestBox =
      [...boxRows].sort(
        (
          a,
          b
        ) =>
          Number(
            b.salesTotal ?? 0
          ) -
          Number(
            a.salesTotal ?? 0
          )
      )[0];


    return (

      <div className="space-y-6">

        {/* RESUMO */}

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <Card>

            <CardHeader className="pb-2">

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Caixas
              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-3xl font-black">
                {boxReport.boxesCount}
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader className="pb-2">

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Vendas
              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-3xl font-black">
                {totalSales.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}Db
              </p>

            </CardContent>

          </Card>


          <Card>

            <CardHeader className="pb-2">

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-400
                "
              >
                Caixas fechados
              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-3xl font-black">
                {closedBoxes}
              </p>

            </CardContent>

          </Card>


          <Card
            className={
              totalDifference < 0
                ? 'border-red-200 bg-red-50/40'
                : totalDifference > 0
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-emerald-200 bg-emerald-50/40'
            }
          >

            <CardHeader className="pb-2">

              <CardTitle
                className="
                  text-[10px]
                  font-black
                  uppercase
                  text-slate-500
                "
              >
                Diferença total
              </CardTitle>

            </CardHeader>

            <CardContent>

              <p
                className={`
                  text-2xl
                  font-black
                  ${
                    totalDifference < 0
                      ? 'text-red-700'
                      : totalDifference > 0
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }
                `}
              >
                {money(totalDifference)}
              </p>

            </CardContent>

          </Card>

        </div>


        {/* DESTAQUE */}

        {bestBox && (

          <Card>

            <CardHeader>

              <CardTitle>
                Destaque do período
              </CardTitle>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Caixa com maior volume de vendas.
              </p>

            </CardHeader>


            <CardContent>

              <div
                className="
                  grid
                  gap-4
                  md:grid-cols-4
                "
              >

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-[10px] font-black uppercase text-blue-600">
                    Caixa
                  </p>

                  <p className="mt-1 text-xl font-black text-blue-900">
                    #{bestBox.id}
                  </p>

                </div>


                <div className="rounded-xl bg-emerald-50 p-4">

                  <p className="text-[10px] font-black uppercase text-emerald-600">
                    Vendas
                  </p>

                  <p className="mt-1 text-xl font-black text-emerald-900">
                    {money(bestBox.salesTotal)}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-100 p-4">

                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Operador
                  </p>

                  <p className="mt-1 font-black text-slate-800">
                    {bestBox.openedBy || '-'}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-100 p-4">

                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Estado
                  </p>

                  <p className="mt-1 font-black text-slate-800">
                    {bestBox.status || '-'}
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        )}


        {/* PESQUISA */}

        <Card>

          <CardContent className="p-4">

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >

              <div className="flex-1">

                <label
                  className="
                    mb-1
                    block
                    text-[10px]
                    font-black
                    uppercase
                    text-slate-400
                  "
                >
                  Pesquisar caixa
                </label>

                <Input
                  value={boxSearch}
                  onChange={(event) => {
                    setBoxSearch(
                      event.target.value
                    );
                    setBoxPage(1);
                  }}
                  placeholder="Número, operador, estado ou loja..."
                />

              </div>


              <p className="text-xs text-slate-500">
                {filteredBoxes.length} caixa(s)
              </p>

            </div>

          </CardContent>

        </Card>


        {/* TABELA */}

        <Card
          className="
            overflow-hidden
            border-slate-200
            shadow-sm
          "
        >

          <CardHeader>

            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <CardTitle>
                  Relatório de caixas
                </CardTitle>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Abertura, fecho, vendas e diferença de cada caixa.
                </p>

              </div>

              <Badge variant="secondary">
                {filteredBoxes.length} caixa(s)
              </Badge>

            </div>

          </CardHeader>


          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table
                className="
                  w-full
                  min-w-[1200px]
                  text-sm
                "
              >

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      Caixa
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Abertura
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Fecho
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Aberto por
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Fechado por
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Inicial
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Vendas
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Esperado
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Final
                    </th>

                    <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                      Diferença
                    </th>

                    <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                      Nº vendas
                    </th>

                    <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                      Estado
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {paginatedBoxes.length === 0 ? (

                    <tr>

                      <td
                        colSpan={12}
                        className="p-10 text-center text-sm text-slate-400"
                      >
                        Não existem caixas para os filtros seleccionados.
                      </td>

                    </tr>

                  ) : (

                    paginatedBoxes.map(
                      row => (

                        <tr
                          key={row.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="p-3 text-center font-black text-blue-600">
                            #{row.id}
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            {row.openingDate
                              ? new Date(
                                  row.openingDate
                                ).toLocaleString('pt-PT')
                              : '-'}
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            {row.closingDate
                              ? new Date(
                                  row.closingDate
                                ).toLocaleString('pt-PT')
                              : '-'}
                          </td>

                          <td className="p-3 font-semibold">
                            {row.openedBy || '-'}
                          </td>

                          <td className="p-3 font-semibold">
                            {row.closedBy || '-'}
                          </td>

                          <td className="p-3 text-right">
                            {money(row.openingValue)}
                          </td>

                          <td className="p-3 text-right font-black">
                            {money(row.salesTotal)}
                          </td>

                          <td className="p-3 text-right">
                            {money(row.expectedClosingValue)}
                          </td>

                          <td className="p-3 text-right">
                            {money(row.closingValue)}
                          </td>

                          <td
                            className={`
                              p-3
                              text-right
                              font-black
                              ${
                                Number(row.difference ?? 0) < 0
                                  ? 'text-red-700'
                                  : Number(row.difference ?? 0) > 0
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                              }
                            `}
                          >
                            {money(row.difference)}
                          </td>

                          <td className="p-3 text-center font-black">
                            {row.salesCount}
                          </td>

                          <td className="p-3">
                            <Badge variant="outline">
                              {row.status || 'N/D'}
                            </Badge>
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {filteredBoxes.length > PAGE_SIZE && (

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  bg-slate-50
                  p-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <p className="text-xs text-slate-500">

                  A mostrar{' '}

                  <strong>
                    {
                      (
                        (boxPage - 1) *
                        PAGE_SIZE
                      ) + 1
                    }
                  </strong>

                  {' — '}

                  <strong>
                    {Math.min(
                      boxPage *
                        PAGE_SIZE,
                      filteredBoxes.length
                    )}
                  </strong>

                  {' de '}

                  <strong>
                    {filteredBoxes.length}
                  </strong>

                  {' caixas'}

                </p>


                <div className="flex items-center gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      boxPage === 1
                    }
                    onClick={() =>
                      setBoxPage(
                        page =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                  >
                    Anterior
                  </Button>

                  <Badge variant="secondary">
                    {boxPage} / {boxTotalPages}
                  </Badge>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      boxPage ===
                      boxTotalPages
                    }
                    onClick={() =>
                      setBoxPage(
                        page =>
                          Math.min(
                            boxTotalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    Seguinte
                  </Button>

                </div>

              </div>

            )}

          </CardContent>

        </Card>

      </div>
    );
  };


  // ==================================================
  // EXCEL — RECEITA MENSAL PARA FINANÇAS
  // ==================================================

  const handleMonthlyFinancialExcel =
    useCallback(
      () => {

        if (!monthlyFinancialReport) {

          showErrorToast(
            'Gere primeiro a receita mensal.'
          );

          return;
        }

        try {

          exportMonthlyFinancialReportExcel(
            monthlyFinancialReport,
            financialYear,
            financialMonth,
            reportShopData
          );

          showSuccessToast(
            'Excel de Receita Mensal preparado com sucesso.'
          );

        } catch (error: unknown) {

          console.error(
            'Erro ao gerar Excel financeiro:',
            error
          );

          showErrorToast(
            'Não foi possível gerar o Excel para Finanças.'
          );

        }

      },
      [
        monthlyFinancialReport,
        financialYear,
        financialMonth,
        reportShopData,
      ]
    );


  // ==================================================
  // RELATÓRIO FINANCEIRO MENSAL
  // ==================================================

  const renderMonthlyFinancialReport =
    () => {

      return (

        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            space-y-6
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-black
                text-slate-900
              "
            >
              Receita Mensal — Finanças
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gere apenas o ficheiro Excel no modelo{' '}
              <strong>
                emitted_document
              </strong>.
            </p>

          </div>


          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
            "
          >

            <div>

              <label
                className="
                  mb-1
                  block
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Ano
              </label>

              <Input
                type="number"
                min={2000}
                max={2100}
                value={financialYear}
                onChange={event =>
                  setFinancialYear(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-32"
              />

            </div>


            <div>

              <label
                className="
                  mb-1
                  block
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Mês
              </label>

              <Input
                type="number"
                min={1}
                max={12}
                value={financialMonth}
                onChange={event =>
                  setFinancialMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-24"
              />

            </div>


            <Button
              type="button"
              onClick={() =>
                void loadMonthlyFinancial()
              }
              disabled={loading}
            >

              <RefreshCw
                className={`
                  mr-2
                  h-4
                  w-4
                  ${
                    loading
                      ? 'animate-spin'
                      : ''
                  }
                `}
              />

              Preparar dados

            </Button>


            <Button
              type="button"
              variant="outline"
              onClick={
                handleMonthlyFinancialExcel
              }
              disabled={
                loading
                || !monthlyFinancialReport
              }
            >

              <FileSpreadsheet
                className="mr-2 h-4 w-4"
              />

              Gerar Excel

            </Button>

          </div>


          <p
            className="
              text-xs
              text-slate-400
            "
          >
            O ficheiro contém exclusivamente a folha{' '}
            <strong>
              emitted_document
            </strong>{' '}
            com as 12 colunas do modelo fornecido.
          </p>

        </div>

      );
    };


  // ==================================================
  // CLIENTES — PESQUISA E PAGINAÇÃO
  // ==================================================

const customerRows = useMemo(
  () => customerReport?.rows ?? [],
  [customerReport?.rows]
);
  const filteredCustomers =
    useMemo(
      () => {

        const query =
          customerSearch
            .trim()
            .toLocaleLowerCase('pt-PT');

        if (!query) {
          return customerRows;
        }

        return customerRows.filter(
          row =>
            String(row.nome ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
            ||
            String(row.nif ?? '')
              .toLocaleLowerCase('pt-PT')
              .includes(query)
        );

      },
      [
        customerRows,
        customerSearch,
      ]
    );

  const customerTotalPages =
    Math.max(
      1,
      Math.ceil(
        filteredCustomers.length /
        PAGE_SIZE
      )
    );

  const paginatedCustomers =
    useMemo(
      () => {

        const start =
          (customerPage - 1) *
          PAGE_SIZE;

        return filteredCustomers.slice(
          start,
          start + PAGE_SIZE
        );

      },
      [
        filteredCustomers,
        customerPage,
      ]
    );

  useEffect(
    () => {

      if (
        reportKey === 'customers'
        && customerPage >
           customerTotalPages
      ) {
        setCustomerPage(
          customerTotalPages
        );
      }

    },
    [
      reportKey,
      customerPage,
      customerTotalPages,
    ]
  );

  const handleCustomerPdf =
    useCallback(
      () => {

        if (!customerReport) {
          return;
        }

        printCustomerReportPdf(
          {
            ...customerReport,
            rows: filteredCustomers,
            customersCount:
              filteredCustomers.length,
          },
          from,
          to,
          reportShopData
        );

      },
      [
        customerReport,
        filteredCustomers,
        from,
        to,
        reportShopData,
      ]
    );

  const handleCustomerExcel =
    useCallback(
      () => {

        if (!customerReport) {
          return;
        }

        try {

          exportCustomerReportExcel(
            {
              ...customerReport,
              rows: filteredCustomers,
              customersCount:
                filteredCustomers.length,
            },
            from,
            to,
            reportShopData
          );

          showSuccessToast(
            'Relatório de clientes exportado com sucesso.'
          );

        } catch (error: unknown) {

          console.error(
            'Erro ao exportar Excel de clientes:',
            error
          );

          showErrorToast(
            'Não foi possível exportar o relatório de clientes.'
          );

        }

      },
      [
        customerReport,
        filteredCustomers,
        from,
        to,
        reportShopData,
      ]
    );

  // ==================================================
  // RELATÓRIO DE CLIENTES
  // ==================================================

  const renderCustomerReport =
    () => {

      if (loading) {
        return (
          <Card>
            <CardContent className="flex min-h-[350px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        );
      }

      if (!customerReport) {
        return (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center text-center">
              <p className="text-sm text-slate-500">
                Gere o relatório para visualizar os clientes.
              </p>
            </CardContent>
          </Card>
        );
      }

      const total =
        Number(customerReport.total ?? 0);

      const averagePerCustomer =
        customerReport.customersCount > 0
          ? total / customerReport.customersCount
          : 0;

      const bestCustomer =
        [...customerRows].sort(
          (a, b) =>
            Number(b.total ?? 0) -
            Number(a.total ?? 0)
        )[0];

      return (
        <div className="space-y-6">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">
                  {customerReport.customersCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                  Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">
                  {customerRows.reduce(
                    (sum, row) =>
                      sum + Number(row.compras ?? 0),
                    0
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400">
                  Média / cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black">
                  {money(averagePerCustomer)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-emerald-600">
                  Total gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black text-emerald-700">
                  {money(total)}
                </p>
              </CardContent>
            </Card>

          </div>

          {bestCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Cliente com maior volume de compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-[10px] font-black uppercase text-blue-600">
                      Cliente
                    </p>
                    <p className="mt-1 font-black text-blue-900">
                      {bestCustomer.nome}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-[10px] font-black uppercase text-emerald-600">
                      Total gasto
                    </p>
                    <p className="mt-1 text-xl font-black text-emerald-900">
                      {money(bestCustomer.total)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-500">
                      Compras
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-800">
                      {bestCustomer.compras}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-500">
                      Frequência média
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-800">
                      {Number(bestCustomer.frequenciaMediaDias ?? 0).toFixed(1)} dias
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex-1">

                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">
                    Pesquisar cliente
                  </label>

                  <Input
                    value={customerSearch}
                    onChange={event => {
                      setCustomerSearch(
                        event.target.value
                      );
                      setCustomerPage(1);
                    }}
                    placeholder="Nome ou NIF..."
                  />

                </div>

                <p className="text-xs text-slate-500">
                  {filteredCustomers.length} cliente(s)
                </p>

              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 shadow-sm">

            <CardHeader>
              <CardTitle>
                Clientes
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Clientes com compras no período seleccionado.
              </p>
            </CardHeader>

            <CardContent className="p-0">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-sm">

                  <thead className="border-b bg-slate-50">

                    <tr>

                      <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                        #
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Cliente
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        NIF
                      </th>

                      <th className="p-3 text-center text-[10px] font-black uppercase text-slate-500">
                        Compras
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Total gasto
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Ticket médio
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Primeira compra
                      </th>

                      <th className="p-3 text-left text-[10px] font-black uppercase text-slate-500">
                        Última compra
                      </th>

                      <th className="p-3 text-right text-[10px] font-black uppercase text-slate-500">
                        Freq. média
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {paginatedCustomers.length === 0 ? (

                      <tr>
                        <td colSpan={9} className="p-10 text-center text-sm text-slate-400">
                          Não existem clientes para os filtros seleccionados.
                        </td>
                      </tr>

                    ) : (

                      paginatedCustomers.map(
                        (row, index) => {

                          const position =
                            (
                              (customerPage - 1) *
                              PAGE_SIZE
                            ) + index + 1;

                          return (
                            <tr
                              key={row.id}
                              className="hover:bg-slate-50"
                            >

                              <td className="p-3 text-center font-black text-blue-600">
                                {position}
                              </td>

                              <td className="p-3 font-bold text-slate-700">
                                {row.nome}
                              </td>

                              <td className="p-3">
                                {row.nif || '-'}
                              </td>

                              <td className="p-3 text-center font-black">
                                {row.compras}
                              </td>

                              <td className="p-3 text-right font-black">
                                {money(row.total)}
                              </td>

                              <td className="p-3 text-right">
                                {money(row.ticketMedio)}
                              </td>

                              <td className="p-3">
                                {row.primeiraCompra
                                  ? new Date(
                                      row.primeiraCompra
                                    ).toLocaleDateString(
                                      'pt-PT'
                                    )
                                  : '-'}
                              </td>

                              <td className="p-3">
                                {row.ultimaCompra
                                  ? new Date(
                                      row.ultimaCompra
                                    ).toLocaleDateString(
                                      'pt-PT'
                                    )
                                  : '-'}
                              </td>

                              <td className="p-3 text-right">
                                {Number(
                                  row.frequenciaMediaDias ?? 0
                                ).toFixed(1)}{' '}
                                dias
                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

              {filteredCustomers.length > PAGE_SIZE && (

                <div className="flex flex-col gap-3 border-t bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-500">
                    A mostrar{' '}
                    <strong>
                      {(
                        (customerPage - 1) *
                        PAGE_SIZE
                      ) + 1}
                    </strong>
                    {' — '}
                    <strong>
                      {Math.min(
                        customerPage *
                          PAGE_SIZE,
                        filteredCustomers.length
                      )}
                    </strong>
                    {' de '}
                    <strong>
                      {filteredCustomers.length}
                    </strong>
                    {' clientes'}
                  </p>

                  <div className="flex items-center gap-2">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        customerPage === 1
                      }
                      onClick={() =>
                        setCustomerPage(
                          page =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                    >
                      Anterior
                    </Button>

                    <Badge variant="secondary">
                      {customerPage} / {customerTotalPages}
                    </Badge>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        customerPage ===
                        customerTotalPages
                      }
                      onClick={() =>
                        setCustomerPage(
                          page =>
                            Math.min(
                              customerTotalPages,
                              page + 1
                            )
                        )
                      }
                    >
                      Seguinte
                    </Button>

                  </div>

                </div>

              )}

            </CardContent>

          </Card>

        </div>
      );
    };


  // ==================================================
  // RELATÓRIO PENDENTE
  // ==================================================

  const renderPending =
    () => {

      return (

        <Card>

          <CardContent
            className="
              flex
              min-h-[350px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >

            <Icon
              className="
                mb-4
                h-12
                w-12
                text-blue-600
              "
            />


            <h2
              className="
                text-xl
                font-black
                text-slate-800
              "
            >
              {definition.title}
            </h2>


            <p
              className="
                mt-2
                max-w-lg
                text-sm
                text-slate-500
              "
            >
              {definition.description}
            </p>


            <Badge
              className="
                mt-4
                bg-slate-100
                text-slate-600
                hover:bg-slate-100
              "
            >
              Em implementação
            </Badge>

          </CardContent>

        </Card>
      );
    };


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div
      className="
        min-h-full
        bg-slate-50
        p-4
        md:p-6
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          space-y-6
        "
      >

        {/* ==================================================
            CABEÇALHO
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-200
            pb-5
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate('/reports')
              }
            >

              <ArrowLeft
                className="h-5 w-5"
              />

            </Button>


            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-100
                  text-blue-700
                "
              >

                <Icon
                  className="h-5 w-5"
                />

              </div>


              <div
                className="min-w-0"
              >

                <h1
                  className="
                    text-2xl
                    font-black
                    uppercase
                    tracking-tight
                    text-slate-900
                  "
                >
                  {definition.title}
                </h1>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  {definition.description}
                </p>

              </div>

            </div>

          </div>


          <div
            className="
              shrink-0
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2
              md:min-w-[190px]
            "
          >

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                text-slate-400
              "
            >
              Unidade
            </p>


            <p
              className="
                text-sm
                font-bold
                text-slate-700
              "
            >
              {reportShopName}
            </p>

          </div>

        </div>


        {/* ==================================================
            FILTROS
        ================================================== */}

        {(
          reportKey === 'sales' ||
          reportKey === 'payments'||
          reportKey === 'products' ||
          reportKey === 'movements' ||
          reportKey === 'employees' ||
          reportKey === 'boxes' ||
          reportKey === 'customers'
        ) && (

          <Card
            className="
              border-slate-200
              shadow-sm
            "
          >

            <CardContent
              className="p-4"
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Período do relatório
                  </p>


                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <CalendarDays
                      className="
                        h-4
                        w-4
                        text-blue-600
                      "
                    />


                    <span
                      className="
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      {from}
                      {' → '}
                      {to}
                    </span>

                  </div>

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    items-end
                    gap-3
                  "
                >

                  <div>

                    <label
                      className="
                        mb-1
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        text-slate-400
                      "
                    >
                      De
                    </label>


                    <Input
                      type="date"
                      value={from}
                      onChange={(
                        e
                      ) =>
                        setFrom(
                          e.target.value
                        )
                      }
                      className="w-[160px]"
                    />

                  </div>


                  <div>

                    <label
                      className="
                        mb-1
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        text-slate-400
                      "
                    >
                      Até
                    </label>


                    <Input
                      type="date"
                      value={to}
                      onChange={(
                        e
                      ) =>
                        setTo(
                          e.target.value
                        )
                      }
                      className="w-[160px]"
                    />

                  </div>


                  <Button
                    type="button"
                    onClick={() => {

                      if (reportKey === 'sales') {

                        void loadSales();

                      } else if (reportKey === 'payments') {

                        void loadPayments();

                      } else if (reportKey === 'products') {

                        void loadProducts();

                      } else if (reportKey === 'movements') {

                        void loadStockMovements();

                      } else if (reportKey === 'employees') {

                        void loadEmployees();

                      } else if (reportKey === 'boxes') {

                        void loadBoxes();

                      }

                    }}
                    disabled={
                      loading
                    }
                  >

                    <RefreshCw
                      className={`
                        mr-2
                        h-4
                        w-4
                        ${
                          loading
                            ? 'animate-spin'
                            : ''
                        }
                      `}
                    />

                    Gerar relatório

                  </Button>


                  {/* PDF VENDAS */}

                  {reportKey === 'sales' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !salesReport ||
                          loading
                        }
                        onClick={
                          handleSalesPdf
                        }
                      >

                        <Printer
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        PDF / Imprimir

                      </Button>


                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !salesReport ||
                          loading
                        }
                        onClick={
                          handleSalesExcel
                        }
                      >

                        <FileSpreadsheet
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        Excel

                      </Button>

                    </>

                  )}


                  {/* PDF PAGAMENTOS */}

                  {reportKey === 'payments' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !paymentReport ||
                          loading
                        }
                        onClick={
                          handlePaymentPdf
                        }
                      >

                        <Printer
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        PDF / Imprimir

                      </Button>


                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !paymentReport ||
                          loading
                        }
                        onClick={
                          handlePaymentExcel
                        }
                      >

                        <FileSpreadsheet
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        Excel

                      </Button>

                    </>

                  )}


                  {/* PDF / EXCEL PRODUTOS */}

                  {reportKey === 'products' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!productsReport || loading}
                        onClick={handleProductsPdf}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF / Imprimir
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!productsReport || loading}
                        onClick={handleProductsExcel}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>

                    </>

                  )}


                  {/* PDF / EXCEL MOVIMENTOS */}

                  {reportKey === 'movements' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!stockMovementsReport || loading}
                        onClick={handleStockMovementsPdf}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF / Imprimir
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!stockMovementsReport || loading}
                        onClick={handleStockMovementsExcel}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>

                    </>

                  )}

                  {/* PDF / EXCEL FUNCIONÁRIOS */}

                  {reportKey === 'employees' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!employeeReport || loading}
                        onClick={handleEmployeePdf}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF / Imprimir
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!employeeReport || loading}
                        onClick={handleEmployeeExcel}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>

                    </>

                  )}

                  {/* PDF / EXCEL CAIXAS */}

                  {reportKey === 'boxes' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!boxReport || loading}
                        onClick={handleBoxPdf}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF / Imprimir
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!boxReport || loading}
                        onClick={handleBoxExcel}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>

                    </>

                  )}

                  {reportKey === 'customers' && (

                    <>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!customerReport || loading}
                        onClick={handleCustomerPdf}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF / Imprimir
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={!customerReport || loading}
                        onClick={handleCustomerExcel}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>

                    </>

                  )}

                </div>

              </div>

            </CardContent>

          </Card>

        )}


        {/* ==================================================
            CONTEÚDO
        ================================================== */}

        {reportKey === 'sales' ? (

          renderSalesReport()

        ) : reportKey === 'payments' ? (

          renderPaymentReport()

        ) : reportKey === 'products' ? (

          renderProductsReport()

        ) : reportKey === 'stock' ? (

          renderStockReport()

        ) : reportKey === 'movements' ? (

          renderStockMovementsReport()

        ) : reportKey === 'employees' ? (

          renderEmployeeReport()

        ) : reportKey === 'boxes' ? (

          renderBoxReport()

        ) : reportKey === 'monthly-financial' ? (

          renderMonthlyFinancialReport()

        ) : reportKey === 'customers' ? (

          renderCustomerReport()

        ) : (

          renderPending()

        )}

      </div>

    </div>
  );
};


export default ReportDetailPage;