// SalePage.js
import React, { useEffect, useState, useContext } from "react";
import PageContainer from "../../component/PageContainer/Pcontainer";
import SaleForm from "./SaleForm";
import SaleSummary from "./SaleSummary";
import SaleTable from "../../component/DataTable/SaleTable";
import CustomerModal from "../../component/ModalForm/CustomerModal";

import { useSaleLogic } from "./useSaleLogic";
import { useProductService } from "../Product/ProductService";
import { useCustomerService } from "../Customer/CustomerService";
import { AuthContext } from "../../component/contexts/AuthContext";

const SalePage = () => {
  // 🔹 Contexto do usuário logado
  const { user } = useContext(AuthContext);

  // 🔹 Lógica da venda (quantidade, produtos, desconto, cliente, etc)
  const sale = useSaleLogic();

  // 🔹 Serviços
  const { listarId } = useProductService();
  const { listar } = useCustomerService();

  // 🔹 Dados carregados
  const [productList, setProductList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  // 🔹 Modal de cliente
  const [showCustomer, setShowCustomer] = useState(false);

  // ===============================
  // Carregar produtos e clientes
  // ===============================
  useEffect(() => {
    const loadData = async () => {
      try {
        // Clientes
        const customers = await listar();
        setCustomerList(customers);

        // Produtos
        const data = await listarId(user?.idl);
        const products = data.map((p) => ({
          ...p,
          precoUnitario: Number(p.precoUnitarios || p.preco || 0),
        }));
        setProductList(products);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };

    loadData();
  }, []);

  // ===============================
  // Abrir modal com F4 (como POS)
  // ===============================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F4") {
        e.preventDefault();
        setShowCustomer(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PageContainer>
      <div className="d-flex gap-4">
        {/* ===============================
              LADO ESQUERDO — PRODUTOS
        =============================== */}
        <div className="flex-grow-1">
          <SaleForm products={productList} onAdd={sale.addProduct} />

          {sale.items.length > 0 && (
            <SaleTable
              items={sale.items}
              onQtyChange={sale.updateQty}
              onRemove={sale.removeItem}
            />
          )}
        </div>

        {/* ===============================
              LADO DIREITO — RESUMO E CLIENTE
        =============================== */}
        <div style={{ width: 340 }}>
          {/* Resumo da venda */}
          <SaleSummary {...sale} />

          {/* Cliente selecionado */}
          <div className="card p-3 mt-3">
            <h6>Cliente</h6>
            {sale.cliente?.nome ? (
              <p>
                <strong>{sale.cliente.nome}</strong>
                {sale.cliente.nif && <> • {sale.cliente.nif}</>}
              </p>
            ) : (
              <p className="text-muted">Nenhum cliente selecionado</p>
            )}
          </div>

          {/* Botões */}
          <button
            className="btn btn-outline-primary w-100 mt-2"
            onClick={() => setShowCustomer(true)}
          >
            Associar Cliente (F4)
          </button>

          <button
            className="btn btn-success w-100 mt-2"
            disabled={sale.items.length === 0}
            onClick={sale.clearSale}
          >
            Finalizar Venda
          </button>
        </div>
      </div>

      {/* ===============================
            MODAL DE CLIENTE
      =============================== */}
      <CustomerModal
        show={showCustomer}
        customers={customerList}
        onClose={() => setShowCustomer(false)}
        onSelect={(cliente) => {
          // Atualiza cliente na venda e fecha modal
          sale.setCliente(cliente);
          setShowCustomer(false);
        }}
      />
    </PageContainer>
  );
};

export default SalePage;
