
import { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms.js";
import JobTitleForm, { JobTitleSchema,  ACCESS_LEVELS } from "./JobTitleForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer.js";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useBasesalayService as basesalaryService } from "./JobTitleService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit } from "react-icons/fa";


const JobTitlePage = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição

  // 🔹 Estado do formulário
  const [Data, setData] = useState({ nome: ""});

  // 🔹 Lista de Imposto
  const [basesalary, setbasesalary] = useState([]);

  // 🔹 Hooks da API
  const {listar, criar, editar } = basesalaryService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
    const [errors, setErrors] = useState({}); // estado de erros Yup

const ACCESS_LABELS = ACCESS_LEVELS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});
  //🔹 Função para buscar salario base da API
 async function fetchCargos() {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        nome: l.nomecargo || l.nomecargo,
        descricao: l.descricao || l.descricao,
        valor: l.valor,
         accessLevel: l.accessLevel || "",
        accessLevelLabel: ACCESS_LABELS[l.accessLevel] || "Sem acesso ao sistema",
      }));
      setbasesalary(adaptados);
    } catch (err) {
      showErrorToast(err.message || "Erro ao carregar");
    }
  }
   useEffect(() => {
  fetchCargos();
}, []); 




  // 🔹 Abrir modal para edição
  const handleEdit = (basesalary) => {
  const valorLimpo = basesalary.valor
    ? basesalary.valor.replace(/[^\d,.-]/g, "") // remove tudo que não seja número, vírgula ou ponto
    : "";
    const dadosParaModal = {
      ...basesalary,
      valor: valorLimpo,
     
    };
    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ descricao: "", valor: "" }); // limpa formulário
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };

  

  // 🔹 Submit do modal
  const handleSubmit = async () => {
    try {
     await JobTitleSchema.validate(Data, { abortEarly: false });
      setErrors({}); // limpa erros se passou validação
      let response;
      if (isEditMode) {
        // agora verifica o estado em vez de Data.id
        response = await editar(Data);
        showSuccessToast(
          response?.message || "Editada com sucesso!"
        );
      } else {
        response = await criar(Data);
        showSuccessToast(
          response?.message || " Criado com sucesso!"
        );
      }
      setShowModal(false);
      setData({ nome: "", descricao: "", valor: "", accessLevel: "" });
      fetchCargos();
    } catch (err) {
      if (err.inner) {
        // mapeia erros do Yup para o estado
        const formErrors = {};
        err.inner.forEach((e) => {
          formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showErrorToast(err.message || "Erro ao efetuar a operação.");
      }
    }
  };

  // 🔹 Filtra  baseado no termo de pesquisa
  const filteredCargos = useMemo(
    () =>
      basesalary.filter(
        (l) =>
          l.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||

           l.valor?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [basesalary, searchTerm]
  );

  // 🔹 Paginação: calcula itens atuais
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCargos.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage);

  // 🔹 Definição das colunas da tabela
  const columns = [
    {header: "nome", field: "nome" },
    { header: "descrição", field: "descricao" },
    { header: "valor", field: "valor" },
      { header: "Nível de Acesso", field: "accessLevelLabel" },
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
        <h3 className="text-primary fw-bold m-0">Cargos</h3>
        <input
          type="text"
          placeholder="Pesquisar Cargo..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Novo Cargo
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setData({ descricao: "", valor: ""});
          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Cargo"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
      >
         <JobTitleForm data={Data} setData={setData} errors={errors} />
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

export default JobTitlePage;
