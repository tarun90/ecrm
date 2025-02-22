import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/dashboard`;

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
