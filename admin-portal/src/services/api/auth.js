import apiClient from './client';

export const authService = {
    login: async (credentials) => {
        // We pass { user_id, password }
        return await apiClient.post('/auth/login', { ...credentials, requiredRole: 'ADMIN' });
    },
    logout: async () => {
        return await apiClient.post('/auth/logout');
    },
    getMe: async () => {
        return await apiClient.get('/auth/me');
    }
};
