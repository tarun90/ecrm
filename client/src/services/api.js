import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api`;

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

  getAllContacts: async (search = '') => {
    try {
      const response = await axios.get(`${API_URL}/contacts`, {
        params: { search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  exportContacts: async () => {
    try {
      const response = await axios.get(`${API_URL}/contacts/export`, {
        responseType: 'blob'
      });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      throw error;
    }
  },

  importContacts: async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/contacts/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error importing contacts:', error);
        throw error;
    }
},

  createContact: async (contactData) => {
    let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {}
    let contsData = {
      ...contactData,
      contactOwner: userData?.id
    }
    const response = await axios.post(`${API_URL}/contacts`, contsData);
    return response.data;
  },

  updateContact: async (contactId, contactData) => {
    const response = await axios.put(`${API_URL}/contacts/${contactId}`, contactData);
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