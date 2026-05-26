# LockedIn

**Your life. Organized.**

LockedIn is a modern full-stack personal life operating system for productivity, placement preparation, goal tracking, and customizable planning systems.

## Phase 1 Core Productivity System

The current product includes:

- JWT signup/login and protected application routes
- Tab-based workspace with `Daily Goals` and `Placement Tracker`
- Daily tasks with today, tomorrow, future date, weekend, and recurring schedules
- Task priorities, categories, notes, reminders, completion tracking, streaks, and smooth optimistic updates
- List, Kanban, and calendar task views
- Filters for Today, Upcoming, Overdue, Completed, High Priority, and categories
- Placement tracker for company applications, OA dates, deadlines, interviews, platforms, resume versions, DSA topics, notes, remarks, statuses, and prep progress
- Search, sorting, analytics cards, and visual deadline indicators
- Modal-based forms, autosave drafts, toast notifications, loading skeletons, browser reminders, offline service worker support, reusable hooks, and centralized API handling
- MongoDB schemas for users, tasks, placements, analytics, and settings

## Phase 2 AI Workspace Generator

The app also includes an AI-powered dynamic workspace system:

- `+ Create Workspace` tab and floating quick-create flow
- Natural-language prompt input for custom systems such as DSA prep, gym trackers, finance dashboards, habit systems, study planners, startup boards, internship trackers, and content calendars
- OpenAI Responses API integration with Structured Outputs for prompt-to-schema generation
- Deterministic local fallback generator when `OPENAI_API_KEY` is not configured
- Dynamic schema renderer for sections, fields, widgets, metrics, progress bars, tables, checklists, notes, deadlines, tags, and analytics
- AI assistant panel for refinements such as adding revision tracking, interview prep, streak tracking, or new dashboard sections
- Drag-and-drop section organization
- MongoDB persistence for generated workspace configurations

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn-style UI primitives
- Framer Motion
- Zustand
- React Hook Form + Zod
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt password hashing

## Run Locally

```bash
npm install
npm run dev
```

The app runs at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Health: `http://localhost:8080/api/health`

## Environment

Create `server/.env` from `server/.env.example`:

```bash
PORT=8080
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
MONGODB_URI=mongodb://127.0.0.1:27017/lockedin
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5.2
```

If `MONGODB_URI` is not set, the API still runs with seed-backed demo data so the full interface remains usable. If `OPENAI_API_KEY` is not set, workspace generation uses the built-in deterministic fallback generator.

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/placements`
- `POST /api/placements`
- `PATCH /api/placements/:id`
- `DELETE /api/placements/:id`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `POST /api/workspaces/:id/refine`
- `PATCH /api/workspaces/:id`
- `DELETE /api/workspaces/:id`

Protected routes require:

```bash
Authorization: Bearer <token>
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```
