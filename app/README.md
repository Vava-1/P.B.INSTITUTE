# Pacemaker Institute

A full-stack web application for Pacemaker Institute, a vocational training center in Kigali, Rwanda.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS, shadcn/ui
- **Backend:** Hono, tRPC v11, Drizzle ORM, MySQL
- **Auth:** OAuth 2.0 with JWT sessions
- **Payments:** MTN MoMo API integration

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

## Project Structure

```
app/
├── api/          # Backend API (Hono + tRPC)
├── contracts/    # Shared types and constants
├── db/           # Database schema and migrations
├── public/       # Static assets
└── src/          # Frontend React application
    ├── components/  # UI components
    ├── hooks/       # Custom hooks
    ├── pages/       # Route pages
    └── providers/   # tRPC provider
```
