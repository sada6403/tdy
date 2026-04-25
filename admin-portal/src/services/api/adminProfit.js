import apiClient from './client';

export const profitService = {
    runMonthlyPayouts: async () => {
        return await apiClient.post('/admin/run-monthly-payouts');
    },
    getPayoutSchedules: async (status) => {
        const query = status ? `?status=${status}` : '';
        return await apiClient.get(`/admin/payout-schedules${query}`);
    },
    getPayoutStats: async () => {
        return await apiClient.get('/admin/payout-stats');
    },
    getPayoutDetail: async (id) => {
        return await apiClient.get(`/admin/payout-logs/${id}`);
    }
};
