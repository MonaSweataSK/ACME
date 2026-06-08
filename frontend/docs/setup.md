# Local Setup Guide

Follow these steps to run the ACME application locally on your machine after downloading or cloning from GitHub.

## Prerequisites

- **Node.js**: Make sure you have Node.js (v18 or higher) installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Git**: Ensure you have Git installed.

## 1. Backend Setup

The backend is a Node.js API built with Express and Prisma (SQLite).

1. **Open a terminal** and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(If you are on Windows Command Prompt/PowerShell, you can simply duplicate `.env.example` and rename it to `.env` using File Explorer).*
   Ensure the `.env` contains something like: `DATABASE_URL="file:./dev.db"`

4. **Initialize the Database:**
   Run Prisma migrations to create the SQLite database file and tables:
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the Database (Optional but recommended):**
   Populate your local database with some initial sample data:
   ```bash
   npm run seed
   ```

6. **Start the API server:**
   ```bash
   npm run dev
   ```
   The backend will start running (typically on `http://localhost:3000`). **Leave this terminal window open.**

## 2. Frontend Setup

The frontend is a React application built with Vite.

1. **Open a NEW terminal window** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **View the App:**
   Open your browser and navigate to the URL provided in the terminal (typically `http://localhost:5173`).

---

**You're all set!** Both the frontend and backend are now running in development mode. Any changes you make to the code will automatically reload in your browser.
