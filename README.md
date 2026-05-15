# Team Task Manager

A polished team project management UI built with React, TypeScript, and Vite.

This application is designed to showcase a clean, user-friendly frontend for managing projects and tasks in a team environment.

## What’s included

- Secure login and signup pages
- Dashboard with project, task, and overdue task summaries
- Projects page with a form to create new projects
- Project detail page with task creation and status management
- Responsive layout with modern cards and form styling
- Friendly error handling for API connection issues

## Pages

- `/login` — sign in to your account
- `/signup` — register a new team member
- `/` — team dashboard with summary stats and recent tasks
- `/projects` — view and create projects
- `/projects/:projectId` — manage tasks inside a project

## Run the app locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

This frontend expects a backend API for authentication, projects, and tasks. If you are testing locally, make sure the backend is available at the configured API endpoint.

## Suggestions for submission

- include API mock data or a demo backend for the reviewers
- add task filtering and assignment functionality
- improve user profile and team member handling

---

This task manager UI is built to be a strong job-assignment demo, with a modern look and intuitive project workflows.