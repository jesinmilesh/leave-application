# Prathyusha Engineering College – Digital Leave Permission Portal (PEC Leave Portal)

Official Full-Stack Real-Time Digital Leave Permission Portal for **Prathyusha Engineering College (PEC)**. Built with React, Express.js, PostgreSQL (Prisma ORM), and Socket.IO real-time synchronization.

---

## 🏗️ Production System Architecture

```
                    INTERNET
                       │
                       ▼
              ┌─────────────────┐
              │  Render Static  │
              │ Web Service UI  │
              │  (Vite / React) │
              └────────┬────────┘
                       │
             HTTPS / WSS WSS Connection
                       │
                       ▼
              ┌─────────────────┐
              │   Render Web    │
              │    Service      │
              │ Node.js Backend │
              │ Express + Socket│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Render Postgres │
              │   PostgreSQL    │
              └─────────────────┘
```


---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://pec_user:password@localhost:5432/pec_db?schema=public"
JWT_SECRET="generate_secure_random_key"
JWT_REFRESH_SECRET="generate_secure_random_key"
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://pec-leave-portal-frontend.onrender.com"
ALLOWED_ORIGINS="https://pec-leave-portal-frontend.onrender.com"
```

### Frontend (`.env`)
```env
VITE_API_URL="https://pec-leave-portal-backend.onrender.com/api"
VITE_SOCKET_URL="https://pec-leave-portal-backend.onrender.com"
```

---

## 🚀 Deployment Instructions for Render

### Method A: Automated Deployment via Render Blueprint (`render.yaml`)

1. Connect your GitHub repository to [Render](https://render.com).
2. Click **New +** -> **Blueprints**.
3. Select this repository. Render will automatically detect `render.yaml` and configure:
   - `pec-leave-portal-db` (PostgreSQL Database)
   - `pec-leave-portal-backend` (Node.js Express + Socket.IO Web Service)
   - `pec-leave-portal-frontend` (Static Web App)
4. Click **Apply**. Render will run database schema generation, idempotent seeding, and build both services.

### Method B: Manual Render Service Setup

#### 1. Create Render PostgreSQL Database
- **Name**: `pec-leave-portal-db`
- **Database**: `pec_db`
- **User**: `pec_user`
- Copy the **Internal Database URL** provided by Render.

#### 2. Create Render Backend Web Service
- **Name**: `pec-leave-portal-backend`
- **Environment**: `Node`
- **Build Command**:
  ```bash
  npm install && npx prisma generate && npx prisma db push && node database/seed.js
  ```
- **Start Command**:
  ```bash
  node backend/src/server.js
  ```
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `DATABASE_URL`: (Paste Render PostgreSQL connection string)
  - `JWT_SECRET`: (Random string)
  - `JWT_REFRESH_SECRET`: (Random string)
  - `NODE_ENV`: `production`
  - `FRONTEND_URL`: `https://pec-leave-portal-frontend.onrender.com`

#### 3. Create Render Frontend Web Service
- **Name**: `pec-leave-portal-frontend`
- **Environment**: `Static Site`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rule**: Rewrite all requests `/*` to `/index.html` (SPA Routing)
- **Environment Variables**:
  - `VITE_API_URL`: `https://pec-leave-portal-backend.onrender.com/api`
  - `VITE_SOCKET_URL`: `https://pec-leave-portal-backend.onrender.com`

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/PEC-Leave-Portal.git
cd PEC-Leave-Portal

# 2. Install dependencies
npm install

# 3. Setup database schema & seed initial accounts
npx prisma generate
npx prisma db push
node database/seed.js

# 4. Start local development server
npm run dev
```

---

## ⚡ Socket.IO Real-Time & Reconnection

The real-time engine connects via `wss://` (secure WebSockets) in production.
- If the network disconnects, the client auto-reconnects (`reconnectionAttempts: Infinity`) and fetches fresh server state from `/api/leave/all` to ensure no state drift occurs.
- Supported Socket Events: `leave_created`, `mentor_approved`, `mentor_rejected`, `hod_approved`, `hod_rejected`, `warden_approved`, `warden_rejected`, `pass_generated`, `student_exited`, `student_returned`, `notification_created`.

---

## 🛡️ Security & OWASP Compliance

- **OWASP Headers**: Helmet protection, HSTS, frameguard, XSS filter, Content-Security-Policy.
- **Authentication**: JWT access tokens + HttpOnly refresh cookies + bcrypt password hashing.
- **Database Transactions**: Multi-step approvals wrap in Prisma `$transaction` blocks for total data safety.
- **Rate Limiting**: Auth endpoints protected with `express-rate-limit` against brute-force attacks.

---

## 📜 License & Ownership

Official software property of **Prathyusha Engineering College (PEC)**.
Poonamallee–Tiruvallur Road, Tamil Nadu – 602025.
All Rights Reserved © 2026.
