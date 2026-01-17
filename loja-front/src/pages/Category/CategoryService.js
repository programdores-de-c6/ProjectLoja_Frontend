import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

 export const useCategoryService = () => {
  const { user } = useContext(AuthContext); // ✅ só dentro do hook

 const listar = async () => {
  try {
 

    const res = await axios.get(`${api}/category/list`, {
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
    // Monta o objeto no formato esperado pelo backend
    const payload = {
      nome: data.nome,
      
    };

    // Faz a chamada POST apenas uma vez, com o payload correto
    const res = await axios.post(`${api}/category/create`, payload, {
       headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
      });

    // Retorna a resposta do backend (objeto criado)
    return res.data;

  } catch (err) {
    throw err;
  }
};

 const editar = async (data) => {
  try {
    const payload =  {
      nome: data.nome,
      
      id: data.id,
    };
   const res = await axios.put(`${api}/category/update`, payload, {
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

 

 return { listar, criar, editar };
};