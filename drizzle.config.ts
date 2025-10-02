import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env.local first, then .env
config({ path: '.env.local' });
config({ path: '.env' });

// Debug: Check if environment variable is loaded
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 20) + '...');
}

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
