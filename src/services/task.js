import api from './api.js'
import { normalizeTask } from './project.js'

const priorityMap = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

const statusMap = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  Done: 'completed',
}

export async function fetchDashboardOverview() {
  const response = await api.get('/projects/stats/overview')
  const { stats, tasks, tasksByUser } = response.data
  return {
    stats,
    tasks: (tasks || []).map(normalizeTask),
    tasksByUser: tasksByUser || [],
  }
}

export async function createTask(projectId, payload) {
  const body = {
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate || null,
    priority: priorityMap[payload.priority] || 'medium',
    assignedTo: payload.assigneeId || null,
  }
  const response = await api.post(`/projects/${projectId}/tasks`, body)
  return normalizeTask(response.data.task)
}

export async function updateTask(taskId, payload) {
  const body = {}
  if (payload.status) body.status = statusMap[payload.status] || payload.status
  if (payload.priority) body.priority = priorityMap[payload.priority]
  if (payload.title !== undefined) body.title = payload.title
  if (payload.description !== undefined) body.description = payload.description
  if (payload.dueDate !== undefined) body.dueDate = payload.dueDate || null
  if (payload.assigneeId !== undefined) body.assignedTo = payload.assigneeId || null

  const response = await api.put(`/projects/tasks/${taskId}`, body)
  return normalizeTask(response.data.task)
}

export async function deleteTask(taskId) {
  await api.delete(`/projects/tasks/${taskId}`)
}
