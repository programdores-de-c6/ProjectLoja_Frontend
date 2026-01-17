// Arquivo: genericViewPdf.js
import { baseLayout } from "../../print/baselayouts/baseLayout.js";
import { printPdf } from "../../print/printservice/printService.js";

/**
 * Converte os campos para conteúdo do PDF, criando uma grelha de 3 colunas
 */
export function fieldsToPdfContent({ title, fields }) {
  const rows = [];
  for (let i = 0; i < fields.length; i += 3) {
    const row = fields.slice(i, i + 3);
    while (row.length < 3) {
      row.push({ label: "", value: "" }); // preenche células vazias
    }
    rows.push(row);
  }

  return [
    // Barra azul de título
    {
      table: {
        widths: ['*'],
        body: [[{ text: title, style: 'sectionTitleBlue' }]]
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 5]
    },
    // Grelha de dados (3 colunas)
    {
      table: {
        widths: ['33%', '33%', '34%'],
        body: rows.map(row => 
          row.map(f => ({
            stack: [
              { text: f.label.toUpperCase(), style: 'label' },
              { text: String(f.value ?? "---"), style: 'value' }
            ],
            margin: [0, 5, 0, 5]
          }))
        )
      },
      layout: {
        hLineWidth: (i) => (i === 0 ? 0 : 0.5),
        vLineWidth: () => 0,
        hLineColor: () => '#ecf0f1'
      }
    }
  ];
}

/**
 * Função que gera o PDF do modal de visualização e abre em nova aba
 */
export function printGenericViewPdf({ title, fields, image, entity, user }) {
  const content = [];

  

  // 🔹 Adiciona os campos em tabela
  content.push(...fieldsToPdfContent({ title, fields }));

  const docDefinition = baseLayout({
    title,
    content,
     image,
    entity,
    user
   
  });

  printPdf(docDefinition);
}
