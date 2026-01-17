import { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";

import PageContainer from "../../component/PageContainer/Pcontainer";
import ModalForm from "../../component/ModalForm/ModalForms";
import DataTable from "../../component/DataTable/DaTables";
import PaginationControl from "../../component/DataTable/PaginationControl";
import { showSuccessToast, showErrorToast } from "../../component/Toast/ToastMessage";

import SerieForm, { SerieSchema } from "./SerieForm";
import { useBasesalayService as serieService } from "./SerieService";

// ======================================================
const SeriePage = () => {
  const { listar, criar, editar } = serieService();

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [series, setSeries] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  // ----------------------------
  // Fetch
  // ----------------------------
  const fetchSeries = async () => {
    try {
      setSeries(await listar());
    } catch (err) {
      showErrorToast("Erro ao carregar séries");
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  // ----------------------------
  // Modal handlers
  // ----------------------------
  const handleNew = () => {
    setFormData({});
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (series) => {
    const dadosmodal = {
      id: series.id,
      serie: series.serie,
      numeroautorizacao: series.numeroAutorizacao, // 🔥 correção aqui
      ano: series.ano,
      shop: series.shop
        ? { id: series.shops, nome: series.shop }
      : null,
    };
    setFormData(dadosmodal);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      await SerieSchema.validate(formData, { abortEarly: false });
      setErrors({});

      isEditMode ? await editar(formData) : await criar(formData);

      showSuccessToast("Operação realizada com sucesso");
      setShowModal(false);
      fetchSeries();
    } catch (err) {
      if (err.inner) {
        const mapped = {};
        err.inner.forEach((e) => (mapped[e.path] = e.message));
        setErrors(mapped);
      } else {
        showErrorToast("Erro ao guardar");
      }
    }
  };

  // ----------------------------
  // Table
  // ----------------------------
  const filtered = useMemo(
    () =>
      series.filter((s) =>
        s.serie?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [series, searchTerm]
  );

  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { header: "Série", field: "serie" },
    { header: "Autorização", field: "numeroAutorizacao" },
    { header: "Ano", field: "ano" },
    {header: "Loja",field: "shop"},
     
    
    {
      header: "Ações",
      cell: (row) => (
        <button
          className="btn btn-warning btn-sm"
          onClick={() => handleEdit(row)}
        >
          <FaEdit />
        </button>
      ),
    },
  ];

  // ----------------------------
  return (
    <PageContainer>
      <div className="d-flex justify-content-between mb-3">
        <h3 className="text-primary">Séries</h3>
        <Button onClick={handleNew}>Nova Série</Button>
      </div>

      <DataTable columns={columns} data={currentItems} />

      <PaginationControl
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />

      <ModalForm
        show={showModal}
        title="Registo de Série"
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
      >
        <SerieForm data={formData} setData={setFormData} errors={errors} />
      </ModalForm>
    </PageContainer>
  );
};

export default SeriePage;
