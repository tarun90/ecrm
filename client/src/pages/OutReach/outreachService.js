// outreachService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/outreach`;
export const getOutreach = async (searchString = '') => {
  try {
    const response = await axios.get(`${API_URL}?search=${encodeURIComponent(searchString)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getOutreachDataById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/outreacbyid/${id}`);
    console.log(response,'response');
    
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createOutreach = async (outreachData) => {
  try {
    const response = await axios.post(API_URL, outreachData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOutreach = async (id, outreachData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, outreachData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOutreach = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const importCSV = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignOutreach = async (outreachIds, userId) => {
  try {
    const response = await axios.post(`${API_URL}/assign`, {
      outreachIds,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignOutreachBySourceFile = async (sourceFile, userId) => {
  try {
    const response = await axios.post(`${API_URL}/assign`, {
      sourceFile,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSourceFiles = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/source-files`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnalyticsData = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics-data`);
    return response.data;
  } catch (error) {
    throw error;
  }
};