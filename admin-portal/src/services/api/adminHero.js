import client from './client';

export const adminHeroService = {
  getHeroSlides: () => client.get('/admin/hero-slides'),
  createHeroSlide: (data) => client.post('/admin/hero-slides', data),
  updateHeroSlide: (id, data) => client.put(`/admin/hero-slides/${id}`, data),
  deleteHeroSlide: (id) => client.delete(`/admin/hero-slides/${id}`),
  uploadImage: (formData) => client.post('/admin/hero-slides/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
