# Sales OS

Sales OS is a lightweight CRM and sales operations dashboard built with Next.js and Airtable.
It provides teams with role-based visibility into leads, opportunities, activities, tasks, weekly reviews, and stage movement.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS for UI styling
- Airtable as the operational data store
- JWT + HTTP-only cookie authentication

## Core Features

- **Authentication**: email/password login with JWT session cookies and protected routes.
- **Role-aware access**:
  - `founder` can view full data and team management pages.
  - `field_sales` / `inside_sales` primarily see their assigned records.
- **Sales workflow modules**:
  - Leads management
  - Opportunities and stage-based forecasting
  - Activities logging
  - Task tracking with overdue status
  - Weekly reviews
  - Stage history tracking for deal progression analytics
- **Dashboard analytics**:
  - Pipeline value and weighted forecast
  - Active/won deal snapshots
  - Recent activities and upcoming tasks
  - Founder-only rep performance table

## Data Model (Airtable)

The app expects these Airtable tables:

- `Users`
- `Leads`
- `Opportunities`
- `Activities`
- `Tasks`
- `Weekly Reviews`
- `Stage History`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base_id
JWT_SECRET=your_secret
```

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000/setup` once to create the initial founder account.

## Scripts

- `npm run dev` — start local development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
