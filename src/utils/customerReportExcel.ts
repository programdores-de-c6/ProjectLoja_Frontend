import ExcelJS from 'exceljs';

import {
  CustomerReport,
  CustomerRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const moneyExcel = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const dateExcel = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-PT');
};

export const exportCustomerReportExcel = async (
  report: CustomerReport,
  from: string,
  to: string,
  shop?: ReportShop
): Promise<void> => {
  if (!report) return;

  const workbook = new ExcelJS.Workbook();

  // ============================================================
  // RESUMO
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
      title: 'RELATÓRIO DE CLIENTES',
      from,
      to,
      startRow: 1,
      lastColumn: 2,
      formatDate: dateExcel,
    });

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  const total =
    Number(report.total ?? 0);

  const totalCompras =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(row.compras ?? 0),
      0
    );

  const mediaPorCliente =
    rows.length > 0
      ? total / rows.length
      : 0;

  // ============================================================
  // TÍTULO DO RESUMO
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
    color: { argb: 'FFFFFF' },
  };

  summaryTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2363EB' },
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

  // ============================================================
  // RESUMO
  // ============================================================

  const summaryData: Array<
    [string, string | number]
  > = [
    [
      'Clientes',
      Number(
        report.customersCount ??
        rows.length
      ),
    ],
    [
      'Compras',
      totalCompras,
    ],
    [
      'Média / cliente',
      moneyExcel(mediaPorCliente),
    ],
    [
      'Total gasto',
      moneyExcel(total),
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
          color: { argb: 'D0D7DE' },
        },
      };

      summarySheet.getCell(
        row,
        2
      ).border = {
        bottom: {
          style: 'hair',
          color: { argb: 'D0D7DE' },
        },
      };

      row++;
    }
  );

  // ============================================================
  // CLIENTES
  // ============================================================

  const customerSheet =
    workbook.addWorksheet(
      'Clientes'
    );

  customerSheet.columns = [
    { width: 10 },
    { width: 40 },
    { width: 22 },
    { width: 12 },
    { width: 18 },
    { width: 18 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
  ];

  const headerRow =
    customerSheet.getRow(1);

  headerRow.values = [
    'Ranking',
    'Cliente',
    'NIF',
    'Compras',
    'Total gasto',
    'Ticket médio',
    'Primeira compra',
    'Última compra',
    'Frequência média',
  ];

  headerRow.eachCell(
    (cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '14202D' },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      cell.border = {
        top: {
          style: 'thin',
          color: { argb: 'D0D7DE' },
        },
        bottom: {
          style: 'thin',
          color: { argb: 'D0D7DE' },
        },
      };
    }
  );

  headerRow.height = 30;

  // ============================================================
  // DADOS DOS CLIENTES
  // ============================================================

  rows.forEach(
    (
      customer: CustomerRow,
      index: number
    ) => {
      const dataRow =
        customerSheet.getRow(
          index + 2
        );

      dataRow.values = [
        index + 1,
        customer.nome ?? '-',
        customer.nif ?? '-',
        Number(
          customer.compras ?? 0
        ),
        moneyExcel(
          customer.total
        ),
        moneyExcel(
          customer.ticketMedio
        ),
        dateExcel(
          customer.primeiraCompra
        ),
        dateExcel(
          customer.ultimaCompra
        ),
        `${Number(
          customer.frequenciaMediaDias ??
            0
        ).toFixed(1)} dias`,
      ];

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
              color: { argb: 'D0D7DE' },
            },
          };
        }
      );
    }
  );

  // ============================================================
  // CONFIGURAÇÃO
  // ============================================================

  customerSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  customerSheet.autoFilter = {
    from: 'A1',
    to: 'I1',
  };

  customerSheet.pageSetup = {
    orientation: 'landscape',
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
    `relatorio-clientes-${from}-${to}.xlsx`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(url);
};