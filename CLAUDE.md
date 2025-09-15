# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build` (uses Turbopack)
- **Start production server**: `npm start`
- **Lint code**: `npm run lint` (ESLint with Next.js rules)

## Project Architecture

This is a Next.js 15 project using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Structure
- **Source code**: All application code lives in `src/app/`
- **App Router**: Uses Next.js App Router with `layout.tsx` and `page.tsx` pattern
- **Styling**: Tailwind CSS v4 with CSS variables for theming in `src/app/globals.css`
- **Fonts**: Uses Next.js font optimization with Geist Sans and Geist Mono
- **Path aliases**: `@/*` maps to `./src/*` for cleaner imports

### Technology Stack
- Next.js 15.5.3 with Turbopack
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4 with PostCSS
- ESLint with Next.js configuration
- Supabase for backend services

### Styling System
- Custom CSS properties for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Tailwind v4 uses `@theme inline` for configuration
- Font variables configured in root layout

### Supabase Integration
- **Client**: Configured in `src/lib/supabase.ts`
- **Environment**: Variables stored in `.env.local`
- **Database Schema**: Full schema in `database-schema.sql`
- **Usage**: Import `supabase` from `@/lib/supabase` for database operations

### Application Architecture
This is a **mobile-first appointment booking system** with NFC integration and three user levels:

1. **Superuser** (`/a/admin`) - Generate tokens for business admins and clients
2. **Business Admin** (`/a/tokenKey=`) - Register business, manage appointments/services
3. **Final Client** (`/c/tokenKey=`) - Book appointments via NFC card links

### Key Features
- **Token-based registration** - Secure invitation system
- **NFC Integration** - Clients access via NFC cards
- **Customizable themes** - Each business gets branded landing pages
- **Mobile-optimized** - PWA-ready for smartphone usage

### Development Setup
- **Database**: Run `database-schema.sql` in Supabase to set up tables
- **Authentication**: Hybrid system (Supabase Auth + custom token auth)
- **Theming**: Dynamic CSS injection per business in `src/utils/theme.ts`