import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const currentHost = window.location.hostname;
export const API_BASE_URL = `http://${currentHost}:8080/api/sales-system`;
export const API_TIMEOUT = 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, 
});

let isRefreshing = false;
interface QueueItem {
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    const idl = localStorage.getItem('idl');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ ALTERAÇÃO: Verifica se o pedido deve ignorar o contexto de loja (Visão Global para o Gerente)
    const skipStoreContext = config.headers['X-Context-Control'] === 'global';

    if (idl && idl !== "0" && !skipStoreContext) {
      config.headers['X-Store-ID'] = idl;
    }

    // Removemos o cabeçalho interno antes do pedido ser enviado ao servidor
    delete config.headers['X-Context-Control'];

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/employee/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/employee/refresh-token`, {}, { withCredentials: true });
        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        processQueue(null, accessToken);
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        window.dispatchEvent(new Event('auth-expired')); 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;