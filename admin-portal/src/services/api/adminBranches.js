import apiClient from './client';

export const branchesService = {
    getAllBranches: async () => {
        return await apiClient.get('/admin/branches');
    },
    createBranch: async (branchData) => {
        return await apiClient.post('/admin/branches', branchData);
    },
    deleteBranch: async (id) => {
        return await apiClient.delete(`/admin/branches/${id}`);
    }
};
