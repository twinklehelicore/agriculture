import api from './axios';

// Farms
export const getMyFarms = () => api.get('/farmer/list-farm');
export const getFarmById = (id: number) => api.get(`/farmer/list-farm-by-id/${id}`);
export const createFarm = (data: object) => api.post('/farmer/create-farm', data);
export const updateFarm = (id: number, data: object) => api.patch(`/farmer/update-farm/${id}`, data);
export const deleteFarm = (id: number) => api.delete(`/farmer/delete-farm/${id}`);

// Service Requests
export const getMyRequests = () => api.get('/farmer/my-service-request');
export const createRequest = (data: object) => api.post('/farmer/service-request', data);
export const deleteRequest = (id: number) => api.delete(`/farmer/delete-my-service-request/${id}`);

// Crops and Services (read only)
export const getCrops = () => api.get('/farmer/list-crop');
export const getServices = () => api.get('/farmer/list-services');

//profile
export const getProfile = () => api.get('/farmer/profile');
export const updateProfile = (data: object) => api.patch('/farmer/update-profile', data);

//category

export const getCategories = () => api.get('/farmer/list-categories');