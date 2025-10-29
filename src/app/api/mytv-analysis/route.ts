/**
 * MyTV Analysis API
 * Provides MyTV analysis data with regional and channel analytics
 */

import { db } from '../../../index';
import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { mytvViewership } from '../../../../drizzle/schema';

export async function GET(request: Request) {
  try {
    console.log('Fetching MyTV data from database...');

    // Get the latest year from mytv_viewership table
    const latestYearResult = await db
      .select({
        maxYear: sql`MAX(${mytvViewership.year})`.as('maxYear')
      })
      .from(mytvViewership);

    const latestYear = latestYearResult[0]?.maxYear || null;
    console.log('Latest year:', latestYear);

    // Calculate total viewers across all channels
    const totalViewersResult = await db
      .select({
        totalViewers: sql`SUM(${mytvViewership.viewers})`.as('totalViewers')
      })
      .from(mytvViewership);

    const totalViewers = Number(totalViewersResult[0]?.totalViewers || 0);
    console.log('Total viewers:', totalViewers);

    // Get channel metrics: average viewers and percentage from total
    const channelMetrics = await db
      .select({
        channel: mytvViewership.channel,
        avgViewers: sql`ROUND(AVG(${mytvViewership.viewers}))`.as('avgViewers'),
        totalAccess: sql`SUM(${mytvViewership.viewers})`.as('totalAccess'),
      })
      .from(mytvViewership)
      .groupBy(mytvViewership.channel)
      .orderBy(desc(sql`AVG(${mytvViewership.viewers})`));

    console.log('Raw channel metrics:', channelMetrics);

    // Calculate percentage for each channel
    const channelMetricsWithPercentage = channelMetrics.map(item => {
      const avgViewers = Number(item.avgViewers || 0);
      const totalAccess = Number(item.totalAccess || 0);
      const audienceShare = totalViewers > 0 
        ? Number(((totalAccess / totalViewers) * 100).toFixed(2))
        : 0;

      return {
        channel: item.channel,
        avgViewers: avgViewers,
        audienceShare: audienceShare
      };
    });

    console.log('Channel metrics with percentage:', channelMetricsWithPercentage);

    const response = {
      success: true,
      channelMetrics: channelMetricsWithPercentage,
      totalViewers: totalViewers,
      latestYear: latestYear,
      meta: {
        queryType: 'mytv_analysis_database',
        timestamp: new Date().toISOString(),
        recordCount: channelMetrics.length
      }
    };

    console.log('MyTV API Response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error) {
    console.error('MyTV Analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch MyTV analysis data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
