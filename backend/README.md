# Echo Backend

Production-ready Node.js backend for Echo — AI Emotional Companion. Users, JWT auth, AI providers (OpenAI chat + Google Cloud voice), health pipeline; no mocks.

## Environment Variables

**Required:**

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing (use a long random string in production)
- `OPENAI_API_KEY` — OpenAI API key for chat (GPT-4.1)
- `GOOGLE_PROJECT_ID` — Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS` — Path to Google Cloud service account JSON

**Optional:**

- `JWT_EXPIRES_IN` (default `7d`)
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `NODE_ENV` (default `development`)
- `PORT` (required for deployment, default `3000`)

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment:**

   Edit `.env` with your `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `PORT`.

3. **Push database schema:**

   ```bash
   pnpm run db:push
   ```

4. **Run in development:**

   ```bash
   pnpm run dev
   ```

5. **Build for production:**

   ```bash
   pnpm run build
   pnpm start
   ```

## API Endpoints

### Auth

- `POST /auth/register` — Body: `{ "username", "email", "password" }` → `{ user, token }`
- `POST /auth/login` — Body: `{ "email", "password" }` → `{ user, token }`

### Chat (Protected)

- `POST /chat/send` — Body: `{ "message" }` → AI provider responds; returns `{ userMessage, assistantMessage }`
- `GET /chat/history?limit=20` — Returns user-scoped chat history

### Call (Protected)

- `POST /call/start` → Creates call session; returns `{ id, status, startedAt, endedAt }`
- `POST /call/end` — Body: `{ "callId" }` → Ends call session
- `GET /call/status/:callId` → Get single call status
- `GET /call/logs?limit=50` → Get user call logs (ended calls only)

### Health Data (Protected)

- `POST /health/log` — Body: `{ "activityMinutes", "sleepHours", "stressLevel", "moodScore", "socialMinutes" }` → Log health entry
- `GET /health/history?limit=30` — Returns user health history
- `GET /health/trends` — Returns computed health trends (7-day aggregates)

### System

- `GET /system/info` — Returns server info (Node version, uptime, etc.)
- `POST /system/clear-data` — Clears all user data (chat, health, calls) for the authenticated user

## Architecture

```
backend/
 ├─ src/
 │  ├─ ai/             # AI provider integrations (OpenAI, Google Cloud)
 │  ├─ auth/           # JWT auth service
 │  ├─ config/         # Environment configuration
 │  ├─ db/             # Drizzle ORM schema and connection
 │  ├─ engines/        # Core business logic (chat, call, health, safety, session)
 │  ├─ middleware/     # Auth middleware and error handlers
 │  ├─ routes/         # Express route handlers (auth, chat, call, health, system)
 │  ├─ utils/          # Logger, etc.
 │  ├─ app.ts          # Express app setup
 │  └─ server.ts       # Server entry point
 ├─ package.json
 ├─ tsconfig.json
 └─ .env
```

## AI Provider Details

### Chat Provider (OpenAI)
- Model: GPT-4.1 (configurable via `OPENAI_MODEL`)
- Graceful error handling with fallback messages
- Concise, empathetic responses

### Voice Providers (Google Cloud)
- **STT**: Google Cloud Speech-to-Text API
- **TTS**: Google Cloud Text-to-Speech API (Neural2 voices)
- Service account authentication via `GOOGLE_APPLICATION_CREDENTIALS`

## Safety

- Input keyword scanning (no LLM escalation yet)
- Session pause + rate limiting
- User-scoped data isolation
- Centralized error handling (no server crashes)
