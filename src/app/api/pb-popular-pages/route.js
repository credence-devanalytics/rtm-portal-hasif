import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { pbPopularPages } from '../../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET(request) {
  try {
    console.log('PB Popular Pages API called');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10'; // Default to top 10
    const limitNum = parseInt(limit);
    
    // Fetch popular pages data
    const popularPages = await db
      .select({
        unifiedScreenClass: pbPopularPages.unifiedScreenClass,
        screenPageViews: sql`SUM(${pbPopularPages.screenPageViews})`.as('screenPageViews'),
        activeUsers: sql`SUM(${pbPopularPages.activeUsers})`.as('activeUsers')
      })
      .from(pbPopularPages)
      .groupBy(pbPopularPages.unifiedScreenClass)
      .orderBy(sql`SUM(${pbPopularPages.screenPageViews}) DESC`)
      .limit(limitNum);

    console.log('PB Popular Pages data:', popularPages);

    // Process data for table
    const tableData = popularPages.map((item, index) => ({
      rank: index + 1,
      pageName: item.unifiedScreenClass || 'Unknown Page',
      screenPageViews: parseInt(item.screenPageViews) || 0,
      activeUsers: parseInt(item.activeUsers) || 0,
      avgViewsPerUser: parseInt(item.activeUsers) > 0 ? 
        ((parseInt(item.screenPageViews) || 0) / (parseInt(item.activeUsers) || 1)).toFixed(2) : '0.00'
    }));

    // Calculate summary statistics
    const totalPageViews = tableData.reduce((sum, item) => sum + item.screenPageViews, 0);
    const totalActiveUsers = tableData.reduce((sum, item) => sum + item.activeUsers, 0);
    const avgPageViews = tableData.length > 0 ? 
      Math.round(totalPageViews / tableData.length) : 0;
    const topPage = tableData[0] || { pageName: 'No data', screenPageViews: 0 };

    const response = {
      success: true,
      data: {
        tableData,
        summary: {
          totalPages: tableData.length,
          totalPageViews,
          totalActiveUsers,
          topPage: {
            name: topPage.pageName,
            pageViews: topPage.screenPageViews,
            users: topPage.activeUsers
          },
          avgPageViews,
          limit: limitNum,
          formattedTotalPageViews: totalPageViews.toLocaleString(),
          formattedTotalActiveUsers: totalActiveUsers.toLocaleString()
        }
      }
    };

    console.log('PB Popular Pages API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB Popular Pages API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB popular pages data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}