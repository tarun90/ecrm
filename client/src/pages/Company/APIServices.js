// services/companyService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/company`;

export const createCompany = async (companyData) => {
  try {
    const response = await axios.post(API_URL, companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCompanies = async (searchTerm = "", page = 1, pageSize = 10) => {
  try {
    console.log('Calling API with:', { searchTerm, page, pageSize });

    const response = await axios.get(`${API_URL}`, {
      params: {
        searchTerm,
        page,
        pageSize
      }
    });

    console.log('Raw API response:', response.data);

    // If response.data is an array, implement pagination manually
    if (Array.isArray(response.data)) {
      const allData = response.data;
      const totalItems = allData.length;

      // Calculate start and end indices for the current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);

      // Slice the array to get only the items for the current page
      const paginatedData = allData.slice(startIndex, endIndex);

      console.log('pagination details:', {
        page,
        pageSize,
        totalItems,
        startIndex,
        endIndex,
        itemsOnThisPage: paginatedData.length
      });

      return {
        data: paginatedData,
        total: totalItems,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalItems / pageSize)
      };
    }

    // If response has pagination structure from backend
    return {
      data: response.data.companies || response.data.data || [],
      total: response.data.total || 0,
      success: true,
      currentPage: response.data.currentPage || page,
      totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error in getCompanies:', error);
    console.error('Error response:', error.response);
    return {
      data: [],
      total: 0,
      success: false,
      message: error.response?.data?.message || 'Failed to fetch companies',
      currentPage: page,
      totalPages: 0
    };
  }
};


export const getCompaniesNames = async () => {
  try {
    const response = await axios.get(`${API_URL}/names`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



export const getCompanyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/view/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const Getcountry = async () => {
  try {
    const response = await axios.get("https://countriesnow.space/api/v0.1/countries/positions");
    return response?.data
  } catch (error) {
    console.log(error);
  };
};