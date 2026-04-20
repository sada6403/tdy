import apiClient from './client';

export const depositsService = {
    getDepositRequests: async () => {
        return await apiClient.get('/admin/deposits');
    },
    approveDeposit: async (id) => {
        return await apiClient.post(`/admin/deposits/${id}/approve`);
    },
    rejectDeposit: async (id, reason) => {
        return await apiClient.post(`/admin/deposits/${id}/reject`, { reason });
    },
    markAsReview: async (id) => {
        return await apiClient.post(`/admin/deposits/${id}/review`);
    }
};
