import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

 export const useLocationService = () => {
  const { user } = useContext(AuthContext); // ✅ só dentro do hook

 const listar = async () => {
  try {
 

    const res = await axios.get(`${api}/location/list`, {
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
      sigla: data.sigla,
      district: data.distrito
        ? { id: data.distrito.id, nome: data.distrito.nome }
        : null,
    };

    // Faz a chamada POST apenas uma vez, com o payload correto
    const res = await axios.post(`${api}/location/create`, payload, {
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
      sigla: data.sigla,
      id: data.id,
      district: data.distrito
        ? { id: data.distrito.id, nome: data.distrito.nome }
        : null,
    };
   const res = await axios.put(`${api}/location/update`, payload, {
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

 const listarDistrito = async () => {


  try {
    const res = await axios.get(`${api}/distritos/listar`,{
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

 const deletar = async (data) => {


  try {
    const res = await axios.delete(`${api}/location/delete`,{
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
};
 return { listar, criar, editar, listarDistrito, deletar };
};