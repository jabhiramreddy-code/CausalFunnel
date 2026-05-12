# CausalFunnel User Analytics Application

A full-stack user analytics and session tracking application — tracking user interactions on a webpage and displaying them in a real-time dashboard.

> **Live Demo**: [Dashboard →](https://YOUR_PROJECT.vercel.app) · [Backend API →](https://YOUR_PROJECT.onrender.com/health)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Tracking Script | Vanilla JS (IIFE, `sendBeacon`) |
| Backend | Node.js · Express 4 |
| Database | MongoDB Atlas (Mongoose) |
| Frontend | React 18 · Vite · shadcn/ui · Tailwind CSS |
| Routing | React Router v6 |
| Hosting | Vercel (frontend) · Render (backend) |

---

## Features

- **Session Tracking** — unique session IDs stored in `localStorage`, persistent across page reloads
- **Event Capture** — `page_view` on load, `click` with (x, y) coordinates
- **Sessions Dashboard** — table of all sessions with event counts, first/last seen; click any row to see the full user journey timeline
- **Click Heatmap** — select any tracked page URL and visualize click density with a color-scaled (blue → red) radial heatmap
- **Skeleton loading** — shimmer placeholders while data fetches
- **Error handling** — retry buttons on every failed fetch
- **Reusable architecture** — `useApi` hook, centralized `api.js`, shared UI components

---

## Project Structure

```
CausalFunnel/
├── backend/            # Express API
│   ├── models/         # Mongoose schema
│   ├── routes/         # events, sessions, heatmap
│   ├── db.js           # MongoDB Atlas connection
│   └── server.js       # Entry point
├── frontend/           # React + Vite dashboard
│   └── src/
│       ├── api.js      # All API calls (single source)
│       ├── hooks/      # useApi — reusable fetch hook
│       ├── components/ # Layout, StatCard, EventTimeline, HeatmapCanvas…
│       ├── components/ui/ # shadcn primitives (Button, Card, Table, Badge…)
│       └── pages/      # SessionsPage, HeatmapPage
└── demo-page/          # Sample webpage with tracker.js embedded
```

---

## Setup

### Prerequisites
- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free M0 cluster)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/causalfunnel-analytics.git
cd causalfunnel-analytics
```

### 2. Backend

```bash
cd backend
npm install

# Create your .env from the template
cp .env.example .env
# Fill in your MongoDB Atlas URI and frontend URL
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/causalfunnel?retryWrites=true&w=majority
PORT=4000
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev     # starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:4000`, so no CORS config needed locally.

### 4. Demo Page

Open `demo-page/index.html` with a Live Server (VS Code extension) or any static file server.  
Click around the page — events will appear in the Sessions dashboard immediately.

---

## Deployment

### MongoDB Atlas
1. Create a free M0 cluster at [atlas.mongodb.com](https://atlas.mongodb.com)
2. Add a database user and whitelist `0.0.0.0/0` (allow all IPs) for Render
3. Copy your connection string

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend/`
4. Build command: `npm install`, Start command: `node server.js`
5. Add environment variables:
   - `MONGODB_URI` — your Atlas URI
   - `FRONTEND_URL` — your Vercel URL (add after deploying frontend)

### Frontend → Vercel
1. Create a new project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variable:
   - `VITE_API_URL` — `https://YOUR_RENDER_APP.onrender.com/api`
4. Deploy

### Demo Page → Update tracker URL
In `demo-page/index.html`, update the `data-api` attribute:
```html
<script src="tracker.js" data-api="https://YOUR_RENDER_APP.onrender.com"></script>
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/events` | Ingest a tracking event |
| `GET` | `/api/sessions` | List all sessions with event counts |
| `GET` | `/api/sessions/:id` | Get ordered event journey for a session |
| `GET` | `/api/heatmap?url=<url>` | Click coordinates for a page |
| `GET` | `/api/heatmap/urls` | All tracked page URLs |
| `GET` | `/health` | Server health check |

---

## Assumptions & Trade-offs

- **No authentication** — the API is open; for production, add JWT or API key auth
- **Viewport coordinates** — click (x, y) are `clientX/clientY` (relative to viewport, not document); the heatmap normalizes against a fixed 1440×900 reference
- **No real-time updates** — the dashboard is polling on page load; WebSockets could be added for live tracking
- **MongoDB free tier** — Atlas M0 has 512MB storage limit, sufficient for demo purposes
- **CORS** — origins are allowlisted; update `FRONTEND_URL` env var when deploying
