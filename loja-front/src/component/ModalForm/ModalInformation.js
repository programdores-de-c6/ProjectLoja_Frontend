
import { Modal, Button, Card } from "react-bootstrap";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa"; // ícones para salvar, editar e cancelar
import "../../css/global.css"; // importa estilos globais (inclui custom-modal)

const ModalInformation = ({
  show,            // booleano que controla se o modal está visível
  onClose,         // função chamada para fechar o modal
  title,           // título exibido no cabeçalho do modal
  children,        // conteúdo do corpo do modal (normalmente um formulário)
  onSubmit,        // função chamada ao clicar em salvar/editar
  isEditMode = false, // novo: indica se o modal está em modo edição
  dialogClassName="responsive-modal",
  fields, 
  image
}) => {
  // Define texto e ícone do botão principal baseado no modo
  const submitButtonText = isEditMode ? "Editar" : "Salvar";
  const submitButtonIcon = isEditMode ? <FaEdit className="me-1" /> : <FaSave className="me-1" />;

        

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"  
      centered
      backdrop="static"
      dialogClassName={dialogClassName} // classe customizada para responsividade
    >
      {/* Cabeçalho do modal */}
      <Modal.Header >
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      {/* Corpo do modal */}
      <Modal.Body>
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex flex-column flex-md-row align-items-start gap-4">
            {/* 🔹 Mostra imagem no modal (não no print) */}
            {image && (
              <img
                src={
                  image.startsWith("data:image")
                    ? image
                    : `data:image/png;base64,${image}`
                }
                alt="Imagem"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              />
            )}
            {/* 🔹 Mostra campos no modal */}
            <div className="row">
              {fields?.map((field, idx) => (
              <div key={idx} className="col-md-6 mb-3">
      <div
                  className="d-flex justify-content-between align-items-center py-2 px-3"
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "#ffffff",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    marginRight: "10px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#555" }}>
                    {field.label}:
                  </span>
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {field.value}
                  </span>
                </div>
                   </div>
              ))}
            </div>
          </div>
           
        {children}
        </Card>
        
        
        
        
        </Modal.Body>

      {/* Rodapé com botões */}
      <Modal.Footer>
        {/* Botão principal: Salvar ou Editar */}
        <Button variant="primary" onClick={onSubmit} className="d-flex align-items-center">
          {submitButtonIcon} {submitButtonText}
        </Button>

        {/* Botão secundário: Cancelar com ícone */}
        <Button variant="secondary" onClick={onClose} className="d-flex align-items-center">
          <FaTimes className="me-1" /> Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalInformation;
