import apiClient from './client';

export const agentsService = {
    getAllAgents: async () => {
        return await apiClient.get('/admin/agents');
    },
    getUnassignedCustomers: async () => {
        return await apiClient.get('/admin/agents/unassigned-customers');
    },
    createAgent: async (agentData) => {
        return await apiClient.post('/admin/agents', agentData);
    },
    updateAgent: async (id, agentData) => {
        return await apiClient.put(`/admin/agents/${id}`, agentData);
    },
    assignCustomer: async (agentId, customerId) => {
        return await apiClient.post(`/admin/agents/${agentId}/assign`, { customerId });
    },
    deleteAgent: async (id) => {
        return await apiClient.delete(`/admin/agents/${id}`);
    }
};
