import apiClient from './client';

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  addItem: (productId) => apiClient.post(`/wishlist/${productId}`),
  removeItem: (productId) => apiClient.delete(`/wishlist/${productId}`),
};
