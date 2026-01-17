export function fieldsToPdfContent(fields) {
  // Dividimos os campos em grupos de 3 para criar as colunas
  const rows = [];
  for (let i = 0; i < fields.length; i += 3) {
    rows.push(fields.slice(i, i + 3));
  }

  return [
    // BARRA AZUL DE TÍTULO
    {
      table: {
        widths: ['*'],
        body: [[{ text: 'INFORMAÇÕES DO REGISTRO', style: 'sectionTitleBlue' }]]
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 5]
    },
    // GRELHA DE DADOS (3 COLUNAS)
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