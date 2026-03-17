import api from './axios';

export const getAssignedRequests = () => api.get('/provider/assigned-request');
export const approveRequest = (id: number) => api.patch(`/provider/approved-request/${id}`);
export const startProgress = (id: number) => api.patch(`/provider/inprogess-request/${id}`);
export const completeRequest = (id: number) => api.patch(`/provider/completed-request/${id}`);
export const rejectRequest = (id: number) => api.patch(`/provider/reject-request/${id}`);

//profile
export const getProfile = () => api.get('/provider/profile');
export const updateProfile = (data: object) => api.patch('/provider/update-profile', data);

//log
export const addLog = (id: number, note: string) =>
  api.post(`/provider/add-log/${id}`, { note });