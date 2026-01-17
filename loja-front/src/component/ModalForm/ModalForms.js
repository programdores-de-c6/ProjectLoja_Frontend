import { Modal, Button } from "react-bootstrap"; // importa Modal e Button do react-bootstrap
import { FaEdit, FaSave, FaTimes } from "react-icons/fa"; // ícones para salvar, editar e cancelar
import "../../css/global.css"; // importa estilos globais (inclui custom-modal)

const ModalForm = ({
  show,
  onClose,
  title,
  children,
  onSubmit,
  isEditMode = false,
  dialogClassName="responsive-modal",
  canSubmit = true, // 🔹 nova prop
}) => {
  const submitButtonText = isEditMode ? "Editar" : "Salvar";
  const submitButtonIcon = isEditMode ? <FaEdit className="me-1" /> : <FaSave className="me-1" />;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      dialogClassName={dialogClassName}
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer>
        {/* Botão principal agora respeita canSubmit */}
        <Button
          variant="primary"
          onClick={onSubmit}
          className="d-flex align-items-center"
          disabled={!canSubmit} // 🔹 botão desabilitado se formulário incompleto
        >
          {submitButtonIcon} {submitButtonText}
        </Button>

        <Button variant="secondary" onClick={onClose} className="d-flex align-items-center">
          <FaTimes className="me-1" /> Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default ModalForm;
