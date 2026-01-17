// Página: Localidade
// Lista localidades, permite criar/editar via modal, pesquisa em tempo real, rolagem interna e paginação

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms";
import ShopForm, { ShopSchema as ShopDataSchema } from "./ShopForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer";
import "../../css/global.css"; // inclui estilos globais (ex: para tabela)
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useShopService as ShopService } from "./ShopService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit, FaEye } from "react-icons/fa";
import GenericViewModal from "../../component/ModalForm/VewModal.js"; // novo modal de confirmação

const Shop = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição

  // 🔹 Estado do formulário
  const [Data, setData] = useState({ nome: "", contribuinte: "", contacto:"", email:"", caixaPostal:"", localidade: "", logo: null, tipo:"", });

  // 🔹 Lista de localidades
  const [shop, setLocalidade] = useState([]);

  // 🔹 Hooks da API
  const { listar, criar, editar } = ShopService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
 
  // 🔹 Modal de visualização
  const [viewShop, setViewShop] = useState(null);
  // 🔹 Função para buscar shop da API
 const fetchlocation = async () => {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        nome: l.nome || l.name,
        contribuinte: l.numeroContribuite || l.numeroContribuite,
        email: l.email || l.email,
        contacto: l.contacto || l.contacto,
        caixaPostal: l.caixaPostal || l.caixaPostal,
        tipo: l.shopTypes || l.shopTypes,
        localidade: l.idlocation
          ? { value: l.idlocation, label: l.nomelocation }
          : null,
        localidadeNome: l.nomelocation || "",
        logo: l.logoUrl || null,
      }));
      setLocalidade(adaptados);
    } catch (err) {
      showErrorToast(err.message || "Erro ao carregar localidades");
    }
  };
   useEffect(() => {
  fetchlocation();
}, []); 




  // 🔹 Abrir modal para edição
  const handleEdit = (shop) => {
    const dadosParaModal = {
      ...shop,
      localidade: shop.localidade
        ? { id: shop.localidade.value, nome: shop.localidade.label }
        : null,
        logo: "", // 🔹 resetamos logo, só se o user fizer upload outra vez
    };
    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ nome: "", contribuinte: "", contacto:"", email:"", caixaPostal:"", localidade: "",  logo: null,}); 
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };
    
// 🔹 Abrir modal de visualização
  const handleView = (shop) => {
    const fields = [
      { label: "Nome", value: shop.nome },
      { label: "Contribuinte", value: shop.contribuinte },
      { label: "Contacto", value: shop.contacto },
      { label: "Email", value: shop.email },
      { label: "Caixa Postal", value: shop.caixaPostal },
      { label: "Rua", value: shop.localidadeNome },
      { label: "Tipo", value: shop.tipo },
    ]; 

   const entity = {
  name: shop.nome || "—",
  address: shop.localidadeNome || "",
  contact: shop.contacto || "—",
  email: shop.email || "—",
  contribuinte: shop.contribuinte || "—",
  caixaPostal: shop.caixaPostal || "—",
};


    setViewShop({ fields, image: shop.logo, entity, title: "Detalhes da Loja" });
  };

  // 🔹 Submit do modal
  const handleSubmit = async () => {
    try {
      await ShopDataSchema.validate(Data);
      let response;
      if (isEditMode) {
        // agora verifica o estado em vez de Data.id
        response = await editar(Data);
        showSuccessToast(
          response?.message || " editada com sucesso!"
        );
      } else {
        response = await criar(Data);
        showSuccessToast(
          response?.message || " criada com sucesso!"
        );
      }
      setShowModal(false);
    setData({ nome: "", contribuinte: "", contacto:"", email:"", caixaPostal:"", localidade: ""}); // limpa formulário
      
      fetchlocation();
    } catch (err) {
      const mensagem =
        err?.response?.data?.mensagem ||
        err.message ||
        "Erro ao efetuar a operação.";
      showErrorToast(mensagem);
    }
  };

  // 🔹 Filtra Sop baseado no termo de pesquisa
  const filteredShop = useMemo(
    () =>
      shop.filter(
        (l) =>
          (l.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       l.contribuinte?.toLowerCase().includes(searchTerm.toLowerCase()))
      
   
      ),
    [shop, searchTerm]
  );

  // 🔹 Paginação: calcula itens atuais
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredShop.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredShop.length / itemsPerPage);

  // 🔹 Definição das colunas da tabela
  const columns = [
    { header: "Nome", field: "nome" },
    { header: "Contribuinte", field: "contribuinte" },
    { header: "Contacto", field: "contacto" },
    { header: "Email", field: "email" },
    { header: "Tipo", field: "tipo" },
//    { header: "Rua", field: "localidadeNome" },
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
            <FaEye  size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 🔹 Cabeçalho: título, pesquisa e botão de nova localidade */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <h3 className="text-primary fw-bold m-0">Loja</h3>
        <input
          type="text"
          placeholder="Pesquisar loja..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Nova Loja
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
             setData({ nome: "", contribuinte: "", contacto:"", email:"", caixaPostal:"", localidade: ""});

          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Loja"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
        dialogClassName="modal-loja"
      >
        <ShopForm data={Data} setData={setData} isEditMode={isEditMode} />

      </ModalForm>
      {/* Modal de visualização */}
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
      {/* 🔹 Tabela com scroll interno e cabeçalho fixo */}
      <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
        <DataTable columns={columns} data={currentItems} height="50vh" />
      </div>

      {/* 🔹 Componente de paginação */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </PageContainer>
  );
};

export default Shop;
