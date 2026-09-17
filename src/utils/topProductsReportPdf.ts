import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  TopProductsReport,
  TopProductRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const money = (
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
};

const datePt = (
  value?: string
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

  return date.toLocaleDateString(
    'pt-PT'
  );
};

export const printTopProductsReportPdf = (
  report: TopProductsReport,
  from: string,
  to: string,
  shop?: ReportShop
): void => {
  const pdf =
    new jsPDF({
      orientation:
        'landscape',
      unit: 'mm',
      format: 'a4',
    });

  const width =
    pdf.internal.pageSize.getWidth();


  const rows =
    Array.isArray(
      report.rows
    )
      ? report.rows
      : [];

  const summary =
    report.summary;

  const unidade =
    shop?.nome ||
    'Visão Global';

  // ==================================================
  // CABEÇALHO PADRONIZADO
  // ==================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop,
      title:
        'RELATÓRIO DE PRODUTOS MAIS VENDIDOS',
      from,
      to,
      left: 14,
      right: 14,
      formatDate: datePt,
    });

  // ==================================================
  // RESUMO
  // ==================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    11
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  const summaryTitleY =
    contentStartY + 2;

  pdf.text(
    'RESUMO DO PERÍODO',
    14,
    summaryTitleY
  );

  const cardGap = 4;
  const cardHeight = 20;
  const margin = 14;

  const available =
    width -
    margin * 2;

  const cardWidth =
    (
      available -
      cardGap * 3
    ) / 4;

  const cardY =
    summaryTitleY + 5;

  const drawCard = (
    x: number,
    label: string,
    value: string,
    highlight = false
  ): void => {

    pdf.setFillColor(
      highlight ? 235 : 248,
      highlight ? 248 : 250,
      highlight ? 240 : 252
    );

    pdf.setDrawColor(
      highlight ? 70 : 220,
      highlight ? 170 : 225,
      highlight ? 110 : 230
    );

    pdf.setLineWidth(
      highlight ? 0.6 : 0.3
    );

    pdf.roundedRect(
      x,
      cardY,
      cardWidth,
      cardHeight,
      2,
      2,
      'FD'
    );

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(
      7
    );

    pdf.setTextColor(
      highlight ? 20 : 100,
      highlight ? 120 : 110,
      highlight ? 75 : 125
    );

    pdf.text(
      label.toUpperCase(),
      x + 5,
      cardY + 7
    );

    pdf.setFontSize(
      highlight ? 12 : 10
    );

    pdf.setTextColor(
      highlight ? 20 : 25,
      highlight ? 120 : 35,
      highlight ? 75 : 50
    );

    pdf.text(
      value,
      x + 5,
      cardY + 15
    );
  };

  drawCard(
    margin,
    'Produtos',
    String(
      summary.productsCount ??
        0
    )
  );

  drawCard(
    margin +
      cardWidth +
      cardGap,
    'Unidades vendidas',
    String(
      summary.itemsCount ??
        0
    )
  );

  drawCard(
    margin +
      (
        cardWidth +
        cardGap
      ) * 2,
    'Subtotal',
    money(
      summary.subtotal
    )
  );

  drawCard(
    margin +
      (
        cardWidth +
        cardGap
      ) * 3,
    'Facturação',
    money(
      summary.total
    ),
    true
  );

  // ==================================================
  // TABELA
  // ==================================================

  const tableY =
    cardY +
    cardHeight +
    10;

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    11
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  pdf.text(
    'RANKING DE PRODUTOS',
    14,
    tableY
  );

  const total =
    Number(
      summary.total ?? 0
    );

  const body =
    rows.map(
      (
        row: TopProductRow,
        index: number
      ) => {

        const rowTotal =
          Number(
            row.total ?? 0
          );

        const percentage =
          total > 0
            ? (
                rowTotal /
                total
              ) * 100
            : 0;

        return [
          String(
            index + 1
          ),

          row.nome || '-',

          String(
            row.quantidade ?? 0
          ),

          money(
            row.subtotal
          ),

          money(
            row.total
          ),

          `${percentage.toFixed(
            2
          )}%`,
        ];
      }
    );

  autoTable(
    pdf,
    {
      startY:
        tableY + 6,

      showHead:
        'everyPage',

      head: [[
        '#',
        'Produto',
        'Quantidade',
        'Subtotal',
        'Facturação',
        '% Total',
      ]],

      body,

      theme:
        'striped',

      styles: {
        font:
          'helvetica',

        fontSize:
          7,

        cellPadding:
          2,

        valign:
          'middle',

        overflow:
          'linebreak',
      },

      headStyles: {
        fontStyle:
          'bold',

        fontSize:
          7,

        halign:
          'center',

        fillColor: [
          35,
          120,
          175,
        ],

        textColor: [
          255,
          255,
          255,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 10,
          halign:
            'center',
        },

        1: {
          cellWidth: 100,
          halign:
            'left',
        },

        2: {
          cellWidth: 35,
          halign:
            'center',
        },

        3: {
          cellWidth: 45,
          halign:
            'right',
        },

        4: {
          cellWidth: 50,
          halign:
            'right',
        },

        5: {
          cellWidth: 30,
          halign:
            'right',
        },
      },

      margin: {
        left: 14,
        right: 14,
        bottom: 18,
      },

      didDrawPage: () => {
        const page =
          pdf
            .getCurrentPageInfo()
            .pageNumber;

        const w =
          pdf.internal.pageSize.getWidth();

        const h =
          pdf.internal.pageSize.getHeight();

        pdf.setDrawColor(
          225,
          228,
          232
        );

        pdf.setLineWidth(
          0.3
        );

        pdf.line(
          8,
          h - 13,
          w - 8,
          h - 13
        );

        pdf.setFont(
          'helvetica',
          'normal'
        );

        pdf.setFontSize(
          7
        );

        pdf.setTextColor(
          110,
          110,
          110
        );

        pdf.text(
          `Relatório de Produtos — ${unidade}`,
          8,
          h - 8
        );

        pdf.text(
          `Página ${page}`,
          w - 25,
          h - 8
        );
      },
    }
  );

  // ==================================================
  // ABRIR / IMPRIMIR
  // ==================================================

  const blob =
    pdf.output(
      'blob'
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const win =
    window.open(
      url,
      '_blank'
    );

  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  } else {
    pdf.save(
      `relatorio-produtos-${from}-${to}.pdf`
    );
  }

  setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    60000
  );
};