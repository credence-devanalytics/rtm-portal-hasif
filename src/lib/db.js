import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let sql, db;

// Function to initialize database connection
function initializeDatabase() {
  if (sql && db) {
    return { sql, db };
  }

  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Initializing database connection...');
  const connectionString = process.env.DATABASE_URL;
  console.log('Database URL pattern:', connectionString.replace(/:[^:@]*@/, ':***@'));

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

  return { sql, db };
}

// Export lazy initialization functions
export function getDb() {
  if (!db) {
    initializeDatabase();
  }
  return db;
}

export function getSql() {
  if (!sql) {
    initializeDatabase();
  }
  return sql;
}

// For backward compatibility
export { db as db, sql as sql };