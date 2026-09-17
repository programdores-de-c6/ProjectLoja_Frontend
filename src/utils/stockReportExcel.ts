import ExcelJS from 'exceljs';

import {
  StockReport,
  StockRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const moneyExcel = (
  value?: number
): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

export const exportStockReportExcel = async (
  report: StockReport,
  reportShop?: ReportShop,
  filterLabel?: string
): Promise<void> => {
  if (!report) return;

  const workbook =
    new ExcelJS.Workbook();

  const summary =
    report.summary;

  // ============================================================
  // RESUMO
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
      title: 'RELATÓRIO DE STOCK',
      startRow: 1,
      lastColumn: 2,
      formatDate: () => '-',
    });

  // ============================================================
  // RESUMO DO STOCK
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
    'RESUMO DO STOCK';

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
      'Produtos',
      Number(
        summary.productsCount ?? 0
      ),
    ],
    [
      'Stock baixo',
      Number(
        summary.stockBaixo ?? 0
      ),
    ],
    [
      'Sem stock',
      Number(
        summary.semStock ?? 0
      ),
    ],
    [
      'Valor do inventário',
      moneyExcel(
        summary.valorInventario
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
  // STOCK
  // ============================================================

  const stockSheet =
    workbook.addWorksheet(
      'Stock'
    );

  stockSheet.columns = [
    { width: 40 },
    { width: 22 },
    { width: 14 },
    { width: 12 },
    { width: 14 },
    { width: 16 },
    { width: 20 },
    { width: 18 },
  ];

  const stockHeader =
    stockSheet.getRow(1);

  stockHeader.values = [
    'Produto',
    'Código',
    'Quantidade',
    'Mínimo',
    'A repor',
    'Preço',
    'Valor inventário',
    'Estado',
  ];

  stockHeader.eachCell(
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

  stockHeader.height = 30;

  // ============================================================
  // DADOS DO STOCK
  // ============================================================

  (report.rows ?? []).forEach(
    (stock: StockRow) => {
      const quantidade =
        Number(
          stock.quantidade ?? 0
        );

      const minimo =
        Number(
          stock.minimo ?? 0
        );

      const aRepor =
        Math.max(
          0,
          minimo - quantidade
        );

      const dataRow =
        stockSheet.addRow([
          stock.produto ?? '-',
          stock.codigoBarra ?? '-',
          quantidade,
          minimo,
          aRepor,
          moneyExcel(
            stock.preco
          ),
          moneyExcel(
            stock.valorInventario
          ),
          stock.semStock
            ? 'SEM STOCK'
            : stock.baixo
              ? 'STOCK BAIXO'
              : 'NORMAL',
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

  stockSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  stockSheet.autoFilter = {
    from: 'A1',
    to: 'H1',
  };

  stockSheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // ============================================================
  // LISTA DE REPOSIÇÃO
  // ============================================================

  const replenishmentSheet =
    workbook.addWorksheet(
      'Reposição'
    );

  replenishmentSheet.columns = [
    { width: 40 },
    { width: 22 },
    { width: 16 },
    { width: 16 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
  ];

  const replenishmentHeader =
    replenishmentSheet.getRow(1);

  replenishmentHeader.values = [
    'Produto',
    'Código',
    'Stock actual',
    'Stock mínimo',
    'Quantidade a repor',
    'Preço unitário',
    'Valor estimado',
  ];

  replenishmentHeader.eachCell(
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

  replenishmentHeader.height = 30;

  const replenishmentRows =
    (report.rows ?? [])
      .map(
        (stock: StockRow) => {
          const quantidade =
            Number(
              stock.quantidade ?? 0
            );

          const minimo =
            Number(
              stock.minimo ?? 0
            );

          const aRepor =
            Math.max(
              0,
              minimo - quantidade
            );

          return {
            produto:
              stock.produto ?? '-',

            codigo:
              stock.codigoBarra ?? '-',

            stockActual:
              quantidade,

            stockMinimo:
              minimo,

            quantidadeARepor:
              aRepor,

            precoUnitario:
              Number(
                stock.preco ?? 0
              ),

            valorEstimado:
              aRepor *
              Number(
                stock.preco ?? 0
              ),
          };
        }
      )
      .filter(
        (stock) =>
          stock.quantidadeARepor > 0
      );

  replenishmentRows.forEach(
    (stock) => {
      const dataRow =
        replenishmentSheet.addRow([
          stock.produto,
          stock.codigo,
          stock.stockActual,
          stock.stockMinimo,
          stock.quantidadeARepor,
          moneyExcel(
            stock.precoUnitario
          ),
          moneyExcel(
            stock.valorEstimado
          ),
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

  replenishmentSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  replenishmentSheet.autoFilter = {
    from: 'A1',
    to: 'G1',
  };

  replenishmentSheet.pageSetup = {
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
    `relatorio-stock-${new Date()
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