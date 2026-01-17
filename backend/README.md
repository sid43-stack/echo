# Echo Backend

Production-ready Node.js backend for Echo - AI Emotional Companion.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration (especially `JWT_SECRET` for production).

## Development

Run the development server with hot reload:
```bash
pnpm dev
```

## Production

Build TypeScript:
```bash
pnpm build
```

Start the server:
```bash
pnpm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /auth/login` - Login (returns JWT token)
  - Body: `{ "email": "user@example.com", "password": "password123" }`
- `GET /auth/me` - Get current user (requires authentication)
  - Header: `Authorization: Bearer <token>`

## Project Structure

```
src/
 ├─ server.ts          # Server entry point
 ├─ app.ts             # Express app configuration
 ├─ routes/            # API routes
 ├─ middleware/        # Express middleware
 ├─ config/           # Configuration
 └─ utils/            # Utilities
```

