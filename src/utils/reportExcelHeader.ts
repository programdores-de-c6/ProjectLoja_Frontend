import ExcelJS from 'exceljs';
import type { ReportShop } from '@/utils/reportShopTypes';

export interface ReportExcelHeaderOptions {
  workbook: ExcelJS.Workbook;
  worksheet: ExcelJS.Worksheet;
  shop?: ReportShop;
  title: string;
  from?: string;
  to?: string;
  startRow?: number;
  lastColumn?: number;
  formatDate?: (value?: string) => string;
}

const addImageFromUrl = async (
  workbook: ExcelJS.Workbook,
  url: string
): Promise<number | null> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);

    let extension: 'png' | 'jpeg' | 'gif' = 'png';

    if (blob.type.includes('jpeg') || blob.type.includes('jpg')) {
      extension = 'jpeg';
    } else if (blob.type.includes('gif')) {
      extension = 'gif';
    }

    return workbook.addImage({
      base64: `data:${blob.type};base64,${base64}`,
      extension,
    });
  } catch (error) {
    console.warn(
      'Não foi possível carregar o logótipo da loja no Excel:',
      error
    );

    return null;
  }
};

export const drawReportExcelHeader = async ({
  workbook,
  worksheet,
  shop,
  title,
  from,
  to,
  startRow = 1,
  lastColumn = 13,
  formatDate = (value?: string) => value || '-',
}: ReportExcelHeaderOptions): Promise<number> => {
  const currentShop = shop?.nome || 'Visão Global';
  const shopNif = shop?.numeroContribuite || '---';
  const shopContact = shop?.contacto || '---';
  const shopAddress = shop?.nomelocation || '---';
  const shopEmail = shop?.email || '';
  const shopLogo = shop?.logoUrl || shop?.logo || null;

  let row = startRow;

  // ============================================================
  // CABEÇALHO DA LOJA
  // ============================================================

  worksheet.mergeCells(row, 1, row, Math.max(2, lastColumn - 2));

  const shopNameCell = worksheet.getCell(row, 1);

  shopNameCell.value = currentShop.toUpperCase();
  shopNameCell.font = {
    name: 'Arial',
    size: 16,
    bold: true,
    color: { argb: '14202D' },
  };

  shopNameCell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  worksheet.getRow(row).height = 24;

  row++;

  // NIF
  worksheet.getCell(row, 1).value = `NIF: ${shopNif}`;

  worksheet.getCell(row, 1).font = {
    name: 'Arial',
    size: 10,
    color: { argb: '505050' },
  };

  row++;

  // Endereço
  worksheet.getCell(row, 1).value = shopAddress;

  worksheet.getCell(row, 1).font = {
    name: 'Arial',
    size: 10,
    color: { argb: '505050' },
  };

  row++;

  // Telefone
  worksheet.getCell(row, 1).value = `TEL: ${shopContact}`;

  worksheet.getCell(row, 1).font = {
    name: 'Arial',
    size: 10,
    color: { argb: '505050' },
  };

  row++;

  // Email
  if (shopEmail) {
    worksheet.getCell(row, 1).value = `Email: ${shopEmail}`;

    worksheet.getCell(row, 1).font = {
      name: 'Arial',
      size: 10,
      color: { argb: '505050' },
    };

    row++;
  }

  // ============================================================
  // LOGÓTIPO
  // ============================================================

  if (shopLogo) {
    try {
      let imageId: number | null = null;

      if (shopLogo.startsWith('data:image/')) {
        const match = shopLogo.match(
          /^data:image\/(png|jpeg|jpg|gif);base64,(.+)$/i
        );

        if (match) {
          const extension =
            match[1].toLowerCase() === 'jpg'
              ? 'jpeg'
              : match[1].toLowerCase() as 'png' | 'jpeg' | 'gif';

          imageId = workbook.addImage({
            base64: shopLogo,
            extension,
          });
        }
      } else {
        imageId = await addImageFromUrl(workbook, shopLogo);
      }

      if (imageId !== null) {
        worksheet.addImage(imageId, {
          tl: {
            col: Math.max(0, lastColumn - 1),
            row: startRow - 1,
          },
          ext: {
            width: 90,
            height: 90,
          },
        });
      }
    } catch (error) {
      console.warn(
        'Não foi possível adicionar o logótipo da loja:',
        error
      );
    }
  }

  // Espaço antes do título
  row++;

  // ============================================================
  // TÍTULO DO RELATÓRIO
  // ============================================================

  worksheet.mergeCells(row, 1, row, lastColumn);

  const titleCell = worksheet.getCell(row, 1);

  titleCell.value = title;
  titleCell.font = {
    name: 'Arial',
    size: 16,
    bold: true,
    color: { argb: '14202D' },
  };

  titleCell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  worksheet.getRow(row).height = 24;

  row++;

  // ============================================================
  // LINHA AZUL
  // ============================================================

  for (let col = 1; col <= lastColumn; col++) {
    const cell = worksheet.getCell(row, col);

    cell.border = {
      bottom: {
        style: 'medium',
        color: { argb: '2363EB' },
      },
    };
  }

  row++;

  // ============================================================
  // PERÍODO
  // ============================================================

  if (from && to) {
    worksheet.getCell(row, 1).value =
      `Período: ${formatDate(from)} a ${formatDate(to)}`;

    worksheet.getCell(row, 1).font = {
      name: 'Arial',
      size: 10,
      color: { argb: '505050' },
    };

    row++;
  }

  // ============================================================
  // DATA DE EMISSÃO
  // ============================================================

  worksheet.getCell(row, 1).value =
    `Data de emissão: ${new Date().toLocaleString('pt-PT')}`;

  worksheet.getCell(row, 1).font = {
    name: 'Arial',
    size: 10,
    color: { argb: '505050' },
  };

  row += 2;

  return row;
};