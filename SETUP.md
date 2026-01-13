# Project Setup Guide (From Scratch)

This guide provides step-by-step instructions to set up and run the **Authenticity Validator for Academia** on a fresh Windows system.

## Prerequisites

1.  **Node.js & npm**: Download and install the LTS version from [nodejs.org](https://nodejs.org/).
    *   Verify installation: Open terminal and run `node -v` and `npm -v`.

## Installation Steps

### 1. Extract Project
Unzip the project folder to your desired location (e.g., `C:\AuthenticityValidator`).

### 2. Backend Setup
The backend handles the API, Logic, and SQLite Database.

1.  Open a terminal (Command Prompt or PowerShell) and navigate to the `backend` folder:
    ```cmd
    cd backend
    ```
2.  Install dependencies:
    ```cmd
    npm install
    ```
    *This installs Express, SQLite3, Multer, PDFKit, and other required packages.*
3.  **Seed the Database**:
    Run the following command to create the database (`authenticity_validator.sqlite`) and populate it with initial data (Institutions, Certificates):
    ```cmd
    node seed_data.js
    ```
    *You should see "Seeding Complete!" output.*

### 3. Frontend Setup
The frontend is the React-based user interface.

1.  Open a **new** terminal window and navigate to the `frontend` folder:
    ```cmd
    cd frontend
    ```
2.  Install dependencies:
    ```cmd
    npm install
    ```

## Running the Application

### Option A: Using Batch Scripts (Recommended)
We have provided easy-to-use batch scripts in the root directory:

1.  **`install.bat`**: Double-click this once to automatically install all dependencies for both backend and frontend.
2.  **`run.bat`**: Double-click this to start both the Backend (Port 5000) and Frontend (Port 3001) servers simultaneously.

### Option B: Manual Start

**Terminal 1 (Backend):**
```cmd
cd backend
npm run dev
```
*Server running on http://localhost:5000*

**Terminal 2 (Frontend):**
```cmd
cd frontend
npm start
```
*App running on http://localhost:3001*

## Verification & Usage

1.  Open your browser to `http://localhost:3001`.
2.  **Login**:
    *   **Admin Email**: `admin@system.com`
    *   **Password**: `admin123`
3.  **Verify a Certificate**:
    *   Go to "Verify Certificate".
    *   Upload `sample_certificate_iitb001.png` (found in project root).
    *   OR manually enter Certificate ID: `IITB001`.

## Batch Data Upload (Optional)
To add massive datasets:
1.  Login as Admin.
2.  Go to **Certificates -> Batch Upload**.
3.  Upload any of the `bulk_dataset_batch_*.csv` files found in the project root.
