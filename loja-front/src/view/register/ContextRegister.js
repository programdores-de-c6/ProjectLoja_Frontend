// Importação dos modulos
import React, { useState,  createContext } from 'react';
import './index.css';

import Register from './RegisterAdmin.js';
import CadastroData from './RegisterAdminStepOne.js';

//Criação de Contexto para Armazenar os dados do utilizador na navegação das telas
export const UserDataContext = createContext();

function ContextRegister({ access  = 0 }) {
  const [dataUser, setDataUser] = useState({});
  const [step, setStep] = useState(1);
//Declaração dos States


  return (
    
    
        
        <>


          <UserDataContext.Provider value={{ dataUser, setDataUser, access }}>
    
           {step===1 && <Register setStep={setStep} />}
           {step===2 && <CadastroData setStep={setStep} />}
           
          </UserDataContext.Provider>
        </>
    
   
  )
}

export default ContextRegister;