# Deployment Guide for Authenticity Validator

This guide explains how to deploy the Authenticity Validator for Academia application for free using **Render** (for Backend & Database) and **Vercel** (for Frontend).

## Prerequisites
- A GitHub account.
- The project code pushed to your GitHub repository: [Authenticity-Validator-for-Academia](https://github.com/amreenfathima26/Authenticity-Validator-for-Academia)

---

## Part 1: Backend Deployment (Render)

1.  **Sign Up/Login** to [Render.com](https://render.com/).
2.  **Create a New Database (PostgreSQL)**:
    *   Click **New +** -> **PostgreSQL**.
    *   Name: `authenticity-db`.
    *   Region: Closest to you (e.g., Singapore, Frankfurt).
    *   Plan: **Free**.
    *   Click **Create Database**.
    *   **Important**: Copy the `Internal Database URL` (for internal use) and `External Database URL` (to connect from your PC if needed).

3.  **Create a Web Service (Backend API)**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository (`Authenticity-Validator-for-Academia`).
    *   **Root Directory**: `backend` (Important!).
    *   **Runtime**: Node.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
    *   **Instance Type**: Free.
    *   **Environment Variables** (Scroll down to "Advanced"):
        *   Key: `DATABASE_URL`
        *   Value: Paste the **Internal Database URL** from the database you just created.
        *   Key: `JWT_SECRET`
        *   Value: (Any random string, e.g., `mysecretkey123`).
    *   Click **Create Web Service**.

4.  **Wait for Deployment**:
    *   Render will install dependencies and start the server.
    *   Once live, copy the **Service URL** (e.g., `https://authenticity-backend.onrender.com`).

---

## Part 2: Frontend Deployment (Vercel)

1.  **Sign Up/Login** to [Vercel.com](https://vercel.com/).
2.  **Add New Project**:
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.
3.  **Configure Project**:
    *   **Framework Preset**: Create React App (should auto-detect).
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Environment Variables**:
        *   Key: `REACT_APP_API_URL`
        *   Value: The **Service URL** of your backend from Part 1 (e.g., `https://authenticity-backend.onrender.com`).
4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to finish.

---

## Part 3: Verification

1.  Open your Vercel deployment URL.
2.  Try to **Register** a new institution or login as `admin@system.com` / `admin123`.
3.  If everything works, you have successfully deployed a full stack app with a persistent online database!
