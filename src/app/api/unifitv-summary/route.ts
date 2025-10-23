/**
 * UnifiTV Summary API
 * Provides UnifiTV summary data with latest date
 */

import { db } from '../../../index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { unifiViewership } from '../../../../drizzle/schema';

export async function GET(request: Request) {
  try {
    // Get the latest date from unifi_viewership table
    const latestDateResult = await db
      .select({
        maxDate: sql`MAX(${unifiViewership.programmeDate})`.as('maxDate')
      })
      .from(unifiViewership);

    const latestDate = latestDateResult[0]?.maxDate || null;

    // Mock data for UnifiTV (from unifi_summary table)
    const unifiData = {
      mau_total: 518883,
      duration_total_hour: 2345678,
      programmes: [
        { programme_name: "Berita RTM", duration_total_hour: 456789 },
        { programme_name: "TV1 Drama", duration_total_hour: 389456 },
        { programme_name: "Sukan RTM", duration_total_hour: 234567 },
      ],
    };

    const response = {
      success: true,
      data: {
        mau_total: unifiData.mau_total,
        duration_total_hour: unifiData.duration_total_hour,
        programmes: unifiData.programmes,
        latestDate: latestDate,
      },
      meta: {
        queryType: 'unifitv_summary_mock',
        timestamp: new Date().toISOString(),
        note: 'Using mock data with latest date from unifi_viewership table'
      }
    };

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
