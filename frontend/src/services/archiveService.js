import api from './api'

export const archiveService = {
  getAll: async () => {
    const response = await api.get('/archives')
    return response.data
  },

  generate: async (params = {}) => {
    const response = await api.post('/archives/generate', params)
    return response.data
  },

  clearAll: async () => {
    const response = await api.delete('/archives/clear')
    return response.data
  },
}

export default archiveService
