/**
 * KPI RTMKlik API
 * Provides total active users for RTMKlik TV and Radio for the current year
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const currentYear = new Date().getFullYear();

    // RTMKlik TV
    const tvResult = await db.execute(sql`
      SELECT 
        SUM(value) as totalActiveUsers
      FROM rtmklik_popular_pages
      WHERE EXTRACT(YEAR FROM date) = ${currentYear}
      AND metric = 'activeUsers'
      AND class = 'live'
    `);

    // RTMKlik Radio
    const radioResult = await db.execute(sql`
      SELECT 
        SUM(value) as totalActiveUsers
      FROM rtmklik_popular_pages
      WHERE EXTRACT(YEAR FROM date) = ${currentYear}
      AND metric = 'activeUsers'
      AND class = 'radio'
    `);

    const tvActiveUsers = tvResult.rows[0]?.totalactiveusers || 0;
    const radioActiveUsers = radioResult.rows[0]?.totalactiveusers || 0;
    const totalActiveUsers = Number(tvActiveUsers) + Number(radioActiveUsers);

    return NextResponse.json({
      success: true,
      data: {
        totalActiveUsers: totalActiveUsers || 0,
        tv: Number(tvActiveUsers) || 0,
        radio: Number(radioActiveUsers) || 0,
        year: currentYear
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
