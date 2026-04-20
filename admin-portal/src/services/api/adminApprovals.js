import apiClient from './client';

export const approvalsService = {
    getPendingApprovals: async () => {
        return await apiClient.get('/admin/approvals');
    },
    getPendingApprovalsFlat: async () => {
        return await apiClient.get('/admin/approvals-flat');
    },
    getApprovalDetails: async (id) => {
        return await apiClient.get(`/admin/approvals/${id}/details`);
    },
    approveRequest: async (id) => {
        return await apiClient.post(`/admin/approvals/${id}/approve`);
    },
    rejectRequest: async (id, reason) => {
        return await apiClient.post(`/admin/approvals/${id}/reject`, { reason });
    },
    resendApplication: async (id, issues) => {
        return await apiClient.post(`/admin/approvals/${id}/resend`, { issues });
    },
    getApprovalHistory: async () => {
        return await apiClient.get('/admin/approvals/history');
    }
};
