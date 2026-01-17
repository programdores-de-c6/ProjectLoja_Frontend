// src/component/Common/WizardFormWrapper.js
import React, { useState } from "react";
import { Button, ProgressBar, Card } from "react-bootstrap";

// 🔹 Wrapper de formulário com etapas
const WizardFormWrapper = ({ steps, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0); // etapa atual
  const totalSteps = steps.length;

  // 🔹 Vai para a próxima etapa
  const nextStep = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  // 🔹 Vai para a etapa anterior
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // 🔹 Ao clicar em Concluir
  const handleFinish = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(); // chama função de envio
  };

  return (
    <Card className="shadow-sm border-0 rounded-3">
      {/* 🔹 Cabeçalho com título da etapa */}
      <Card.Header className="bg-light">
        <strong>{steps[currentStep].title}</strong>
      </Card.Header>

      <Card.Body>
        {/* 🔹 Barra de progresso */}
        <ProgressBar
          now={((currentStep + 1) / totalSteps) * 100}
          label={`${currentStep + 1} / ${totalSteps}`}
          className="mb-3"
        />

        {/* 🔹 Conteúdo da etapa */}
        <form onSubmit={handleFinish}>
          {steps[currentStep].content}

          {/* 🔹 Botões de navegação */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="secondary"
              disabled={currentStep === 0}
              onClick={prevStep}
            >
              Anterior
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button variant="primary" onClick={nextStep}>
                Próximo
              </Button>
            ) : (
              <Button type="submit" variant="success">
                Concluir
              </Button>
            )}
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default WizardFormWrapper;
