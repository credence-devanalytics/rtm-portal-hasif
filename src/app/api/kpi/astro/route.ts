/**
 * KPI ASTRO API
 * Provides total reach for ASTRO TV and Radio for the current year
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get TV viewers for ASTRO
    const tvResult = await db.execute(sql`
      SELECT 
        SUM(value) as total_tv_reach
      FROM astro_rate_n_reach
      WHERE tx_year = ${currentYear.toString()}
        AND metric_type = 'reach'
        AND channel ILIKE '%TV%'
    `);

    // Get Radio listeners for ASTRO
    const radioResult = await db.execute(sql`
      SELECT 
        SUM(value) as total_Radio_reach
      FROM astro_rate_n_reach
      WHERE tx_year = ${currentYear.toString()}
        AND metric_type = 'reach'
        AND channel ILIKE '%FM%'
    `);

    const tvReach = tvResult.rows[0]?.total_tv_reach || 0;
    const radioReach = radioResult.rows[0]?.total_radio_reach || 0;

    return NextResponse.json({
      success: true,
      data: {
        tv_reach: Number(tvReach) || 0,
        radio_reach: Number(radioReach) || 0,
        year: currentYear
      }
    });

  } catch (error) {
    console.error('KPI ASTRO API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch ASTRO KPI data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
