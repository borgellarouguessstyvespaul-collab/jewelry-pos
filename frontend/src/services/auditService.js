import api from './api'

export const auditService = {
  getAll: async (params = {}) => {
    const response = await api.get('/audit/', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/audit/${id}`)
    return response.data
  },
}

export default auditService
