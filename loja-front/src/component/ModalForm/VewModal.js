import React, { useRef, useContext } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import { AuthContext } from "../../component/contexts/AuthContext";
import StorefrontIcon from "@mui/icons-material/Storefront";
import "../../css/global.css"; // inclui estilos globais
import { printGenericViewPdf } from "../../print/builders/genericViewPdf";

// 🔹 Componente principal
const GenericViewModal = ({ show, onClose, title, fields, image, entity }) => {
  const printRef = useRef(); // referência para o corpo do modal
  const { user } = useContext(AuthContext); // pega informações do utilizador/logotipo
/*
  // 🔹 Função de impressão
  const handlePrint = () => {
    // Abre uma nova janela em branco
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Escreve HTML diretamente na nova janela
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              /* 🔹 Estilos aplicados só no documento impresso */
             /* body {
                font-family: 'Inter', sans-serif;
                padding: 40px;
                margin: 0;
                background: #fff;
                color: #222;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 40px;
                border-bottom: 2px solid #1976d2;
                padding-bottom: 10px;
              }
              .header h2 {
                margin: 0;
                color: #1976d2;
              }
              .logo {
                width: 120px;
                height: 60px;
                object-fit: contain;
              }
              .field {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
                font-size: 15px;
              }
              .field span.label {
                font-weight: 600;
                color: #444;
              }
              .field span.value {
                font-weight: 500;
                color: #000;
              }
              .image {
                display: block;
                margin: 20px auto;
                width: 200px;
                height: 200px;
                object-fit: cover;
                border: 1px solid #ccc;
                border-radius: 8px;
              }
              .footer {
                margin-top: 50px;
                font-size: 12px;
                color: #666;
                text-align: right;
              }
            </style>
          </head>
          <body>
            <!-- 🔹 Cabeçalho com logo + título -->
            <div class="header">
              ${
                user?.loja?.logo
                  ? `<img src="${user.logo}" class="logo" alt="Logo"/>`
                  : ""
              }
              <h2>${title}</h2>
            </div>

            <!-- 🔹 Imagem principal, se existir -->
            ${
              image
                ? `<img class="image" src="${
                    image.startsWith("data:image")
                      ? image
                      : `data:image/png;base64,${image}`
                  }" alt="Imagem"/>`
                : ""
            }

            <!-- 🔹 Lista de campos formatados -->
            ${fields
              .map(
                (f) => `
              <div class="field">
                <span class="label">${f.label}:</span>
                <span class="value">${f.value}</span>
              </div>`
              )
              .join("")}

            <!-- 🔹 Rodapé automático com data da impressão -->
            <div class="footer">
              Impresso em ${new Date().toLocaleString("pt-PT")}
            </div>
          </body>
        </html>
      `);

      // Finaliza o HTML
      printWindow.document.close();
      printWindow.focus();
      // Abre diálogo de impressão
      printWindow.print();
      // Fecha a janela após imprimir
      printWindow.close();
    }
  }; */

  const handlePrint = () => {
    printGenericViewPdf({ title, fields, image, entity, user });
  }
  return (
    <Modal
      show={show}           // controla visibilidade do modal
      onHide={onClose}      // ação para fechar
      size="lg"             // modal grande
      centered              // centralizado no ecrã
      backdrop="static"     // só fecha pelo botão, não ao clicar fora
      className="generic-view-modal"
      dialogClassName="responsive-modal"
    >
      {/* 🔹 Cabeçalho da modal */}
      <Modal.Header style={{ borderBottom: "2px solid #1976d2" }}>
        <Modal.Title
          className="fw-bold d-flex align-items-center gap-3"
          style={{ color: "#1976d2", fontSize: "1.5rem" }}
        >
          {title}
          {user?.loja?.logo ? (
            <img
              src={user.logo}
              alt={user.loja?.nome || "Logo"}
              style={{
                width: 120,
                height: 60,
                objectFit: "contain",
              }}
            />
          ) : (
            <StorefrontIcon
              sx={{ width: 40, height: 40, color: "#1976d2" }}
              fontSize="large"
            />
          )}
        </Modal.Title>
      </Modal.Header>

      {/* 🔹 Corpo da modal */}
      <Modal.Body ref={printRef}>
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
  {fields?.map((field, idx) => {
    const isDescricao = field.label.toLowerCase() === "descrição";
    return (
      <div key={idx} className={`mb-3 ${isDescricao ? "col-12" : "col-md-6"}`}>
        <div
          className="d-flex flex-column"
          style={{
            backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "#f8f9fa",
            borderRadius: "6px",
            padding: "10px",
            wordBreak: "break-word",
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
    );
  })}
</div>
</div>
        </Card>
      </Modal.Body>

      {/* 🔹 Rodapé da modal */}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          style={{
            backgroundColor: "#1976d2",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          🖨️ Imprimir
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenericViewModal;
