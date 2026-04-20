import apiClient from './client';

export const expensesService = {
    getAll: async () => {
        return await apiClient.get('/admin/expenses');
    },
    getDistribution: async () => {
        return await apiClient.get('/admin/expenses/distribution');
    },
    create: async (expenseData) => {
        return await apiClient.post('/admin/expenses', expenseData);
    }
};
