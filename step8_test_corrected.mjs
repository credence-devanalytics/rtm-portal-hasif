import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, text, serial, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

console.log('🧪 Step 8: Testing with corrected schema...\n');

// Corrected schema (matching actual database)
const marketingChannelByYear = pgTable("marketing_channel_byyear", {
  id: serial().primaryKey().notNull(),
  saluran: text(),
  groupby: text(),
  year: integer(),
  value: doublePrecision(),
  report_type: text("report_type"),
  report_title: text("report_title"),
});

async function testCorrectedSchema() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);
    
    console.log('Testing query with corrected schema...');
    const currentYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2024),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    console.log('✅ Query successful!');
    console.log('Records found:', currentYearData.length);
    console.log('\nData:');
    currentYearData.forEach(item => {
      console.log(`  - ${item.saluran}: RM ${item.value?.toLocaleString()}`);
    });
    
    // Test the full API logic
    console.log('\n📊 Testing full calculation...');
    
    const previousYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2023),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    const previousYearMap = {};
    previousYearData.forEach(item => {
      previousYearMap[item.saluran] = item.value || 0;
    });

    const saluranMetrics = currentYearData.map(item => {
      const currentValue = item.value || 0;
      const previousValue = previousYearMap[item.saluran] || 0;
      
      let percentageChange = 0;
      if (previousValue > 0) {
        percentageChange = ((currentValue - previousValue) / previousValue) * 100;
      }

      return {
        saluran: item.saluran,
        currentValue: currentValue,
        previousValue: previousValue,
        change: percentageChange.toFixed(1) + '%'
      };
    });

    console.log('\n✓ Calculated metrics:');
    saluranMetrics.forEach(m => {
      console.log(`  ${m.saluran}: RM ${m.currentValue.toLocaleString()} (${m.change})`);
    });

    const totalCurrent = saluranMetrics.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPrevious = saluranMetrics.reduce((sum, item) => sum + item.previousValue, 0);
    console.log(`\n✓ Total Current: RM ${totalCurrent.toLocaleString()}`);
    console.log(`✓ Total Previous: RM ${totalPrevious.toLocaleString()}`);
    
    await pool.end();
    console.log('\n✅ Step 8 Complete: Schema fix successful!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    process.exit(1);
  }
}

testCorrectedSchema();
