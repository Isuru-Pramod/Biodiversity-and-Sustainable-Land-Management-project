
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
});

export const getHealth = async () => {
    const response = await API.get('/health');
    return response.data;
};

export const getTeaFarmerSchema = async () => {
    const response = await API.get('/tea-farmers/schema');
    return response.data.data;
};

export const getTeaFarmers = async () => {
    const response = await API.get('/tea-farmers');
    return response.data;
};

export const getTeaFarmersForDatabase = async () => {
    const response = await API.get('/tea-farmers/database');
    return response.data;
};

export const getTeaFarmersForMap = async () => {
    const response = await API.get('/tea-farmers/map');
    return response.data;
};

export const getTeaFarmerById = async (id) => {
    const response = await API.get(`/tea-farmers/${encodeURIComponent(id)}`);
    return response.data;
};

export const createTeaFarmer = async (record) => {
    const response = await API.post('/tea-farmers', record);
    return response.data;
};

export const getTeaFarmerExport = async () => {
    const response = await API.get('/tea-farmers/export', { responseType: 'blob' });
    const disposition = response.headers['content-disposition'] || '';
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1]
        || `TeaGrow_database_${new Date().toISOString().slice(0, 10)}.csv`;
    return { blob: response.data, filename };
};
