import { Modal, Button, Spinner } from "react-bootstrap";
import { FaTimes, FaQuestionCircle } from "react-icons/fa";
import { useState } from "react";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  message,
  confirmText = "Confirmar",
  confirmVariant = "primary",
  confirmIcon: ConfirmIcon = FaQuestionCircle,
  loadingText = "A processar..."
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header className="bg-light border-bottom-0">
        <Modal.Title className="d-flex align-items-center">
          <FaQuestionCircle className="text-warning me-2" size={20} />
          Confirmação
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <p className="fs-5">{message}</p>
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-top-0">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="px-4"
        >
          <FaTimes size={14} className="me-1" /> Cancelar
        </Button>

        <Button
          variant={confirmVariant}
          onClick={handleConfirm}
          disabled={loading}
          className="px-4"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {loadingText}
            </>
          ) : (
            <>
              {ConfirmIcon && <ConfirmIcon size={14} className="me-1" />}
              {confirmText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
