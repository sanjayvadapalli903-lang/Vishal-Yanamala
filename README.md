# Smart Campus AI — Student Success & Campus Analytics Platform

Role-based analytics platform for students, teachers, and principals, with AI assistance powered by **Groq**.

## Stack

- Frontend: React 19 + Vite + Tailwind CSS 4 + Recharts
- Backend: Express (`server.ts`, also serves Vite in dev via middleware)
- AI: `groq-sdk` (default model: `openai/gpt-oss-120b`)

## Prerequisites

- Node.js 22+ and npm

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env and set GROQ_API_KEY (get one at https://console.groq.com/keys)
```

## Run

```bash
npm run dev
```

App + API serve on `http://localhost:3000`.

| Script      | Command        |
| ----------- | -------------- |
| Dev         | `npm run dev`  |
| Type-check  | `npm run lint` |
| Build       | `npm run build`|

## Demo logins

| Role      | ID          | Password     |
| --------- | ----------- | ------------ |
| Student   | `STD2024101`| `student123` |
| Teacher   | `TCH150`    | `teacher123` |
| Principal | `PRN001`    | `principal123` |

## API overview

- `POST /api/auth/login` — `{ identifier, password, selectedRole }`
- `GET /api/student/data`, `GET /api/teacher/data`, `GET /api/principal/data` (role-guarded)
- `GET /api/ai/status` — AI provider diagnostics (no auth)
- `POST /api/ai/chat`, `POST /api/ai/study-planner`, `POST /api/ai/risk-analysis` (auth)

AI endpoints fall back to a local rule engine when `GROQ_API_KEY` is unset.

## Notes

- Never commit `.env` (it is git-ignored). Use `.env.example` as the template.
- `GROQ_MODEL` in `.env` overrides the default chat model.
