import React, { useState } from "react";
import { Form } from "react-bootstrap";

const CustomTextArea = ({
  label,
  placeholder = "Digite aqui...",
  rows = 3,
  variant = "outline-primary",
  shadow = false,
  isRequired = false,
  validationMessage = "Este campo é obrigatório",
  onChange,
  value = "",
  ...props
}) => {
  const [isInvalid, setIsInvalid] = useState(false);

  const handleBlur = () => {
    if (isRequired && !value.trim()) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  return (
    <Form.Group className="mb-3" {...props}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        as="textarea"
        rows={rows}
        placeholder={placeholder}
        className={`border ${variant} ${shadow ? "shadow" : ""}`}
        isInvalid={isInvalid}
        value={value}
        onChange={(e) => {
          onChange && onChange(e);
          setIsInvalid(false); // Remove o estado inválido ao digitar
        }}
        onBlur={handleBlur}
      />
      <Form.Control.Feedback type="invalid">
        {validationMessage}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default CustomTextArea;
