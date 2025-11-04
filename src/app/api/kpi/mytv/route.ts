/**
 * KPI MyTV API
 * Provides total audience for MyTV for the current year
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get total audience for MyTV
    const result = await db.execute(sql`
      SELECT 
        SUM(audience_000s) as total_audience_Mytv
      FROM mytv_top_programs
      WHERE EXTRACT(YEAR FROM programme_date) = ${currentYear}
      AND channel ILIKE ANY (ARRAY[
        '%TV1%',
        '%TV2%',
        '%TV6%',
        '%OKEY%',
        '%SUKAN%',
        '%BERITA%'
      ])
    `);

    const totalAudience = result.rows[0]?.total_audience_mytv || 0;

    return NextResponse.json({
      success: true,
      data: {
        total_reach: Number(totalAudience) || 0, // Keep value as is from database
        year: currentYear
      }
    });

  } catch (error) {
    console.error('KPI MyTV API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch MyTV KPI data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
