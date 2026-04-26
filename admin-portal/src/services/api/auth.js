import apiClient from './client';

export const authService = {
    login: async (credentials) => {
        return await apiClient.post('/auth/login', { ...credentials, requiredRole: 'ADMIN' });
    },
    logout: async () => {
        return await apiClient.post('/auth/logout');
    },
    getMe: async () => {
        return await apiClient.get('/auth/me');
    },
    sendAdminChangeOtp: async () => {
        return await apiClient.post('/auth/admin/send-change-otp');
    },
    adminChangePasswordWithOtp: async ({ otp, newPassword }) => {
        return await apiClient.post('/auth/admin/change-password-otp', { otp, newPassword });
    }
};
