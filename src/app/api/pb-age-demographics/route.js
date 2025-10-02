import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { pbAudienceAge } from '../../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('PB Age Demographics API called');
    
    // Fetch age demographics data and group by age bracket
    const ageData = await db
      .select({
        userAgeBracket: pbAudienceAge.userAgeBracket,
        totalActiveUsers: sql`SUM(${pbAudienceAge.activeUsers})`.as('totalActiveUsers'),
        totalNewUsers: sql`SUM(${pbAudienceAge.newUsers})`.as('totalNewUsers'),
        recordCount: sql`COUNT(*)`.as('recordCount')
      })
      .from(pbAudienceAge)
      .groupBy(pbAudienceAge.userAgeBracket);

    console.log('PB Age data:', ageData);

    // Process data for charts
    const chartData = ageData.map(item => ({
      ageBracket: item.userAgeBracket,
      activeUsers: parseInt(item.totalActiveUsers) || 0,
      newUsers: parseInt(item.totalNewUsers) || 0,
      recordCount: parseInt(item.recordCount) || 0,
      percentage: 0 // Will calculate after getting totals
    }));

    // Calculate percentages
    const totalUsers = chartData.reduce((sum, item) => sum + item.activeUsers, 0);
    chartData.forEach(item => {
      item.percentage = totalUsers > 0 ? 
        parseFloat(((item.activeUsers / totalUsers) * 100).toFixed(1)) : 0;
    });

    // Sort by age bracket for better visualization
    chartData.sort((a, b) => {
      const ageOrder = {
        '18-24': 1, '25-34': 2, '35-44': 3, '45-54': 4, '55-64': 5, '65+': 6
      };
      return (ageOrder[a.ageBracket] || 999) - (ageOrder[b.ageBracket] || 999);
    });

    // Find dominant age group
    const dominantAgeGroup = chartData.reduce((max, item) => 
      item.activeUsers > max.activeUsers ? item : max, chartData[0] || {}
    );

    const response = {
      success: true,
      data: {
        chartData,
        summary: {
          totalUsers,
          totalNewUsers: chartData.reduce((sum, item) => sum + item.newUsers, 0),
          dominantAgeGroup: dominantAgeGroup.ageBracket || 'N/A',
          dominantPercentage: dominantAgeGroup.percentage || 0,
          ageGroupCount: chartData.length
        }
      }
    };

    console.log('PB Age Demographics API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB Age Demographics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB age demographics data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}