export function getApiErrorMessage(error) {
  const status = error.response?.status
  const data = error.response?.data
  const serverMessage =
    typeof data === 'string'
      ? data
      : data?.message || data?.error || data?.msg

  if (status === 404) {
    return (
      serverMessage ||
      'API route not found (404). The frontend may be calling the wrong host — check VITE_API_URL or API_TARGET.'
    )
  }
  if (status === 400) {
    return serverMessage || 'Invalid request. Check the fields you submitted.'
  }
  if (status === 401) {
    return serverMessage || 'Invalid email or password.'
  }
  if (status === 409) {
    return serverMessage || 'That email is already registered.'
  }
  if (status >= 500) {
    return serverMessage || 'Server error. Try again later.'
  }
  if (error.request && !error.response) {
    return 'No response from the API. Check network, CORS, and that the backend is running.'
  }
  return serverMessage || 'Something went wrong. Try again.'
}
