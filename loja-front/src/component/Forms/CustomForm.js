import React, { useState } from "react"; // Importa React e o hook useState para gerenciar o estado do componente
import { Form, Button } from "react-bootstrap"; // Importa componentes do React Bootstrap para criar o formulário e botões

const CustomForm = ({
  fields = [], // Lista de campos do formulário, com valores padrão vazios
  onSubmit, // Função chamada ao enviar o formulário
  submitButtonText = "Enviar", // Texto do botão de envio, com valor padrão "Enviar"
  buttonVariant = "primary", // Estilo do botão de envio, com valor padrão "primary"
  validationMessage = "Por favor, preencha todos os campos obrigatórios", // Mensagem de validação padrão
  ...props // Outras propriedades que podem ser passadas ao componente
}) => {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || ""; // Inicializa cada campo com um valor padrão ou vazio
      return acc;
    }, {})
  );

  // Estado para controlar se o formulário é inválido (campos obrigatórios não preenchidos)
  const [isInvalid, setIsInvalid] = useState(false);

  // Função para atualizar o estado do formulário quando um campo é alterado
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value })); // Atualiza o valor do campo no estado
    setIsInvalid(false); // Remove o estado de erro ao alterar o campo
  };

  // Função chamada ao enviar o formulário
  const handleSubmit = (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    // Verifica se há campos obrigatórios não preenchidos
    const hasEmptyFields = fields.some(
      (field) => field.isRequired && !formData[field.name].trim()
    );

    // Se houver campos obrigatórios não preenchidos, define o estado como inválido e retorna
    if (hasEmptyFields) {
      setIsInvalid(true);
      return;
    }

    // Chama a função de onSubmit passada como prop, enviando os dados do formulário
    onSubmit && onSubmit(formData);
  };

  // Renderiza o formulário
  return (
    <Form onSubmit={handleSubmit} {...props}>
      {fields.map((field, index) => (
        <Form.Group className="mb-3" key={index}>
          {field.label && <Form.Label>{field.label}</Form.Label>} {/* Renderiza o label do campo, se existir */}
          <Form.Control
            as={field.type === "textarea" ? "textarea" : "input"} // Define o tipo de campo (textarea ou input)
            type={field.type !== "textarea" ? field.type : undefined} // Define o tipo de input (text, number, etc.)
            placeholder={field.placeholder || ""} // Define o placeholder do campo
            rows={field.rows || 3} // Define o número de linhas para textarea
            className={`border ${field.variant || "outline-primary"} ${
              field.shadow ? "shadow" : ""
            }`} // Define a classe CSS do campo
            value={formData[field.name]} // Define o valor do campo com base no estado
            onChange={(e) => handleChange(field.name, e.target.value)} // Atualiza o estado ao alterar o campo
            isInvalid={isInvalid && field.isRequired && !formData[field.name].trim()} // Define se o campo é inválido
          />
          <Form.Control.Feedback type="invalid">
            {field.validationMessage || validationMessage} {/* Exibe a mensagem de validação */}
          </Form.Control.Feedback>
        </Form.Group>
      ))}
      <Button variant={buttonVariant} type="submit">
        {submitButtonText} {/* Renderiza o botão de envio com o texto definido */}
      </Button>
    </Form>
  );
};

export default CustomForm; // Exporta o componente CustomForm para ser usado em outros lugares