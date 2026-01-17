import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

 export const useCustomerService = () => {
  const { user } = useContext(AuthContext); // ✅ só dentro do hook

 const listar = async () => {
  try {
 

    const res = await axios.get(`${api}/customer/list`, {
     headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
      });
    return res.data;
  } catch (err) {
     // 🔹 lança o erro para o frontend capturar
    throw err;
  }
};


const criar = async (data) => {
  try {

    // Constrói o DTO
    const supplierDto = {
      nome: data.nome,
      numeroContribuinte: data.contribuinte,
      email: data.email,
      contactoPrincipal: data.contactoprincipal,
      contactoSecudario: data.contactosecudario,
      location: data.localidade
        ? { id: data.localidade.id, nome: data.localidade.nome }
        : null,
    };

   
    const res = await axios.post(`${api}/customer/create`, supplierDto, {
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
       
      },
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};



 const editar = async (data) => {
  try {
    const payload =  {
      nome: data.nome,
      numeroContribuinte: data.contribuinte,
      email: data.email,
      contactoPrincipal: data.contactoprincipal,
      contactoSecudario: data.contactosecudario,
      id: data.id,
       location: data.localidade
        ? { id: data.localidade.id, nome: data.localidade.nome }
        : null,
     
      
    };
   
   const res = await axios.put(`${api}/customer/update`, payload, {
       headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
      });
    return res.data;
  } catch (err) {
    throw err;
  }
};

 
/* const deletar = async (data) => {


  try {
    const res = await axios.delete(`${api}/shop/delete`,{
       headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
        params: { id: data.id }, // 🔹 envia id como query param
      });
    return res.data;
  } catch (err) {
      // 🔹 lança o erro para o frontend capturar
    throw err;
  }
};*/
 return { listar, criar, editar /*, deletar */};
};