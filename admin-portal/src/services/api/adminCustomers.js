import apiClient from './client';

export const adminCustomersService = {
    getList: async (params) => {
        return await apiClient.get('/admin/customers', { params });
    },
    getSummary: async () => {
        return await apiClient.get('/admin/customers/summary');
    },
    getProfile: async (id) => {
        return await apiClient.get(`/admin/customers/${id}`);
    },
    getWallet: async (id) => {
        return await apiClient.get(`/admin/customers/${id}/wallet`);
    },
    getInvestments: async (id) => {
        return await apiClient.get(`/admin/customers/${id}/investments`);
    },
    getTransactions: async (id) => {
        return await apiClient.get(`/admin/customers/${id}/transactions`);
    },
    getActivity: async (id) => {
        return await apiClient.get(`/admin/customers/${id}/activity`);
    },
    getFinancialSummary: async (id) => {
        return await apiClient.get(`/admin/customers/${id}/financial-summary`);
    },
    getDownloadUrl: (id, category) => {
        return `/api/admin/customers/${id}/download/${category}`;
    },
    getReport: async (id, category) => {
        return await apiClient.get(`/admin/customers/${id}/report/${category}`);
    },
    getReportPdfUrl: (id, category) => {
        return `${apiClient.defaults.baseURL}/admin/customers/${id}/report/${category}?format=pdf`;
    }
};
