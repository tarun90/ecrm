// regionService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/regions`; 

export const getRegions = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createRegion = async (regionData) => {
    try {
        const response = await axios.post(API_URL, regionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};