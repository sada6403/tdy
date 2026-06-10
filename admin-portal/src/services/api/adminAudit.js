import apiClient from './client';

export const auditService = {
    getAuditLogs: async (filters) => {
        return await apiClient.get('/admin/activity-log', { params: filters });
    }
};
