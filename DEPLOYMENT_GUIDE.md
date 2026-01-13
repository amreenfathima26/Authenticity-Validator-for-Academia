# 🚀 Deployment Guide for Authencity Validator

Since you already have a database on Render, we will use **Neon.tech** as a free alternative.

---

## 💎 Step 1: Setup Free Database (Neon.tech)

1.  **Register** at [Neon.tech](https://neon.tech/) (Free Forever).
2.  Create a project and copy the **Connection String** (Postgres URL).
    *   Example: `postgresql://alex:abc123@ep-shiny-pond-123.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## ⚡ Step 2: Deploy Backend (Render)

1.  **Create Web Service**:
    *   Click **New +** ➡️ **Web Service** on Render.
    *   Connect your GitHub repo.
    *   **Root Directory**: `backend`.
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Environment Variables**:
        *   `DATABASE_URL`: (Paste your **Neon.tech** string)
        *   `JWT_SECRET`: `your_random_secret_here`
2.  **Wait** for the service to be "Live".

---

## ⚡ Step 3: Deploy Frontend (Vercel)

1.  Import repo to Vercel.
2.  Root Directory: `frontend`.
3.  Environment Variable: `REACT_APP_API_URL` = (Your Render Backend URL).
4.  Deploy.

---

## ✅ Step 4: Seed the Database

1.  Go to Render Dashboard ➡️ `authenticity-backend` ➡️ **Shell**.
2.  Run: `node seed_data.js`.
3.  Login with: `admin@system.com` / `admin123`.
