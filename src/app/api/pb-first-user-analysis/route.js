import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { pbFirstUser } from '../../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('PB First User Analysis API called');
    
    // Fetch first user data and group by channel group
    const firstUserData = await db
      .select({
        channelGroup: pbFirstUser.firstUserPrimaryChannelGroup,
        totalUsers: sql`SUM(${pbFirstUser.totalUsers})`.as('totalUsers'),
        totalNewUsers: sql`SUM(${pbFirstUser.newUsers})`.as('totalNewUsers'),
        totalReturningUsers: sql`SUM(${pbFirstUser.returningUsers})`.as('totalReturningUsers'),
        recordCount: sql`COUNT(*)`.as('recordCount')
      })
      .from(pbFirstUser)
      .groupBy(pbFirstUser.firstUserPrimaryChannelGroup);

    console.log('PB First User data:', firstUserData);

    // Process data for charts
    const chartData = firstUserData.map(item => ({
      channelGroup: item.channelGroup,
      totalUsers: parseInt(item.totalUsers) || 0,
      newUsers: parseInt(item.totalNewUsers) || 0,
      returningUsers: parseInt(item.totalReturningUsers) || 0,
      recordCount: parseInt(item.recordCount) || 0,
      percentage: 0, // Will calculate after getting totals
      newUserRate: 0 // Will calculate below
    }));

    // Calculate percentages and rates
    const totalUsers = chartData.reduce((sum, item) => sum + item.totalUsers, 0);
    chartData.forEach(item => {
      item.percentage = totalUsers > 0 ? 
        parseFloat(((item.totalUsers / totalUsers) * 100).toFixed(1)) : 0;
      item.newUserRate = item.totalUsers > 0 ? 
        parseFloat(((item.newUsers / item.totalUsers) * 100).toFixed(1)) : 0;
    });

    // Sort by total users descending
    chartData.sort((a, b) => b.totalUsers - a.totalUsers);

    // Find top channel group
    const topChannelGroup = chartData[0] || {};

    const response = {
      success: true,
      data: {
        chartData,
        summary: {
          totalUsers,
          totalNewUsers: chartData.reduce((sum, item) => sum + item.newUsers, 0),
          totalReturningUsers: chartData.reduce((sum, item) => sum + item.returningUsers, 0),
          topChannelGroup: topChannelGroup.channelGroup || 'N/A',
          topChannelUsers: topChannelGroup.totalUsers || 0,
          topChannelPercentage: topChannelGroup.percentage || 0,
          channelGroupCount: chartData.length,
          avgNewUserRate: chartData.length > 0 ? 
            parseFloat((chartData.reduce((sum, item) => sum + item.newUserRate, 0) / chartData.length).toFixed(1)) : 0
        }
      }
    };

    console.log('PB First User Analysis API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB First User Analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB first user analysis data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}