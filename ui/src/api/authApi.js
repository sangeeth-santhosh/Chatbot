import { apiClient } from './client.js';

export async function registerRequest(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function currentUserRequest() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
