// 🔹 Importações
import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import FormField from "../../component/Inputs/FormField.js";
import * as Yup from "yup";
import { useProductService } from "./ProductService.js";

// 🔹 Validação com Yup
export const ShopSchema = Yup.object().shape({
  codigobarra: Yup.string().required("Código de Barra é obrigatório"),
  nome: Yup.string().required("Nome é obrigatório"),
  descricao: Yup.string().nullable().max(150, "Máximo 150 caracteres"),
  precoUnitario: Yup.string().required("Preço é obrigatório"),
  fornacedor: Yup.object().required("Fornecedor é obrigatório"),
  imposto: Yup.object().required("Imposto é obrigatório").nullable(),
  categoria: Yup.object().required("Categoria é obrigatória"),
  imagem: Yup.mixed().nullable(),
});

class StoreStocksManager {
  constructor(initialList = [], setData) {
    this.list = [...initialList];
    this.setData = setData;
  }

  add(store, stock, stockMin) {
    if (!store || stock == null || stockMin == null) return;

    const newItem = {
      storeId: store.id,
      storeName: store.nome,
      stock,
      stockMin,
    };

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

// 🔹 Componente principal
const ProductForm = ({
  data,
  setData,
  isEditMode,
  useWizard = false,
  onFormValidityChange,
}) => {
  const [step, setStep] = useState(0);

  const totalSteps = isEditMode ? 2 : 3;
  const [categoria, setCategoria] = useState([]);
  const [fornacedor, setFornecedor] = useState([]);
  const [imposto, setImposto] = useState([]);
  const [shop, setShop] = useState([]);

  const [selectedStore, setSelectedStore] = useState(null);
  const [storeStocks, setStoreStocks] = useState([]);
  const [stock, setStock] = useState("");
  const [stockMin, setStockMin] = useState("");

  const manager = new StoreStocksManager(data.distribuicaoStock || [], setData);

  const { listarCategoria, listarFornecedor, listarImposto, listarShop } =
    useProductService();

  useEffect(() => {
    const fetchData = async () => {
      const cats = await listarCategoria();
      setCategoria(cats.map((c) => ({ value: c.id, label: c.nome })));

      const fornecs = await listarFornecedor();
      setFornecedor(fornecs.map((f) => ({ value: f.id, label: f.nome })));

      const impostos = await listarImposto();
      setImposto(impostos.map((i) => ({ value: i.id, label: i.imposto })));

      const lojas = await listarShop();
      setShop(lojas.map((s) => ({ value: s.id, label: s.nome })));
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const handleCategoriaChange = (e) => {
    const value = e.target.value; // id selecionado (string)
    const selected = categoria.find((d) => String(d.value) === value); // encontra objeto {value, label}

    if (!selected) {
      setData({ ...data, categoria: null });
    } else {
      setData({
        ...data,
        categoria: { id: selected.value, nome: selected.label }, // aqui criamos o objeto correto
      });
    }
  };

  // Handler específico para o select de Localidade
  const handleFornacedorChange = (e) => {
    const value = e.target.value; // id selecionado (string)
    const selected = fornacedor.find((d) => String(d.value) === value); // encontra objeto {value, label}

    if (!selected) {
      setData({ ...data, fornacedor: null });
    } else {
      setData({
        ...data,
        fornacedor: { id: selected.value, nome: selected.label }, // aqui criamos o objeto correto
      });
    }
  };
  // Handler específico para o select de Localidade
  const handleImpostoChange = (e) => {
    const value = e.target.value; // id selecionado (string)
    const selected = imposto.find((d) => String(d.value) === value); // encontra objeto {value, label}

    if (!selected) {
      setData({ ...data, imposto: null });
    } else {
      setData({
        ...data,
        imposto: { id: selected.value, nome: selected.label }, // aqui criamos o objeto correto
      });
    }
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
  const validateStockEntry = (store, stock, stockMin, distribuicaoStock) => {
    if (!store || stock == null || stockMin == null) {
      return "Preencha todos os campos.";
    }

    if (Number(stock) < Number(stockMin)) {
      return "O stock não pode ser inferior ao stock mínimo.";
    }

    const lojaJaExiste = (distribuicaoStock || []).some(
      (item) => item.storeId === store.id
    );
    if (lojaJaExiste) {
      return "Esta loja já tem stock atribuído.";
    }

    return null; // tudo certo
  };

  const isFormComplete = () => {
    if (!data.codigobarra || !data.nome) return false;
    if (
      !data.precoUnitario ||
      !data.categoria ||
      !data.imposto ||
      !data.fornacedor
    )
      return false;
    if (!data.distribuicaoStock || data.distribuicaoStock.length === 0)
      return false;

    return true;
  };

  useEffect(() => {
    if (onFormValidityChange) {
      onFormValidityChange(isEditMode ? true : isFormComplete());
    }
  }, [data, step, storeStocks]);
  // 🔹 Renderização por etapas
  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <Row className="align-items-start">
            <Col md={isEditMode ? 12 : 9}>
              <FormField
                controlId="CodigoBarra"
                label="Código de Barra"
                name="codigobarra"
                value={data.codigobarra || ""}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              {!isEditMode && (
                <FormField
                  controlId="fotoProduto"
                  label="Foto do Produto"
                  type="image-box"
                  name="imagem"
                  value={data.imagem}
                  onChange={(e) =>
                    setData({ ...data, imagem: e.target.files[0] })
                  }
                  disabled={isEditMode}
                />
              )}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormField
                controlId="Nome"
                label="Nome"
                name="nome"
                value={data.nome || ""}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="Descricao"
                label="Descrição"
                name="descricao"
                as="textarea"
                rows={3}
                maxLength={150}
                value={data.descricao || ""}
                onChange={handleChange}
                helperText={`${data.descricao?.length || 0}/150 caracteres`}
              />
            </Col>
          </Row>
        </>
      );
    }

    if (step === 1) {
      return (
        <Row>
          <Col md={6}>
            <FormField
              controlId="PrecoUnitario"
              label="Preço Unitário (Db)"
              name="precoUnitario"
              placeholder="0,00"
              decimalsLimit={2}
              decimalSeparator=","
              groupSeparator="."
              value={data.precoUnitario || ""}
              onChange={handleChange}
            />
          </Col>
          <Col md={6}>
            <FormField
              controlId="categoria"
              label="Categoria"
              name="categoria"
              value={String(data.categoria?.id || "")}
              onChange={handleCategoriaChange}
              options={categoria}
              isSelect={true}
            />
          </Col>
          <Col md={6}>
            <FormField
              controlId="taxa"
              label="Imposto"
              name="imposto"
              value={String(data.imposto?.id || "")}
              onChange={handleImpostoChange}
              options={imposto}
              isSelect={true}
            />
          </Col>
          <Col md={6}>
            <FormField
              controlId="fornecedor"
              label="Fornecedor"
              name="fornacedor"
              value={String(data.fornacedor?.id || "")}
              onChange={handleFornacedorChange}
              options={fornacedor}
              isSelect={true}
            />
          </Col>
        </Row>
      );
    }

    if (step === 2 && !isEditMode) {
      return (
        <>
          <Row>
            <Col md={3}>
              <FormField
                controlId="stock"
                label="Stock"
                name="stock"
                type="number"
                min="1"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <FormField
                controlId="stockMin"
                label="Stock Mínimo"
                name="stockMin"
                type="number"
                min="1"
                step="1"
                value={stockMin}
                onChange={(e) => setStockMin(e.target.value)}
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
                    selected
                      ? { id: selected.value, nome: selected.label }
                      : null
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
                    stockMin,
                    data.distribuicaoStock
                  );
                  if (erro) {
                    showErrorToast(erro);

                    return;
                  }
                  manager.add(selectedStore, Number(stock), Number(stockMin));
                  setStock("");
                  setStockMin("");
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
                    <th>Stock Mínimo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.distribuicaoStock || []).map((item, index) => (
                    <tr key={index}>
                      <td>{item.storeName}</td>
                      <td>{item.stock}</td>
                      <td>{item.stockMin}</td>
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
      );
    }
  };
  return (
    <Form>
      {renderStep()}
      {useWizard && (
        <>
          <div className="d-flex justify-content-end gap-2 mt-3">
            {step > 0 && (
              <OverlayTrigger
                overlay={<Tooltip>Voltar para a etapa anterior</Tooltip>}
              >
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  <FaArrowLeft className="me-1" /> Voltar
                </Button>
              </OverlayTrigger>
            )}
            {step < totalSteps - 1 && (
              <OverlayTrigger
                overlay={<Tooltip>Ir para a próxima etapa</Tooltip>}
              >
                <Button variant="primary" onClick={() => setStep(step + 1)}>
                  Próximo <FaArrowRight className="ms-1" />
                </Button>
              </OverlayTrigger>
            )}
          </div>
          <ProgressBar
            now={((step + 1) / totalSteps) * 100}
            label={`Etapa ${step + 1} de ${totalSteps}`}
            className="mt-3"
          />
        </>
      )}
    </Form>
  );
};

export default ProductForm;
