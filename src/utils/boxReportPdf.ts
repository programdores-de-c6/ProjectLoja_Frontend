import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  BoxReport,
  BoxRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const money = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const dateTimePt = (
  value?: string
): string => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('pt-PT');
};

export const printBoxReportPdf = (
  report: BoxReport,
  from: string,
  to: string,
  reportShop?: ReportShop
): void => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width =
    pdf.internal.pageSize.getWidth();

  const height =
    pdf.internal.pageSize.getHeight();

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  const summary = report;

  const unidade =
    reportShop?.nome ||
    'Visão Global';

  // ==================================================
  // CABEÇALHO PADRONIZADO
  // ==================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop: reportShop,
      title: 'RELATÓRIO DE CAIXAS',
      from,
      to,
      left: 14,
      right: 14,
      formatDate: (value) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
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

  pdf.setFontSize(11);

  pdf.setTextColor(
    20,
    30,
    45
  );

  const summaryTitleY =
    contentStartY + 2;

  pdf.text(
    'RESUMO DOS CAIXAS',
    14,
    summaryTitleY
  );

  const gap = 4;
  const cardH = 20;
  const available = width - 28;
  const cardW =
    (available - gap * 3) / 4;

  const cardY =
    summaryTitleY + 5;

  const totalDifference =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.difference ?? 0
        ),
      0
    );

  const averagePerBox =
    Number(
      summary.boxesCount ?? 0
    ) > 0
      ? Number(
          summary.totalSales ?? 0
        ) /
        Number(
          summary.boxesCount
        )
      : 0;

  const drawCard = (
    x: number,
    label: string,
    value: string,
    highlight = false
  ) => {
    pdf.setFillColor(
      highlight ? 235 : 248,
      highlight ? 248 : 250,
      highlight ? 240 : 252
    );

    pdf.setDrawColor(
      highlight ? 75 : 220,
      highlight ? 170 : 225,
      highlight ? 110 : 230
    );

    pdf.roundedRect(
      x,
      cardY,
      cardW,
      cardH,
      2,
      2,
      'FD'
    );

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(7);

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
    14,
    'Caixas',
    String(
      summary.boxesCount ?? 0
    )
  );

  drawCard(
    14 + cardW + gap,
    'Total de vendas',
    money(
      summary.totalSales
    )
  );

  drawCard(
    14 +
      (cardW + gap) * 2,
    'Média / caixa',
    money(averagePerBox)
  );

  drawCard(
    14 +
      (cardW + gap) * 3,
    'Diferença total',
    money(totalDifference),
    true
  );

  // ==================================================
  // DETALHE
  // ==================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(11);

  pdf.setTextColor(
    20,
    30,
    45
  );

  const detailTitleY =
    cardY + cardH + 9;

  pdf.text(
    'DETALHE DOS CAIXAS',
    14,
    detailTitleY
  );

  pdf.setFont(
    'helvetica',
    'normal'
  );

  pdf.setFontSize(7);

  pdf.setTextColor(
    110,
    110,
    110
  );

  pdf.text(
    'Valores monetários em Dobras (Db).',
    14,
    detailTitleY + 4
  );

  const body = rows.map(
    (row: BoxRow) => [
      `#${row.id}`,
      dateTimePt(
        row.openingDate
      ),
      dateTimePt(
        row.closingDate
      ),
      row.openedBy || '-',
      row.closedBy || '-',
      money(
        row.openingValue
      ),
      money(
        row.salesTotal
      ),
      money(
        row.expectedClosingValue
      ),
      money(
        row.closingValue
      ),
      money(
        row.difference
      ),
      String(
        row.salesCount ?? 0
      ),
      row.status || 'N/D',
    ]
  );

  autoTable(pdf, {
    startY: detailTitleY + 8,

    head: [[
      'Caixa',
      'Abertura',
      'Fecho',
      'Aberto por',
      'Fechado por',
      'Inicial',
      'Vendas',
      'Esperado',
      'Final',
      'Diferença',
      'Nº vendas',
      'Estado',
    ]],

    body,

    theme: 'striped',

    showHead: 'everyPage',

    styles: {
      font: 'helvetica',
      fontSize: 5.4,
      cellPadding: 1.0,
      valign: 'middle',
      overflow: 'linebreak',
      lineWidth: 0.1,
    },

    headStyles: {
      fontStyle: 'bold',
      fontSize: 5.4,
      halign: 'center',
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
      cellPadding: 1.0,
    },

    columnStyles: {
      0: {
        cellWidth: 15,
        halign: 'center',
      },
      1: {
        cellWidth: 24,
        halign: 'left',
      },
      2: {
        cellWidth: 24,
        halign: 'left',
      },
      3: {
        cellWidth: 27,
        halign: 'left',
      },
      4: {
        cellWidth: 27,
        halign: 'left',
      },
      5: {
        cellWidth: 21,
        halign: 'right',
      },
      6: {
        cellWidth: 23,
        halign: 'right',
      },
      7: {
        cellWidth: 23,
        halign: 'right',
      },
      8: {
        cellWidth: 23,
        halign: 'right',
      },
      9: {
        cellWidth: 23,
        halign: 'right',
      },
      10: {
        cellWidth: 16,
        halign: 'center',
      },
      11: {
        cellWidth: 22,
        halign: 'center',
      },
    },

    margin: {
      left: 14,
      right: 15,
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

      pdf.setLineWidth(0.3);

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

      pdf.setFontSize(7);

      pdf.setTextColor(
        110,
        110,
        110
      );

      pdf.text(
        `Relatório de Caixas — ${unidade}`,
        8,
        h - 8
      );

      pdf.text(
        `Página ${page}`,
        w - 25,
        h - 8
      );
    },
  });

  // ==================================================
  // TOTAL
  // ==================================================

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable
      ?.finalY ?? 100;

  if (
    finalY <
    height - 25
  ) {
    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(9);

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `TOTAL DE VENDAS: ${money(
        summary.totalSales
      )}`,
      14,
      finalY + 8
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(7);

    pdf.setTextColor(
      110,
      110,
      110
    );

    pdf.text(
      `DIFERENÇA TOTAL: ${money(
        totalDifference
      )}`,
      14,
      finalY + 13
    );
  }

  // ==================================================
  // IMPRESSÃO
  // ==================================================

  const blob =
    pdf.output('blob');

  const url =
    URL.createObjectURL(blob);

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
      `relatorio-caixas-${from}-${to}.pdf`
    );
  }

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
};