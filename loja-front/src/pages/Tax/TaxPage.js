
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms.js";
import TaxForm, { CategorySchema as categoryDataSchema } from "./TaxForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer.js";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useTaxService as TaxService } from "./TaxService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit } from "react-icons/fa";

const TaxPage = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição

  // 🔹 Estado do formulário
  const [Data, setData] = useState({ nome: ""});

  // 🔹 Lista de Imposto
  const [tax, setTax] = useState([]);

  // 🔹 Hooks da API
  const {listar, criar, editar } = TaxService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  //🔹 Função para buscar imposto da API
 const fetchlocation = async () => {
    try {
     const response = await listar();
     const adaptados = response.map((l) => ({
        id: l.id,
        imposto: l.imposto || l.imposto,
        taxa: l.baseCalculo || l.baseCalculo
        
      }));
      setTax(adaptados);
  } catch (err) {
      showErrorToast(err.message || "Erro ao carregar");
    }
  };
   useEffect(() => {
  fetchlocation();
}, []); 




  // 🔹 Abrir modal para edição
  const handleEdit = (imposto) => {
 console.log(imposto);
    const dadosParaModal = {
      ...imposto,
     
    };
    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ imposto: "", taxa: "" }); // limpa formulário
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };

  

  // 🔹 Submit do modal
  const handleSubmit = async () => {
    try {
      await categoryDataSchema.validate(Data);
      let response;
      if (isEditMode) {
        // agora verifica o estado em vez de Data.id
        response = await editar(Data);
        showSuccessToast(
          response?.message || "Imposto editada com sucesso!"
        );
      } else {
        response = await criar(Data);
        showSuccessToast(
          response?.message || "imposto criada com sucesso!"
        );
      }
      setShowModal(false);
      setData({ nome: ""});
      fetchlocation();
    } catch (err) {
      const mensagem =
        err?.response?.data?.mensagem ||
        err.message ||
        "Erro ao efetuar a operação.";
      showErrorToast(mensagem);
    }
  };

  // 🔹 Filtra localidades baseado no termo de pesquisa
  const filteredLocalidade = useMemo(
    () =>
      tax.filter(
        (l) =>
          l.imposto?.toLowerCase().includes(searchTerm.toLowerCase()) 
          
      ),
    [tax, searchTerm]
  );

  // 🔹 Paginação: calcula itens atuais
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLocalidade.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredLocalidade.length / itemsPerPage);

  // 🔹 Definição das colunas da tabela
  const columns = [

    { header: "Imposto", field: "imposto" },
    { header: "Taxa", field: "taxa" },
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
          
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 🔹 Cabeçalho: título, pesquisa e botão de nova localidade */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <h3 className="text-primary fw-bold m-0">Imposto</h3>
        <input
          type="text"
          placeholder="Pesquisar categoria..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Novo Imposto
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setData({ imposto: "", taxa: ""});
          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Imposto"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
      >
        <TaxForm data={Data} setData={setData} />
      </ModalForm>
     
      
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

export default TaxPage;
