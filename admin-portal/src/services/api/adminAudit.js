import apiClient from './client';

export const auditService = {
    getAuditLogs: async (filters) => {
        return await apiClient.get('/admin/audit-logs', { params: filters });
    }
};
