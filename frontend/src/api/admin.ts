import api from './axios';

// Services
export const getServices = () => api.get('/admin/list-service');
export const createService = (data: object) => api.post('/admin/add-service', data);
export const updateService = (id: number, data: object) => api.patch(`/admin/update-service/${id}`, data);
export const deleteService = (id: number) => api.delete(`/admin/delete-service/${id}`);

// Users
export const getUsers = () => api.get('/admin/list-users');
export const getFarmers = () => api.get('/admin/list-farmers');
export const getProviders = () => api.get('/admin/list-providers');
export const addUser = (data: object) => api.post('/admin/add-user', data);
export const updateUser = (id: number, data: object) => api.patch(`/admin/update-user/${id}`, data);
export const deleteUser = (id: number) => api.patch(`/admin/delete-user/${id}`);

// Service Requests
export const getAllRequests = () => api.get('/admin/list-all-service-request');
export const assignProvider = (id: number, providerId: number) =>
  api.patch(`/admin/assign-provider/${id}`, { providerId });
export const rejectRequest = (id: number) => api.patch(`/admin/reject-request/${id}`);

// Crops
export const getCrops = () => api.get('/admin/list-crop');
export const createCrop = (data: object) => api.post('/admin/create-crop', data);
export const updateCrop = (id: number, data: object) => api.patch(`/admin/update-crop/${id}`, data);
export const deleteCrop = (id: number) => api.delete(`/admin/delete-crop/${id}`);