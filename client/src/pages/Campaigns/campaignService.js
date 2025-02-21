import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/campaign`;
const CATEGORY_API_URL = `${import.meta.env.VITE_TM_API_URL}/api/categories?search=`;

export const getCategories = async (searchTerm = "") => {
  try {
    const response = await axios.get(CATEGORY_API_URL, {
      params: searchTerm ? { searchTerm } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(API_URL, campaignData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCampaigns = async (searchTerm = "") => {
  try {
    const response = await axios.get(API_URL, {
      params: searchTerm ? { searchTerm } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCampaignsNames = async () => {
  try {
    const response = await axios.get(`${API_URL}/names`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCampaignById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCampaign = async (id, campaignData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, campaignData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCampaign = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
