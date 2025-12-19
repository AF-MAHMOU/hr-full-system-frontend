import axios from 'axios';
import { Document } from './document';

export const getDocuments = async (): Promise<Document[]> => {
  const res = await axios.get('/api/documents');
  return res.data;
};