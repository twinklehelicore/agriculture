import api from './axios';

export const getNotifications = (role: string) =>
  api.get(`/${role.toLowerCase()}/my-notifications`);

export const getUnreadCount = (role: string) =>
  api.get(`/${role.toLowerCase()}/unread-count`);

export const markAllRead = (role: string) =>
  api.patch(`/${role.toLowerCase()}/mark-all-read`);

export const markOneRead = (role: string, id: number) =>
  api.patch(`/${role.toLowerCase()}/mark-read/${id}`);