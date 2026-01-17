import React, { useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import "./SaleTable.css";

const SaleTable = ({ items = [], onQtyChange, onRemove }) => {
  const lastItemRef = useRef(null);

  // ===== Destaque do último item =====
  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.classList.add("highlight");
      const timer = setTimeout(() => {
        lastItemRef.current?.classList.remove("highlight");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [items]);

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        Nenhum produto adicionado
      </div>
    );
  }

  return (
    <div className="sale-table">
      {items.map((item, index) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        const iva = Number(item.taxa) || 0; // percentual do produto
        const subtotal = qty * price;
        const totalLinha = subtotal + subtotal * iva;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`sale-row d-flex align-items-center justify-content-between p-2 mb-2 shadow-sm`}
            ref={isLast ? lastItemRef : null}
          >
            {/* Nome do produto */}
            <div className="flex-grow-1 fw-semibold">{item.nome}</div>

            {/* Preço unitário */}
            <div style={{ width: 70 }}><span>Db</span> {price.toFixed(2)}</div>

            {/* Quantidade com botões */}
            <div className="d-flex align-items-center gap-1" style={{ width: 140 }}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onQtyChange(item.id, qty - 1)}
              >
                −
              </Button>
              <Form.Control
                type="number"
                min={0}
                value={qty}
                onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
                style={{ width: 60, textAlign: "center" }}
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onQtyChange(item.id, qty + 1)}
              >
                +
              </Button>
            </div>

            {/* IVA da linha */}
            <div style={{ width: 60 }} className="text-muted">
              {iva}
            </div>

            {/* Total da linha */}
            <div className="fw-bold" style={{ width: 75 }}>
              Db {totalLinha.toFixed(2)}
            </div>

            {/* Remover */}
            <div style={{ width: 75 }}>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemove(item.id)}
              >
                Remover
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SaleTable;
