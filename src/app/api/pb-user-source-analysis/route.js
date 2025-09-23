import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { pbFirstUserSource } from '../../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('PB User Source Analysis API called');
    
    // Fetch user source data and group by main source
    const userSourceData = await db
      .select({
        mainSource: pbFirstUserSource.mainSource,
        totalActiveUsers: sql`SUM(${pbFirstUserSource.activeUsers})`.as('totalActiveUsers'),
        recordCount: sql`COUNT(*)`.as('recordCount'),
        avgDailyUsers: sql`AVG(${pbFirstUserSource.activeUsers})`.as('avgDailyUsers')
      })
      .from(pbFirstUserSource)
      .groupBy(pbFirstUserSource.mainSource);

    console.log('PB User Source data:', userSourceData);

    // Process data for charts
    const chartData = userSourceData.map(item => ({
      source: item.mainSource,
      totalActiveUsers: parseInt(item.totalActiveUsers) || 0,
      recordCount: parseInt(item.recordCount) || 0,
      avgDailyUsers: parseFloat(item.avgDailyUsers) || 0,
      percentage: 0 // Will calculate after getting totals
    }));

    // Calculate percentages
    const totalUsers = chartData.reduce((sum, item) => sum + item.totalActiveUsers, 0);
    chartData.forEach(item => {
      item.percentage = totalUsers > 0 ? 
        parseFloat(((item.totalActiveUsers / totalUsers) * 100).toFixed(1)) : 0;
    });

    // Sort by total active users descending
    chartData.sort((a, b) => b.totalActiveUsers - a.totalActiveUsers);

    // Find top sources
    const topSource = chartData[0] || {};
    const topSources = chartData.slice(0, 5);

    const response = {
      success: true,
      data: {
        chartData,
        summary: {
          totalUsers,
          topSource: topSource.source || 'N/A',
          topSourceUsers: topSource.totalActiveUsers || 0,
          topSourcePercentage: topSource.percentage || 0,
          sourceCount: chartData.length,
          topSources: topSources.map(s => ({ 
            source: s.source, 
            users: s.totalActiveUsers, 
            percentage: s.percentage,
            avgDaily: parseFloat(s.avgDailyUsers.toFixed(1))
          })),
          avgUsersPerSource: chartData.length > 0 ? 
            Math.round(totalUsers / chartData.length) : 0
        }
      }
    };

    console.log('PB User Source Analysis API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB User Source Analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB user source analysis data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}