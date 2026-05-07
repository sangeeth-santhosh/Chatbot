import axios from 'axios';
import { readAuth } from '../utils/storage.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
