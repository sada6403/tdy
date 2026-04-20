import apiClient from './client';

export const notificationsService = {
    getAll: async () => {
        return await apiClient.get('/admin/notifications');
    },
    send: async ({ title, message, targetType, targetId }) => {
        return await apiClient.post('/admin/notifications', { title, message, targetType, targetId });
    }
};
