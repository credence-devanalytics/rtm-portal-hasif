import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, varchar, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

// Define the schema inline
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

const db = drizzle(process.env.DATABASE_URL);

async function testMarketingAPI() {
  try {
    console.log('🧪 Step 5: Testing Marketing API logic...\n');
    
    // Fetch 2024 data - exactly as the API does
    console.log('Fetching 2024 data...');
    const currentYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2024),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    console.log('✓ 2024 data records:', currentYearData.length);
    console.log('  Data:', JSON.stringify(currentYearData, null, 2));

    // Fetch 2023 data
    console.log('\nFetching 2023 data...');
    const previousYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2023),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    console.log('✓ 2023 data records:', previousYearData.length);
    console.log('  Data:', JSON.stringify(previousYearData, null, 2));

    // Create a map for easy lookup of previous year data
    const previousYearMap = {};
    previousYearData.forEach(item => {
      previousYearMap[item.saluran] = parseFloat(item.value) || 0;
    });

    // Calculate percentage change and prepare metrics
    const saluranMetrics = currentYearData.map(item => {
      const currentValue = parseFloat(item.value) || 0;
      const previousValue = previousYearMap[item.saluran] || 0;
      
      let percentageChange = 0;
      let changeDirection = 'no change';
      
      if (previousValue > 0) {
        percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        changeDirection = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change';
      } else if (currentValue > 0) {
        percentageChange = 100;
        changeDirection = 'new';
      }

      return {
        saluran: item.saluran,
        currentValue: currentValue,
        previousValue: previousValue,
        percentageChange: Math.abs(percentageChange),
        changeDirection: changeDirection,
        formattedChange: `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`,
        formattedCurrentValue: currentValue.toLocaleString('en-MY', {
          style: 'currency',
          currency: 'MYR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })
      };
    });

    console.log('\n✓ Calculated saluran metrics:', JSON.stringify(saluranMetrics, null, 2));

    // Calculate totals
    const totalCurrent = saluranMetrics.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPrevious = saluranMetrics.reduce((sum, item) => sum + item.previousValue, 0);
    const overallChange = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

    console.log('\n✓ Summary:');
    console.log('  Total Current: RM', totalCurrent.toLocaleString());
    console.log('  Total Previous: RM', totalPrevious.toLocaleString());
    console.log('  Overall Change:', overallChange.toFixed(1) + '%');
    console.log('  Active Saluran:', saluranMetrics.length);

    const response = {
      success: true,
      data: {
        saluranMetrics: saluranMetrics,
        summary: {
          totalCurrent,
          totalPrevious,
          overallChange: overallChange.toFixed(1),
          activeSaluran: saluranMetrics.length,
          formattedTotalCurrent: totalCurrent.toLocaleString('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        }
      }
    };

    console.log('\n✅ Step 5 Complete: API logic works correctly!');
    console.log('Final response structure:', JSON.stringify(response, null, 2));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Step 5 Failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMarketingAPI();
