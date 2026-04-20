import apiClient from './client';

export const getAllEvents = () => {
    return apiClient.get('/admin/events');
};

export const createEvent = (data) => {
    return apiClient.post('/admin/events', data);
};

export const updateEvent = (id, data) => {
    return apiClient.put(`/admin/events/${id}`, data);
};

export const deleteEvent = (id) => {
    return apiClient.delete(`/admin/events/${id}`);
};
