# 🚀 Deployment Guide for Authencity Validator

This project is now configured for **100% Free & Fast Deployment**.

## Prerequisites
- A GitHub account.
- The project code pushed to your GitHub repository: [Authenticity-Validator-for-Academia](https://github.com/amreenfathima26/Authenticity-Validator-for-Academia)

---

## ⚡ Option 1: The "Fast Track" (Recommended)

This method automates the Backend and Database setup using a Render Blueprint.

### Step 1: Deploy Backend + Database (Render)
1.  **Login** to [Render.com](https://render.com/).
2.  Go to **Blueprints** and click **New Blueprint Instance**.
3.  Connect your repository: `Authenticity-Validator-for-Academia`.
4.  Render will detect `render.yaml`. Click **Apply**.
5.  **Wait** for the deployment to finish. It will create:
    *   A Postgres Database (`authenticity-db`)
    *   A Web Service (`authenticity-backend`)
6.  Once "Live", go to your **Dashboard**.
7.  Click on the `authenticity-backend` service.
8.  **Copy the URL** (e.g., `https://authenticity-backend-xxxx.onrender.com`).

### Step 2: Deploy Frontend (Vercel)
1.  **Login** to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import `Authenticity-Validator-for-Academia`.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Environment Variables**:
        *   Key: `REACT_APP_API_URL`
        *   Value: Paste your **Render Backend URL** (from Step 1).
5.  Click **Deploy**.

**That's it! Your project is live.** 🚀

---

## 🛠️ Option 2: Manual Setup

If the Blueprint fails or you prefer manual control:

### Part 1: Database (Render)
1.  Create a **New PostgreSQL** database on Render (Free Plan).
2.  Copy the `Internal Database URL`.

### Part 2: Backend (Render)
1.  Create a **New Web Service**.
2.  Repo: `Authenticity-Validator-for-Academia`.
3.  Root Directory: `backend`.
4.  Build Command: `npm install`.
5.  Start Command: `node server.js`.
6.  **Environment Variables**:
    *   `DATABASE_URL`: (Paste Internal Database URL)
    *   `JWT_SECRET`: (Random string)

### Part 3: Frontend (Vercel)
1.  Deploy `frontend` folder to Vercel.
2.  Set Environment Variable `REACT_APP_API_URL` to your backend URL.

---

## ✅ Verification Checklist (10000% Working)

1.  **Database Connection**: The backend logs should say "Connected to PostgreSQL database".
2.  **Frontend-Backend Link**:
    *   Open your Vercel App.
    *   Try to **Register** a new user.
    *   If it works, the connection is perfect!
3.  **Persistence**:
    *   Refresh the page. Your data should still be there (thanks to Postgres).
