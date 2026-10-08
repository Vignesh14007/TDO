# TDO Setup & Execution Guide

This guide walks you through running TDO (Backend & Frontend) locally.

---

## Prerequisites

1. **Python 3.10+** (verified on Python 3.14)
2. **Node.js 18+** & **npm**
3. Outbound Internet access for connecting to the remote **Aiven PostgreSQL** database.

---

## 1. Backend Setup

### Navigate to the backend directory
```bash
cd backend
```

### Virtual Environment
If not already active, activate the virtual environment:
```bash
source .venv/bin/activate
```

### Environment Variables
Inspect `backend/.env` to confirm the database URL and security settings:
```ini
PROJECT_NAME="TDO"
VERSION="1.0.0"
API_V1_STR="/api/v1"
ENVIRONMENT="development"
SECRET_KEY="tdo-development-super-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALGORITHM="HS256"
DATABASE_URL="postgresql+psycopg2://<user>:<password>@<host>:<port>/defaultdb?sslmode=require"
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

### Apply Database Migrations (Alembic)
Ensure the database schema is up-to-date:
```bash
PYTHONPATH=. alembic upgrade head
```

### Run Backend Server
Start the FastAPI server on port 8000:
```bash
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger UI: `http://localhost:8000/api/v1/docs`
- Health check: `http://localhost:8000/health`

---

## 2. Frontend Setup

### Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

### Install Dependencies (if needed)
```bash
npm install
```

### Start Vite Development Server
```bash
npm run dev
```
The application will be accessible at:
👉 **`http://localhost:5173`**

Vite is preconfigured with a proxy that directs `/api` requests seamlessly to `http://127.0.0.1:8000`.

---

## 3. Production Build

To verify and test production frontend assets:
```bash
cd frontend
npm run build
npm run preview
```
