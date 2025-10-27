import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking actual table columns...\n');
    
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'marketing_channel_byyear'
      ORDER BY ordinal_position;
    `);
    
    console.log('✓ Actual columns in marketing_channel_byyear:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
