import axios from 'axios';
import { readAuth } from '../utils/storage.js';

const productionApiUrl = 'https://chatbot-api-sangeeth-santhosh.onrender.com/api';
const developmentApiUrl = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? productionApiUrl : developmentApiUrl),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const { token } = readAuth();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
