/**
 * KPI RTMKlik API
 * Provides total active users for RTMKlik for the current year
 * Note: RTMKlik data structure doesn't have tx_year, using existing summary endpoint
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // RTMKlik uses current month data based on the rtmklik-summary endpoint
    // We'll use the existing logic from rtmklik-summary
    const totalActiveUsersResult = await db.execute(sql`
      SELECT 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_live_malaysia
          WHERE metric = 'activeUsers'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) 
        + 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_radio_malaysia
          WHERE metric = 'activeUsers'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) AS total_active_users_rtmklik
    `);

    const totalActiveUsers = totalActiveUsersResult.rows[0]?.total_active_users_rtmklik || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalActiveUsers: Number(totalActiveUsers) || 0
      }
    });

  } catch (error) {
    console.error('KPI RTMKlik API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch RTMKlik KPI data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
