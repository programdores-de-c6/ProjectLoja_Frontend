// ======================================================
// IMPORTAÇÕES
// ======================================================
import React from "react";
import { Table } from "react-bootstrap";

// ======================================================
// COMPONENTE DataTable
// Props:
// - columns: array de colunas { header: string, field: string, cell?: function }
// - data: array de objetos representando linhas
// - height: opcional, para definir altura da tabela
// ======================================================
const DataTable = ({ columns = [], data = [], height }) => {
  return (
    <div style={{ maxHeight: height || "500px", overflowY: "auto" }}>
      <Table striped bordered hover style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="text-center"
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#1976d2", // 🔹 azul Bootstrap
                  color: "#fff",               // 🔹 texto branco
                  fontWeight: "500",           // 🔹 semibold
                  textTransform: "uppercase",  // 🔹 maiúsculas
                  letterSpacing: "0.5px",      // 🔹 espaçamento
                  zIndex: 2,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)", // 🔹 sombra suave
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            // 🔹 Mensagem quando não houver itens
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                Nenhum item encontrado
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col, cidx) => (
                  <td
                    key={cidx}
                    className="text-center"
                    style={{ wordBreak: "break-word" }}
                  >
                    {col.cell ? col.cell(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

// ======================================================
// EXPORTAÇÃO
// ======================================================
export default DataTable;
