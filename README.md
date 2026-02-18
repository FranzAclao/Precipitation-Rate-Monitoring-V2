# FloodSense v2  
### IoT Flood Monitoring & Prediction System

FloodSense v2 is a real-time web dashboard designed for the Municipality of Del Carmen.  
It monitors rainfall intensity and river water levels using IoT sensor nodes (Node 1 & Node 2) and provides flood risk alerts through predictive analytics.

This version migrates the legacy v1 (HTML/JS) system to a modern **React + Vite** architecture featuring:

- Real-time data synchronization  
- Historical data visualization  
- Interactive mapping  
- ML-based flood prediction interface  

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Project Structure](#-project-structure)
- [Running the Application](#-running-the-application)
- [Managing GitHub Accounts](#-managing-github-accounts)
- [Troubleshooting](#-troubleshooting)
- [Contribution Workflow](#-contribution-workflow)
- [Tech Stack](#-tech-stack)

---

## 🛠 Prerequisites

Before cloning the repository, ensure your environment meets the following requirements:

- **Node.js** version `18.x` or higher  
  ```bash
  node -v
  ```

- **npm** version `9.x` or higher  
  ```bash
  npm -v
  ```

- **Code Editor:** VS Code (recommended)  
- **Firebase:** Access to the project's Realtime Database  

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/FranzAclao/Precipitation-Rate-Monitoring-V2.git
cd floodsense-v2
```

### 2️⃣ Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Configuration

⚠️ Firebase credentials are not committed to Git for security reasons.

### Step 1: Create `.env` File

Create a file named:

```
.env
```

Place it in the **root directory** (same level as `package.json`).

### Step 2: Add Firebase Configuration

Paste the following and replace with values from your Firebase Console:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_database_url.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

After creating `.env`, restart the development server if it is running.

---

## 📂 Project Structure

```
src/
├── components/        # Reusable UI components (Map.jsx, RainfallChart.jsx)
├── hooks/             # Custom hooks (useFloodData.js)
├── lib/               # Firebase configuration & initialization (firebase.js)
├── App.jsx            # Main dashboard view
├── Data.jsx           # Historical logs table
├── Analysis.jsx       # ML prediction & forecasting view
└── main.jsx           # Application entry point & routing
```

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser at:

```
http://localhost:5173/
```

---

## 🔄 Managing GitHub Accounts

If switching between different GitHub accounts (e.g., School and Work):

### 1️⃣ Clear Stored Credentials

1. Open **Credential Manager**
2. Select **Windows Credentials**
3. Remove entries related to:
   ```
   git:https://github.com
   ```

### 2️⃣ Log Into the Correct GitHub Account

Log into the intended account in your browser.

### 3️⃣ Reauthenticate in VS Code

When running `git push` or `git pull`, select:

```
Sign in with Browser
```

---

## ❓ Troubleshooting

### 🔴 Repository Not Found

You are likely authenticated with the wrong GitHub account.  
Follow the **Managing GitHub Accounts** section.

---

### 🔴 Firebase: No Firebase App Created

- Ensure `.env` is in the **root directory**
- Ensure all variables start with `VITE_`
- Restart the dev server

---

### 🔴 Chart Is Blank

The rainfall chart displays data based on the selected date.

If no data exists for the current day:

- Use the Date Picker  
- Select a historical date with recorded rainfall  

---

## 🤝 Contribution Workflow

To keep the `main` branch stable:

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit changes:
   ```bash
   git commit -m "feat: short description"
   ```

4. Push branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request on GitHub for review.

---

## 📦 Tech Stack

- React  
- Vite  
- Firebase Realtime Database  
- Charting Library (rainfall visualization)  
- Leaflet (mapping integration)  
- Machine Learning Prediction Module  

---

© 2026 FloodSense v2 Project
