/**
 * ====================================================
 * CAIXA CLOSING PDF - VERSÃO DTO FLAT (DADOS DO BACKEND)
 * ====================================================
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { 
  TDocumentDefinitions, 
  Column, 
  TableCell, 
  PageSize,
  StyleDictionary,
  Content
} from 'pdfmake/interfaces';
import { CaixaSession } from '@/pages/caixa/CaixaService';

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

export type ReceiptFormat = 'A4' | 'A5' | 'THERMAL';

interface LayoutConfig {
  size: PageSize;
  margin: [number, number, number, number];
  width: number;
}

export const printCaixaClosingPdf = (caixa: CaixaSession, format: ReceiptFormat = 'A5'): void => {
  const isThermal = format === 'THERMAL';

  // 1. MAPEAMENTO DIRETO DO SEU NOVO JSON
  const shopName = (caixa.shopNome || "SISTEMA DE VENDAS").toUpperCase();
  const shopNif = caixa.shopNif || "---";
  const shopAddr = caixa.shopEndereco || "---";

  const operadorAbertura = (caixa.nomeOperadorAbertura || "N/A").toUpperCase();
  const operadorFecho = (caixa.nomeOperadorFecho || operadorAbertura).toUpperCase();

  // 2. CONFIGURAÇÃO DE LAYOUT (Garante que preenche o papel)
  const layouts: Record<ReceiptFormat, LayoutConfig> = {
    A4: { size: 'A4', margin: [40, 40, 40, 40], width: 515 },
    A5: { size: 'A5', margin: [30, 30, 30, 30], width: 360 },
    THERMAL: { 
      size: { width: 226, height: 450 }, 
      margin: [10, 10, 10, 10], 
      width: 206 
    }
  };

  const config = layouts[format];

  // 3. DICIONÁRIO DE ESTILOS
  const styles: StyleDictionary = {
    shopTitle: { fontSize: isThermal ? 10 : 16, bold: true, color: '#0d47a1' },
    docTitle: { fontSize: 11, bold: true, color: '#455a64', alignment: 'right' },
    tableHeader: { fontSize: 9, bold: true, color: '#ffffff', fillColor: '#0d47a1' },
    dataLabel: { fontSize: 7, color: '#90a4ae', bold: true },
    dataValue: { fontSize: isThermal ? 8 : 10, bold: true, color: '#263238' }
  };

  // 4. ESTRUTURA DO CONTEÚDO
  const content: Content[] = [
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: shopName, style: 'shopTitle' },
            { text: `NIF: ${shopNif}`, fontSize: 9 },
            { text: `Endereço: ${shopAddr}`, fontSize: 8 },
          ]
        },
        { 
          width: isThermal ? 'auto' : 150,
          stack: [
            { text: 'RELATÓRIO DE FECHO', style: 'docTitle' },
            { text: `SESSÃO #${caixa.id}`, alignment: 'right', fontSize: 10, color: '#0d47a1', bold: true }
          ]
        }
      ],
      margin: [0, 0, 0, 15]
    },

    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: config.width, y2: 0, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 5] },

    {
      columns: [
        {
          stack: [
            { text: 'ABERTO POR:', style: 'dataLabel' },
            { text: operadorAbertura, style: 'dataValue' },
            { text: new Date(caixa.dataAbertura).toLocaleString(), fontSize: 8, color: '#546e7a' }
          ]
        },
        {
          stack: [
            { text: 'FECHADO POR:', style: 'dataLabel', alignment: 'right' },
            { text: operadorFecho, style: 'dataValue', alignment: 'right' },
            { 
              text: caixa.dataFecho ? new Date(caixa.dataFecho).toLocaleString() : '---', 
              fontSize: 8, color: '#546e7a', alignment: 'right' 
            }
          ]
        }
      ],
      margin: [0, 10, 0, 25]
    },

    {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'DESCRIÇÃO DOS VALORES', style: 'tableHeader', margin: [5, 4] } as TableCell, 
            { text: 'TOTAL (DB)', style: 'tableHeader', alignment: 'right', margin: [5, 4] } as TableCell
          ],
          [
            { text: 'FUNDO DE MANEIO (ABERTURA)', style: 'moneyLabel' } as TableCell, 
            { text: Number(caixa.valorInicial).toFixed(2), style: 'moneyValue' } as TableCell
          ],
          [
            { text: 'VENDAS DO DIA (FACTURADO)', style: 'moneyLabel', color: '#0d47a1' } as TableCell, 
            { text: `+ ${Number(caixa.valorDia || 0).toFixed(2)}`, style: 'moneyValue', color: '#0d47a1' } as TableCell
          ],
          [
            { text: 'VALOR TOTAL EM GAVETA', fillColor: '#f8fafc', bold: true, fontSize: 12, margin: [5, 12] } as TableCell, 
            { text: `${Number(caixa.valorFinal || 0).toFixed(2)}`, fillColor: '#f8fafc', bold: true, fontSize: 13, alignment: 'right', margin: [5, 12] } as TableCell
          ]
        ]
      },
      layout: 'headerLineOnly',
    },

    {
      margin: [0, 80, 0, 0],
      columns: [
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: isThermal ? 80 : 150, y2: 0, lineWidth: 0.5 }] },
            { text: 'O OPERADOR', fontSize: 7, alignment: 'center', margin: [0, 5] }
          ]
        } as Column,
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: isThermal ? 80 : 150, y2: 0, lineWidth: 0.5 }] },
            { text: 'GERÊNCIA / CONFERÊNCIA', fontSize: 7, alignment: 'center', margin: [0, 5] }
          ]
        } as Column
      ]
    },

    { 
      text: 'DOCUMENTO GERADO PELO SISTEMA PARA CONFERÊNCIA FÍSICA.', 
      fontSize: 6, 
      alignment: 'center', 
      color: '#bdbdbd', 
      margin: [0, 60, 0, 0] 
    }
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: config.size,
    pageMargins: config.margin,
    content: content,
    styles: styles
  };
 pdfMake.createPdf(docDefinition).print();

}; 