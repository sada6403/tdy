import apiClient from './client';

export const branchesService = {
    getAllBranches: async () => {
        return await apiClient.get('/admin/branches');
    },
    getStats: async () => {
        return await apiClient.get('/admin/branch-stats');
    },
    createBranch: async (branchData) => {
        if (branchData instanceof FormData) {
            return await apiClient.post('/admin/branches', branchData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return await apiClient.post('/admin/branches', branchData);
    },
    updateBranch: async (id, branchData) => {
        if (branchData instanceof FormData) {
            return await apiClient.put(`/admin/branches/${id}`, branchData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return await apiClient.put(`/admin/branches/${id}`, branchData);
    },
    deleteBranch: async (id) => {
        return await apiClient.delete(`/admin/branches/${id}`);
    }
};
