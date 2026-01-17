// Página: Localidade
// Lista localidades, permite criar/editar via modal, pesquisa em tempo real, rolagem interna e paginação

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import ModalForm from "../../component/ModalForm/ModalForms";
import LocationForm, {
  locationSchema as locationDataSchema,
} from "./LocationForm.js";
import DataTable from "../../component/DataTable/DaTables.js";
import PageContainer from "../../component/PageContainer/Pcontainer";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";
import { useLocationService } from "./LocationService.js";
import PaginationControl from "../../component/DataTable/PaginationControl.js";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "../../component/ModalForm/ConfirmModal"; // novo modal de confirmação

const Localidade = () => {
  // 🔹 Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // controla se o modal está em modo edição

  // 🔹 Estado do formulário
  const [Data, setData] = useState({ nome: "", sigla: "", distrito: "" });

  // 🔹 Lista de localidades
  const [localidade, setLocalidade] = useState([]);

  // 🔹 Hooks da API
  const { listar, criar, editar, deletar } = useLocationService();

  // 🔹 Estado da pesquisa em tempo real
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  // 🔹 Estado do modal de confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    location: null,
  });
  // 🔹 Função para buscar localidades da API
  const fetchlocation = async () => {
    try {
      const response = await listar();
      const adaptados = response.map((l) => ({
        id: l.id,
        nome: l.nome || l.name,
        sigla: l.sigla || l.code,
        distrito: l.distritoid
          ? { value: l.distritoid, label: l.nomedistrito }
          : null,
        distritoNome: l.nomedistrito || "",
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
  const handleEdit = (location) => {
    const dadosParaModal = {
      ...location,
      distrito: location.distrito
        ? { id: location.distrito.value, nome: location.distrito.label }
        : null,
    };
    setData(dadosParaModal); // preenche formulário com os dados da linha
    setIsEditMode(true); // muda para modo edição
    setShowModal(true); // abre modal
  };

  // 🔹 Abrir modal para criação
  const handleNew = () => {
    setData({ nome: "", sigla: "", distrito: "" }); // limpa formulário
    setIsEditMode(false); // muda para modo criação
    setShowModal(true); // abre modal
  };
  // 🔹 Abrir modal de confirmação para eliminar
  const handleOpenDelete = (location) => {
    setConfirmDelete({ show: true, location });
  };
  //
  // 🔹 Confirmar eliminação
  const handleConfirmDelete = async () => {
    let response;
    try {
      response = await deletar({ id: confirmDelete.location.id }); // chama API de delete

      showSuccessToast(
        response?.message || "Localidade eliminada com sucesso!"
      );
      await fetchlocation(); // atualiza lista
    } catch (err) {
      // pega mensagem do backend, se existir
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao eliminar localidade";
      showErrorToast(msg);
    } finally {
      setConfirmDelete({ show: false, location: null }); // fecha modal
    }
  };

  // 🔹 Submit do modal
  const handleSubmit = async () => {
    try {
      await locationDataSchema.validate(Data);
      let response;
      if (isEditMode) {
        // agora verifica o estado em vez de Data.id
        response = await editar(Data);
        showSuccessToast(
          response?.message || "Localidade editada com sucesso!"
        );
      } else {
        response = await criar(Data);
        showSuccessToast(response?.message || "Localidade criada com sucesso!");
      }
      setShowModal(false);
      setData({ nome: "", sigla: "", distrito: "" });
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
      localidade.filter(
        (l) =>
          l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.distritoNome.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [localidade, searchTerm]
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
    { header: "Nome", field: "nome" },
    { header: "Sigla", field: "sigla" },
    { header: "Distrito", field: "distritoNome" },
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
          {/* Botão de eliminar */}
          <button
            onClick={() => handleOpenDelete(row)}
            className="btn btn-sm btn-danger d-flex align-items-center justify-content-center p-1"
            style={{ width: "32px", height: "32px" }}
            title="Eliminar"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 🔹 Cabeçalho: título, pesquisa e botão de nova localidade */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <h3 className="text-primary fw-bold m-0">Localidade</h3>
        <input
          type="text"
          placeholder="Pesquisar localidade..."
          className="form-control"
          style={{ maxWidth: "400px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta página ao pesquisar
          }}
        />
        <Button variant="primary" onClick={handleNew}>
          Nova Localidade
        </Button>
      </div>

      {/* 🔹 Modal de cadastro/edição */}
      <ModalForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setData({ nome: "", sigla: "", distrito: "" });
          setIsEditMode(false); // garante reset ao fechar
        }}
        title="Registo Localidade"
        onSubmit={handleSubmit}
        isEditMode={isEditMode} // passa o estado para o modal
      >
        <LocationForm data={Data} setData={setData} />
      </ModalForm>
      {/* 🔹 Modal de confirmação de exclusão */}
      <ConfirmModal
        show={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, location: null })}
        onConfirm={handleConfirmDelete}
        message={
          <>
            Deseja realmente eliminar a Localidade{" "}
            <strong>"{confirmDelete.location?.nome}"</strong>?
          </>
        }
        confirmText="Eliminar"
        confirmVariant="danger"
        confirmIcon={FaTrash}
        loadingText="A eliminar..."
      />
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

export default Localidade;
