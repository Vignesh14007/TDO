# API Reference — TDO V1

Base URL: `/api/v1`

All protected endpoints require an `Authorization: Bearer <token>` HTTP header.

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new user account.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "Jane Doe",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "user": { "id": 1, "email": "user@example.com", "name": "Jane Doe", "is_active": true, ... },
    "token": { "access_token": "...", "token_type": "bearer" }
  }
  ```

### `POST /auth/login`
Authenticates a user and issues an access token.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**: Returns user and token object.

### `POST /auth/logout` *(Protected)*
Invalidates client session.
* **Response (200 OK)**:
  ```json
  { "message": "Successfully logged out." }
  ```

---

## 2. User Profile (`/api/v1/users`)

### `GET /users/me` *(Protected)*
Returns current authenticated user details.

### `PUT /users/me` *(Protected)*
Updates user display name or password.
* **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "password": "optionalNewPassword"
  }
  ```

---

## 3. Goals (`/api/v1/goals`)

### `GET /goals` *(Protected)*
* **Query Parameters**: `status` (`active`, `completed`, `archived`)
* **Response (200 OK)**: Array of goals.

### `POST /goals` *(Protected)*
Creates a new goal.
* **Request Body**:
  ```json
  {
    "title": "Master Backend Systems",
    "description": "Build high-throughput APIs",
    "start_date": "2026-10-01",
    "end_date": "2026-12-31",
    "status": "active",
    "progress": 20
  }
  ```

### `GET /goals/{id}` *(Protected)*
Retrieve a goal by ID.

### `PUT /goals/{id}` *(Protected)*
Update a goal by ID.

### `DELETE /goals/{id}` *(Protected)*
Deletes a goal (returns 204 No Content).

---

## 4. Tasks (`/api/v1/tasks`)

### `GET /tasks` *(Protected)*
* **Query Parameters**:
  - `status`: `pending`, `completed`, `cancelled`
  - `priority`: `low`, `medium`, `high`
  - `category`: string filter
  - `date`: specific date (`YYYY-MM-DD`)
  - `start_date` / `end_date`: date window
  - `search`: keyword search in title & description
  - `sort_by`: `task_date`, `priority`, `created_at`
  - `sort_order`: `asc`, `desc`
* **Response (200 OK)**: Array of tasks.

### `POST /tasks` *(Protected)*
Creates a new task.
* **Request Body**:
  ```json
  {
    "title": "Solve 2 LeetCode problems",
    "description": "Arrays and HashMaps",
    "task_date": "2026-10-08",
    "priority": "high",
    "category": "DSA",
    "duration": 45,
    "goal_id": 1
  }
  ```

### `GET /tasks/{id}` *(Protected)*
Retrieve task by ID.

### `PUT /tasks/{id}` *(Protected)*
Update task fields.

### `DELETE /tasks/{id}` *(Protected)*
Deletes a task (returns 204 No Content).

### `POST /tasks/{id}/complete` *(Protected)*
Marks task completed with current UTC timestamp.

### `POST /tasks/{id}/uncomplete` *(Protected)*
Reverts task status to pending.

---

## 5. Aggregations & Analytics

### `GET /dashboard` *(Protected)*
Returns high-level summary: today's progress %, current streak, longest streak, today's task list, and active goals.

### `GET /streaks` *(Protected)*
Returns streak statistics: `current_streak`, `longest_streak`, `consistency_percentage`, `total_active_days`.

### `GET /history` *(Protected)*
* **Query Parameters**: `period` (`today`, `this_week`, `this_month`, `all`), `status`, `category`
* **Response**: Summary metrics (total, completed, pending, duration) and list of tasks.

### `GET /analytics` *(Protected)*
* **Query Parameters**: `days` (integer: `7`, `14`, `30`, `90`)
* **Response**: Daily completion metrics, category distribution, priority distribution, and overall completion rate.
