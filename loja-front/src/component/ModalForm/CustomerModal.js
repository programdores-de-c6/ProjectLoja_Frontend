import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import FormField from "../../component/Inputs/FormField";

/**
 * CustomerModal
 *
 * Modal para selecionar ou criar cliente durante a venda.
 * Pesquisa 100% local usando a lista carregada na SalePage.
 *
 * Funcionalidades:
 * - Pesquisa local por nome ou NIF
 * - Atualiza lista a cada digito
 * - Navegação por teclado: ArrowUp / ArrowDown / Enter
 * - Criação rápida de cliente se não existir
 *
 * Props:
 * - show: boolean, controla visibilidade
 * - onClose: função para fechar modal
 * - onSelect: função para retornar cliente selecionado ou criado
 * - customers: array de clientes existentes
 */
const CustomerModal = ({ show, onClose, onSelect, customers = [] }) => {
  const [query, setQuery] = useState("");      // pesquisa digitada
  const [nome, setNome] = useState("");        // para criar cliente novo
  const [nif, setNif] = useState("");          // NIF para criar cliente novo
  const [highlightIndex, setHighlightIndex] = useState(0); // setas
  const inputRef = useRef(null);

  // ===============================
  // Foco automático no input quando modal abre
  // ===============================
  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  // ===============================
  // Pesquisa LOCAL (nome ou NIF)
  // ===============================
  const filteredCustomers = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.nif && c.nif.includes(query))
    );
  }, [query, customers]);

  // ===============================
  // Seleciona cliente existente
  // ===============================
  const selectCustomer = (customer) => {
    onSelect(customer);
    resetAndClose();
  };

  // ===============================
  // Cria cliente novo simples
  // ===============================
  const createCustomer = () => {
    onSelect({
      nome: nome || query,
      nif: nif || null,
      novo: true,
    });
    resetAndClose();
  };

  // ===============================
  // Reset campos e fechamento do modal
  // ===============================
  const resetAndClose = () => {
    setQuery("");
    setNome("");
    setNif("");
    setHighlightIndex(0);
    onClose();
  };

  // ===============================
  // Navegação por teclado: ArrowUp, ArrowDown, Enter
  // ===============================
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      resetAndClose();
      return;
    }

    if (filteredCustomers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filteredCustomers.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCustomers.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        selectCustomer(filteredCustomers[highlightIndex]);
        break;

      default:
        break;
    }
  };

  // ===============================
  // Renderização do Modal
  // ===============================
  
  return (
    <Modal
      show={show}
      onHide={resetAndClose}
      centered
      backdrop="static"
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton>
        <Modal.Title>Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Campo de pesquisa */}
        <FormField
          ref={inputRef}
          label="Pesquisar cliente"
          placeholder="Digite nome ou NIF"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Lista de clientes encontrados */}
        {filteredCustomers.length > 0 && (
          <ListGroup className="mb-3">
            {filteredCustomers.map((c, index) => (
              <ListGroup.Item
                key={c.id || index}
                action
                active={index === highlightIndex}
                onClick={() => selectCustomer(c)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <strong>{c.nome}</strong>
                {c.nif && <small className="text-muted"> • {c.nif}</small>}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Criação rápida de cliente */}
        {query && filteredCustomers.length === 0 && (
          <>
            <FormField
              label="Nome"
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <FormField
              label="NIF"
              placeholder="NIF (opcional)"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
            />
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={resetAndClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={createCustomer}
          disabled={!nome && !query}
        >
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomerModal;
