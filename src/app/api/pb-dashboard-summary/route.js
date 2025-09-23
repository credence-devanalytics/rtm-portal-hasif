import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { 
  pbAudience, 
  pbAudienceRegion, 
  pbFirstUser,
  pbFirstUserSource 
} from '../../../../drizzle/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('PB Dashboard Summary API called');
    
    // 1. Total Audience - Sum totalUsers where audienceName = "All Users"
    const totalAudienceResult = await db
      .select({
        totalUsers: sql`SUM(${pbAudience.totalUsers})`.as('totalUsers')
      })
      .from(pbAudience)
      .where(eq(pbAudience.audienceName, 'All Users'));

    const totalAudience = parseInt(totalAudienceResult[0]?.totalUsers) || 0;

    // 2. Top Region - Most active users by region
    const topRegionResult = await db
      .select({
        region: pbAudienceRegion.region,
        totalActiveUsers: sql`SUM(${pbAudienceRegion.activeUsers})`.as('totalActiveUsers')
      })
      .from(pbAudienceRegion)
      .groupBy(pbAudienceRegion.region)
      .orderBy(sql`SUM(${pbAudienceRegion.activeUsers}) DESC`)
      .limit(1);

    // Clean up region name
    let cleanRegionName = 'No data';
    let regionUsers = 0;
    
    if (topRegionResult[0]) {
      cleanRegionName = topRegionResult[0].region;
      regionUsers = parseInt(topRegionResult[0].totalActiveUsers) || 0;
      
      // Apply region name cleanup
      if (cleanRegionName === "Federal Territory of Kuala Lumpur") {
        cleanRegionName = "Kuala Lumpur";
      } else if (cleanRegionName === "Labuan Federal Territory") {
        cleanRegionName = "Labuan";
      }
    }

    const topRegion = {
      name: cleanRegionName,
      users: regionUsers
    };

    // 3. Top Traffic Source - Top firstUserPrimaryChannelGroup
    const topTrafficSourceResult = await db
      .select({
        channelGroup: pbFirstUser.firstUserPrimaryChannelGroup,
        totalUsers: sql`SUM(${pbFirstUser.totalUsers})`.as('totalUsers')
      })
      .from(pbFirstUser)
      .groupBy(pbFirstUser.firstUserPrimaryChannelGroup)
      .orderBy(sql`SUM(${pbFirstUser.totalUsers}) DESC`)
      .limit(1);

    const topTrafficSource = topTrafficSourceResult[0] ? {
      name: topTrafficSourceResult[0].channelGroup,
      users: parseInt(topTrafficSourceResult[0].totalUsers) || 0
    } : { name: 'No data', users: 0 };

    // 4. Top External Source - Top main_source
    const topExternalSourceResult = await db
      .select({
        mainSource: pbFirstUserSource.mainSource,
        totalActiveUsers: sql`SUM(${pbFirstUserSource.activeUsers})`.as('totalActiveUsers')
      })
      .from(pbFirstUserSource)
      .groupBy(pbFirstUserSource.mainSource)
      .orderBy(sql`SUM(${pbFirstUserSource.activeUsers}) DESC`)
      .limit(1);

    const topExternalSource = topExternalSourceResult[0] ? {
      name: topExternalSourceResult[0].mainSource,
      users: parseInt(topExternalSourceResult[0].totalActiveUsers) || 0
    } : { name: 'No data', users: 0 };

    const response = {
      success: true,
      data: {
        totalAudience,
        topRegion,
        topTrafficSource,
        topExternalSource,
        summary: {
          hasData: totalAudience > 0 || topRegion.users > 0 || topTrafficSource.users > 0 || topExternalSource.users > 0,
          formattedTotalAudience: totalAudience.toLocaleString(),
          metrics: {
            totalAudience: {
              value: totalAudience,
              formatted: totalAudience.toLocaleString(),
              label: 'Total Audience'
            },
            topRegion: {
              value: topRegion.users,
              formatted: `${topRegion.name} (${topRegion.users.toLocaleString()})`,
              label: 'Top Region',
              name: topRegion.name,
              count: topRegion.users
            },
            topTrafficSource: {
              value: topTrafficSource.users,
              formatted: `${topTrafficSource.name} (${topTrafficSource.users.toLocaleString()})`,
              label: 'Top Traffic Source',
              name: topTrafficSource.name,
              count: topTrafficSource.users
            },
            topExternalSource: {
              value: topExternalSource.users,
              formatted: `${topExternalSource.name} (${topExternalSource.users.toLocaleString()})`,
              label: 'Top External Source',
              name: topExternalSource.name,
              count: topExternalSource.users
            }
          }
        }
      }
    };

    console.log('PB Dashboard Summary API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB Dashboard Summary API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB dashboard summary data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}