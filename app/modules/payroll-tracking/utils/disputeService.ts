import axios from 'axios';
import { Dispute } from './dispute';
export const getDisputeById = async (id: string): Promise<Dispute> => {
  const res = await axios.get(`/api/disputes/${id}`);
  return res.data;
};