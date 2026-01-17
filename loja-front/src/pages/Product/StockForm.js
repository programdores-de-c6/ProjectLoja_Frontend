// 🔹 Importa React e hooks useState/useEffect
import React, { useState, useEffect } from "react";
// 🔹 Importa Form do React-Bootstrap (estrutura base do formulário)
import { Form, Row, Col, Button } from "react-bootstrap";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
// 🔹 Importa o componente reutilizável de campo
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Importa Yup para validação de esquemas
import * as Yup from "yup";
// 🔹 Importa o serviço que busca distritos da API
import { useProductService } from "./ProductService.js"; // 🔹

// 🔹 Esquema de validação com Yup
export const ShopSchema = Yup.object().shape({
  imposto: Yup.object().required("Imposto é obrigatória").nullable(),
  categoria: Yup.object().required("Categoria é obrigatória"),
  imagem: Yup.mixed().nullable(),
});
class StoreStocksManager {
  constructor(initialList = [], setData) {
    this.list = [...initialList];
    this.setData = setData;
  }

  add(store, stock, productId = null) {
    if (!store || stock == null) return;

    const newItem = {
      storeId: store.id,
      storeName: store.nome,
      stock,
    };

    if (productId) {
      newItem.productId = productId;
    }

    this.list = [...this.list, newItem];

    this.setData((prev) => ({
      ...prev,
      distribuicaoStock: [...this.list],
    }));
  }

  remove(index) {
    this.list = this.list.filter((_, i) => i !== index);

    this.setData((prev) => ({
      ...prev,
      distribuicaoStock: [...this.list],
    }));
  }

  getList() {
    return [...this.list];
  }
}

// 🔹 Componente de formulário para Localidade
const StockForm = ({
  data,
  setData,
  isEditMode,
  productId,
  mode = "adicionar",
}) => {
  console.log("Modo atual:", mode);

  const stockLabel =
    mode === "baixar" ? "Quantidade a retirar" : "Quantidade a adicionar";

  useEffect(() => {
    const fetchData = async () => {
      const lojas = await listarShop();
      setShop(lojas.map((s) => ({ value: s.id, label: s.nome })));
    };
    fetchData();
  }, []); // Executa apenas uma vez

  const { listarShop } = useProductService();
  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)

  const [shop, setShop] = useState([]);

  const [selectedStore, setSelectedStore] = useState(null);
  const [stock, setStock] = useState("");

  const manager = new StoreStocksManager(data.distribuicaoStock || [], setData);

  const validateStockEntry = (store, stock, distribuicaoStock) => {
    if (!store || stock == null) {
      return "Preencha todos os campos.";
    }

    const lojaJaExiste = (distribuicaoStock || []).some(
      (item) => item.storeId === store.id
    );
    if (lojaJaExiste) {
      return "Esta loja já tem stock atribuído.";
    }

    return null; // tudo certo
  };
  const handleSelectChange = (e, options, fieldName) => {
    const selected = options.find((o) => String(o.value) === e.target.value);
    setData({
      ...data,
      [fieldName]: selected
        ? { id: selected.value, nome: selected.label }
        : null,
    });
    return selected;
  };

  // 🔹 Renderização do formulário
  return (
    <Form>
      <>
        <Row>
          <Col md={6}>
            <FormField
              controlId="stock"
              label={stockLabel}
              name="stock"
              type="number"
              min="1"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </Col>

          <Col md={6}>
            <FormField
              controlId="shop"
              label="Loja"
              name="shop"
              value={String(data.shop?.id || "")}
              onChange={(e) => {
                handleSelectChange(e, shop, "shop");
                const selected = shop.find(
                  (s) => String(s.value) === e.target.value
                );
                setSelectedStore(
                  selected ? { id: selected.value, nome: selected.label } : null
                );
              }}
              options={shop}
              isSelect
            />
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <Button
              onClick={() => {
                const erro = validateStockEntry(
                  selectedStore,
                  stock,

                  data.distribuicaoStock
                );
                if (erro) {
                  showErrorToast(erro);

                  return;
                }
                manager.add(
                  selectedStore,
                  Number(stock),

                  productId // ✅ Aqui passamos o ID do produto
                );
                setStock("");
                setSelectedStore(null); // limpa o state interno da loja
                setData((prev) => ({
                  ...prev,
                  shop: null, // limpa o select de loja
                }));
              }}
            >
              Adicionar
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Stock</th>

                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {(data.distribuicaoStock || []).map((item, index) => (
                  <tr key={index}>
                    <td>{item.storeName}</td>
                    <td>{item.stock}</td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => manager.remove(index)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      </>
    </Form>
  );
};

// 🔹 Exporta oStockForm para uso na página Localidade
export default StockForm;
