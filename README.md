<div align="center">
  <h1>✨ Persona ✨</h1>
  <p><strong>A persona-driven chat demo that pairs clear UX with modular AI backends.</strong></p>
  <p>Switch voices, keep conversation threads, and run the app locally using the built-in API route or the legacy Express server.</p>
</div>

---

## Overview

Persona is a full-stack chat application that demonstrates persona-based prompts, conversational history, and a smooth client experience. The project ships a Next.js front end and an optional Express backend. The app can either call the Next API route (`/api/chat`) or the legacy Express endpoint; modern usage prefers the Next route.

The UI emphasizes readability and motion: dark-mode styling with Tailwind, subtle animations, and a streaming-like message reveal for a natural conversational feel.

## Key Features

- Persona-driven prompts: each persona has a tailored system prompt and style (see `backend/personas.js`).
- Multiple threads per persona with local persistence so conversations remain between sessions.
- Clean dark theme and animated UI using Framer Motion and Tailwind.
- Two server options: a Next.js API route that forwards to OpenRouter (recommended), and a legacy Express server that can stream responses via SSE.
- Simple configuration: provide an API key for your chosen model provider and run the client and (optionally) the backend.

## Tech Stack

### Frontend (`/client`)
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Animations: Framer Motion
- Language: TypeScript / React

### Backend
- Primary: Next.js API route at `/api/chat` (forwards requests to OpenRouter by default).
- Legacy: Express server in `/backend` that supports SSE-based streaming (kept for reference and compatibility).
- Persona storage: `backend/personas.js` contains the system prompts used for each persona.

---

## Getting Started

These steps will get the app running locally. The project has two runnable parts; the modern flow uses the Next API route and needs only the `client` app.

### Prerequisites

- Node.js v18+ (or current LTS)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Persona
```

### 2. Configure environment variables

- For the Next API route (recommended): create `client/.env.local` and add your OpenRouter key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Optional: NEXT_BACKEND_API can be left empty; don't set it to the legacy http://localhost:5000 fallback.
```

- If you plan to run the legacy Express backend, create a `.env` in the project root or `backend/.env` and provide any keys expected by that server (the legacy README references Gemini; adapt as needed).

### 3. Run the client (Next.js)

```bash
cd client
npm install
npm run dev
```

The Next dev server will expose the app (default port 3000). If the app still calls `http://localhost:5000`, stop the dev server, remove `.next`, ensure `NEXT_BACKEND_API` is unset or empty, and restart the dev server.

### 4. (Optional) Run the legacy Express backend

```bash
cd backend
npm install
npm run dev
```

This starts the Express server (default port 5000) which implements an SSE streaming endpoint. Use this only if you need streaming from the legacy server.

---

## How It Works

1. Persona selection on the client chooses a system prompt from `backend/personas.js`.
2. The client builds a message history and POSTs it to the Next API route (`/api/chat`) which injects the persona prompt and forwards the request to the configured model provider (OpenRouter by default).
3. The API returns the assistant reply (non-streaming). When using the legacy Express server, responses can be streamed via SSE for a typewriter effect.
4. The client appends replies to the active thread and persists threads to `localStorage` so conversations survive page reloads.

---

Files of interest: `client/app/api/chat/route.js`, `client/app/components/ChatClient.tsx`, `backend/personas.js`, and `client/next.config.ts`.

---
