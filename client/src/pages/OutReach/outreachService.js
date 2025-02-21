// outreachService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/outreach`;
export const getOutreach = async (
  searchString = '',
  page = 1,
  pageSize = 100,
  filters = {
    country: '',
    status: '',
    region: '',
    campaign: '',
    category: '',
    assignTo: ''
  }
) => {
  try {
    // Initialize URLSearchParams with pagination and search
    const params = new URLSearchParams({
      search: searchString,
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    // Add filter parameters if they have values
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        currentPage: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalPages: response.data.totalPages
      };
    } else {
      return {
        success: false,
        data: [],
        total: 0,
        currentPage: page,
        pageSize: pageSize,
        totalPages: 0,
        message: response.data.message || 'Failed to fetch outreach data'
      };
    }
  } catch (error) {
    console.error('Error in getOutreach:', error);
    return {
      success: false,
      data: [],
      total: 0,
      currentPage: page,
      pageSize: pageSize,
      totalPages: 0,
      message: error.message || 'Error fetching outreach data'
    };
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

export const getAnalyticsData = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/analytics-data`, {
      params: {
        search: search.trim()
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserCampaignData = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/user-campaign-data`, {
      params: {
        search: search.trim()
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};