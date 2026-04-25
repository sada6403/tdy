import apiClient from './client';

export const supportService = {
    getRequests: (params = {}) =>
        apiClient.get('/admin/support-requests', { params }),

    updateStatus: (id, data) =>
        apiClient.patch(`/admin/support-requests/${id}/status`, data),

    markRead: (id) =>
        apiClient.patch(`/admin/support-requests/${id}/read`),
};

export const adminNotifService = {
    getAll: (limit = 20) =>
        apiClient.get('/admin/admin-notifications', { params: { limit } }),

    markRead: (id) =>
        apiClient.patch(`/admin/admin-notifications/${id}/read`),

    markAllRead: () =>
        apiClient.patch('/admin/admin-notifications/mark-all-read'),
};
