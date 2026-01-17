// Página: Localidade
// Lista localidades, permite criar/editar via modal, pesquisa em tempo real, rolagem interna e paginação

import React, { useState, useEffect, useMemo,useRef  } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms.js";
import EmployeeForm from "./EmployeeForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer.js";
import "../../css/global.css"; // inclui estilos globais (ex: para tabela)
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useEmployeeService as SupllierService } from "./EmployeeService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit, FaEye } from "react-icons/fa";
import GenericViewModal from "../../component/ModalForm/VewModal.js"; // novo modal de confirmação

const Employee = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição
const employeeFormRef = useRef(null);
  // 🔹 Estado do formulário
  const initialEmployeeData = {
  nome: "",
  contribuinte: "",
  contactoprincipal: "",
  contactosecudario: "",
  email: "",
  sexo: "",
  bi: "",
  dataNascimento: "",
  dataAdmissao: "",
  foto: "",

  // 🔹 CAMPOS OBJECT
  localidade: null,
  loja: null,
  funcao: null,

  // 🔹 ACESSO
  username: "",
};

  const [Data, setData] = useState(initialEmployeeData);

  // 🔹 Lista de Funcionario
  const [Employee, setEmployee] = useState([]);

  // 🔹 Hooks da API
  const { listar, criar, editar, listarId } = SupllierService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
 
  // 🔹 Modal de visualização
  const [viewEmployee, setViewEmployee] = useState(null);
  // 🔹 Função para buscar fornecedor da API
 const fetchlocation = async () => {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        nome: l.nome || l.name,
        contribuinte: l.numeroContribuinte || l.numeroContribuinte,
        email: l.email || l.email,
        contactoprincipal: l.contactoPrincipal || l.contactoPrincipal,
        jobTitle: l.jobTitle || l.jobTitle,
        estado: l.status || l.status,
        
      }));
      setEmployee(adaptados);
    } catch (err) {
      showErrorToast(err.message || "Erro ao carregar");
    }
  };
   useEffect(() => {
  fetchlocation();
}, []); 


const formatDateForInput = (date) => {
  if (!date) return "";
  const [dia, mes, ano] = date.split("/");
  return `${ano}-${mes}-${dia}`;
};


  // 🔹 Abrir modal para edição
  const handleEdit =  async (supplier) => {
      const response = await listarId(supplier.id);
   const dadosParaModal = {
    ...supplier,
nome: response.nome,
bi: response.numeroBi,
email: response.email,
contribuinte: response.numeroContribuinte,
contactoprincipal:response.contactoPrincipal,
contactosecudario:response.contactoSecudario,
dataNascimento: formatDateForInput(response.dataNascimento),
dataAdmissao: formatDateForInput(response.dataAdmissao),
sexo: response.gender,
localidade: response.location
    ? { id: response.location, nome: response.locations }
    : null,
loja: response.shop2
    ? { id: response.shop2.id, nome: response.shop2.nome }
    : null,
funcao: response.jobtitle
    ? { id: response.jobtitle, nome: response.jobTitle}
    : null,
};

    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
    
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"",  localidade: "",}); 
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };
    
// 🔹 Abrir modal de visualização
  const handleView = async  (supplier) => {
  
    try{
    const response = await listarId(supplier.id);

const fields = [
  { label: "Nome", value: response.nome || "" },
  { label: "Contribuinte", value: response.numeroContribuinte || "" },
  { label: "Contacto Principal", value: response.contactoPrincipal || "" },
  { label: "Contacto Secudario", value: response.contactoSecudario || "" },
  { label: "Email", value: response.email || "" },
  { label: "Numero de BI", value: response.numeroBi || "" },
  { label: "Data Nacimento", value: response.dataNascimento || "" },
  { label: "Data Admissão", value: response.dataAdmissao || "" },
  { label: "Sexo", value: response.gender || "" },
  { label: "Localidade", value: response.locations || "" },
  { label: "Função", value: response.jobTitle || "" },
  { label: "Salario Base", value: response.salaaryBases || "" },
  { label: "Estado", value: response.status || "" }
];
const entity = {
  name: response.shop2.nome || "—",
  address:response.shop2.location.nome || "",
  contact: response.shop2.contacto || "—",
  email: response.shop2.email || "—",
  contribuinte: response.shop2.numeroContribuite || "—",
  caixaPostal: response.shop2.caixaPostal || "—",
};

        setViewEmployee({ fields, image: response.logoUrl, entity,  title: "Ficha Individual do Funcionário" });

    }
  catch (err) {
    showErrorToast(
      err?.response?.data?.mensagem ||
      err.message ||
      "Erro ao carregar dados do funcionário"
    );
  }
    
  };

  // 🔹 Submit do modal
  const handleSubmit = async () => {
    try {
     // 🔹 Chama validação da última etapa via ref
    const isValid = await employeeFormRef.current.validateLastStep();
    if (!isValid) return; // sai se houver erros
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
    setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"",  localidade: "",}); // limpa formulário
      
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
      Employee.filter(
        (l) =>
          (l.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       l.contribuinte?.toLowerCase().includes(searchTerm.toLowerCase()))
     
      
   
      ),
    [Employee, searchTerm]
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
    { header: "Cargo ", field: "jobTitle" },
    {header: "Status ", field: "estado" },
    
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
        <h3 className="text-primary fw-bold m-0">Funcionario</h3>
        <input
          type="text"
          placeholder="Pesquisar Funcionario..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Novo Funcionario
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
             setData({ nome: "", contribuinte: "", contactoprincipal:"", contactosecudario:"", email:"", localidade: ""});

          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Funcionario"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
        dialogClassName="modal-loja" // modal maior
      >
        <EmployeeForm data={Data} setData={setData} isEditMode={isEditMode} ref={employeeFormRef}   />

      </ModalForm>
      {/* Modal de visualização */}
      {viewEmployee && (
        <GenericViewModal
          show={!!viewEmployee}
          onClose={() => setViewEmployee(null)}
          title={viewEmployee.title}
          fields={viewEmployee.fields}
          image={viewEmployee.image}
          entity={viewEmployee.entity} 
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

export default Employee;
