// userService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/users`;

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};