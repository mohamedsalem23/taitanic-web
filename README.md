# RMS Titanic — Passenger Survival & Manifest Risk Engine

A full-stack predictive web platform transforming the 1912 RMS Titanic passenger records into an actuarial survival estimation and historical risk appraisal engine.

Built with **Next.js (App Router, React 19, TypeScript)** on the frontend and **FastAPI (Python 3.12, Scikit-Learn)** on the backend, prepared for seamless deployment on **Vercel**.

---

## 🏛️ Project Structure

```text
taitanic-web/
├── backend/
│   ├── main.py                  # FastAPI application with CORS and Pydantic validation
│   ├── model.py                 # Scikit-learn Random Forest model loader and feature pipeline
│   ├── titanic_pipeline.pkl     # Pre-trained ML pipeline model
│   ├── requirements.txt         # Python backend dependencies
│   ├── api/
│   │   └── index.py             # Entry point for Vercel Python Serverless runtime
│   └── vercel.json              # Standalone Vercel deployment configuration for backend
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── predict/route.ts # Next.js API route (FastAPI proxy + fallback engine)
│   │   │   ├── presets/route.ts # Historical passenger profiles endpoint
│   │   │   └── stats/route.ts   # 1912 voyage disaster benchmark stats
│   │   ├── components/
│   │   │   └── Icons.tsx        # Authored maritime & nautical SVG vector icons (Zero AI badges)
│   │   ├── globals.css          # Maritime dark design system, CSS variables & typography tokens
│   │   ├── layout.tsx           # Editorial serif typography (Cormorant Garamond) + Inter
│   │   ├── page.module.css      # Component-level CSS module with responsive layout
│   │   └── page.tsx             # Interactive passenger manifest appraisal workspace
│   ├── .env.example             # Environment variables template
│   ├── .env.local               # Local development backend URL
│   ├── package.json             # Next.js dependencies
│   └── vercel.json              # Frontend Vercel configuration
├── vercel.json                  # Root monorepo Vercel configuration
└── README.md
```

---

## 🚀 Running Locally

### 1. Start the FastAPI Backend
Open a terminal inside `taitanic-web/backend`:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
The API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start the Next.js Frontend
In a second terminal inside `taitanic-web/frontend`:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

### Option A: Monorepo Deployment (Recommended)
1. Push your repository to GitHub.
2. In the Vercel Dashboard, click **New Project** and import your repository.
3. In **Project Settings**:
   - **Root Directory**: Leave as `./` or select `taitanic-web/frontend`
   - **Framework Preset**: `Next.js`
4. If deploying the frontend separately and hosting the backend on Render/Railway/Fly.io:
   - Add environment variable: `BACKEND_API_URL=https://your-backend-url.com`
5. Click **Deploy**.

### Option B: Built-in Resilient Fallback
The Next.js frontend includes an integrated statistical fallback engine mirroring the trained Random Forest model's decision boundaries. If the external Python backend is offline or waking up, the interface continues to operate smoothly without downtime.

---

## 🎨 Design Philosophy (/impeccable)
- **Authentic Maritime Identity**: 1912 White Star Line archival typography and deep oceanic midnight tones.
- **Zero AI Clichés**: No stars, sparkles, robots, or magic wands. All visuals are custom nautical and statistical SVG vectors.
- **Historical Passenger Manifests**: One-click historical presets (*Lady Duff-Gordon*, *Col. Archibald Gracie*, *Lawrence Beesley*, *Eva Hart*, *Olaus Abelseth*, *Sage Family*).
- **Evacuation Factor Attribution**: Explains *why* the passenger is predicted to survive or perish (gender protocol priority, deck proximity, family friction, age).
