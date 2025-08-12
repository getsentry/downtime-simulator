# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js 14 application for simulating temporary downtime based on hostname. It uses Vercel KV for storage, Prisma for database management, and integrates with Sentry for error tracking. The app allows setting different HTTP status codes (404, 500) for specific hostnames for a specified duration.

## Development Commands

**Note: This project uses pnpm as the package manager.**

### Local Development
```bash
# Install dependencies
pnpm install

# Run development server (default)
pnpm run dev

# Run with specific hostname (for testing multiple instances)
DIR=.next-1 pnpm run dev -- -H downtime-simulator.local
DIR=.next-2 pnpm run dev -- -H test1.downtime-simulator.local

# Build production
pnpm run build

# Start production server
pnpm start

# Lint
pnpm run lint

# TypeScript checking (no explicit typecheck command - use tsc directly)
pnpm exec tsc --noEmit
```

### Database & Storage
```bash
# Generate Prisma client (runs automatically on postinstall)
pnpm exec prisma generate

# Run Redis and serverless-redis-http for local KV storage
docker-compose up

# Database migrations
pnpm exec prisma migrate dev
```

## Architecture

### Core Functionality
- **Middleware** (`src/middleware.ts`): Intercepts requests and rewrites URLs based on hostname. Routes non-root hostnames to the `[host]` dynamic route.
- **Dynamic Host Pages** (`src/app/[host]/page.tsx`): Checks KV storage for host status and returns appropriate response (404, 500, or normal).
- **Server Actions** (`src/app/actions.tsx`): Handles creating downtime by setting status in KV storage with expiration.
- **Main Form** (`src/components/simulator-form.tsx`): UI for setting downtime status for configured hosts.

### Key Dependencies
- **Next.js 14**: Using App Router with server components and server actions
- **Vercel KV**: Redis-based key-value storage for host status
- **Prisma**: ORM for PostgreSQL database (Post model defined but primarily used for testing 500 errors)
- **Sentry**: Error tracking and performance monitoring with custom tunnel route at `/monitoring`
- **Tailwind CSS + shadcn/ui**: Styling and UI components

### Environment Configuration
Required environment variables (see `.env.example`):
- `KV_REST_API_*`: Vercel KV connection details
- `DOWNTIME_SIMULATOR_ROOT_HOSTNAME`: Main hostname for admin interface
- `NEXT_PUBLIC_DOWNTIME_SIMULATOR_HOSTS`: Comma-separated list of testable hostnames
- `DATABASE_URL`: PostgreSQL connection string for Prisma
- `SENTRY_*`: Sentry configuration for error tracking

### Deployment
- Uses standalone output mode for optimized Docker deployments
- Dockerfile provided for containerized deployment
- Multiple Next.js instances can run locally using different `DIR` environment variable

## Testing Setup

To test locally, add entries to `/private/etc/hosts`:
```
127.0.0.1 downtime-simulator.local
127.0.0.1 test1.downtime-simulator.local
127.0.0.1 test2.downtime-simulator.local
```

Then configure `.env.development.local` with appropriate hostnames and run multiple instances as shown in development commands.