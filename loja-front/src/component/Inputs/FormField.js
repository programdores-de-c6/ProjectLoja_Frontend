// 🔹 Importa React (necessário para JSX)
import React from "react";
// 🔹 Importa FloatingLabel (rótulo flutuante) e Form do React-Bootstrap
import { FloatingLabel, Form } from "react-bootstrap";

// 🔹 Componente reutilizável para campos de formulário
const FormField = ({
  controlId, // ID único do campo (ligação rótulo → input)
  label, // Texto exibido no rótulo (label flutuante)
  type = "text", // Tipo do input (padrão: "text")
  name, // Nome do campo (usado no state e envio do form)
  placeholder, // Texto de exemplo dentro do input
  value, // Valor atual do campo
  onChange, // Função chamada quando o valor muda
  onBlur, // Função chamada quando o campo perde o foco
  isInvalid, // Boolean → define se o campo está inválido
  feedback, // Mensagem de erro (aparece em vermelho abaixo do input)
  options, // Lista de opções (caso seja um select)
  isSelect = false, // Se true → renderiza um <Form.Select>, senão um <Form.Control>
}) => {
  // 🔹 Estilos inline básicos para espaçamento dos inputs
  const inputStyle = {
    paddingBottom: "7px",
    marginTop: "20px",
    marginBottom: "30px",
  };

  // ===========================================================
// 🟢 Caso especial: campo do tipo "image-box"
// ===========================================================
if (type === "image-box") {
  return (
    <div className="mb-3 text-center">
      {/* 🔹 Label centralizado */}
    

      {/* 🔹 Quadrado clicável */}
      <div
        onClick={() => document.getElementById(name).click()}
        style={{
          width: "120px",
          height: "120px",
          border: "2px dashed #bbb",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
          transition: "0.3s",
           margin: "0 auto",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0d6efd")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#bbb")}
      >
        {value instanceof File ?  (
          <img
            src={URL.createObjectURL(value)}
            alt="Pré-visualização"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        ) : (
          <div className="text-center">
            <i className="bi bi-cloud-arrow-up fs-1 text-secondary"></i>
            <div style={{ fontSize: "12px", color: "#777" }}>Carregar imagem</div>
          </div>
        )}
      </div>

      {/* 🔹 Input escondido */}
      <Form.Control
        id={name}
        type="file"
        accept="image/*"
        name={name}
        onChange={onChange}
        style={{ display: "none" }}
      />
    </div>
  );
}



  // ===========================================================
  // 🔹 Caso normal: Inputs com FloatingLabel e Selects
  // ===========================================================
  return (
    <FloatingLabel controlId={controlId} label={label} className="mb-4">
      {/* 🔹 Se for SELECT */}
      {isSelect ? (
        <Form.Select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          isInvalid={isInvalid}
          className="input_left_color shadow-sm"
          style={inputStyle}
        >
          <option value="">{placeholder || "Selecione..."}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      ) : (
        /* 🔹 Caso seja um INPUT normal */
        <Form.Control
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          isInvalid={isInvalid}
          className="input_left_color shadow-sm"
          style={inputStyle}
        />
      )}

      {/* 🔹 Mensagem de erro */}
      {feedback && (
        <Form.Control.Feedback type="invalid">
          {feedback}
        </Form.Control.Feedback>
      )}
    </FloatingLabel>
  );
};

// 🔹 Exporta o componente para uso em outros formulários
export default FormField;
