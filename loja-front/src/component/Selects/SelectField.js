// components/SelectField.js
import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

const SelectField = ({ controlId, label, name, value, onChange, options, isInvalid, feedback }) => (
  <FloatingLabel controlId={controlId} className="mb-4" label={label}>
    <Form.Select
      className="input_left_color shadow-sm"
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
    >
      <option value="">Escolha uma opção</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.nome} - {option.sigla}
        </option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">{feedback}</Form.Control.Feedback>
  </FloatingLabel>
);

export default SelectField;
