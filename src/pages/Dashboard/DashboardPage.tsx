import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Button,
} from '@/components/ui/button';

import {
  useDashboardService,
  type DashboardResponse,
} from './DashboardService';

import {
  useAuth,
} from '@/contexts/useAuth';

import {
  showErrorToast,
} from '@/utils/toast';


// ====================================================
// FORMATAÇÃO
// ====================================================

const money = (
  value?: number | null
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
};


const numberPt = (
  value?: number | null
): string => {

  return Number(
    value ?? 0
  ).toLocaleString(
    'pt-PT'
  );
};


const dateTime = (
  value?: string | null
): string => {

  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-';
  }

  return date.toLocaleString(
    'pt-PT',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  );
};


const shortDate = (
  value?: string | null
): string => {

  if (!value) {
    return '-';
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'pt-PT',
    {
      day: '2-digit',
      month: '2-digit',
    }
  );
};


// ====================================================
// PEQUENO COMPONENTE DE BARRA
// ====================================================

interface HorizontalBarProps {
  value: number;
  max: number;
  className?: string;
}

const HorizontalBar: React.FC<
  HorizontalBarProps
> = ({
  value,
  max,
  className = 'bg-blue-600',
}) => {

  const width =
    max > 0
      ? Math.max(
          3,
          Math.min(
            100,
            (value / max) * 100
          )
        )
      : 3;

  return (
    <div
      className="
        h-2.5
        w-full
        overflow-hidden
        rounded-full
        bg-slate-100
      "
    >
      <div
        className={`
          h-full
          rounded-full
          transition-all
          duration-500
          ${className}
        `}
        style={{
          width: `${width}%`,
        }}
      />
    </div>
  );
};


// ====================================================
// ESTADO SEGURO INICIAL DO DASHBOARD
// ====================================================
//
// Evita aceder a propriedades de null durante o primeiro render.
// Enquanto a API não respondeu, o componente continua no estado
// de loading e usa estes valores apenas como fallback seguro.

const EMPTY_DASHBOARD: DashboardResponse = {
  scope: 'SHOP',
  shopId: null,
  shopName: 'A carregar...',
  summary: {
    salesToday: 0,
    totalToday: 0,
    salesMonth: 0,
    totalMonth: 0,
    averageTicket: 0,
    itemsSold: 0,
    openBoxes: 0,
    lowStock: 0,
    outOfStock: 0,
  },
  salesByDay: [],
  payments: [],
  topProducts: [],
  recentSales: [],
  openBoxes: [],
  yesterdayClosings: [],
  shops: [],
};


// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const DashboardPage: React.FC = () => {

  const {
    user,
  } = useAuth();

  const {
    getDashboard,
  } = useDashboardService();

  const [
    dashboard,
    setDashboard,
  ] = useState<
    DashboardResponse | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  // ==================================================
  // CARREGAR
  // ==================================================

  const loadDashboard =
    useCallback(
      async (
        silent = false
      ) => {

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {

          const result =
            await getDashboard();

          setDashboard(
            result
          );

        } catch (
          error: unknown
        ) {

          console.error(
            'Erro ao carregar Dashboard:',
            error
          );

          showErrorToast(
            'Não foi possível carregar o Dashboard.'
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      [
        getDashboard,
      ]
    );


  useEffect(
    () => {

      void loadDashboard();

    },
    [
      loadDashboard,
    ]
  );


  // ==================================================
  // CONTEXTO
  // ==================================================

  // ==================================================
  // CONTEXTO
  // ==================================================
  //
  // O bloco abaixo só é executado depois do guard:
  // if (loading || !dashboard) return ...
  //
  // Ainda assim, o TypeScript pode conservar a possibilidade
  // de null porque o estado continua tipado como nullable.
  // Criamos uma referência local explicitamente não nula.

  const currentDashboard =
    dashboard ?? EMPTY_DASHBOARD;

  const isGlobal =
    currentDashboard.scope === 'GLOBAL';

  const isOperator =
    currentDashboard.scope === 'OPERATOR';

  const isShop =
    currentDashboard.scope === 'SHOP';


  const scopeLabel =
    isGlobal
      ? 'Visão Global'
      : isOperator
        ? 'Minha actividade'
        : 'Visão da loja';


  // ==================================================
  // RESUMO
  // ==================================================

  const summary =
    currentDashboard.summary;

  const salesByDay =
    useMemo(
      () =>
        currentDashboard.salesByDay
        ?? [],
      [currentDashboard.salesByDay]
    );

  const payments =
    useMemo(
      () =>
        currentDashboard.payments
        ?? [],
      [currentDashboard.payments]
    );

  const topProducts =
    useMemo(
      () =>
        currentDashboard.topProducts
        ?? [],
      [currentDashboard.topProducts]
    );

  const recentSales =
    useMemo(
      () =>
        currentDashboard.recentSales
        ?? [],
      [currentDashboard.recentSales]
    );

  const openBoxes =
    useMemo(
      () =>
        currentDashboard.openBoxes
        ?? [],
      [currentDashboard.openBoxes]
    );

  const shops =
    useMemo(
      () =>
        currentDashboard.shops
        ?? [],
      [currentDashboard.shops]
    );


  // ==================================================
  // MÉTRICAS DE GRÁFICOS
  // ==================================================

  const maxDaily =
    useMemo(
      () =>
        Math.max(
          ...salesByDay.map(
            point =>
              Number(
                point.total ?? 0
              )
          ),
          0
        ),
      [salesByDay]
    );


  const maxPayment =
    useMemo(
      () =>
        Math.max(
          ...payments.map(
            point =>
              Number(
                point.total ?? 0
              )
          ),
          0
        ),
      [payments]
    );


  const maxProduct =
    useMemo(
      () =>
        Math.max(
          ...topProducts.map(
            point =>
              Number(
                point.quantidade ?? 0
              )
          ),
          0
        ),
      [topProducts]
    );


  // ==================================================
  // RENDER - LOADING
  // ==================================================

  if (loading || !dashboard) {

    return (
      <div
        className="
          flex
          min-h-[560px]
          flex-col
          items-center
          justify-center
          gap-3
        "
      >

        <RefreshCw
          className="
            h-8
            w-8
            animate-spin
            text-primary
          "
        />

        <p
          className="
            text-sm
            text-slate-500
          "
        >
          A carregar o Dashboard...
        </p>

      </div>
    );
  }


  return (

    <div
      className="
        space-y-6
        pb-10
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
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                text-slate-900
                md:text-3xl
              "
            >
              Dashboard
            </h1>

            <Badge
              variant={
                isGlobal
                  ? 'default'
                  : 'outline'
              }
            >
              {scopeLabel}
            </Badge>

          </div>

          <div
            className="
              mt-1
              flex
              flex-wrap
              items-center
              gap-x-2
              gap-y-1
              text-sm
              text-slate-500
            "
          >

            <span
              className="
                font-semibold
                text-slate-700
              "
            >
              {currentDashboard.shopName}
            </span>

            <span>•</span>

            <span>
              Olá, {user?.nome || 'Utilizador'}
            </span>

          </div>

        </div>


        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >

          <Badge
            variant="outline"
            className="
              h-9
              px-3
            "
          >

            <CalendarDays
              className="
                mr-2
                h-4
                w-4
              "
            />

            {new Date().toLocaleDateString(
              'pt-PT',
              {
                dateStyle: 'medium',
              }
            )}

          </Badge>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() =>
              void loadDashboard(
                true
              )
            }
          >

            <RefreshCw
              className={`
                mr-2
                h-4
                w-4
                ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              `}
            />

            Actualizar

          </Button>

        </div>

      </div>


      {/* ==================================================
          CONTEXTO GLOBAL
          ================================================== */}

      {isGlobal && (

        <Card
          className="
            border-blue-200
            bg-blue-50/50
          "
        >

          <CardContent
            className="
              flex
              items-start
              gap-3
              p-4
            "
          >

            <div
              className="
                rounded-xl
                bg-blue-600
                p-2
                text-white
              "
            >

              <Store
                className="
                  h-5
                  w-5
                "
              />

            </div>

            <div>

              <p
                className="
                  font-black
                  text-blue-950
                "
              >
                Visão Global
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-blue-800
                "
              >
                Os indicadores financeiros abaixo são consolidados
                de todas as lojas. Os detalhes operacionais identificam
                sempre a loja de origem.
              </p>

            </div>

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          INDICADORES
          ================================================== */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-6
        "
      >

        {/* VENDAS HOJE */}

        <Card
          className="
            xl:col-span-1
          "
        >

          <CardHeader
            className="
              flex
              flex-row
              items-center
              justify-between
              space-y-0
              pb-2
            "
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
              {isGlobal
                ? 'Vendas hoje — Global'
                : isOperator
                  ? 'Minhas vendas hoje'
                  : 'Vendas de hoje'}
            </CardTitle>

            <ShoppingCart
              className="
                h-4
                w-4
                text-blue-600
              "
            />

          </CardHeader>

          <CardContent>

            <p
              className="
                text-xl
                font-black
                text-slate-900
              "
            >
              {money(
                summary.totalToday
              )}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {numberPt(
                summary.salesToday
              )}{' '}
              venda(s)

            </p>

          </CardContent>

        </Card>


        {/* FACTURAÇÃO MÊS */}

        <Card
          className="
            xl:col-span-1
          "
        >

          <CardHeader
            className="
              flex
              flex-row
              items-center
              justify-between
              space-y-0
              pb-2
            "
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
              {isGlobal
                ? 'Facturado no mês — Global'
                : isOperator
                  ? 'Minhas vendas no mês'
                  : 'Facturado no mês'}
            </CardTitle>

            <CircleDollarSign
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

          </CardHeader>

          <CardContent>

            <p
              className="
                text-xl
                font-black
                text-slate-900
              "
            >
              {money(
                summary.totalMonth
              )}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {numberPt(
                summary.salesMonth
              )}{' '}
              venda(s)

            </p>

          </CardContent>

        </Card>


        {/* TICKET MÉDIO */}

        <Card
          className="
            xl:col-span-1
          "
        >

          <CardHeader
            className="
              flex
              flex-row
              items-center
              justify-between
              space-y-0
              pb-2
            "
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
              Ticket médio
            </CardTitle>

            <TrendingUp
              className="
                h-4
                w-4
                text-indigo-600
              "
            />

          </CardHeader>

          <CardContent>

            <p
              className="
                text-xl
                font-black
                text-slate-900
              "
            >
              {money(
                summary.averageTicket
              )}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              por venda no mês

            </p>

          </CardContent>

        </Card>


        {/* PRODUTOS VENDIDOS */}

        <Card
          className="
            xl:col-span-1
          "
        >

          <CardHeader
            className="
              flex
              flex-row
              items-center
              justify-between
              space-y-0
              pb-2
            "
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
              Produtos vendidos
            </CardTitle>

            <Package
              className="
                h-4
                w-4
                text-violet-600
              "
            />

          </CardHeader>

          <CardContent>

            <p
              className="
                text-xl
                font-black
                text-slate-900
              "
            >
              {numberPt(
                summary.itemsSold
              )}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              unidades no mês

            </p>

          </CardContent>

        </Card>


        {/* CAIXAS */}

        {!isOperator && (

          <Card
            className="
              xl:col-span-1
            "
          >

            <CardHeader
              className="
                flex
                flex-row
                items-center
                justify-between
                space-y-0
                pb-2
              "
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
                Caixas abertos
              </CardTitle>

              <Boxes
                className="
                  h-4
                  w-4
                  text-cyan-600
                "
              />

            </CardHeader>

            <CardContent>

              <p
                className="
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                {numberPt(
                  summary.openBoxes
                )}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                activos neste momento

              </p>

            </CardContent>

          </Card>

        )}


        {/* STOCK */}

        {!isOperator && (

          <Card
            className="
              xl:col-span-1
            "
          >

            <CardHeader
              className="
                flex
                flex-row
                items-center
                justify-between
                space-y-0
                pb-2
              "
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
                Stock baixo
              </CardTitle>

              <AlertTriangle
                className="
                  h-4
                  w-4
                  text-amber-600
                "
              />

            </CardHeader>

            <CardContent>

              <p
                className="
                  text-xl
                  font-black
                  text-amber-700
                "
              >
                {numberPt(
                  summary.lowStock
                )}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                {numberPt(
                  summary.outOfStock
                )}{' '}
                sem stock

              </p>

            </CardContent>

          </Card>

        )}

      </div>


      {/* ==================================================
          GRÁFICOS
          ================================================== */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-3
        "
      >

        {/* VENDAS POR DIA */}

        <Card
          className="
            xl:col-span-2
          "
        >

          <CardHeader>

            <CardTitle>
              Vendas por dia
            </CardTitle>

            <CardDescription>
              Evolução diária das vendas no mês em curso.
              {isGlobal
                ? ' Valores consolidados de todas as lojas.'
                : ''}
            </CardDescription>

          </CardHeader>


          <CardContent>

            {salesByDay.length === 0 ? (

              <div
                className="
                  flex
                  h-[270px]
                  items-center
                  justify-center
                  text-sm
                  text-slate-400
                "
              >
                Ainda não existem dados para o período.
              </div>

            ) : (

              <div
                className="
                  flex
                  h-[270px]
                  items-end
                  gap-2
                  overflow-x-auto
                  pb-1
                "
              >

                {salesByDay.map(
                  point => {

                    const value =
                      Number(
                        point.total ?? 0
                      );

                    const height =
                      maxDaily > 0
                        ? Math.max(
                            8,
                            (
                              value /
                              maxDaily
                            ) * 100
                          )
                        : 8;

                    return (

                      <div
                        key={
                          point.date
                        }
                        className="
                          flex
                          h-full
                          min-w-[42px]
                          flex-1
                          flex-col
                          items-center
                          justify-end
                          gap-2
                        "
                      >

                        <span
                          className="
                            whitespace-nowrap
                            text-[9px]
                            font-bold
                            text-slate-500
                          "
                        >
                          {money(
                            value
                          )}
                        </span>

                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-end
                          "
                        >

                          <div
                            className="
                              w-full
                              rounded-t-lg
                              bg-blue-600
                              transition-all
                              duration-500
                            "
                            style={{
                              height:
                                `${height}%`,
                            }}
                            title={`${shortDate(point.date)} — ${money(value)}`}
                          />

                        </div>

                        <span
                          className="
                            text-[10px]
                            font-medium
                            text-slate-400
                          "
                        >
                          {shortDate(
                            point.date
                          )}
                        </span>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>


        {/* PAGAMENTO */}

        <Card>

          <CardHeader>

            <CardTitle>
              Métodos de pagamento
            </CardTitle>

            <CardDescription>
              Distribuição das vendas no mês.
            </CardDescription>

          </CardHeader>


          <CardContent>

            {payments.length === 0 ? (

              <div
                className="
                  flex
                  min-h-[270px]
                  items-center
                  justify-center
                  text-sm
                  text-slate-400
                "
              >
                Sem dados de pagamento.
              </div>

            ) : (

              <div
                className="
                  space-y-5
                  pt-2
                "
              >

                {payments.map(
                  payment => {

                    const total =
                      Number(
                        payment.total ?? 0
                      );

                    return (

                      <div
                        key={
                          payment.metodo
                        }
                        className="
                          space-y-2
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                truncate
                                text-sm
                                font-bold
                                text-slate-800
                              "
                            >
                              {payment.metodo}
                            </p>

                            <p
                              className="
                                text-xs
                                text-slate-400
                              "
                            >
                              {numberPt(
                                payment.vendas
                              )}{' '}
                              venda(s)

                            </p>

                          </div>


                          <div
                            className="
                              text-right
                            "
                          >

                            <p
                              className="
                                text-sm
                                font-black
                                text-slate-900
                              "
                            >
                              {money(
                                total
                              )}
                            </p>

                            <p
                              className="
                                text-[10px]
                                font-bold
                                text-slate-400
                              "
                            >
                              {Number(
                                payment.percentagem
                                ?? 0
                              ).toLocaleString(
                                'pt-PT',
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}%

                            </p>

                          </div>

                        </div>

                        <HorizontalBar
                          value={
                            total
                          }
                          max={
                            maxPayment
                          }
                          className="
                            bg-emerald-600
                          "
                        />

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>

      </div>


      {/* ==================================================
          GLOBAL — POR LOJA
          ================================================== */}

      {isGlobal && (

        <Card>

          <CardHeader>

            <CardTitle>
              Desempenho por loja
            </CardTitle>

            <CardDescription>
              Comparação directa das unidades.
            </CardDescription>

          </CardHeader>


          <CardContent>

            {shops.length === 0 ? (

              <p
                className="
                  py-10
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                Não existem lojas para apresentar.
              </p>

            ) : (

              <div
                className="
                  grid
                  gap-4
                  lg:grid-cols-2
                "
              >

                {shops.map(
                  shop => {

                    const maxShop =
                      Math.max(
                        ...shops.map(
                          item =>
                            Number(
                              item.todayTotal ?? 0
                            )
                        ),
                        0
                      );

                    return (

                      <div
                        key={
                          shop.shopId
                        }
                        className="
                          rounded-2xl
                          border
                          border-slate-200
                          p-4
                          transition
                          hover:border-blue-200
                          hover:shadow-sm
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                truncate
                                font-black
                                text-slate-800
                              "
                            >
                              {shop.shopName}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-400
                              "
                            >
                              {numberPt(
                                shop.todaySales
                              )}{' '}
                              venda(s) hoje

                            </p>

                          </div>


                          <p
                            className="
                              shrink-0
                              text-lg
                              font-black
                              text-slate-900
                            "
                          >
                            {money(
                              shop.todayTotal
                            )}
                          </p>

                        </div>


                        <div
                          className="
                            mt-4
                          "
                        >

                          <HorizontalBar
                            value={
                              Number(
                                shop.todayTotal
                              )
                            }
                            max={
                              maxShop
                            }
                            className="
                              bg-blue-600
                            "
                          />

                        </div>


                        <div
                          className="
                            mt-4
                            grid
                            grid-cols-4
                            gap-2
                          "
                        >

                          <div
                            className="
                              rounded-lg
                              bg-slate-50
                              p-2
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-black
                                uppercase
                                text-slate-400
                              "
                            >
                              Mês
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-black
                                text-slate-800
                              "
                            >
                              {money(
                                shop.monthTotal
                              )}
                            </p>

                          </div>


                          <div
                            className="
                              rounded-lg
                              bg-slate-50
                              p-2
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-black
                                uppercase
                                text-slate-400
                              "
                            >
                              Caixas
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-black
                                text-slate-800
                              "
                            >
                              {numberPt(
                                shop.openBoxes
                              )}
                            </p>

                          </div>


                          <div
                            className="
                              rounded-lg
                              bg-amber-50
                              p-2
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-black
                                uppercase
                                text-amber-600
                              "
                            >
                              Stock baixo
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-black
                                text-amber-800
                              "
                            >
                              {numberPt(
                                shop.lowStock
                              )}
                            </p>

                          </div>


                          <div
                            className="
                              rounded-lg
                              bg-red-50
                              p-2
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-black
                                uppercase
                                text-red-600
                              "
                            >
                              Sem stock
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-black
                                text-red-800
                              "
                            >
                              {numberPt(
                                shop.outOfStock
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          PRODUTOS MAIS VENDIDOS / ÚLTIMAS VENDAS
          ================================================== */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-2
        "
      >

        {/* TOP PRODUTOS */}

        {!isOperator && (

          <Card>

            <CardHeader>

              <CardTitle>
                Produtos mais vendidos
              </CardTitle>

              <CardDescription>
                Top 10 por quantidade vendida.
                {isGlobal
                  ? ' A loja de origem é identificada.'
                  : ''}
              </CardDescription>

            </CardHeader>


            <CardContent>

              {topProducts.length === 0 ? (

                <div
                  className="
                    py-12
                    text-center
                    text-sm
                    text-slate-400
                  "
                >
                  Ainda não existem produtos vendidos no período.
                </div>

              ) : (

                <div
                  className="
                    space-y-4
                  "
                >

                  {topProducts.slice(
                    0,
                    10
                  ).map(
                    (
                      product,
                      index
                    ) => (

                      <div
                        key={`${product.productId}-${index}`}
                        className="
                          rounded-xl
                          border
                          border-slate-100
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
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

                            <div
                              className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-900
                                text-xs
                                font-black
                                text-white
                              "
                            >
                              {index + 1}
                            </div>

                            <div
                              className="
                                min-w-0
                              "
                            >

                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-bold
                                  text-slate-800
                                "
                              >
                                {product.nome}
                              </p>

                              {isGlobal && (
                                <p
                                  className="
                                    truncate
                                    text-[11px]
                                    text-slate-400
                                  "
                                >
                                  {product.shopName
                                    || 'Loja não identificada'}
                                </p>
                              )}

                            </div>

                          </div>


                          <div
                            className="
                              shrink-0
                              text-right
                            "
                          >

                            <p
                              className="
                                text-sm
                                font-black
                                text-slate-900
                              "
                            >
                              {numberPt(
                                product.quantidade
                              )}{' '}
                              un.
                            </p>

                            <p
                              className="
                                text-[11px]
                                text-slate-400
                              "
                            >
                              {money(
                                product.total
                              )}
                            </p>

                          </div>

                        </div>


                        <div
                          className="
                            mt-3
                          "
                        >

                          <HorizontalBar
                            value={
                              Number(
                                product.quantidade
                              )
                            }
                            max={
                              maxProduct
                            }
                            className="
                              bg-violet-600
                            "
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </CardContent>

          </Card>

        )}


        {/* ÚLTIMAS VENDAS */}

        <Card
          className={
            isOperator
              ? 'xl:col-span-2'
              : ''
          }
        >

          <CardHeader>

            <CardTitle>
              Últimas vendas
            </CardTitle>

            <CardDescription>
              As últimas operações registadas hoje.
              {isGlobal
                ? ' Cada venda mostra a loja de origem.'
                : ''}
            </CardDescription>

          </CardHeader>


          <CardContent>

            {recentSales.length === 0 ? (

              <div
                className="
                  py-12
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                Ainda não existem vendas hoje.
              </div>

            ) : (

              <div
                className="
                  space-y-2
                "
              >

                {recentSales.slice(
                  0,
                  10
                ).map(
                  sale => (

                    <div
                      key={
                        sale.saleId
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border
                        border-slate-100
                        p-3
                      "
                    >

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-800
                            "
                          >
                            {sale.numeroFactura
                              || `Venda #${sale.saleId}`}
                          </p>

                          <Badge
                            variant="outline"
                            className="
                              text-[9px]
                            "
                          >
                            {sale.metodoPagamento
                              || 'N/D'}
                          </Badge>

                        </div>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-400
                          "
                        >
                          {isGlobal && sale.shopName
                            ? `${sale.shopName} • `
                            : ''}
                          {sale.cliente
                            || 'Venda ao Público'}
                          {' • '}
                          {dateTime(
                            sale.dataVenda
                          )}

                        </p>

                      </div>


                      <p
                        className="
                          shrink-0
                          text-sm
                          font-black
                          text-emerald-700
                        "
                      >
                        {money(
                          sale.total
                        )}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </CardContent>

        </Card>

      </div>


      {/* ==================================================
          CAIXAS — GESTÃO
          ================================================== */}

      {!isOperator && !isGlobal && (

        <Card>

          <CardHeader>

            <CardTitle>
              Situação dos caixas
            </CardTitle>

            <CardDescription>
              Aberturas de hoje e referência do fecho anterior.
            </CardDescription>

          </CardHeader>


          <CardContent>

            <div
              className="
                grid
                gap-6
                lg:grid-cols-2
              "
            >

              <div>

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Boxes
                    className="
                      h-4
                      w-4
                      text-indigo-600
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-black
                      text-slate-800
                    "
                  >
                    Caixas de hoje
                  </p>

                </div>


                {openBoxes.length === 0 ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-dashed
                      p-5
                      text-sm
                      text-slate-400
                    "
                  >
                    Nenhum caixa aberto neste momento.
                  </div>

                ) : (

                  <div
                    className="
                      space-y-2
                    "
                  >

                    {openBoxes.map(
                      box => (

                        <div
                          key={
                            box.boxId
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50/60
                            p-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-4
                            "
                          >

                            <div>

                              <p
                                className="
                                  font-black
                                  text-slate-800
                                "
                              >
                                Caixa #{box.boxId}
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Aberto por:{' '}
                                <span
                                  className="
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  {box.openedBy || '-'}
                                </span>
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-400
                                "
                              >
                                Abertura:{' '}
                                {dateTime(
                                  box.openingDate
                                )}
                              </p>

                            </div>

                            <Badge>
                              ABERTO
                            </Badge>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              <div>

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    gap-2
                  "
                >

                  <CircleDollarSign
                    className="
                      h-4
                      w-4
                      text-slate-500
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-black
                      text-slate-800
                    "
                  >
                    Fechos do dia anterior
                  </p>

                </div>


                {currentDashboard.yesterdayClosings.length === 0 ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-dashed
                      p-5
                      text-sm
                      text-slate-400
                    "
                  >
                    Não existem fechos registados no dia anterior.
                  </div>

                ) : (

                  <div
                    className="
                      space-y-2
                    "
                  >

                    {currentDashboard.yesterdayClosings.map(
                      closing => (

                        <div
                          key={
                            closing.boxId
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            p-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-4
                            "
                          >

                            <div>

                              <p
                                className="
                                  font-black
                                  text-slate-800
                                "
                              >
                                Caixa #{closing.boxId}
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Fechado por:{' '}
                                <span
                                  className="
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  {closing.closedBy || '-'}
                                </span>
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-400
                                "
                              >
                                Hora: {dateTime(
                                  closing.closingDate
                                )}
                              </p>

                            </div>


                            <p
                              className="
                                shrink-0
                                text-sm
                                font-black
                                text-slate-900
                              "
                            >
                              {money(
                                closing.closingValue
                              )}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          OPERADOR — VISÃO SIMPLES
          ================================================== */}

      {isOperator && (

        <Card
          className="
            border-slate-200
            bg-slate-50/70
          "
        >

          <CardContent
            className="
              flex
              flex-col
              gap-2
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <ShoppingCart
                className="
                  h-4
                  w-4
                  text-blue-600
                "
              />

              <p
                className="
                  text-sm
                  font-black
                  text-slate-800
                "
              >
                Actividade do dia
              </p>

            </div>

            <p
              className="
                text-xs
                leading-5
                text-slate-500
              "
            >
              Este painel mostra apenas a sua actividade de vendas.
              Informações administrativas de caixas, stock e relatórios
              não fazem parte desta visão.
            </p>

          </CardContent>

        </Card>

      )}

    </div>
  );
};


export default DashboardPage;
