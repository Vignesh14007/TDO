# TDO — Task • Do • Optimize (Version 1)

**TDO** is a clean, reliable personal task, goal, consistency, and progress-management application built with a focus on simplicity, responsiveness, and data integrity.

TDO V1 helps users organize high-level goals and actionable daily tasks, complete them consistently, track deterministic streaks, and understand their productivity through an intuitive monochrome dashboard and analytics suite.

---

## 🚀 Key Features

1. **Authentication & User Profile**
   - Secure email/password registration and login with bcrypt hashing.
   - JWT-based authentication with automatic header injection and route protection.
   - User profile management with display name and password updating.

2. **Goals Management**
   - Goal creation, editing, status tracking (`active`, `completed`, `archived`), and progress calculation (0–100%).
   - Strict multi-tenant user data isolation.

3. **Tasks Engine**
   - Complete CRUD operations for daily tasks.
   - Flexible attributes: scheduled date, optional due date, priority (`low`, `medium`, `high`), category, duration (minutes), and optional goal linkage.
   - Instant state toggle (`complete` / `uncomplete`) with UTC timestamps.
   - Search by keyword and filter by status, priority, category, or date.

4. **Deterministic Streaks**
   - Grounded strictly in database completion timestamps (no invented data).
   - Tracks current streak (with same-day grace period), longest streak, total active days, and 30-day consistency percentage.

5. **Overview Dashboard**
   - High-level KPIs: Today's progress %, current streak, longest streak, active goals.
   - Today's task list with one-click completion.
   - Quick task creation modal targeted to today.

6. **Interactive Calendar**
   - Month-level planning grid with completion ratios per day.
   - Day-detail inspector and date-specific task creation.

7. **Activity History**
   - Filterable timeline across presets (`today`, `this_week`, `this_month`, `all`).
   - Summary cards displaying total tasks, completed, pending, and total focus duration.

8. **Performance Analytics**
   - Objective charts answering:
     - *"Am I maintaining daily consistency?"* (Daily completion bar chart)
     - *"Which categories do I complete most?"* (Category breakdown with percentages)
     - *"How do I perform across priorities?"* (Priority completion rates)

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Python 3, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT / Python-Jose, Bcrypt
- **Database**: PostgreSQL (Aiven Cloud PostgreSQL)

---

## 🎨 Design System

TDO adheres to a strict, distraction-free monochrome design palette:
- **Background**: `#FFFFFF`
- **Surface**: `#F7F7F7`
- **Borders**: `#E5E5E5`
- **Primary Text / Accents**: `#111111`
- **Secondary Text**: `#666666`
- **Functional Accents**: Subtle emerald for success, subtle amber for pending, subtle rose for high priority/cancellation.

---

## 📂 Project Structure

```
TDO/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── api/              # API v1 routes & dependencies
│   │   ├── core/             # App settings, DB engine, security
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (streaks, analytics)
│   │   └── main.py           # FastAPI application entrypoint
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI & layout components
│   │   ├── context/          # AuthContext reactive state
│   │   ├── pages/            # Dashboard, Tasks, Goals, Calendar, History, Analytics, Profile
│   │   ├── services/         # Axios API client
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
└── docs/                     # Full system documentation
```
