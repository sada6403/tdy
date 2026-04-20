import apiClient from './client';

export const getSettings = () => {
    return apiClient.get('/admin/website-settings');
};

export const updateSettings = (data) => {
    return apiClient.put('/admin/website-settings', data);
};
