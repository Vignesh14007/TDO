# TDO — Task • Do • Optimize

A full-stack productivity web app to plan tasks, organize work around goals, and track progress with analytics and streaks.

**Live demo:** https://tdoapp.onrender.com
**API:** https://tdo-rt2t.onrender.com/docs

> The app is hosted on Render's free tier, so the first request after inactivity may take 30–60 seconds to wake up.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7)

## Highlights

- Decoupled architecture: React + TypeScript SPA talking to a FastAPI REST API
- User authentication with per-user ownership checks on all task and goal data
- Recurring tasks (one-time, daily, weekly) with per-date completion tracking
- Goal-based task organization, analytics, and completion streaks
- Schema migrations with Alembic, request validation with Pydantic
- Deployed live: frontend and backend on Render, PostgreSQL on Aiven

## Features

| Area | What it does |
|---|---|
| **Authentication** | Account-based access; users can only read and modify their own tasks and goals |
| **Tasks** | Create, edit, complete, and reopen tasks |
| **Goals** | Create goals and link tasks to them |
| **Recurring tasks** | One-time, daily, or weekly (selected weekdays), with an optional end date; each occurrence is completed or reopened independently |
| **Analytics** | Completion progress over time with readable date labels (e.g. `Oct 8`) and safe handling of empty or zero-progress states |
| **Streaks** | Completion streaks calculated from task completion records, including recurring tasks |

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI, Uvicorn |
| Data access | SQLAlchemy, Pydantic |
| Database | PostgreSQL (hosted on Aiven) |
| Migrations | Alembic |
| Deployment | Render |

## Architecture

```text
React + TypeScript (Vite)
        |
        | HTTP / REST
        v
FastAPI backend ── business logic, auth, validation, analytics
        |
        | SQLAlchemy
        v
PostgreSQL
```

## Project Structure

```text
TDO/
├── backend/
│   ├── app/
│   │   ├── api/        # route handlers
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   └── services/   # business logic
│   ├── alembic/        # database migrations
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── types/
│       └── utils/
└── docs/
```

## Run Locally

**Prerequisites:** Python 3, Node.js with npm, and a PostgreSQL database.

### 1. Clone

```bash
git clone https://github.com/Vignesh14007/TDO.git
cd TDO
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your own values:

```text
DATABASE_URL=postgresql://user:password@localhost:5432/tdo
SECRET_KEY=your-own-secret-key
```

Apply migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at http://127.0.0.1:8000

### 3. Frontend

In a new terminal:

```bash
cd TDO/frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

> Never commit `.env` files, database passwords, or secret keys.

## API Documentation

With the backend running, interactive docs are available at:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc


