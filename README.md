# Intelligent Phishing Email Detector

## Overview
An AI-powered phishing email detection system consisting of:

- Chrome Extension for scanning Gmail emails
- React Dashboard for displaying scan results
- Node.js + Express backend for email and URL analysis

---

## Project Structure

```
Intelligent-Phishing-Email-Detector
│
├── backend
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend
│   ├── extension
│   │   ├── manifest.json
│   │   ├── popup.js
│   │   ├── background.js
│   │   └── content.js
│   │
│   ├── src
│   ├── public
│   └── ...
```

---

## Frontend

- React + Vite
- Dashboard UI
- Risk Analysis
- Link Analysis
- History
- Recommendation Panel
- Statistics Cards

---

## Chrome Extension

- Gmail Email Scanner
- Email Extraction
- Link Detection
- Sends email data to backend

---

## Backend

- Express.js API
- Email Analysis
- URL Risk Analysis
- Risk Score Calculation

---

## Running the Project

### Backend

```
cd backend
npm install
node server.js
```

Runs on:

```
http://localhost:5000
```

### Frontend

```
cd frontend
npm install
npm run dev
```

### Chrome Extension

Load the **frontend/extension** folder as an unpacked extension in Chrome.
