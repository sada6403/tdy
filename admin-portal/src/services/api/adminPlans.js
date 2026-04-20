import apiClient from './client';

export const plansService = {
    // Admin Module Endpoints
    getAllPlans: async () => {
        return await apiClient.get('/admin/plans');
    },
    getPlanById: async (id) => {
        return await apiClient.get(`/admin/plans/${id}`);
    },
    createPlan: async (planData) => {
        return await apiClient.post('/admin/plans', planData);
    },
    updatePlan: async (id, planData) => {
        return await apiClient.put(`/admin/plans/${id}`, planData);
    },
    patchStatus: async (id, status) => {
        return await apiClient.patch(`/admin/plans/${id}/status`, { status });
    },
    patchVisibility: async (id, customerVisible) => {
        return await apiClient.patch(`/admin/plans/${id}/visibility`, { customerVisible });
    },
    deletePlan: async (id) => {
        return await apiClient.delete(`/admin/plans/${id}`);
    },
    
    // Investment interactions
    getAllInvestments: async () => {
        return await apiClient.get('/admin/investments');
    },
    getInvestmentDetails: async (id) => {
        return await apiClient.get(`/admin/investments/${id}/details`);
    },
    approveInvestment: async (id) => {
        return await apiClient.post(`/admin/investments/${id}/approve`);
    },
    rejectInvestment: async (id, reason) => {
        return await apiClient.post(`/admin/investments/${id}/reject`, { reason });
    }
};
