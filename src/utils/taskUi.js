export function statusClass(status) {
  if (status === 'To Do') return 'chip chip-status-todo'
  if (status === 'In Progress') return 'chip chip-status-progress'
  if (status === 'Done') return 'chip chip-status-done'
  return 'chip'
}

export function priorityClass(priority) {
  if (priority === 'High') return 'chip chip-priority-high'
  if (priority === 'Medium') return 'chip chip-priority-medium'
  if (priority === 'Low') return 'chip chip-priority-low'
  return 'chip'
}

export function projectStatusClass(status) {
  if (status === 'completed') return 'chip chip-project-completed'
  return 'chip chip-project-active'
}
