import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dealService = {
  getAllDeals: async (search = '') => {
    const response = await axios.get(`${API_URL}/deals${search ? `?search=${search}` : ''}`);
    return response.data;
  },

  createDeal: async (dealData) => {
    const response = await axios.post(`${API_URL}/deals`, dealData);
    return response.data;
  },

  updateDeal: async (dealId, dealData) => {
    const response = await axios.patch(`${API_URL}/deals/${dealId}`, dealData);
    return response.data;
  },

  updateDealStage: async (dealId, stage) => {
    const response = await axios.patch(`${API_URL}/deals/${dealId}`, { stage });
    return response.data;
  },

  deleteDeal: async (dealId) => {
    const response = await axios.delete(`${API_URL}/deals/${dealId}`);
    return response.data;
  },

  importDeals: async (formData) => {
    const response = await axios.post(`${API_URL}/deals/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const contactService = {
  getAllContacts: async () => {
    const response = await axios.get(`${API_URL}/contacts`);
    return response.data;
  },

  createContact: async (contactData) => {
    const response = await axios.post(`${API_URL}/contacts`, contactData);
    return response.data;
  },

  updateContact: async (contactId, contactData) => {
    const response = await axios.patch(`${API_URL}/contacts/${contactId}`, contactData);
    return response.data;
  },

  deleteContact: async (contactId) => {
    const response = await axios.delete(`${API_URL}/contacts/${contactId}`);
    return response.data;
  },

  importContacts: async (formData) => {
    const response = await axios.post(`${API_URL}/contacts/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};