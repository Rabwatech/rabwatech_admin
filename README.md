# Rabwatech Admin Dashboard

Admin dashboard for managing leads, orders, services, offers, and assessments.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Run development server:
```bash
npm run dev
```

## Features

- Leads Management
- Orders Management
- Services Management
- Offers Management (Black Friday, etc.)
- Assessment Results
- Analytics Dashboard

## Design System

This project uses the same design system as the main Rabwatech project:
- Tailwind CSS with custom Arabic/English optimizations
- Shadcn/ui components
- Dark mode support
- RTL/LTR support

