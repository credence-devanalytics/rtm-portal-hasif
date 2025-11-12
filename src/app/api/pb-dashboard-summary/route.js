import { NextResponse } from "next/server";
import { db } from "@/index";
import {
  pberitaAudience,
  pberitaAudienceRegion,
  pberitaFirstUser,
  pberitaFirstUserSource,
} from "../../../../drizzle/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
  try {
    console.log('PB Dashboard Summary API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    console.log('Filter params:', { yearParam, monthParam, fromParam, toParam });

    // Build date filter conditions for each table
    let audienceDateFilters = [];
    let regionDateFilters = [];
    let firstUserDateFilters = [];
    let firstUserSourceDateFilters = [];

    if (fromParam && toParam) {
      // Date range filter: from and to in YYYY-MM-DD format
      const startDate = fromParam;
      const endDate = toParam;

      audienceDateFilters = [gte(pberitaAudience.date, startDate), lte(pberitaAudience.date, endDate)];
      regionDateFilters = [gte(pberitaAudienceRegion.date, startDate), lte(pberitaAudienceRegion.date, endDate)];
      firstUserDateFilters = [gte(pberitaFirstUser.date, startDate), lte(pberitaFirstUser.date, endDate)];
      firstUserSourceDateFilters = [gte(pberitaFirstUserSource.date, startDate), lte(pberitaFirstUserSource.date, endDate)];

      console.log('Date range filter applied:', { startDate, endDate });
    } else if (monthParam) {
      // Month filter: YYYY-MM format
      const [year, month] = monthParam.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

      audienceDateFilters = [gte(pberitaAudience.date, startDate), lte(pberitaAudience.date, endDate)];
      regionDateFilters = [gte(pberitaAudienceRegion.date, startDate), lte(pberitaAudienceRegion.date, endDate)];
      firstUserDateFilters = [gte(pberitaFirstUser.date, startDate), lte(pberitaFirstUser.date, endDate)];
      firstUserSourceDateFilters = [gte(pberitaFirstUserSource.date, startDate), lte(pberitaFirstUserSource.date, endDate)];

      console.log('Month filter applied:', { startDate, endDate });
    } else if (yearParam) {
      // Year only filter
      const startDate = `${yearParam}-01-01`;
      const endDate = `${yearParam}-12-31`;

      audienceDateFilters = [gte(pberitaAudience.date, startDate), lte(pberitaAudience.date, endDate)];
      regionDateFilters = [gte(pberitaAudienceRegion.date, startDate), lte(pberitaAudienceRegion.date, endDate)];
      firstUserDateFilters = [gte(pberitaFirstUser.date, startDate), lte(pberitaFirstUser.date, endDate)];
      firstUserSourceDateFilters = [gte(pberitaFirstUserSource.date, startDate), lte(pberitaFirstUserSource.date, endDate)];

      console.log('Year filter applied:', { startDate, endDate });
    }

    // Get the latest date from pb_audience table
    const latestDateResult = await db
      .select({
        maxDate: sql`MAX(${pberitaAudience.date})`.as('maxDate')
      })
      .from(pberitaAudience);

    console.log('Latest date result:', latestDateResult);
    const latestDate = latestDateResult[0]?.maxDate || null;

    // 1. Total Audience - Sum totalUsers where audienceName = "All Users"
    let totalAudienceQuery = db
      .select({
        totalUsers: sql`SUM(${pberitaAudience.totalusers})`.as('totalUsers')
      })
      .from(pberitaAudience);

    // Apply filters
    if (audienceDateFilters.length > 0) {
      totalAudienceQuery = totalAudienceQuery.where(
        and(eq(pberitaAudience.audiencename, 'All Users'), ...audienceDateFilters)
      );
    } else {
      totalAudienceQuery = totalAudienceQuery.where(eq(pberitaAudience.audiencename, 'All Users'));
    }

    const totalAudienceResult = await totalAudienceQuery;

    console.log('Total audience result:', totalAudienceResult);
    const totalAudience = parseInt(totalAudienceResult[0]?.totalUsers) || 0;

    // 2. Top Region - Most active users by region
    let topRegionQuery = db
      .select({
        region: pberitaAudienceRegion.region,
        totalActiveUsers: sql`SUM(${pberitaAudienceRegion.activeusers})`.as(
          "totalActiveUsers"
        ),
      })
      .from(pberitaAudienceRegion);

    // Apply date filters
    if (regionDateFilters.length > 0) {
      topRegionQuery = topRegionQuery.where(and(...regionDateFilters));
    }

    topRegionQuery = topRegionQuery
      .groupBy(pberitaAudienceRegion.region)
      .orderBy(sql`SUM(${pberitaAudienceRegion.activeusers}) DESC`)
      .limit(1);

    const topRegionResult = await topRegionQuery;

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
    let topTrafficSourceQuery = db
      .select({
        channelGroup: pberitaFirstUser.firstuserprimarychannelgroup,
        totalUsers: sql`SUM(${pberitaFirstUser.totalusers})`.as("totalUsers"),
      })
      .from(pberitaFirstUser);

    // Apply date filters
    if (firstUserDateFilters.length > 0) {
      topTrafficSourceQuery = topTrafficSourceQuery.where(and(...firstUserDateFilters));
    }

    topTrafficSourceQuery = topTrafficSourceQuery
      .groupBy(pberitaFirstUser.firstuserprimarychannelgroup)
      .orderBy(sql`SUM(${pberitaFirstUser.totalusers}) DESC`)
      .limit(1);

    const topTrafficSourceResult = await topTrafficSourceQuery;

    const topTrafficSource = topTrafficSourceResult[0]
      ? {
        name: topTrafficSourceResult[0].channelGroup,
        users: parseInt(topTrafficSourceResult[0].totalUsers) || 0,
      }
      : { name: "No data", users: 0 };

    // 4. Top External Source - Top main_source
    let topExternalSourceQuery = db
      .select({
        mainSource: pberitaFirstUserSource.mainSource,
        totalActiveUsers: sql`SUM(${pberitaFirstUserSource.activeusers})`.as(
          "totalActiveUsers"
        ),
      })
      .from(pberitaFirstUserSource);

    // Apply date filters
    if (firstUserSourceDateFilters.length > 0) {
      topExternalSourceQuery = topExternalSourceQuery.where(and(...firstUserSourceDateFilters));
    }

    topExternalSourceQuery = topExternalSourceQuery
      .groupBy(pberitaFirstUserSource.mainSource)
      .orderBy(sql`SUM(${pberitaFirstUserSource.activeusers}) DESC`)
      .limit(1);

    const topExternalSourceResult = await topExternalSourceQuery;

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



