import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, varchar, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

console.log('🔍 Step 6: Testing the exact marketing API setup...\n');

// Define the schema inline (same as in drizzle/schema.ts)
const marketingChannelByYear = pgTable("marketing_channel_byyear", {
  id: serial().primaryKey().notNull(),
  report_type: varchar("report_type"),
  report_title: text("report_title"),
  saluran: varchar(),
  groupby: varchar(),
  year: integer(),
  value: varchar(),
  insertdate: timestamp({ mode: 'string' }),
  updatedate: timestamp({ mode: 'string' }),
});

async function testWithPool() {
  try {
    console.log('Testing with Pool (like src/index.ts)...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);
    
    console.log('✓ Pool created');
    console.log('✓ Drizzle initialized');
    
    // Test query
    console.log('\nTesting query...');
    const currentYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2024),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    console.log('✅ Query successful!');
    console.log('Records found:', currentYearData.length);
    console.log('Data:', JSON.stringify(currentYearData, null, 2));
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testWithPool();
