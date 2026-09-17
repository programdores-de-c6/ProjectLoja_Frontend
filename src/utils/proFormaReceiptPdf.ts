/**
 * ====================================================
 * PRO FORMA PDF - MOTOR DE IMPRESSÃO
 * ====================================================
 *
 * Documento específico para Pro Forma / Requisição.
 *
 * Formatos suportados:
 * - A4
 * - A5
 *
 * Não utiliza THERMAL/POS.
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import {
  TDocumentDefinitions,
  TableCell,
  Content,
  PageSize,
} from 'pdfmake/interfaces';

import {
  ProFormaResponse,
  ProFormaItemResponse,
} from '@/pages/sales/SalesService';

import type { ReportShop } from '@/utils/reportShopTypes';

// ====================================================
// INICIALIZAÇÃO DAS FONTES
// ====================================================

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  pdfMake.vfs =
    pdfFonts as unknown as {
      [key: string]: string;
    };
}

// ====================================================
// FORMATOS PERMITIDOS
// ====================================================

export type ProFormaPrintFormat =
  | 'A4'
  | 'A5';

// ====================================================
// DADOS NORMALIZADOS PARA IMPRESSÃO
// ====================================================

interface PrintableProFormaData {
  numero: string;
  data: string;

  cliente: string;
  nifCliente: string;

  shopId: number | null;

  subtotal: number;
  impostos: number;
  desconto: number;
  total: number;

  status: string;

  items: ProFormaItemResponse[];
}

// ====================================================
// ADAPTADOR DOS DADOS
// ====================================================

const adaptData = (
  input: ProFormaResponse
): PrintableProFormaData => {
  return {
    numero:
      input.numeroProforma ||
      '---',

    data:
      input.dataProforma ||
      new Date().toISOString(),

    cliente:
      input.customerName ||
      'VENDA AO PÚBLICO',

    nifCliente:
      input.customerNif ||
      'CONSUMIDOR FINAL',

    shopId:
      input.shopId ??
      null,

    subtotal:
      Number(
        input.subtotal || 0
      ),

    impostos:
      Number(
        input.totalImposto || 0
      ),

    desconto:
      Number(
        input.discountValue || 0
      ),

    total:
      Number(
        input.totalGeral || 0
      ),

    status:
      input.status ||
      'ABERTA',

    items:
      Array.isArray(
        input.items
      )
        ? input.items
        : [],
  };
};

// ====================================================
// IMPRESSÃO DA PRO FORMA
// ====================================================

export const printProFormaPdf = (
  input: ProFormaResponse,
  format: ProFormaPrintFormat = 'A4',
  shop?: ReportShop
): void => {

  // Normaliza os dados.
  const data =
    adaptData(input);

  // ==================================================
  // CONFIGURAÇÃO DO PAPEL
  // ==================================================

  const config = {
    A4: {
      size: 'A4' as PageSize,

      margin: [
        40,
        30,
        40,
        50,
      ] as [
        number,
        number,
        number,
        number
      ],

      width: 515,
    },

    A5: {
      size: 'A5' as PageSize,

      margin: [
        30,
        25,
        30,
        40,
      ] as [
        number,
        number,
        number,
        number
      ],

      width: 360,
    },
  }[format];

  // ==================================================
  // DADOS DA LOJA
  // ==================================================

  const shopName =
    shop?.nome ||
    'Visão Global';

  const shopNif =
    shop?.numeroContribuite ||
    '---';

  const shopAddress =
    shop?.nomelocation ||
    '---';

  const shopContact =
    shop?.contacto ||
    '---';

  const shopEmail =
    shop?.email ||
    '';

  const shopLogo =
    shop?.logoUrl ||
    shop?.logo ||
    null;

  // ==================================================
  // TABELA DOS PRODUTOS
  // ==================================================

  const tableBody:
    TableCell[][] = [

    [
      {
        text: 'ARTIGO',
        style: 'tableHeader',
      },

      {
        text: 'QTD',
        style: 'tableHeader',
        alignment: 'center',
      },

      {
        text: 'UNIT.',
        style: 'tableHeader',
        alignment: 'right',
      },

      {
        text: 'TOTAL',
        style: 'tableHeader',
        alignment: 'right',
      },
    ],
  ];

  // ==================================================
  // PRODUTOS
  // ==================================================

  data.items.forEach(
    (item) => {

      tableBody.push([
        {
          text:
            String(
              item.productName ||
              ''
            ).toUpperCase(),

          fontSize:
            format === 'A5'
              ? 8
              : 9,

          margin: [
            0,
            4,
            0,
            4,
          ],
        },

        {
          text:
            String(
              item.quantity
            ),

          fontSize:
            format === 'A5'
              ? 8
              : 9,

          alignment:
            'center',
        },

        {
          text:
            Number(
              item.unitPrice ||
              0
            ).toFixed(2),

          fontSize:
            format === 'A5'
              ? 8
              : 9,

          alignment:
            'right',
        },

        {
          text:
            Number(
              item.subtotal ||
              0
            ).toFixed(2),

          fontSize:
            format === 'A5'
              ? 8
              : 9,

          bold:
            true,

          alignment:
            'right',
        },
      ]);
    }
  );

  // ==================================================
  // BLOCO DE TOTAIS
  // ==================================================

  const totalsBlock:
    Content = {

    unbreakable: true,

    stack: [

      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2:
              config.width,
            y2: 0,
            lineWidth: 0.5,
            lineColor:
              '#dddddd',
          },
        ],

        margin: [
          0,
          10,
          0,
          5,
        ],
      },

      {
        stack: [

          {
            columns: [

              {
                text:
                  'SUBTOTAL:',

                fontSize: 9,
              },

              {
                text:
                  `${data.subtotal.toFixed(
                    2
                  )} Db`,

                fontSize: 9,

                alignment:
                  'right',
              },
            ],
          },

          {
            columns: [

              {
                text:
                  'IMPOSTOS:',

                fontSize: 9,
              },

              {
                text:
                  `${data.impostos.toFixed(
                    2
                  )} Db`,

                fontSize: 9,

                alignment:
                  'right',
              },
            ],
          },

          {
            columns: [

              {
                text:
                  'DESCONTO:',

                fontSize: 9,

                color:
                  '#c62828',
              },

              {
                text:
                  `-${data.desconto.toFixed(
                    2
                  )} Db`,

                fontSize: 9,

                alignment:
                  'right',

                color:
                  '#c62828',
              },
            ],
          },

          {
            canvas: [
              {
                type: 'line',

                x1: 0,

                y1: 5,

                x2: 180,

                y2: 5,

                lineWidth:
                  0.5,

                lineColor:
                  '#dddddd',
              },
            ],

            margin: [
              0,
              4,
            ],
          },

          {
            table: {

              widths: [
                '*',
                'auto',
              ],

              body: [

                [
                  {
                    text:
                      'TOTAL',

                    color:
                      'white',

                    bold:
                      true,

                    fontSize:
                      10,

                    fillColor:
                      '#0d47a1',

                    margin: [
                      5,
                      5,
                      5,
                      5,
                    ],
                  },

                  {
                    text:
                      `${data.total.toFixed(
                        2
                      )} Db`,

                    color:
                      'white',

                    bold:
                      true,

                    fontSize:
                      12,

                    alignment:
                      'right',

                    fillColor:
                      '#0d47a1',

                    margin: [
                      5,
                      5,
                      5,
                      5,
                    ],
                  },
                ],
              ],
            },

            layout:
              'noBorders',

            margin: [
              0,
              8,
              0,
              0,
            ],
          },
        ],
      },
    ],
  };

  // ==================================================
  // CABEÇALHO DA LOJA
  // ==================================================

  const shopInfoStack: Content[] = [

    {
      text:
        shopName.toUpperCase(),

      fontSize:
        format === 'A5'
          ? 12
          : 14,

      bold:
        true,

      color:
        '#0d47a1',
    },

    {
      text:
        `NIF: ${shopNif}`,

      fontSize:
        format === 'A5'
          ? 7
          : 8,

      color:
        '#505050',

      margin: [
        0,
        3,
        0,
        0,
      ],
    },

    {
      text:
        shopAddress,

      fontSize:
        format === 'A5'
          ? 7
          : 8,

      color:
        '#505050',
    },

    {
      text:
        `TEL: ${shopContact}`,

      fontSize:
        format === 'A5'
          ? 7
          : 8,

      color:
        '#505050',
    },
  ];

  if (shopEmail) {
    shopInfoStack.push({
      text:
        `Email: ${shopEmail}`,

      fontSize:
        format === 'A5'
          ? 7
          : 8,

      color:
        '#505050',
    });
  }

  const shopLogoContent:
    Content =
    shopLogo
      ? {
          image:
            shopLogo,

          width:
            format === 'A5'
              ? 40
              : 50,

          alignment:
            'right',

        }
      : {
          text: '',
        };

  // ==================================================
  // DEFINIÇÃO DO DOCUMENTO
  // ==================================================

  const docDefinition:
    TDocumentDefinitions = {

    pageSize:
      config.size,

    pageMargins:
      config.margin,

    footer: (
      currentPage: number,
      pageCount: number
    ): Content => ({
      margin: [
        config.margin[0],
        0,
        config.margin[2],
        15,
      ],

      columns: [

        {
          text:
            `Página ${currentPage} de ${pageCount}`,

          fontSize:
            7,

          color:
            '#90a4ae',
        },

        {
          text:
            'Documento Pro Forma',

          fontSize:
            7,

          alignment:
            'right',

          color:
            '#90a4ae',
        },
      ],
    }),

    content: [

      // ==================================================
      // CABEÇALHO DA LOJA
      // ==================================================

      {
        columns: [

          {
            stack:
              shopInfoStack,

            width:
              '*',
          },

          {
            stack: [
              shopLogoContent,
            ],

            width:
              70,

            alignment:
              'right',
          },
        ],

        margin: [
          0,
          0,
          0,
          8,
        ],
      },

      // ==================================================
      // LINHA
      // ==================================================

      {
        canvas: [
          {
            type: 'line',

            x1: 0,

            y1: 0,

            x2:
              config.width,

            y2: 0,

            lineWidth:
              0.8,

            lineColor:
              '#dddddd',
          },
        ],

        margin: [
          0,
          4,
          0,
          8,
        ],
      },

      // ==================================================
      // CABEÇALHO DA PRO FORMA
      // ==================================================

      {
        columns: [

          {
            stack: [

              {
                text:
                  'PRO FORMA',

                fontSize:
                  format === 'A5'
                    ? 16
                    : 18,

                bold:
                  true,

                color:
                  '#0d47a1',
              },

              {
                text:
                  'ORÇAMENTO / REQUISIÇÃO',

                fontSize:
                  8,

                bold:
                  true,

                color:
                  '#455a64',

                margin: [
                  0,
                  2,
                  0,
                  0,
                ],
              },
            ],

            width:
              '*',
          },

          {
            stack: [

              {
                text:
                  data.numero,

                fontSize:
                  10,

                bold:
                  true,

                alignment:
                  'right',

                color:
                  '#0d47a1',
              },

              {
                text:
                  `DATA: ${new Date(
                    data.data
                  ).toLocaleString(
                    'pt-PT'
                  )}`,

                fontSize:
                  8,

                alignment:
                  'right',
              },
            ],

            width:
              170,
          },
        ],

        margin: [
          0,
          0,
          0,
          10,
        ],
      },

      // ==================================================
      // CLIENTE
      // ==================================================

      {
        columns: [

          {
            stack: [

              {
                text:
                  'CLIENTE',

                fontSize:
                  7,

                color:
                  '#90a4ae',

                bold:
                  true,
              },

              {
                text:
                  data.cliente.toUpperCase(),

                fontSize:
                  10,

                bold:
                  true,
              },

              {
                text:
                  `NIF: ${data.nifCliente}`,

                fontSize:
                  8,
              },
            ],
          },

          {
            stack: [

              {
                text:
                  `ESTADO: ${data.status}`,

                fontSize:
                  8,

                bold:
                  true,

                alignment:
                  'right',

                color:
                  data.status ===
                  'CONVERTIDA'
                    ? '#2e7d32'
                    : '#0d47a1',
              },

              {
                text:
                  `LOJA ID: ${data.shopId ?? '---'}`,

                fontSize:
                  7,

                alignment:
                  'right',

                color:
                  '#90a4ae',
              },
            ],

            width:
              150,
          },
        ],

        margin: [
          0,
          5,
          0,
          10,
        ],
      },

      // ==================================================
      // TABELA
      // ==================================================

      {
        table: {

          headerRows:
            1,

          widths:
            format === 'A5'
              ? [
                  '*',
                  30,
                  55,
                  60,
                ]
              : [
                  '*',
                  40,
                  70,
                  75,
                ],

          body:
            tableBody,
        },

        layout:
          'headerLineOnly',

        margin: [
          0,
          0,
          0,
          10,
        ],
      },

      // ==================================================
      // LINHA
      // ==================================================

      {
        canvas: [
          {
            type: 'line',

            x1: 0,

            y1: 0,

            x2:
              config.width,

            y2: 0,

            lineWidth:
              1,

            lineColor:
              '#eeeeee',
          },
        ],

        margin: [
          0,
          5,
        ],
      },

      // ==================================================
      // TOTAIS
      // ==================================================

      totalsBlock,

      // ==================================================
      // AVISO
      // ==================================================

      {
        text:
          'DOCUMENTO SEM VALOR DE FACTURA. ' ,
   

        fontSize:
          7,

        alignment:
          'center',

        color:
          '#78909c',

        margin: [
          20,
          25,
          20,
          0,
        ],
      },

      {
        text:
          ' Gerado pelo Sistema de Vendas',

        fontSize:
          7,

        alignment:
          'center',

        color:
          '#b0bec5',

        margin: [
          0,
          10,
          0,
          0,
        ],
      },
    ],

    styles: {

      tableHeader: {
        fontSize:
          7,

        bold:
          true,

        color:
          '#ffffff',

        fillColor:
          '#0d47a1',

        margin: [
          0,
          2,
          0,
          2,
        ],
      },
    },
  };

  // ====================================================
  // IMPRIMIR
  // ====================================================

  pdfMake
    .createPdf(
      docDefinition
    )
    .print();
};