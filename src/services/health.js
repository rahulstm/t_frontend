import api from './api.js'
import { endpoints } from './endpoints.js'

export async function checkBackendHealth() {
  const response = await api.get(endpoints.health)
  return response.data
}
