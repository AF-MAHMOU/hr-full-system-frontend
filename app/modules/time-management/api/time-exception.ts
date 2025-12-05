// frontend/api/timeException.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getAllTimeExceptions = async (token: string) => {
  const { data } = await axios.get(`${API_URL}/attendance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getTimeException = async (id: string, token: string) => {
  const { data } = await axios.get(`${API_URL}/attendance/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createTimeException = async (payload: any, token: string) => {
  const { data } = await axios.post(`${API_URL}/attendance`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateTimeException = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${API_URL}/attendance/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteTimeException = async (id: string, token: string) => {
  const { data } = await axios.delete(`${API_URL}/attendance/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
