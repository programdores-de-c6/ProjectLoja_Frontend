import ExcelJS from 'exceljs';

import {
  StockMovementReport,
  StockMovementRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const typeLabel = (
  value?: string
): string => {
  const type = (
    value ?? ''
  ).toLocaleUpperCase('pt-PT');

  return type === 'TRANSFERENCIA'
    ? 'TRANSFERÊNCIA'
    : type || 'N/D';
};

const dateTimePt = (
  value?: string
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('pt-PT');
};

export const exportStockMovementsReportExcel = async (
  report: StockMovementReport,
  reportShop?: ReportShop,
  filterLabel?: string,
  from?: string,
  to?: string
): Promise<void> => {
  if (!report) return;

  const workbook =
    new ExcelJS.Workbook();

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  // ============================================================
  // CÁLCULOS
  // ============================================================

  const entries = rows
    .filter(
      (row) =>
        (
          row.tipo ?? ''
        ).toLocaleUpperCase(
          'pt-PT'
        ) === 'ENTRADA'
    )
    .reduce(
      (sum, row) =>
        sum +
        Number(
          row.quantidade ?? 0
        ),
      0
    );

  const exits = rows
    .filter(
      (row) =>
        (
          row.tipo ?? ''
        ).toLocaleUpperCase(
          'pt-PT'
        ) === 'SAÍDA'
    )
    .reduce(
      (sum, row) =>
        sum +
        Number(
          row.quantidade ?? 0
        ),
      0
    );

  const transfers = rows
    .filter(
      (row) =>
        (
          row.tipo ?? ''
        ).toLocaleUpperCase(
          'pt-PT'
        ) === 'TRANSFERENCIA'
    )
    .reduce(
      (sum, row) =>
        sum +
        Number(
          row.quantidade ?? 0
        ),
      0
    );

  const adjustments = rows
    .filter(
      (row) =>
        (
          row.tipo ?? ''
        ).toLocaleUpperCase(
          'pt-PT'
        ) === 'AJUSTE'
    )
    .reduce(
      (sum, row) =>
        sum +
        Number(
          row.quantidade ?? 0
        ),
      0
    );

  // ============================================================
  // FOLHA 1 — RESUMO
  // ============================================================

  const summarySheet =
    workbook.addWorksheet(
      'Resumo'
    );

  summarySheet.columns = [
    { width: 34 },
    { width: 48 },
  ];

  const startRow =
    await drawReportExcelHeader({
      workbook,
      worksheet: summarySheet,
      shop: reportShop,
      title:
        'RELATÓRIO DE MOVIMENTOS DE STOCK',
      from,
      to,
      startRow: 1,
      lastColumn: 2,
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
    'RESUMO DOS MOVIMENTOS';

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
      'Filtro',
      filterLabel || 'Todos',
    ],
    [
      'Movimentos',
      Number(
        report.movementsCount ??
          rows.length
      ),
    ],
    [
      'Entradas',
      entries,
    ],
    [
      'Saídas',
      exits,
    ],
    [
      'Transferências',
      transfers,
    ],
    [
      'Ajustes',
      adjustments,
    ],
    [
      'Quantidade movimentada',
      Number(
        report.totalQuantity ?? 0
      ),
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
  // FOLHA 2 — MOVIMENTOS
  // ============================================================

  const detailSheet =
    workbook.addWorksheet(
      'Movimentos'
    );

  detailSheet.columns = [
    { width: 21 },
    { width: 38 },
    { width: 18 },
    { width: 14 },
    { width: 45 },
    { width: 28 },
    { width: 28 },
  ];

  // ============================================================
  // CABEÇALHO
  // ============================================================

  const headerRow =
    detailSheet.getRow(1);

  headerRow.values = [
    'Data',
    'Produto',
    'Tipo',
    'Quantidade',
    'Motivo',
    'Funcionário',
    'Loja',
  ];

  headerRow.eachCell(
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

  headerRow.height = 30;

  // ============================================================
  // DADOS
  // ============================================================

  rows.forEach(
    (
      row: StockMovementRow
    ) => {
      const dataRow =
        detailSheet.addRow([
          dateTimePt(
            row.data
          ),
          row.produto ?? '-',
          typeLabel(
            row.tipo
          ),
          Number(
            row.quantidade ?? 0
          ),
          row.motivo ?? '-',
          row.funcionario ?? '-',
          row.loja ??
            reportShop?.nome ??
            'Visão Global',
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

  // ============================================================
  // CONFIGURAÇÃO
  // ============================================================

  detailSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  detailSheet.autoFilter = {
    from: 'A1',
    to: 'G1',
  };

  detailSheet.pageSetup = {
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
    `relatorio-movimentos-stock-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(url);
};