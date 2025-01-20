// components/FormField.js
import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

const FormField = ({ controlId, label, type, name, placeholder, value, onChange, onBlur, isInvalid, feedback }) => (
  <FloatingLabel controlId={controlId} className="mb-4" label={label}>
    <Form.Control
      className="input_left_color shadow-sm"
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isInvalid={isInvalid}
    />
    <Form.Control.Feedback type="invalid">{feedback}</Form.Control.Feedback>
  </FloatingLabel>
);

export default FormField;

