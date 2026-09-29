import api from './api'

export const saleService = {
  getAll: async (params = {}) => {
    const response = await api.get('/sales/', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },

  create: async (saleData) => {
    const response = await api.post('/sales/', saleData)
    return response.data
  },

  cancel: async (id) => {
    const response = await api.post(`/sales/${id}/cancel`)
    return response.data
  },

  deletePermanent: async (id) => {
    const response = await api.delete(`/sales/${id}/permanent`)
    return response.data
  },

  clearHistory: async (dateStr = null) => {
    const url = dateStr ? `/sales/history/clear?date_str=${encodeURIComponent(dateStr)}` : '/sales/history/clear'
    const response = await api.delete(url)
    return response.data
  },
}

export default saleService
