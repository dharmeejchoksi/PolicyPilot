# 🏛️ PolicyPilot — AI-Powered Government Scheme Navigator

> **IAR Udaan Hackathon 2026** | Team Dharmee

PolicyPilot is an AI-powered platform that helps Indian citizens discover, understand, and apply for government welfare schemes. It uses RAG-based matching over official PDFs, detects Central vs. State policy conflicts, and auto-fills application forms — all through a citizen-friendly interface with voice input and Hindi support.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 **AI Scheme Matching** | Describe your situation (text or voice) → get matched to eligible schemes with % scores |
| ⚡ **Conflict Detection** | Automatically flags contradictions between Central and State scheme criteria |
| 📝 **Form Auto-Fill** | Pre-fills application forms from uploaded documents with source attribution |
| 🔐 **Secure Auth** | Phone+OTP, DigiLocker integration, or Guest access |
| 🗣️ **Voice Input** | Low-latency voice-to-text in English, Hindi, and Gujarati |
| 🌐 **Bilingual** | Full Hindi (हिंदी) support across all pages |
| 📊 **Admin Dashboard** | Analytics, live activity feed, PDF manager, system health monitoring |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS v4, Framer Motion, Vite |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | SQLite (users, OTPs, sessions, query logs) |
| **AI/NLP** | RAG pipeline, keyword matching, conflict detection engine |
| **Voice** | Web Speech API (browser-native) |
| **Auth** | OTP-based (6-digit, 5-min expiry), DigiLocker simulation |

---

## 📁 Project Structure

```
PolicyPilot/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx     # Phone+OTP / DigiLocker / Guest login
│   │   │   ├── Landing.jsx      # Citizen input (voice, categories, state, docs)
│   │   │   ├── Results.jsx      # Matched schemes with scores
│   │   │   ├── SchemeDetail.jsx  # Eligibility, steps, auto-filled form
│   │   │   ├── Conflicts.jsx    # Central vs State comparison
│   │   │   ├── AdminLogin.jsx   # Admin portal login
│   │   │   └── Dashboard.jsx    # Analytics, activity feed, PDF manager
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Auth-aware navbar with language toggle
│   │   │   ├── Footer.jsx       # Government-grade footer
│   │   │   └── LoadingScreen.jsx # Animated AI processing screen
│   │   ├── context/
│   │   │   └── AppContext.jsx   # Global state + auth
│   │   └── index.css            # Design system
│   └── vite.config.js
│
├── backend/                     # FastAPI server
│   ├── main.py                  # API endpoints (match, auth, form-fill, stats)
│   ├── database.py              # SQLite ORM (users, OTPs, sessions, logs)
│   ├── schemes_data.py          # 41 schemes across 4 categories
│   ├── conflict_detector.py     # Central vs State conflict engine
│   ├── form_filler.py           # Auto-fill with source tracking
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.9+

### 1. Clone the repo
```bash
git clone https://github.com/dharmeejchoksi/PolicyPilot.git
cd PolicyPilot
```

### 2. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
> The SQLite database (`policypilot.db`) is auto-created on first run.

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
> Opens at `http://localhost:5173` — API calls are proxied to port 8000.

---

## 🎯 Demo Scenarios

### 1. Farmer in Gujarat
> *"I am a 45-year-old farmer in Gujarat with 2 acres of land and annual income below ₹1.5 lakh"*
- Select: Agriculture → Gujarat
- **Expected:** PM-KISAN, PMFBY matched | 2 Central vs State conflicts detected

### 2. SC Student in Delhi
> *"SC student pursuing B.Tech in Delhi"*
- Select: Education → Delhi
- **Expected:** NSP, Post-Matric Scholarship matched

### 3. Voice Input (Hindi)
- Switch language to हिंदी
- Use microphone: *"मैं एक किसान हूँ गुजरात से"*
- **Expected:** Same matching with Hindi output

---

## 📸 Screenshots

### Auth Page
Split-screen design with Phone+OTP (demo OTP shown), DigiLocker, and Guest access.

### Landing Page
Voice input, category chips, state selector, document upload, and animated pipeline.

### Results Page
Matched schemes with % scores, eligibility reasoning, and conflict alert banners.

### Admin Dashboard
Donut chart, sparkline analytics, live activity feed, PDF manager, and system health.

---

## 🔒 Auth Flow

```
Phone → Send OTP (6-digit, stored in SQLite) → Verify → Session token → Protected routes
         ↓ Demo Mode: OTP shown in green banner
DigiLocker → Simulate connect → Auto-fetch documents → Session
Guest → Limited access (no form auto-fill)
```

---

## 📊 Database Schema

| Table | Purpose |
|---|---|
| `users` | Phone, auth method, timestamps |
| `otps` | 6-digit codes with 5-min expiry |
| `sessions` | Token-based auth sessions |
| `query_logs` | Every citizen search (for dashboard analytics) |

---

## 🤝 Team Dharmee

Built for **IAR Udaan Hackathon 2026** — solving the problem of citizens missing out on government welfare schemes due to information asymmetry, policy conflicts, and complex application processes.

---

## 📄 License

This project is built for hackathon demonstration purposes.
