import apiClient from './client';

export const agentsService = {
    getAllAgents: async () => {
        return await apiClient.get('/admin/agents');
    },
    createAgent: async (agentData) => {
        return await apiClient.post('/admin/agents', agentData);
    },
    deleteAgent: async (id) => {
        return await apiClient.delete(`/admin/agents/${id}`);
    }
};
