// SaleSummary.js
import React from "react";

const SaleSummary = ({
  subtotal = 0,
  discount,
  setDiscount,
  paymentMethod,
  setPaymentMethod,
  received,
  setReceived,
  total,
  troco,
}) => {
  return (
    <div className="card p-3 shadow-sm">
      <h5 className="fw-bold">Resumo</h5>

      <div className="d-flex justify-content-between">
        <span>Subtotal</span>
        <strong>{subtotal.toFixed(2)}</strong>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <span>Desconto</span>
        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="form-control form-control-sm"
          style={{ width: 90 }}
        />
      </div>

      <div className="d-flex justify-content-between mt-2 fs-5">
        <span>Total</span>
        <strong>{total.toFixed(2)}</strong>
      </div>

      <select
        className="form-select mt-2"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="DINHEIRO">Dinheiro</option>
        <option value="CARTAO">Cartão</option>
      </select>

      <input
        type="number"
        className="form-control mt-2"
        placeholder="Recebido"
        value={received}
        onChange={(e) => setReceived(Number(e.target.value))}
      />

      <div className="mt-2 text-success fw-bold">
        Troco: {troco.toFixed(2)}
      </div>
    </div>
  );
};

export default SaleSummary;
