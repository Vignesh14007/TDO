# Database Architecture & Schema — TDO V1

The database is the **single source of truth** for all metrics, completion percentages, history, and streak calculations.

TDO utilizes **PostgreSQL 18** hosted on **Aiven Cloud**. Schema definitions and migrations are managed exclusively via **Alembic**.

---

## 1. Entity Relationship Overview

```
 ┌────────────────────────┐
 │         users          │
 ├────────────────────────┤
 │ id (PK)                │
 │ email (UQ, IX)         │
 │ hashed_password        │
 │ name                   │
 │ is_active              │
 │ created_at             │
 │ updated_at             │
 └───────────┬────────────┘
             │ 1:N
             ├────────────────────────────────┐
             │                                │
             ▼ 1:N                            ▼ 1:N
 ┌────────────────────────┐       ┌────────────────────────┐
 │         goals          │       │         tasks          │
 ├────────────────────────┤       ├────────────────────────┤
 │ id (PK)                │       │ id (PK)                │
 │ user_id (FK, IX)       ├───────┤ goal_id (FK, IX, Null) │
 │ title                  │  0..1 │ user_id (FK, IX)       │
 │ description            │       │ title                  │
 │ start_date             │       │ description            │
 │ end_date               │       │ task_date (IX)         │
 │ status                 │       │ due_date               │
 │ progress               │       │ priority               │
 │ created_at             │       │ category               │
 │ updated_at             │       │ duration               │
 └────────────────────────┘       │ status (IX)            │
                                  │ completed_at           │
                                  │ created_at             │
                                  │ updated_at             │
                                  └────────────────────────┘
```

---

## 2. Table Specifications

### `users` Table
Stores user account profiles and credentials.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Index | Unique user ID |
| `email` | `VARCHAR(255)` | Unique, Index, Not Null | User login email (lowercase) |
| `hashed_password`| `VARCHAR(255)` | Not Null | Bcrypt hashed password |
| `name` | `VARCHAR(255)` | Not Null | User display name |
| `is_active` | `BOOLEAN` | Not Null, Default `TRUE` | Account active status |
| `created_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Account creation time |
| `updated_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Profile last updated |

---

### `goals` Table
Represents high-level user goals.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Index | Goal ID |
| `user_id` | `INTEGER` | Foreign Key (`users.id` ON DELETE CASCADE), Index, Not Null | Owner of the goal |
| `title` | `VARCHAR(255)` | Not Null | Goal title |
| `description` | `TEXT` | Nullable | Goal description |
| `start_date` | `DATE` | Nullable | Optional start date |
| `end_date` | `DATE` | Nullable | Optional target deadline |
| `status` | `VARCHAR(50)` | Not Null, Default `'active'` | `active`, `completed`, or `archived` |
| `progress` | `INTEGER` | Not Null, Default `0` | Percentage completion (0–100) |
| `created_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Last modification timestamp |

---

### `tasks` Table
Represents granular scheduled tasks.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Index | Task ID |
| `user_id` | `INTEGER` | Foreign Key (`users.id` ON DELETE CASCADE), Index, Not Null | Owner of the task |
| `goal_id` | `INTEGER` | Foreign Key (`goals.id` ON DELETE SET NULL), Index, Nullable | Associated goal |
| `title` | `VARCHAR(255)` | Not Null | Task title |
| `description` | `TEXT` | Nullable | Detailed notes / subtasks |
| `task_date` | `DATE` | Index, Not Null | Calendar date task is scheduled for |
| `due_date` | `DATE` | Nullable | Optional hard deadline |
| `priority` | `VARCHAR(20)` | Not Null, Default `'medium'` | `low`, `medium`, or `high` |
| `category` | `VARCHAR(50)` | Not Null, Default `'general'` | Category (Study, Work, Fitness) |
| `duration` | `INTEGER` | Nullable | Estimated focus minutes |
| `status` | `VARCHAR(20)` | Index, Not Null, Default `'pending'` | `pending`, `completed`, `cancelled` |
| `completed_at` | `TIMESTAMPTZ` | Nullable | UTC completion timestamp |
| `created_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Task creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Not Null, Server Default `now()` | Last update timestamp |

---

## 3. Database Indexes

To maintain rapid queries under growing user datasets:
1. `users.email` (Unique B-tree index for O(1) login lookups)
2. `goals.user_id` (Index for fast goal list queries)
3. `tasks.user_id` (Index for scoped user tasks)
4. `tasks.task_date` (Index for today/calendar/analytics queries)
5. `tasks.status` (Index for streak calculations and pending task filters)
6. `tasks.goal_id` (Index for relational joins with goals)
