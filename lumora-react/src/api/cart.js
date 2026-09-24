import apiClient from './client';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data) => apiClient.post('/cart/items', data),
  updateQuantity: (id, quantity) => apiClient.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id) => apiClient.delete(`/cart/items/${id}`),
  clearCart: () => apiClient.delete('/cart'),
};
