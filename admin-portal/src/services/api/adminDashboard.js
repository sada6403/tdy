import apiClient from './client';

export const dashboardService = {
    getMetrics: async () => {
        return await apiClient.get('/admin/dashboard');
    },
    getAnalytics: async () => {
        return await apiClient.get('/admin/analytics');
    }
};
