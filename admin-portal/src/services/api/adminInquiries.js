import client from './client';

export const inquiriesService = {
    getAll: () => client.get('/admin/inquiries'),
    markRead: (id) => client.patch(`/admin/inquiries/${id}/read`),
};
