import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames"; // Biblioteca para gerenciar classes dinamicamente
import { Link } from "react-router-dom"; // Caso o botão também precise redirecionar

export const ButtonS = ({
  variant = "primary", // Valor padrão
  size,
  texto = "Clique aqui", // Valor padrão para texto
  icone,
  className,
  loadIf = false,
  type = "button",
  loadingText = "Processando...", // Personalização do texto de loading
  to, // Caminho para redirecionamento (opcional)
  onClick, // Callback para cliques
  disabled, // Desabilitar botão manualmente
}) => {
  const isLink = Boolean(to); // Verifica se o botão deve ser um link

  const buttonContent = loadIf ? (
    <>
      {loadingText}
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
        className="ml-2"
      />
    </>
  ) : (
    <>
      {texto}
      {icone && <FontAwesomeIcon icon={icone} className="ml-2" />}
    </>
  );

  const buttonClasses = classNames(className, {
    "loading-state": loadIf, // Classe adicional quando está carregando
  });

  if (isLink) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        role="button"
        onClick={onClick}
        aria-busy={loadIf}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <Button
      size={size}
      className={buttonClasses}
      variant={variant}
      type={type}
      disabled={loadIf || disabled}
      onClick={onClick}
      aria-busy={loadIf}
    >
      {buttonContent}
    </Button>
  );
};
