import api from './api'

export const stockService = {
  getAll: async (params = {}) => {
    const response = await api.get('/stock/', { params })
    return response.data
  },

  getLowStock: async () => {
    const response = await api.get('/stock/low')
    return response.data
  },

  adjust: async (adjustmentData) => {
    const response = await api.post('/stock/adjust', adjustmentData)
    return response.data
  },

  getMovements: async (params = {}) => {
    const response = await api.get('/stock/movements', { params })
    return response.data
  },
}

export default stockService
