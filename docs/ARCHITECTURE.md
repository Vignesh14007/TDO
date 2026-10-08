# System Architecture — TDO V1

TDO follows a decoupled, three-tier client-server architecture with strict separation of concerns and database-driven truth.

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React + Vite + TS)            │
│    Components • Context • Services • Tailwind Theme    │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend API (FastAPI)                   │
│   Routers (v1) • Dependencies • Pydantic Validation    │
├────────────────────────────────────────────────────────┤
│               Service / Logic Layer                   │
│         Streak Engine • Analytics Aggregators          │
├────────────────────────────────────────────────────────┤
│               ORM / Persistence Layer                  │
│             SQLAlchemy 2.0 • Alembic                   │
└───────────────────────────┬────────────────────────────┘
                            │ TCP / SSL (psycopg2)
                            ▼
┌────────────────────────────────────────────────────────┐
│         Database: Aiven Cloud PostgreSQL 18            │
│           users  •  goals  •  tasks  •  alembic        │
└────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Architecture

- **State Management**:
  - `AuthContext`: Centralized reactive token and user profile management with localStorage persistence and cross-tab synchronization.
  - Component-local state for query filters, modals, and form submissions.
- **API Communication**:
  - Centralized Axios client (`src/services/api.ts`) equipped with a request interceptor that injects Bearer JWT tokens and a response interceptor that automatically purges invalid credentials on HTTP 401.
- **Design System**:
  - Minimal monochrome aesthetic configured in `tailwind.config.js`.
  - Reusable primitive components (`Button`, `Card`, `Input`, `Modal`, `StatusBadge`).

---

## 2. Backend Architecture

- **Routers (`app/api/v1`)**:
  - Clean endpoints organized by domain: `auth`, `users`, `goals`, `tasks`, `dashboard`, `streaks`, `history`, `analytics`.
- **Dependency Injection (`app/api/deps.py`)**:
  - `get_db`: Scoped database session yielding and closing per HTTP request.
  - `get_current_user`: Decodes JWT subject, queries database, verifies user account status, and guarantees authentication.
- **Service Layer (`app/services`)**:
  - `streak_service.py`: Computes continuous day chains without mocking or relying on external analytics counters.
  - `analytics_service.py`: Aggregates completion distributions, category breakdown, and priority metrics.
- **Persistence (`app/models`)**:
  - Normalized schema with foreign key cascades, unique constraints, and indexes on lookup columns (`email`, `user_id`, `task_date`, `status`).

---

## 3. Security Principles

1. **Password Hashing**: Uses `bcrypt` with dynamic salt generation. Plain-text passwords and hashes are never exposed in logs or API responses.
2. **Multi-Tenant Isolation**: Every goal and task query strictly matches against `current_user.id`. Access attempts to resources owned by another user return `404 Not Found`.
3. **Environment Isolation**: Database credentials, secret keys, and token expirations are loaded through environment variables via Pydantic Settings.
