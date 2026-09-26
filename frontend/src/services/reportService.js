import api from './api'

export const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard')
    return response.data
  },

  getSalesReport: async (params = {}) => {
    const response = await api.get('/reports/sales', { params })
    return response.data
  },

  getTopProducts: async (limit = 10) => {
    const response = await api.get('/reports/products', { params: { limit } })
    return response.data
  },

  getStockReport: async () => {
    const response = await api.get('/reports/stock')
    return response.data
  },
}

export default reportService
