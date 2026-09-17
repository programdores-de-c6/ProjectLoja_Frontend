import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  MonthlyReport,
  MonthlySaleRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const datePt = (
  value?: string
): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(
    'pt-PT'
  );
};

const moneyNumber = (
  value?: number
): string =>
  Number(
    value ?? 0
  ).toLocaleString(
    'pt-PT',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

export const printMonthlyFinancialReportPdf = (
  report: MonthlyReport,
  year: number,
  month: number,
  shop?: ReportShop
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

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  const summary =
    report.summary;

  const unidade =
    shop?.nome ||
    'Visão Global';

  const mes =
    String(month).padStart(
      2,
      '0'
    );

  // ====================================================
  // CABEÇALHO PADRONIZADO
  // ====================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop,
      title:
        'RECEITA MENSAL — FINANÇAS',
      from:
        `${year}-${mes}-01`,
      to:
        `${year}-${mes}`,
      left: 14,
      right: 14,
      formatDate: () =>
        `${mes}/${year}`,
    });

  // ====================================================
  // MODELO
  // ====================================================

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
    'Modelo: emitted_document',
    14,
    contentStartY
  );

  // ====================================================
  // RESUMO
  // ====================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    10.5
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  const summaryTitleY =
    contentStartY +
    9;

  pdf.text(
    'RESUMO DO PERÍODO',
    14,
    summaryTitleY
  );

  const gap = 4;
  const cardHeight = 18;
  const available =
    width - 28;

  const cardWidth =
    (
      available -
      gap * 3
    ) / 4;

  const cardY =
    summaryTitleY +
    5;

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
      highlight ? 75 : 220,
      highlight ? 170 : 225,
      highlight ? 110 : 230
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
      6.5
    );

    pdf.setTextColor(
      highlight ? 20 : 100,
      highlight ? 120 : 110,
      highlight ? 75 : 125
    );

    pdf.text(
      label.toUpperCase(),
      x + 4,
      cardY + 6
    );

    pdf.setFontSize(
      highlight
        ? 10.5
        : 9
    );

    pdf.setTextColor(
      highlight ? 20 : 25,
      highlight ? 120 : 35,
      highlight ? 75 : 50
    );

    pdf.text(
      value,
      x + 4,
      cardY + 14
    );
  };

  drawCard(
    14,
    'Facturas',
    String(
      summary.salesCount ?? 0
    )
  );

  drawCard(
    14 +
      cardWidth +
      gap,
    'Itens',
    String(
      summary.itemsCount ?? 0
    )
  );

  drawCard(
    14 +
      (cardWidth + gap) * 2,
    'Impostos',
    `${moneyNumber(
      summary.tax
    )} Db`
  );

  drawCard(
    14 +
      (cardWidth + gap) * 3,
    'Total facturado',
    `${moneyNumber(
      summary.total
    )} Db`,
    true
  );

  // ====================================================
  // TABELA
  // ====================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    10.5
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  const detailTitleY =
    cardY +
    cardHeight +
    9;

  pdf.text(
    'EMITTED_DOCUMENT',
    14,
    detailTitleY
  );

  pdf.setFont(
    'helvetica',
    'normal'
  );

  pdf.setFontSize(
    6.5
  );

  pdf.setTextColor(
    110,
    110,
    110
  );

  pdf.text(
    'A exportação mantém exactamente a ordem de colunas do modelo.',
    14,
    detailTitleY + 5
  );

  const body =
    rows.map(
      (
        row: MonthlySaleRow
      ) => [
        row.documentoNumero ?? '',
        row.documentoSerie ?? '',
        datePt(
          row.documentoData
        ),
        row.nifConsumidor ?? '',
        moneyNumber(
          row.totalValorItens
        ),
        moneyNumber(
          row.taxAplicavelItens
        ),
        row.codigoIsento ?? '',
        row.quantItens ?? '',
        row.descItens ?? '',
        row.numeroDocumentoOrigem ?? '',
        datePt(
          row.dataDocumentoOrigem
        ),
        row.tipoDocumento ?? '',
      ]
    );

  autoTable(
    pdf,
    {
      startY:
        detailTitleY + 10,

      head: [[
        'documento_numero',
        'documento_serie',
        'documento_data',
        'nif_consumidor',
        'total_valor_itens',
        'tax_aplicavel_itens',
        'codigo_isento',
        'quant_itens',
        'desc_itens',
        'numero_documento_origem',
        'data_documento_origem',
        'tipo_documento',
      ]],

      body,

      theme: 'striped',

      showHead:
        'everyPage',

      styles: {
        font: 'helvetica',
        fontSize: 5.2,
        cellPadding: 1.0,
        valign: 'middle',
        overflow: 'linebreak',
      },

      headStyles: {
        fontStyle: 'bold',
        fontSize: 5.1,
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
      },

      columnStyles: {
        0: {
          cellWidth: 22,
        },
        1: {
          cellWidth: 21,
        },
        2: {
          cellWidth: 23,
        },
        3: {
          cellWidth: 27,
        },
        4: {
          cellWidth: 25,
          halign: 'right',
        },
        5: {
          cellWidth: 27,
          halign: 'right',
        },
        6: {
          cellWidth: 20,
          halign: 'center',
        },
        7: {
          cellWidth: 18,
          halign: 'center',
        },
        8: {
          cellWidth: 30,
        },
        9: {
          cellWidth: 29,
        },
        10: {
          cellWidth: 27,
        },
        11: {
          cellWidth: 23,
        },
      },

      margin: {
        left: 14,
        right: 14,
        bottom: 16,
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
          h - 12,
          w - 8,
          h - 12
        );

        pdf.setFont(
          'helvetica',
          'normal'
        );

        pdf.setFontSize(
          6.5
        );

        pdf.setTextColor(
          110,
          110,
          110
        );

        pdf.text(
          `Receita Mensal — ${unidade}`,
          8,
          h - 7
        );

        pdf.text(
          `Página ${page}`,
          w - 24,
          h - 7
        );
      },
    }
  );

  // ====================================================
  // TOTAL
  // ====================================================

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    )
      .lastAutoTable
      ?.finalY ?? 100;

  if (
    finalY <
    height - 22
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
      `TOTAL FACTURADO: ${moneyNumber(
        summary.total
      )} Db`,
      14,
      finalY + 8
    );
  }

  // ====================================================
  // ABRIR / IMPRIMIR
  // ====================================================

  const blob =
    pdf.output('blob');

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
      `receita-mensal-${year}-${mes}.pdf`
    );
  }

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
};