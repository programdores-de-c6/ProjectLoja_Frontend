import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

/**
 * Paginação discreta com ícones e tooltip
 * Props:
 * - currentPage: página atual
 * - totalPages: total de páginas
 * - onPageChange: função chamada com o número da nova página
 */
const PaginationDiscrete = ({ currentPage, totalPages, onPageChange }) => {

  // Calcula quais números mostrar
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex justify-content-end align-items-center gap-1 mt-2">
      {/* Botão retroceder */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ minWidth: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <FaAngleLeft />
      </Button>

      {/* Números das páginas */}
      {pageNumbers.map((num, idx) =>
        num === "..." ? (
          <span key={idx} style={{ padding: "0 8px" }}>...</span>
        ) : (
          <OverlayTrigger
            key={idx}
            placement="top"
            overlay={<Tooltip id={`tooltip-${num}`}>Página {num}</Tooltip>}
          >
            <Button
              onClick={() => onPageChange(num)}
              style={{
                minWidth: "40px",              // 🔹 largura fixa
                padding: "0 10px",             // 🔹 padding uniforme
                backgroundColor: currentPage === num ? "#0d6efd" : "#f8f9fa",
                color: currentPage === num ? "#fff" : "#000",
                border: "1px solid #dee2e6",   // 🔹 mesma borda para todos
              }}
            >
              {num}
            </Button>
          </OverlayTrigger>
        )
      )}

      {/* Botão avançar */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        style={{ minWidth: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <FaAngleRight />
      </Button>
    </div>
  );
};

export default PaginationDiscrete;
