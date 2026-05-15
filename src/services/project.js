import api from './api.js'
import { endpoints } from './endpoints.js'

const normalizeRole = (role) => (role === 'admin' ? 'Admin' : 'Member')

const buildUser = (user) => {
  if (!user) return null
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  return {
    _id: user._id || user.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: user.email,
    role: normalizeRole(user.role || 'member'),
  }
}

const backendPriorityToLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const backendStatusToLabel = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
}

export const normalizeTask = (task) => {
  const assigned = task.assignedTo
  let assignee
  if (assigned && typeof assigned === 'object' && (assigned.email || assigned.firstName)) {
    assignee = buildUser(assigned)
  } else if (assigned) {
    const id = assigned._id || assigned
    assignee = id ? { _id: String(id) } : undefined
  }
  return {
    ...task,
    _id: task._id,
    status: backendStatusToLabel[task.status] ?? task.status,
    priority: backendPriorityToLabel[task.priority] ?? task.priority,
    assignee,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : '',
  }
}

const normalizeProject = (project) => ({
  ...project,
  _id: project._id,
  ownerId: project.ownerId?._id || project.ownerId,
  memberCount: project.memberCount ?? project.members?.length ?? 0,
  roleInProject: project.roleInProject ?? null,
  members: (project.members || []).map((member) => ({
    ...buildUser(member),
    role: normalizeRole(member.role || 'member'),
  })),
})

export async function fetchProjects() {
  const response = await api.get(endpoints.projects.list)
  return response.data.projects.map(normalizeProject)
}

export async function fetchProject(projectId) {
  const response = await api.get(endpoints.projects.detail(projectId))
  return normalizeProject(response.data.project)
}

export async function createProject(payload) {
  const response = await api.post(endpoints.projects.create, payload)
  return normalizeProject(response.data.project)
}

export async function updateProject(projectId, payload) {
  const response = await api.put(endpoints.projects.update(projectId), payload)
  return normalizeProject(response.data.project)
}

export async function deleteProject(projectId) {
  await api.delete(endpoints.projects.delete(projectId))
}

export async function addProjectMember(projectId, body) {
  await api.post(endpoints.projects.members(projectId), body)
  return fetchProject(projectId)
}

export async function removeProjectMember(projectId, userId) {
  await api.delete(endpoints.projects.member(projectId, userId))
  return fetchProject(projectId)
}

export async function fetchProjectTasks(projectId) {
  const response = await api.get(endpoints.projects.tasks(projectId))
  return response.data.tasks.map(normalizeTask)
}
