// ================================================================
// 🔹 FormField.js — Componente de Campo de Formulário Reutilizável
// ================================================================
// Este componente serve para criar todos os tipos de campos de formulário
// (inputs, selects e upload de imagem) de forma padronizada e elegante.
// ================================================================

// Importa React para o uso de JSX
import React from "react";
// Importa componentes do React-Bootstrap para estrutura e estilo
import { FloatingLabel, Form } from "react-bootstrap";

// ================================================================
// 🔹 Componente Principal
// ================================================================
const FormField = ({
  controlId,      // ID único do campo — associa o label ao input
  label,          // Texto exibido acima ou dentro do campo
  type = "text",  // Tipo do campo: "text", "number", "email", "image-box", etc.
  name,           // Nome do campo — usado no objeto de dados (state)
  placeholder,    // Texto de exemplo (para inputs e selects)
  value,          // Valor atual do campo
  onChange,       // Função chamada ao alterar o valor
  onBlur,         // Função chamada ao perder o foco (opcional)
  isInvalid,      // Define se o campo está inválido (para validação visual)
  feedback,       // Mensagem de erro a exibir quando inválido
  options,        // Lista de opções (para selects)
  isSelect = false, // Se for true, o campo é renderizado como SELECT
}) => {

  // ================================================================
  // 🔹 Estilos padrão aplicados a inputs e selects
  // ================================================================
  const inputStyle = {
    paddingBottom: "7px",
    marginTop: "20px",
    marginBottom: "30px",
  };

  // ================================================================
  // 🟢 Caso Especial: Campo do tipo “image-box”
  // ================================================================
  // Este tipo cria um quadrado com borda tracejada, onde o utilizador pode
  // clicar para carregar uma imagem. Quando o ficheiro é escolhido, aparece
  // automaticamente a pré-visualização dentro do quadrado.
  // ================================================================
  if (type === "image-box") {
    return (
      <div className="mb-4" style={{ marginTop: "20px" }}>
        {/* Rótulo (label) acima do quadrado */}
        {label && (
          <label
            htmlFor={name}
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#333",
            }}
          >
            {label}
          </label>
        )}

        {/* 🔲 Quadrado interativo para upload da imagem */}
        <div
          onClick={() => document.getElementById(name).click()}
          style={{
            width: "100%",
            height: "180px",
            border: "2px dashed #ccc",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backgroundColor: "#f8f9fa",
            overflow: "hidden",
          }}
        >
          {/* Se já há imagem → mostra preview */}
          {value ? (
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
            // Caso contrário → mostra sinal "+"
            <span style={{ fontSize: "2rem", color: "#888" }}>＋</span>
          )}
        </div>

        {/* Input invisível (mas funcional) para receber o ficheiro */}
        <Form.Control
          id={name}
          type="file"
          accept="image/*"
          name={name}
          onChange={onChange}
          style={{ display: "none" }}
        />

        {/* Mensagem de erro, se existir */}
        {feedback && (
          <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
            {feedback}
          </Form.Control.Feedback>
        )}
      </div>
    );
  }

  // ================================================================
  // 🔹 Caso Normal: Inputs com Floating Label e Selects
  // ================================================================
  // Aqui o componente volta a ser o mesmo que tinhas antes.
  // Mantém compatibilidade total com formulários anteriores.
  // ================================================================
  return (
    <FloatingLabel controlId={controlId} label={label} className="mb-4">
      {/* Se for SELECT */}
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
        /* Caso contrário, é um input normal */
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

      {/* Feedback de erro (validação visual) */}
      {feedback && (
        <Form.Control.Feedback type="invalid">
          {feedback}
        </Form.Control.Feedback>
      )}
    </FloatingLabel>
  );
};

// ================================================================
// 🔹 Exporta o componente
// ================================================================
export default FormField;
