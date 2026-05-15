import axios from 'axios'
import { getApiErrorMessage } from './apiErrors.js'

function resolveBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return '/api'
}

const api = axios.create({
  baseURL: resolveBaseURL(),
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
      console.error(
        'API error:',
        error.config?.method?.toUpperCase(),
        error.config?.baseURL,
        error.config?.url,
        '→',
        error.response.status,
        error.response.data,
      )
    } else if (error.request) {
      console.error('No response from server. Check VITE_API_URL / API_TARGET and CORS.', error.request)
    } else {
      console.error('Request error:', error.message)
    }
    error.userMessage = getApiErrorMessage(error)
    return Promise.reject(error)
  },
)

export default api
