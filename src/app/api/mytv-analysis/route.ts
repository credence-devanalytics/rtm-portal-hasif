/**
 * MyTV Analysis API
 * Provides MyTV analysis data with regional and channel analytics
 */

import { db } from '../../../index';
import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Return the exact data from your database query until server issues are resolved
    // Based on your actual SQL query output
    const mockChannelMetrics = [
      { channel: "BERITA RTM", avg_viewers: 1790317, perc_from_total_access: 24 },
      { channel: "BERNAMA", avg_viewers: 1267925, perc_from_total_access: 17.13 },
      { channel: "SUKAN RTM", avg_viewers: 2645322, perc_from_total_access: 35 },
      { channel: "TV6", avg_viewers: 2242294, perc_from_total_access: 30 },
      { channel: "TV1", avg_viewers: 3058843, perc_from_total_access: 40 },
      { channel: "OKEY", avg_viewers: 3024567, perc_from_total_access: 40 },
      { channel: "TV2", avg_viewers: 3734307, perc_from_total_access: 49 },
    ];

    const response = {
      channelMetrics: mockChannelMetrics.map(item => ({
        channel: item.channel,
        avgViewers: item.avg_viewers,
        audienceShare: item.perc_from_total_access
      })),
      meta: {
        queryType: 'mytv_analysis_mock',
        timestamp: new Date().toISOString(),
        note: 'Using exact database values with both avg_viewers and perc_from_total_access'
      }
    };

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
