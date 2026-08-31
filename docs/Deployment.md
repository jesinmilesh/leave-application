# DLPMS Deployment Guide

## Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Docker & Docker Compose (optional for containerized deployment)

## Step-by-Step Production Deployment

### 1. Database Setup
```bash
# Set environment variables
cp .env.example .env

# Run Prisma Migrations
npx prisma migrate dev --name init

# Seed Database
node database/seed.js
```

### 2. Frontend & Backend Build
```bash
# Build React Frontend
npm run build

# Start Backend Express Server
node backend/src/server.js
```

### 3. Docker Deployment
```bash
docker-compose up -d --build
```
