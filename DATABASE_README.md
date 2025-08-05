# Database Setup with Drizzle ORM

This project uses Drizzle ORM with PostgreSQL for data management.

## Prerequisites

1. PostgreSQL database (local or remote)
2. Node.js and pnpm installed

## Setup Instructions

### 1. Environment Configuration

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the `DATABASE_URL` in `.env.local` with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 2. Database Schema

The database schema is defined in `src/lib/db/schema.js` and includes:

- **users**: User management table
- **mentions**: Social media mentions with sentiment analysis data

### 3. Database Migration

Generate and run migrations:

```bash
# Generate migration files
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# Or run migrations (for production)
pnpm db:migrate
```

### 4. Seed Database

Populate the database with sample data:

```bash
pnpm db:seed
```

This will:
- Create sample users
- Import data from CSV files in `public/data/` if available
- Create sample mentions if CSV files are not found

### 5. Database Studio

Open Drizzle Studio to view and manage your data:

```bash
pnpm db:studio
```

## Available Scripts

- `pnpm db:generate` - Generate migration files from schema
- `pnpm db:push` - Push schema changes to database (development)
- `pnpm db:migrate` - Run migrations (production)
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Seed database with sample data

## Database Queries

Pre-built queries are available in `src/lib/db/queries.js`:

- User management (create, read)
- Mentions CRUD operations
- Analytics queries for dashboard data
- Sentiment distribution
- Platform statistics
- Engagement metrics

## Usage in Components

```javascript
import { db } from '@/lib/db';
import { getAllMentions, getSentimentDistribution } from '@/lib/db/queries';

// In your API routes or server components
const mentions = await getAllMentions();
const sentimentData = await getSentimentDistribution();
```

## File Structure

```
src/lib/db/
├── index.js         # Database connection
├── schema.js        # Database schema definitions
└── queries.js       # Pre-built database queries

scripts/
└── seed.js          # Database seeding script

drizzle.config.js    # Drizzle configuration
```
