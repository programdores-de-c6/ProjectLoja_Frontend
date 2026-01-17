// Página: Localidade
// Lista localidades, permite criar/editar via modal, pesquisa em tempo real, rolagem interna e paginação

import React, { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms.js";
import ShopForm, { ShopSchema as ShopDataSchema } from "./SupplierForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer.js";
import "../../css/global.css"; // inclui estilos globais (ex: para tabela)
import { AuthContext } from "../../component/contexts/AuthContext";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useSupplierService as SupllierService } from "./SupplierService.js";
import { useShopService as ShopService } from "../Shop/ShopService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit, FaEye } from "react-icons/fa";
import GenericViewModal from "../../component/ModalForm/VewModal.js"; // novo modal de confirmação

const Supplier = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição
  const { user } = useContext(AuthContext); // pega informações do utilizador/logotipo
  // 🔹 Estado do formulário
  const [Data, setData] = useState({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"",  pais: "",  });

  // 🔹 Lista de localidades
  const [shop, setLocalidade] = useState([]);

  // 🔹 Hooks da API
  const { listar, criar, editar } = SupllierService();
  const { listarId } = ShopService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
 
  // 🔹 Modal de visualização
  const [viewShop, setViewShop] = useState(null);
  // 🔹 Função para buscar fornecedor da API
 const fetchlocation = async () => {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        nome: l.nome || l.name,
        contribuinte: l.numeroContribuite || l.numeroContribuite,
        email: l.email || l.email,
        contactoprincipal: l.contactoPrincipal || l.contactoPrincipal,
        contactosecudario: l.contactoSecudario || l.contactoSecudario,
        pais: l.idpais
          ? { value: l.idpais, label: l.nomepais }
          : null,
        paisNome: l.nomepais || "",
        
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
  const handleEdit = (supplier) => {
    const dadosParaModal = {
      ...supplier,
      pais: supplier.pais
        ? { id: supplier.pais.value, nome: supplier.pais.label }
        : null,
      
    };
    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"",  pais: "",}); 
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };
    
// 🔹 Abrir modal de visualização
  const handleView = async (supplier) => {
     try {
    // Busca os dados da loja via API usando o id do supplier
    const shopData = await listarId(user.idl); 
    const fields = [
      { label: "Nome", value: supplier.nome },
      { label: "Contribuinte", value: supplier.contribuinte },
      { label: "Contacto Principal", value: supplier.contactoprincipal},
       { label: "Contacto Secudario", value: supplier.contactosecudario },
      { label: "Email", value: supplier.email },
      { label: "País", value: supplier.paisNome },
    ]; 
 

    const entity = {
  name: shopData.nome || "—",
  address: shopData.nomelocation || "",
  contact: shopData.contacto || "—",
  email: shopData.email || "—",
  contribuinte: shopData.numeroContribuite || "—",
  caixaPostal: shopData.caixaPostal || "—",
};
    setViewShop({ fields, image: supplier.logo, entity, title: "Detalhes do Fornecedor" });
    } catch (err) {
    showErrorToast(err.message || "Erro ao carregar dados da loja");
  }
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
    setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"",  pais: "",}); // limpa formulário
      
      fetchlocation();
    } catch (err) {
      const mensagem =
        err?.response?.data?.mensagem ||
        err.message ||
        "Erro ao efetuar a operação.";
      showErrorToast(mensagem);
    }
  };

  // 🔹 Filtra supplier baseado no termo de pesquisa
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
    { header: "Contacto", field: "contactoprincipal" },
    { header: "Email", field: "email" },
    { header: "Pais ", field: "paisNome" },
    
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
      {/* 🔹 Cabeçalho: título, pesquisa e botão de novo fornecedor */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <h3 className="text-primary fw-bold m-0">Fornecedor</h3>
        <input
          type="text"
          placeholder="Pesquisar Fornecedor..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Novo Fornecedor
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
             setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"", pais: ""});

          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Fornecedor"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
        dialogClassName="modal-loja" // modal maior
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

export default Supplier;
