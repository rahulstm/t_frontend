/**
 * Backend routes (base URL: https://taskbackend-oiuia.ondigitalocean.app).
 * Axios uses baseURL `/api`, so paths here are the segment after `/api`.
 */
export const endpoints = {
  health: '/health',

  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    profile: '/auth/profile',
  },

  projects: {
    list: '/projects',
    create: '/projects',
    detail: (projectId) => `/projects/${projectId}`,
    update: (projectId) => `/projects/${projectId}`,
    delete: (projectId) => `/projects/${projectId}`,
    members: (projectId) => `/projects/${projectId}/members`,
    member: (projectId, userId) => `/projects/${projectId}/members/${userId}`,
    statsOverview: '/projects/stats/overview',
    tasks: (projectId) => `/projects/${projectId}/tasks`,
  },

  tasks: {
    update: (taskId) => `/projects/tasks/${taskId}`,
    delete: (taskId) => `/projects/tasks/${taskId}`,
  },
}
