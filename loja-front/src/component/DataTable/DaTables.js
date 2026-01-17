import React from "react";
import { Table } from "react-bootstrap";

const DataTable = ({ columns, data, height }) => (
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
              textTransform: "uppercase",  // 🔹 deixa o texto em maiúsculas
              letterSpacing: "0.5px",      // 🔹 mais espaçamento
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
      {data.map((row, idx) => (
        <tr key={idx}>
          {columns.map((col, cidx) => (
            <td key={cidx} className="text-center"style={{ wordBreak: "break-word" }}>
              {col.cell ? col.cell(row) : row[col.field]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </Table>
);

export default DataTable;
