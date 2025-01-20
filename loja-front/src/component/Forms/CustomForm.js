import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const CustomForm = ({
  fields = [], // Lista de campos do formulário
  onSubmit, // Função chamada ao enviar o formulário
  submitButtonText = "Enviar", // Texto do botão de envio
  buttonVariant = "primary", // Estilo do botão de envio
  validationMessage = "Por favor, preencha todos os campos obrigatórios",
  ...props
}) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || "";
      return acc;
    }, {})
  );
  const [isInvalid, setIsInvalid] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsInvalid(false); // Remove o estado de erro ao alterar
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasEmptyFields = fields.some(
      (field) => field.isRequired && !formData[field.name].trim()
    );

    if (hasEmptyFields) {
      setIsInvalid(true);
      return;
    }

    onSubmit && onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit} {...props}>
      {fields.map((field, index) => (
        <Form.Group className="mb-3" key={index}>
          {field.label && <Form.Label>{field.label}</Form.Label>}
          <Form.Control
            as={field.type === "textarea" ? "textarea" : "input"}
            type={field.type !== "textarea" ? field.type : undefined}
            placeholder={field.placeholder || ""}
            rows={field.rows || 3}
            className={`border ${field.variant || "outline-primary"} ${
              field.shadow ? "shadow" : ""
            }`}
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            isInvalid={isInvalid && field.isRequired && !formData[field.name].trim()}
          />
          <Form.Control.Feedback type="invalid">
            {field.validationMessage || validationMessage}
          </Form.Control.Feedback>
        </Form.Group>
      ))}
      <Button variant={buttonVariant} type="submit">
        {submitButtonText}
      </Button>
    </Form>
  );
};

export default CustomForm;
