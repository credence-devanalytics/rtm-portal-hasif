/**
 * UnifiTV Summary API
 * Provides UnifiTV summary data from unifi_summary table
 */

import { db } from '../../../index';
import { sql, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { unifiSummary } from '../../../../drizzle/schema';

export async function GET(request: Request) {
  try {
    console.log('Fetching UnifiTV data from database...');

    // Get the latest year and month combination
    const latestPeriodResult = await db
      .select({
        txYear: unifiSummary.txYear,
        txMonth: unifiSummary.txMonth
      })
      .from(unifiSummary)
      .orderBy(desc(unifiSummary.txYear), desc(unifiSummary.txMonth))
      .limit(1);

    const latestPeriod = latestPeriodResult[0];
    console.log('Latest period:', latestPeriod);

    if (!latestPeriod) {
      return NextResponse.json({
        success: false,
        error: 'No data available',
        data: null
      });
    }

    // Get total MAU and duration for the latest period
    const totalsResult = await db
      .select({
        mauTotal: sql`COALESCE(SUM(${unifiSummary.mauTotal}), 0)`.as('mauTotal'),
        durationTotalHour: sql`COALESCE(SUM(${unifiSummary.durationTotalHour}), 0)`.as('durationTotalHour'),
        durationLive: sql`COALESCE(SUM(${unifiSummary.durationLive}), 0)`.as('durationLive'),
        frequencyTotalAccessTime: sql`COALESCE(SUM(${unifiSummary.frequencyTotalAccessTime}), 0)`.as('frequencyTotalAccessTime')
      })
      .from(unifiSummary)
      .where(sql`${unifiSummary.txYear} = ${latestPeriod.txYear} AND ${unifiSummary.txMonth} = ${latestPeriod.txMonth}`);

    const totals = totalsResult[0];
    console.log('Totals:', totals);
    console.log('MAU Total:', totals.mauTotal);
    console.log('Duration Total Hour:', totals.durationTotalHour);
    console.log('Duration Live:', totals.durationLive);
    console.log('Frequency Total Access Time:', totals.frequencyTotalAccessTime);
    
    // Use durationTotalHour if available, otherwise fall back to durationLive
    const finalDurationHour = Number(totals.durationTotalHour) || Number(totals.durationLive) || 0;

    // Get top programmes - use MAU as primary metric if duration is not available
    const programmesResult = await db
      .select({
        programmeName: unifiSummary.programmeName,
        durationTotalHour: sql`COALESCE(SUM(${unifiSummary.durationTotalHour}), 0)`.as('durationTotalHour'),
        durationLive: sql`COALESCE(SUM(${unifiSummary.durationLive}), 0)`.as('durationLive'),
        mauTotal: sql`COALESCE(SUM(${unifiSummary.mauTotal}), 0)`.as('mauTotal')
      })
      .from(unifiSummary)
      .where(sql`${unifiSummary.txYear} = ${latestPeriod.txYear} AND ${unifiSummary.txMonth} = ${latestPeriod.txMonth}`)
      .groupBy(unifiSummary.programmeName)
      .orderBy(desc(sql`COALESCE(SUM(${unifiSummary.mauTotal}), 0)`))  // Order by MAU instead
      .limit(10);

    console.log('Top programmes:', programmesResult);
    console.log('First programme:', programmesResult[0]);

    // Map programmes and use fallback for duration
    const programmes = programmesResult.map(p => {
      const durationHour = Number(p.durationTotalHour || 0) || Number(p.durationLive || 0);
      const mauTotal = Number(p.mauTotal || 0);
      
      return {
        programme_name: p.programmeName,
        duration_total_hour: durationHour,
        mau_total: mauTotal,
        avg_viewers: mauTotal // In UnifiTV context, MAU represents the average monthly viewers
      };
    });

    // Create a date string from the latest period
    const latestDate = latestPeriod.txYear && latestPeriod.txMonth 
      ? `${latestPeriod.txYear}-${latestPeriod.txMonth}-01`
      : null;

    const response = {
      success: true,
      data: {
        mau_total: Number(totals.mauTotal || 0),
        duration_total_hour: finalDurationHour,
        programmes: programmes,
        latestDate: latestDate,
        period: {
          year: latestPeriod.txYear,
          month: latestPeriod.txMonth
        }
      },
      meta: {
        queryType: 'unifitv_summary_database',
        timestamp: new Date().toISOString(),
        recordCount: programmes.length,
        rawTotals: {
          durationTotalHour: totals.durationTotalHour,
          durationLive: totals.durationLive,
          frequencyTotalAccessTime: totals.frequencyTotalAccessTime
        }
      }
    };

    console.log('UnifiTV API Response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error) {
    console.error('UnifiTV Summary API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch UnifiTV summary data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
