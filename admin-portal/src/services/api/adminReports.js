import apiClient from './client';

export const reportsService = {
    // Generate reports, currently might just use analytics or specific endpoints
    generateReport: async (type, filters) => {
        return await apiClient.get('/admin/reports', { params: { type, ...filters } });
    }
};
