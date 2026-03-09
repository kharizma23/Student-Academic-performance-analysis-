# 🎯 Student Academic Performance Analysis & Platform

An advanced, AI-powered ecosystem designed to track, analyze, and optimize student academic development through a professional **Client-Server Architecture**.

---

## 🏗️ Architecture Overview

The project is strictly classified into two primary divisions to ensure separation of concerns, scalability, and maintainability:

### 🌐 Frontend (Client)
A modern, responsive dashboard built with **Next.js 14**, providing a premium user experience with:
- **Student Interface**: Real-time progress tracking, gamified XP systems, and personalized roadmaps.
- **Faculty Dashboard**: Detailed student analytics, performance heatmaps, and feedback modules.
- **Micro-Animations**: Glassmorphism and dynamic transitions for a premium "WOW" factor.

### ⚙️ Backend (Server)
A high-performance **FastAPI** engine handling all intelligence and data operations:
- **AI Daily Roadmap**: Dynamic goal-based task generation.
- **Performance Analytics**: Automated CGPA prediction and risk probability scores.
- **Faculty Feedback System**: Detailed 25-metric evaluation for every student.

---

## 📂 Project Structure

```bash
StudentAcademicPlatform/
├── client/                 # Frontend - Next.js Application
│   ├── app/                # Application routes and pages
│   │   ├── student/        # Student Dashboard & Features
│   │   ├── admin/          # Institutional Administration
│   │   └── faculty/        # Faculty Grading & Feedback
│   ├── components/         # Reusable UI Components (StatCards, Modals)
│   └── lib/                # Utility functions and API clients
│
├── server/                 # Backend - FastAPI Application
│   ├── app/                # Core Application Logic
│   │   ├── routers/        # API Endpoints (Student, Admin, Faculty)
│   │   ├── models.py       # SQLAlchemy ORM Data Models
│   │   └── schemas.py      # Pydantic Data Validation
│   ├── student_platform.db # Demo Database (Pre-filled with 23k+ records)
│   └── main.py             # Server Entry Point
│
├── docker-compose.yml      # Orchestration for Client, Server, DB, & Redis
└── README.md               # Documentation
```

---

## 🚀 Key Features

- **✅ Smart Adaptive Logic**: Uncompleted tasks automatically carry over, maintaining academic momentum.
- **📊 Detailed Faculty Evaluations**: Every student includes 6-7 demo feedback entries from specific faculty members across 25 metrics.
- **✨ XP & Streak System**: Gamified productivity tracking to keep students engaged.
- **🗺️ 100-Day Progress Map**: A visual roadmap indicating task completion and skill gaps.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: FastAPI, SQLAlchemy, SQLite (for demo), Pydantic.
- **Infrastructure**: Docker, Docker Compose.

---

## 🚦 Getting Started

### 1. Run via Docker
```bash
docker-compose up --build
```

### 2. Manual Start
**Server:**
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Client:**
```bash
cd client
npm install
npm run dev -- -p 3001
```

---
*Developed with focus on Academic Excellence and AI-Driven Insights.*
