import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  PaymentReport,
  PaymentRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

// ====================================================
// FORMATAÇÃO
// ====================================================

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

// ====================================================
// PDF — RELATÓRIO DE PAGAMENTOS
// ====================================================

export const printPaymentReportPdf = (
  report: PaymentReport,
  from: string,
  to: string,
  shopData?: ReportShop
): void => {

  if (!report) {
    return;
  }

  // ==================================================
  // DOCUMENTO
  // ==================================================

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const marginLeft = 14;
  const marginRight = 14;

  // ==================================================
  // DADOS
  // ==================================================

  const summary =
    report.summary;

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  const currentShop =
    shopData?.nome ||
    'Visão Global';

  // ==================================================
  // CABEÇALHO PADRONIZADO
  // ==================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop: shopData,
      title: 'RELATÓRIO DE PAGAMENTOS',
      from,
      to,
      left: marginLeft,
      right: marginRight,
      formatDate: (
        value?: string
      ) => {

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
      },
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
    marginLeft,
    summaryTitleY
  );

  // ==================================================
  // CARTÕES
  // ==================================================

  const cardGap = 4;

  const cardHeight = 20;

  const availableWidth =
    pageWidth -
    marginLeft -
    marginRight;

  const cardWidth =
    (
      availableWidth -
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

    if (highlight) {

      pdf.setFillColor(
        235,
        248,
        240
      );

      pdf.setDrawColor(
        70,
        170,
        110
      );

    } else {

      pdf.setFillColor(
        248,
        250,
        252
      );

      pdf.setDrawColor(
        220,
        225,
        230
      );
    }

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

    // ------------------------------------------------
    // LABEL
    // ------------------------------------------------

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

    // ------------------------------------------------
    // VALOR
    // ------------------------------------------------

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
    marginLeft,
    'Vendas',
    String(
      summary.salesCount ?? 0
    )
  );

  drawCard(
    marginLeft +
      cardWidth +
      cardGap,
    'Total recebido',
    money(
      summary.total
    ),
    true
  );

  drawCard(
    marginLeft +
      (cardWidth + cardGap) * 2,
    'Ticket médio',
    money(
      summary.averageTicket
    )
  );

  drawCard(
    marginLeft +
      (cardWidth + cardGap) * 3,
    'Método principal',
    summary.mainMethod || '-'
  );

  // ==================================================
  // DISTRIBUIÇÃO
  // ==================================================

  const distributionY =
    cardY +
    cardHeight +
    17;

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
    'DISTRIBUIÇÃO POR MÉTODO DE PAGAMENTO',
    marginLeft,
    distributionY
  );

  // ==================================================
  // TABELA
  // ==================================================

  const body =
    rows.map(
      (
        row: PaymentRow
      ) => [

        row.metodo || '-',

        String(
          row.vendas ?? 0
        ),

        money(
          row.total
        ),

        `${Number(
          row.percentagem ?? 0
        ).toFixed(2)}%`,

      ]
    );

  autoTable(
    pdf,
    {

      startY:
        distributionY + 7,

      head: [[

        'Método',

        'N.º de vendas',

        'Total',

        'Percentagem',

      ]],

      body,

      theme:
        'striped',

      showHead:
        'everyPage',

      styles: {

        font:
          'helvetica',

        fontSize:
          8,

        cellPadding:
          2.3,

        valign:
          'middle',

      },

      headStyles: {

        font:
          'helvetica',

        fontStyle:
          'bold',

        fontSize:
          8,

        halign:
          'center',

        textColor: [
          255,
          255,
          255,
        ],

        fillColor: [
          35,
          120,
          175,
        ],

      },

      columnStyles: {

        0: {
          cellWidth: 80,
        },

        1: {
          cellWidth: 38,
          halign:
            'center',
        },

        2: {
          cellWidth: 50,
          halign:
            'right',
        },

        3: {
          cellWidth: 40,
          halign:
            'right',
        },

      },

      margin: {

        left:
          marginLeft,

        right:
          marginRight,

        bottom:
          18,

      },

      didDrawPage: () => {

        const page =
          pdf
            .getCurrentPageInfo()
            .pageNumber;

        const width =
          pdf
            .internal
            .pageSize
            .getWidth();

        const height =
          pdf
            .internal
            .pageSize
            .getHeight();

        // ------------------------------------------------
        // LINHA DO RODAPÉ
        // ------------------------------------------------

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
          height - 13,
          width - 8,
          height - 13
        );

        // ------------------------------------------------
        // RODAPÉ
        // ------------------------------------------------

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
          `Relatório de Pagamentos — ${currentShop}`,
          8,
          height - 8
        );

        pdf.text(
          `Página ${page}`,
          width - 25,
          height - 8
        );
      },

    }
  );

  // ==================================================
  // TOTAL FINAL
  // ==================================================

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    )
      .lastAutoTable
      ?.finalY
      ?? 100;

  if (
    finalY <
    pageHeight - 25
  ) {

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `TOTAL RECEBIDO: ${money(
        summary.total
      )}`,
      marginLeft,
      finalY + 10
    );
  }

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

  const printWindow =
    window.open(
      url,
      '_blank'
    );

  if (printWindow) {

    printWindow.onload = () => {

      printWindow.focus();

      printWindow.print();

    };

    setTimeout(
      () => {
        URL.revokeObjectURL(
          url
        );
      },
      60000
    );

  } else {

    pdf.save(
      `relatorio-pagamentos-${from}-${to}.pdf`
    );

    URL.revokeObjectURL(
      url
    );
  }
};