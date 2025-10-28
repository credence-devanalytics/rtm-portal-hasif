import { NextResponse } from "next/server";
import { db } from "@/index";
import {
	pberitaAudience,
	pberitaAudienceRegion,
	pberitaFirstUser,
	pberitaFirstUserSource,
} from "../../../../drizzle/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    console.log('PB Dashboard Summary API called');
    
    // Get the latest date from pb_audience table
    const latestDateResult = await db
      .select({
        maxDate: sql`MAX(${pberitaAudience.date})`.as('maxDate')
      })
      .from(pberitaAudience);

    console.log('Latest date result:', latestDateResult);
    const latestDate = latestDateResult[0]?.maxDate || null;
    
    // 1. Total Audience - Sum totalUsers where audienceName = "All Users"
    const totalAudienceResult = await db
      .select({
        totalUsers: sql`SUM(${pberitaAudience.totalusers})`.as('totalUsers')
      })
      .from(pberitaAudience)
      .where(eq(pberitaAudience.audiencename, 'All Users'));

    console.log('Total audience result:', totalAudienceResult);
		const totalAudience = parseInt(totalAudienceResult[0]?.totalUsers) || 0;

		// 2. Top Region - Most active users by region
		const topRegionResult = await db
			.select({
				region: pberitaAudienceRegion.region,
				totalActiveUsers: sql`SUM(${pberitaAudienceRegion.activeusers})`.as(
					"totalActiveUsers"
				),
			})
			.from(pberitaAudienceRegion)
			.groupBy(pberitaAudienceRegion.region)
			.orderBy(sql`SUM(${pberitaAudienceRegion.activeusers}) DESC`)
			.limit(1);

		console.log('Top region result:', topRegionResult);
		// Clean up region name
		let cleanRegionName = "No data";
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
			users: regionUsers,
		};

		// 3. Top Traffic Source - Top firstUserPrimaryChannelGroup
		const topTrafficSourceResult = await db
			.select({
				channelGroup: pberitaFirstUser.firstuserprimarychannelgroup,
				totalUsers: sql`SUM(${pberitaFirstUser.totalusers})`.as("totalUsers"),
			})
			.from(pberitaFirstUser)
			.groupBy(pberitaFirstUser.firstuserprimarychannelgroup)
			.orderBy(sql`SUM(${pberitaFirstUser.totalusers}) DESC`)
			.limit(1);

		const topTrafficSource = topTrafficSourceResult[0]
			? {
					name: topTrafficSourceResult[0].channelGroup,
					users: parseInt(topTrafficSourceResult[0].totalUsers) || 0,
			  }
			: { name: "No data", users: 0 };

		// 4. Top External Source - Top main_source
		const topExternalSourceResult = await db
			.select({
				mainSource: pberitaFirstUserSource.mainSource,
				totalActiveUsers: sql`SUM(${pberitaFirstUserSource.activeusers})`.as(
					"totalActiveUsers"
				),
			})
			.from(pberitaFirstUserSource)
			.groupBy(pberitaFirstUserSource.mainSource)
			.orderBy(sql`SUM(${pberitaFirstUserSource.activeusers}) DESC`)
			.limit(1);

		const topExternalSource = topExternalSourceResult[0]
			? {
					name: topExternalSourceResult[0].mainSource,
					users: parseInt(topExternalSourceResult[0].totalActiveUsers) || 0,
			  }
			: { name: "No data", users: 0 };

    const response = {
      success: true,
      data: {
        totalAudience,
        topRegion,
        topTrafficSource,
        topExternalSource,
        latestDate: latestDate,
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



