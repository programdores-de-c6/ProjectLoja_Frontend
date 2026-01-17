import { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "react-bootstrap";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { AuthContext } from "../../component/contexts/AuthContext";
import ModalForm from "../../component/ModalForm/ModalForms.js";
import ModalStock from "../../component/ModalForm/ModalInformation.js";
import GenericViewModal from "../../component/ModalForm/VewModal.js";

import ProductForm, { ShopSchema as ShopDataSchema } from "./ProductForm.js";
import StockForm from "./StockForm.js";

import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { useShopService as ShopService } from "../Shop/ShopService.js";

import "../../css/global.css";

import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";

import { useProductService as ProdutService } from "./ProductService.js";
import ConfirmModal from "../../component/ModalForm/ConfirmModal.js";

const ProductPage = () => {
  // 🔹 Estados principais
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [Data, setData] = useState({
    nome: "",
    codigobarra: "",
    descricao: "",
    precoUnitario: "",
    fornacedor: "",
    imposto: "",
    categoria: "",
    acao: "",
    imagem: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
const { user } = useContext(AuthContext); // pega informações do utilizador/logotipo
  const [product, setProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [canSave, setCanSave] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [viewShop, setViewShop] = useState(null);
const { listarId } = ShopService();
  // 🔹 API
  const { listar, criar, editar, updateStock } = ProdutService();
 
  // 🔹 Buscar produtos
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        codigobarra: l.codigobarra,
        nome: l.nome || l.name,
        descricao: l.descricao,
        precoUnitario: l.precoUnitario,
        stock: l.stock,
        stockMin: l.stockMin,
        fornacedor: l.idsupplier
          ? { value: l.idsupplier, label: l.suppliers }
          : null,
        fornecedores: l.suppliers,
        categorias: l.categorys,
        categoria: l.idcatgory
          ? { value: l.idcatgory, label: l.categorys }
          : null,
        imposto: l.idtax ? { value: l.idtax, label: l.taxs } : null,
        impostos: l.taxs,
        imagem: l.logoUrl || null,
      }));
      setProduct(adaptados);
    } catch (err) {
      showErrorToast(err.message || "Erro ao carregar produtos.");
    }
  };

  const emptyData = {
    nome: "",
    codigobarra: "",
    descricao: "",
    precoUnitario: "",
    fornacedor: "",
    imposto: "",
    categoria: "",
    logo: "",
  };

  // 🔹 Ações
  const handleEdit = (product) => {
    const valorLimpo = product.precoUnitario
    ? product.precoUnitario.replace(/[^\d,.-]/g, "") // remove tudo que não seja número, vírgula ou ponto
    : "";
    const dadosParaModal = {
      ...product,
      categoria: product.categoria
        ? { id: product.categoria.value, nome: product.categoria.label }
        : null,
      imposto: product.imposto
        ? { id: product.imposto.value, nome: product.imposto.label }
        : null,
      fornacedor: product.fornacedor
        ? { id: product.fornacedor.value, nome: product.fornacedor.label }
        : null,
      logo: "",
      precoUnitario: valorLimpo,
    };
    setData(dadosParaModal);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleNew = () => {
    setData(emptyData);
    setIsEditMode(false);
    setShowModal(true);
  };
  //função para abrir modal de adicionar stock
  const handleAddStock = (produto) => {
    const fields = [
      { label: "Nome", value: produto.nome },
      { label: "Preço Unitário", value: produto.precoUnitario + " Db" },
      { label: "Categoria", value: produto.categoria?.label },
      { label: "Stock", value: produto.stock },
    ];
    setStockModal({
      show: true,
      mode: "adicionar",
      fields,
      image: produto.imagem,
      title: "Adicionar Stock",
      id: produto.id,
    });
  };
  // chamar modal para baixar stock
  const handleReduceStock = (produto) => {
    const fields = [
      { label: "Nome", value: produto.nome },
      { label: "Preço Unitário", value: produto.precoUnitario + " Db" },
      { label: "Categoria", value: produto.categoria?.label },
      { label: "Stock", value: produto.stock },
    ];
    setStockModal({
      show: true,
      mode: "baixar",
      fields,
      image: produto.imagem,
      title: "Baixar Stock",
      id: produto.id,
    });
  };

  const handleView = async (produto) => {
         try {
        // Busca os dados da loja via API usando o id do supplier
    const shopData = await listarId(user.idl);
    const fields = [
      { label: "Nome", value: produto.nome },
      { label: "Código de Barras", value: produto.codigobarra },
      { label: "Preço Unitário", value: produto.precoUnitario },
      { label: "Categoria", value: produto.categoria?.label },
      { label: "Fornecedor", value: produto.fornecedores },
      { label: "Imposto", value: produto.imposto?.label },
      { label: "Stock", value: produto.stock },
      { label: "Descrição", value: produto.descricao },
    ];
     const entity = {
  name: shopData.nome || "—",
  address: shopData.nomelocation || "",
  contact: shopData.contacto || "—",
  email: shopData.email || "—",
  contribuinte: shopData.numeroContribuite || "—",
  caixaPostal: shopData.caixaPostal || "—",
};
    setViewShop({
      fields,
      image: produto.imagem,
      entity,
      title: "Detalhes de Produto",
    });
    } catch (err) {
        showErrorToast(err.message || "Erro ao carregar dados da loja");
      }
  };

  // 🔹 Submissões
  const handleSubmit = async () => {
    try {
      await ShopDataSchema.validate(Data);
      const response = isEditMode ? await editar(Data) : await criar(Data);
      showSuccessToast(response?.message || "Operação realizada com sucesso!");
      setShowModal(false);
      setData(emptyData);
      fetchProducts();
    } catch (err) {
      const mensagem =
        err?.response?.data?.message ||
        err.message ||
        "Erro ao efetuar a operação.";
      showErrorToast(mensagem);
    }
  };
  // 🔹 Filtra Sop baseado no termo de pesquisa
  const filteredProduct = useMemo(
    () =>
      product.filter((l) =>
        l.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [product, searchTerm]
  );

  const handleSubmitStock = async () => {
    const nomeProduto =
      stockModal?.fields?.find((f) => f.label === "Nome")?.value || "produto";

    const distribuicoes = Data?.distribuicaoStock || [];

    if (distribuicoes.length === 0) {
      showErrorToast("Por favor, adicione pelo menos uma loja e quantidade.");
      return;
    }

    // texto singular / plural
    const textoLojas =
      distribuicoes.length === 1 ? "na seguinte loja:" : "nas seguintes lojas:";

    // monta elementos JSX para cada linha (com espaço entre linhas)
    const linhas = distribuicoes.map((item, idx) => (
      <div key={idx} style={{ marginBottom: "0.5rem" }}>
        <strong>• {item.storeName}</strong>: {item.stock} unidade
        {item.stock > 1 ? "s" : ""}
      </div>
    ));

    // monta a mensagem como JSX (com quebra de linha após o cabeçalho)
    const acaoTexto =
      stockModal?.mode === "adicionar"
        ? `aumentar o stock de "${nomeProduto}" ${textoLojas}`
        : `baixar o stock de "${nomeProduto}" ${textoLojas}`;

    setConfirmMessage(
      <div>
        <div style={{ marginBottom: "0.75rem" }}>
          Tem a certeza que deseja <strong>{acaoTexto}</strong>
        </div>
        <div>{linhas}</div>
      </div>
    );

    setShowConfirm(true);
  };

  const confirmUpdateStock = async () => {
    try {
      const payload = {
        acao: stockModal?.mode,
        distribuicaoStock: Data.distribuicaoStock,
      };

      const response = await updateStock(payload);
      showSuccessToast(response?.message || "Stock atualizado com sucesso!");
      setStockModal(null);
      setData(emptyData);
      fetchProducts();
    } catch (err) {
      const mensagem =
        err?.response?.data?.message ||
        err.message ||
        "Erro ao atualizar stock.";
      showErrorToast(mensagem);
    }
  };

  // 🔹 Paginação: calcula itens atuais
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProduct.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);

  // 🔹 Definição das colunas da tabela
  const columns = [
    { header: "Código ", field: "codigobarra" },
    { header: "Nome", field: "nome" },
    { header: "Categoria", field: "categorias" },
    { header: "Preço", field: "precoUnitario" },
    {
      header: "Stock",
      field: "stock",
      cell: (row) => (
        <div className="gap-2">
          <span>{row.stock}</span>
          {row.stock <= row.stockMin && (
            <FaExclamationTriangle
              size={14}
              color="orange"
              title="Stock no limite ou abaixo do mínimo"
            />
          )}
        </div>
      ),
    },

    {
      header: "Ações",
      field: "acoes",
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          {/* Botão de editar */}
          <button
            onClick={() => handleEdit(row)}
            className="btn btn-sm btn-warning d-flex align-items-center justify-content-center p-1"
            style={{ width: "32px", height: "32px" }}
            title="Editar"
          >
            <FaEdit size={14} />
          </button>
          {/* Botão de ver */}
          <button
            onClick={() => handleView(row)}
            className="btn btn-sm btn-info d-flex align-items-center justify-content-center p-1"
            style={{ width: "32px", height: "32px" }}
            title="Visualizar"
          >
            <FaEye size={14} />
          </button>

          {/* 🟢 Botão de aumentar stock */}
          <button
            onClick={() => handleAddStock(row)}
            className="btn btn-sm btn-success d-flex align-items-center justify-content-center p-1"
            style={{ width: "32px", height: "32px" }}
            title="Aumentar Stock"
          >
            <FaPlus size={14} />
          </button>
          {/* 🟢 Botão de baixar stock */}
          <button
            onClick={() => handleReduceStock(row)}
            className="btn btn-sm btn-danger d-flex align-items-center justify-content-center p-1"
            style={{ width: "32px", height: "32px" }}
            title="Baixar Stock"
          >
            <FaMinus size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 🔹 Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <h3 className="text-primary fw-bold m-0">Produtos</h3>
        <input
          type="text"
          placeholder="Pesquisar produto..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Novo Produto
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setData(emptyData);
          setIsEditMode(false);
        }}
        title="Registo Loja"
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        canSubmit={canSave}
        dialogClassName="modal-loja"
      >
        <ProductForm
          data={Data}
          setData={setData}
          isEditMode={isEditMode}
          useWizard={true}
          onFormValidityChange={setCanSave}
        />
      </ModalForm>

      {/* 🔹 Modal de stock (adicionar ou baixar) */}
      {stockModal?.show && (
        <ModalStock
          show={stockModal.show}
          onClose={() => {
            setStockModal(null);
            setData(emptyData);
          }}
          title={stockModal.title}
          fields={stockModal.fields}
          image={stockModal.image}
          onSubmit={handleSubmitStock}
        >
          <StockForm
            data={Data}
            setData={setData}
            isEditMode={isEditMode}
            productId={stockModal.id}
            mode={stockModal.mode}
          />
        </ModalStock>
      )}
      {/*Modal de conformação */}

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          confirmUpdateStock();
          setShowConfirm(false);
          setStockModal(null);
          setData(emptyData);
        }} 
        message={confirmMessage} // texto formatado com nome, lojas e quantidades
        confirmText="Confirmar"
        confirmVariant="success"
        confirmIcon={FaCheckCircle}
        loadingText="A confirmar..."
      />

      {/* 🔹 Modal de visualização */}
      {viewShop && (
        <GenericViewModal
          show={!!viewShop}
          onClose={() => setViewShop(null)}
          title={viewShop.title}
          fields={viewShop.fields}
          image={viewShop.image}
          entity={viewShop.entity}
        />
      )}

      {/* 🔹 Tabela de produtos */}
      <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
        <DataTable columns={columns} data={currentItems} height="50vh" />
      </div>

      {/* 🔹 Paginação */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </PageContainer>
  );
};

export default ProductPage;
