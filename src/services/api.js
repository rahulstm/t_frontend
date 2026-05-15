import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_manager_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('No response from server. Is the backend running?', error.request)
    } else {
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  },
)

export default api
