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

//notification
export const setPriority = (id: number, priority: string) =>
  api.patch(`/admin/set-priority/${id}`, { priority });
export const getAdminNotifications = () => api.get('/admin/my-notifications');
export const getAdminUnreadCount = () => api.get('/admin/unread-count');
export const markAdminAllRead = () => api.patch('/admin/mark-all-read');

//profile
export const getProfile = () => api.get('/admin/profile');
export const updateProfile = (data: object) => api.patch('/admin/update-profile', data);
export const changePassword = (data: object) => api.patch('/admin/change-password', data);

//logs
export const getTrackService = () => api.get('/admin/track-service');
export const getLogsByRequest = (id: number) => api.get(`/admin/track-service/${id}`);

//category
// Categories
export const getCategories = () => api.get('/admin/list-categories');
export const createCategory = (data: object) => api.post('/admin/create-category', data);
export const updateCategory = (id: number, data: object) => api.patch(`/admin/update-category/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/admin/delete-category/${id}`);