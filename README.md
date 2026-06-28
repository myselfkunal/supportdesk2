# SupportDesk

AI-powered customer query manager for merchants and small business teams. Built with Next.js 16, SQLite, and Groq AI.

## Features

- **Compose** — Paste customer messages, get AI-powered classification (category, priority, sentiment) and a reply draft
- **Inbox** — Browse all saved queries with expandable details and delete capability
- **Analytics** — KPI cards, category bar chart, priority and sentiment breakdowns

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router, TypeScript)
- **Tailwind CSS** — dark theme UI
- **SQLite** via `@libsql/client` — zero-config, file-based database
- **Groq SDK** — AI classification and reply generation (`llama-3.1-8b-instant`)
- **Lucide React** — icons

## Setup

```bash
git clone <repo>
cd xatpat-support-2
npm install
cp .env.local.example .env.local
```

Add your Groq API key to `.env.local`:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com).

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

- No Docker, no migrations, no external database required.
- The SQLite database file (`data/support.db`) is created automatically on the first API call.
- AI calls have keyword-based fallbacks — the app never crashes if Groq is down or the API key is missing.
- Dynamic route params use `await context.params` (Next.js 16 convention).

## Project Structure

```
app/
├── api/
│   ├── analyze/route.ts       # POST — classify & generate reply
│   └── queries/
│       ├── route.ts            # GET/POST — list & create queries
│       └── [id]/route.ts       # PATCH/DELETE — update & delete
├── components/
│   ├── Header.tsx              # Sticky nav tabs
│   ├── ComposeTab.tsx          # Message input, analysis, reply editor
│   ├── InboxTab.tsx            # Saved queries list
│   ├── AnalyticsTab.tsx        # KPIs & charts
│   ├── ClassificationCards.tsx # Category/priority/sentiment badges
│   ├── Badge.tsx               # Reusable colored pill
│   ├── QueryRow.tsx            # Expandable inbox row
│   └── Toast.tsx               # Green notification
├── layout.tsx
├── page.tsx                    # Tab router
├── globals.css
lib/
├── types.ts                    # Shared interfaces
├── db.ts                       # SQLite singleton & CRUD
└── ai.ts                       # Groq AI + fallback heuristics
data/
└── support.db                  # Auto-created SQLite file