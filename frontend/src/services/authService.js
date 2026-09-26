import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { identifier: email, password })
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
}

export default authService

