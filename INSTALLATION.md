# 🛠️ EchoHire AI — Installation & Setup Guide

This guide walks you through setting up and running EchoHire AI from scratch on Windows, macOS, or Linux.

---

## 📋 System Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: `v18.0.0` or later (Node 20+ recommended)
- **npm**: `v9.0.0` or later
- **Python**: `v3.10` or later (Python 3.11 / 3.12 recommended)
- **Git**: `v2.30` or later

Verify your environment:
```bash
node -v
npm -v
python --version
git --version
```

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Clone the Repository & Configure Environment
```bash
git clone https://github.com/your-username/EchoHire-AI.git
cd EchoHire-AI
```

Copy the environment configuration template:
```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

*(Note: EchoHire AI works out of the box with high-fidelity fallback synthesis even if you don't add API keys immediately!)*

---

### Step 2: Install Dependencies & Run

#### Terminal 1 — Backend (FastAPI)
```bash
# 1. Create and activate a Python virtual environment (optional but recommended)
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Full-Duplex WebSocket Endpoint**: `ws://localhost:8000/ws/duplex`

---

#### Terminal 2 — Frontend (Next.js 14)
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Next.js development server
npm run dev
```
- **Web Application**: `http://localhost:3000`

---

## 🐳 Docker Deployment (Optional)

If you prefer containerized execution:

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    env_file:
      - .env

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000
      - NEXT_PUBLIC_WS_URL=ws://backend:8000/ws/duplex
    depends_on:
      - backend
```

Run with:
```bash
docker compose up --build
```

---

## 🔍 Verification & Health Check

1. **Verify Backend Status**:
   Visit `http://localhost:8000/api/health` in your browser. Expected response:
   ```json
   {
     "status": "healthy",
     "service": "EchoHire AI Voice Backend 2026",
     "rime_tts": "Active (Mist/Coda)",
     "full_duplex": "Enabled"
   }
   ```

2. **Verify Frontend**:
   Open `http://localhost:3000` in Google Chrome, Microsoft Edge, or Brave (Microphone permissions enabled).

3. **Run Automated Test Suite**:
   ```bash
   python -m pytest tests/ -v
   ```
   All 9 unit & integration tests will pass with 100% green status.
