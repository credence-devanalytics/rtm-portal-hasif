import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('Initializing database connection...');

// Create a connection pool
const connectionString = process.env.DATABASE_URL;
console.log('Database URL pattern:', connectionString.replace(/:[^:@]*@/, ':***@'));

let sql, db;

try {
  sql = postgres(connectionString, { 
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    debug: false
  });

  // Create drizzle instance
  db = drizzle(sql);
  
  console.log('Database connection initialized successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

// Export the instances
export { db, sql };