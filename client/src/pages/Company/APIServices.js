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
    const response = await axios.get(API_URL, {
      params: {
        ...(searchTerm ? { searchTerm } : {}),
        page,
        pageSize
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
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