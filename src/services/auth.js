import api from './api.js'

const normalizeRole = (role) => (role === 'admin' ? 'Admin' : 'Member')

const buildUser = (user) => {
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  return {
    _id: user._id || user.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: user.email,
    role: normalizeRole(user.role),
  }
}

const normalizeAuthResponse = (data) => ({
  token: data.token,
  user: buildUser(data.user),
})

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return normalizeAuthResponse(response.data)
}

export async function signup(name, email, password) {
  const trimmed = name.trim()
  const space = trimmed.indexOf(' ')
  const firstName = space === -1 ? trimmed : trimmed.slice(0, space)
  const lastName = space === -1 ? '' : trimmed.slice(space + 1).trim()
  const response = await api.post('/auth/signup', {
    firstName,
    lastName,
    email,
    password,
  })
  return normalizeAuthResponse(response.data)
}

export async function getProfile() {
  const response = await api.get('/auth/profile')
  return normalizeAuthResponse(response.data)
}
