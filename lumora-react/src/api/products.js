import apiClient from './client';

export const productsApi = {
  getProducts: (params = {}) => apiClient.get('/products', { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  getProductBySlug: (slug) => apiClient.get(`/products/slug/${slug}`),
  getFeatured: () => apiClient.get('/products/featured'),
  getBestSellers: () => apiClient.get('/products/bestsellers'),
  getNewArrivals: () => apiClient.get('/products/new-arrivals'),
  getRelated: (id) => apiClient.get(`/products/${id}/related`),
  getCategories: () => apiClient.get('/categories'),
  getBrands: () => apiClient.get('/brands'),
  search: (q) => apiClient.get('/search', { params: { q } }),
};
