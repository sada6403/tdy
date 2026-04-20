import apiClient from './client';

export const withdrawalsService = {
    getWithdrawalRequests: async () => {
        return await apiClient.get('/admin/withdrawals');
    },
    getWithdrawalDetails: async (id) => {
        return await apiClient.get(`/admin/withdrawals/${id}/details`);
    },
    approveWithdrawal: async (id) => {
        return await apiClient.post(`/admin/withdrawals/${id}/approve`);
    },
    rejectWithdrawal: async (id, reason) => {
        return await apiClient.post(`/admin/withdrawals/${id}/reject`, { reason });
    },
    completeWithdrawal: async (id, bankReference) => {
        return await apiClient.post(`/admin/withdrawals/${id}/complete`, { bankReference });
    },
    failWithdrawal: async (id, reason) => {
        return await apiClient.post(`/admin/withdrawals/${id}/fail`, { reason });
    },
    getPayoutList: async () => {
        return await apiClient.get('/admin/payout-list');
    },
    getPayoutHistory: async () => {
        return await apiClient.get('/admin/payout-list?status=COMPLETED');
    }
};
