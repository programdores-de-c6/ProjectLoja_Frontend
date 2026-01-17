// SaleForm.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaBarcode } from "react-icons/fa";

const SaleForm = ({ onAdd, products = [] }) => {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return [];
    return products
      .filter((p) =>
        p.nome.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6);
  }, [query, products]);

  const addProduct = (product) => {
    onAdd({
      id: product.id,
      nome: product.nome,
      price: Number(product.precoUnitario || 0),
    });
    setQuery("");
    setShowList(false);
  };

  return (
    <div className="position-relative mb-3">
      <div className="input-group input-group-lg">
        <span className="input-group-text">
          <FaBarcode />
        </span>
        <input
          ref={inputRef}
          className="form-control"
          placeholder="Pesquisar produto"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowList(true);
          }}
        />
      </div>

      {showList && filteredProducts.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow z-3">
          {filteredProducts.map((p, i) => (
            <li
              key={p.id}
              className="list-group-item list-group-item-action"
              onClick={() => addProduct(p)}
            >
              {p.nome} — {p.precoUnitario}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SaleForm;
