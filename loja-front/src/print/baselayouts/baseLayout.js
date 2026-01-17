/**
 * Arquivo: baseLayout.js
 * Descrição: Define a moldura profissional do PDF (Cabeçalho e Rodapé).
 */
export function baseLayout({ title, content, image, entity, user }) {

  return {
    pageSize: "A4",
    // Margem superior aumentada para 120 para acomodar o cabeçalho completo
    pageMargins: [40, 120, 40, 60],

    header: {
      margin: [40, 25, 40, 0],
      columns: [
        {
          // LADO ESQUERDO: Dados da Empresa
          width: '*',
          stack: [
            { 
              text: entity?.name?.toUpperCase() || "NOME DA SUA EMPRESA", 
              style: "headerCompany" 
            },
          
              { 
              text: `Endereço: ${entity?.address || "Endereço da Empresa, 123 - Bairro - Cidade"}`, 
              style: "headerSub" 
            },
            { 
              text: `Telefone: ${entity?.contact || "(00) 000-000-000"}`, 
              style: "headerSub" 
            },
             { 
              text: `NIF: ${entity?.contribuinte || ""}`, 
              style: "headerSub" 
            },
            { 
              text: `Email: ${entity?.email || "empresa@exemplo.com"}`, 
              style: "headerSub" 
            },
            { 
              text: `Caixa Postal: ${entity?.caixaPostal || "empresa@exemplo.com"}`, 
              style: "headerSub" 
            },
          ]
        },
        {
          // LADO DIREITO: Foto (como no modelo que enviou)
          width: 160,
          stack: [
            
            image 
              ? { image: image, width: 95, height: 85, alignment: 'right' ,
                objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }
              : { 
                  // Moldura cinza caso não exista foto
                  canvas: [{ 
                    type: 'rect', x: 0, y: 0, w: 75, h: 85, 
                    lineWidth: 1, lineColor: '#bdc3c7' 
                  }],
                  alignment: 'right'
                }
          ]
        }
      ]
    },

    // Rodapé profissional com linha divisória
    footer: (currentPage, pageCount) => ({
      margin: [40, 20],
      stack: [
        { 
          canvas: [{ 
            type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, 
            lineWidth: 0.5, lineColor: '#bdc3c7' 
          }] 
        },
        {
          columns: [
            { 
              text: `Emitido por: ${user?.nome || 'Sistema de Vendas'}`, 
              style: 'footerText' 
            },
            { 
              text: `Página ${currentPage} de ${pageCount}`, 
              alignment: 'right', 
              style: 'footerText' 
            }
          ],
          margin: [0, 5]
        }
      ]
    }),

    content: content,

    // Definição obrigatória dos estilos para o pdfMake renderizar corretamente
    styles: {
      headerCompany: {
        fontSize: 15,
        bold: true,
        color: '#1a237e', // Azul escuro corporativo
        margin: [0, 0, 0, 2]
      },
      headerSub: {
        fontSize: 9,
        color: '#546e7a', // Cinza azulado para informações secundárias
        margin: [0, 0, 0, 2]
      },
      footerText: {
        fontSize: 8,
        color: '#90a4ae'
      },
      // Estilos que serão usados no fieldsAdapter
      sectionTitleBlue: {
        fontSize: 11,
        bold: true,
        color: 'white',
        fillColor: '#0277bd',
        margin: [5, 2, 5, 2]
      },
      label: {
        fontSize: 8,
        bold: true,
        color: '#78909c',
        margin: [0, 0, 0, 2]
      },
      value: {
        fontSize: 10,
        bold: true,
        color: '#263238'
      }
    }
  };
}