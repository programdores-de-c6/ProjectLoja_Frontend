import ExcelJS from 'exceljs';

import {
  PaymentReport,
  PaymentRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

// ============================================================
// FORMATAÇÃO
// ============================================================

const moneyExcel = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

// ============================================================
// EXPORTAÇÃO EXCEL — RELATÓRIO DE PAGAMENTOS
// ============================================================

export const exportPaymentReportExcel = async (
  report: PaymentReport,
  from: string,
  to: string,
  shop?: ReportShop
): Promise<void> => {
  if (!report) {
    throw new Error(
      'Relatório de pagamentos inexistente.'
    );
  }

  const workbook =
    new ExcelJS.Workbook();

  // ============================================================
  // FOLHA 1 — RESUMO
  // ============================================================

  const summarySheet =
    workbook.addWorksheet('Resumo');

  summarySheet.columns = [
    { width: 34 },
    { width: 48 },
  ];

  const startRow =
    await drawReportExcelHeader({
      workbook,
      worksheet: summarySheet,
      shop,
      title: 'RELATÓRIO DE PAGAMENTOS',
      from,
      to,
      startRow: 1,
      lastColumn: 2,
      formatDate: (value?: string) => {
        if (!value) {
          return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return '-';
        }

        return date.toLocaleDateString(
          'pt-PT'
        );
      },
    });

  // ============================================================
  // RESUMO DO PERÍODO
  // ============================================================

  summarySheet.mergeCells(
    startRow,
    1,
    startRow,
    2
  );

  const summaryTitle =
    summarySheet.getCell(
      startRow,
      1
    );

  summaryTitle.value =
    'RESUMO DO PERÍODO';

  summaryTitle.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: {
      argb: 'FFFFFF',
    },
  };

  summaryTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: '2363EB',
    },
  };

  summaryTitle.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  summarySheet.getRow(
    startRow
  ).height = 20;

  let row =
    startRow + 1;

  const summaryData: Array<
    [string, string | number]
  > = [
    [
      'Número de vendas',
      Number(
        report.summary.salesCount ?? 0
      ),
    ],
    [
      'Total recebido',
      moneyExcel(
        report.summary.total
      ),
    ],
    [
      'Ticket médio',
      moneyExcel(
        report.summary.averageTicket
      ),
    ],
    [
      'Método principal',
      report.summary.mainMethod || '-',
    ],
  ];

  summaryData.forEach(
    ([label, value]) => {
      summarySheet.getCell(
        row,
        1
      ).value = label;

      summarySheet.getCell(
        row,
        2
      ).value = value;

      summarySheet.getCell(
        row,
        1
      ).font = {
        name: 'Arial',
        size: 10,
        bold: true,
      };

      summarySheet.getCell(
        row,
        2
      ).font = {
        name: 'Arial',
        size: 10,
      };

      summarySheet.getCell(
        row,
        1
      ).border = {
        bottom: {
          style: 'hair',
          color: {
            argb: 'D0D7DE',
          },
        },
      };

      summarySheet.getCell(
        row,
        2
      ).border = {
        bottom: {
          style: 'hair',
          color: {
            argb: 'D0D7DE',
          },
        },
      };

      row++;
    }
  );

  summarySheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
  };

  // ============================================================
  // FOLHA 2 — PAGAMENTOS
  // ============================================================

  const paymentSheet =
    workbook.addWorksheet(
      'Pagamentos'
    );

  paymentSheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
  ];

  const paymentHeader =
    paymentSheet.getRow(1);

  paymentHeader.values = [
    'Método',
    'Número de vendas',
    'Total',
    'Percentagem',
  ];

  paymentHeader.eachCell(
    (cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '14202D',
        },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      cell.border = {
        top: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
        bottom: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
      };
    }
  );

  paymentHeader.height = 30;

  // ============================================================
  // DADOS DOS PAGAMENTOS
  // ============================================================

  (report.rows ?? []).forEach(
    (payment: PaymentRow) => {
      const dataRow =
        paymentSheet.addRow([
          payment.metodo || '-',
          Number(
            payment.vendas ?? 0
          ),
          moneyExcel(
            payment.total
          ),
          `${Number(
            payment.percentagem ?? 0
          ).toFixed(2)}%`,
        ]);

      dataRow.eachCell(
        (cell) => {
          cell.font = {
            name: 'Arial',
            size: 9,
          };

          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
          };

          cell.border = {
            bottom: {
              style: 'hair',
              color: {
                argb: 'D0D7DE',
              },
            },
          };
        }
      );
    }
  );

  paymentSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  paymentSheet.autoFilter = {
    from: 'A1',
    to: 'D1',
  };

  paymentSheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // ============================================================
  // FOLHA 3 — ANÁLISE
  // ============================================================

  const analysisSheet =
    workbook.addWorksheet(
      'Análise'
    );

  analysisSheet.columns = [
    { width: 25 },
    { width: 15 },
    { width: 20 },
    { width: 18 },
  ];

  const analysisHeader =
    analysisSheet.getRow(1);

  analysisHeader.values = [
    'Método',
    'Vendas',
    'Total',
    'Percentagem',
  ];

  analysisHeader.eachCell(
    (cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '14202D',
        },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      cell.border = {
        top: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
        bottom: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
      };
    }
  );

  analysisHeader.height = 30;

  // ============================================================
  // DADOS DA ANÁLISE
  // ============================================================

  (report.rows ?? []).forEach(
    (payment: PaymentRow) => {
      const dataRow =
        analysisSheet.addRow([
          payment.metodo || '-',
          Number(
            payment.vendas ?? 0
          ),
          moneyExcel(
            payment.total
          ),
          `${Number(
            payment.percentagem ?? 0
          ).toFixed(2)}%`,
        ]);

      dataRow.eachCell(
        (cell) => {
          cell.font = {
            name: 'Arial',
            size: 9,
          };

          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
          };

          cell.border = {
            bottom: {
              style: 'hair',
              color: {
                argb: 'D0D7DE',
              },
            },
          };
        }
      );
    }
  );

  analysisSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  analysisSheet.autoFilter = {
    from: 'A1',
    to: 'D1',
  };

  analysisSheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // ============================================================
  // EXPORTAÇÃO
  // ============================================================

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob =
    new Blob(
      [buffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    `relatorio-pagamentos-${from}-${to}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};