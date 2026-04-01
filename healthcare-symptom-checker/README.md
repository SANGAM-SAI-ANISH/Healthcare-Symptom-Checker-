# Healthcare Symptom Checker

Educational assignment: **symptom text in** → **probable conditions and recommended next steps** out, with **safety disclaimers**. Uses **React** (optional UI), **Express** API, **Anthropic Claude** for reasoning, and an **optional** local history file (`symptom_queries.json`).

**Not medical advice.** For coursework / learning only.

---

## Assignment scope (per spec)

| Requirement | How this project meets it |
|-------------|---------------------------|
| Input: symptom text | Form + `POST /api/check-symptoms` |
| Output: probable conditions + next steps | LLM JSON → conditions, recommendations, summary, red flags |
| Optional frontend | React + Vite |
| Backend API + LLM | Express + Claude |
| Optional storage for queries/history | JSON file + `/api/history` |
| LLM guidance (conditions, next steps, **educational disclaimer**) | System prompt asks for disclaimer + structured JSON |

---

## Submission checklist (per course guidelines)

Before you submit:

- [ ] **GitHub:** `main` branch, **public** repo, within size limits (or use an allowed alternative such as Google Drive per instructions).
- [ ] **Do not commit:** `node_modules/`, `.env`, build folders (`dist/`, `build/`, `out/`, `.next/`), editor folders (`.vscode/`, `.idea/`), or local history (`symptom_queries.json`). This repo’s `.gitignore` is set up for that—verify before `git push`.
- [ ] **Deliverables:** repository link + this **README** + **demo video** (record separately; not stored in the repo).
- [ ] **Run:** grader can `npm install` in `backend` and `frontend`, set `backend/.env`, start API then UI.

---

## Tech stack

| Part | Stack |
|------|--------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express, `cors`, `dotenv` |
| LLM | `@anthropic-ai/sdk` (Claude) |
| Optional history | JSON file on disk |

Dependencies are limited to what the assignment needs (no extra runtime packages beyond API + server basics).

---

## Project layout

```
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── index.html
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Setup

**Prerequisites:** Node.js 18+, npm, [Anthropic API key](https://console.anthropic.com/).

**1. Install**

```bash
cd backend && npm install
cd ../frontend && npm install
```

**2. Environment**

Copy `backend/.env.example` to `backend/.env` and set:

```
ANTHROPIC_API_KEY=your_real_key
PORT=5001
```

**3. Run**

Start the **backend** first, then the **frontend**.

```bash
# Terminal 1
cd backend
npm start
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Open **http://localhost:3000**. In development, Vite proxies `/api` to **http://127.0.0.1:5001**. If you change `PORT` in `backend/.env`, set the same port in `frontend/vite.config.js` → `server.proxy["/api"].target`.

---

## API (summary)

| Method | Path | Purpose |
|--------|------|--------|
| POST | `/api/check-symptoms` | Body: `symptoms` (required); optional `age`, `gender`, `duration` |
| GET | `/api/history` | Past queries (optional history feature) |
| GET | `/api/history/:id` | One query |
| DELETE | `/api/history/:id` | Delete one query |
| GET | `/api/health` | Health check |

---


