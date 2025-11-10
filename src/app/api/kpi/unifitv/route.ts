/**
 * KPI UnifiTV API
 * Provides total MAU for UnifiTV for the current year
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Count MAU for UNIFITV
    const result = await db.execute(sql`
      SELECT 
        SUM(mau_total) as mau_total_UnifiTV
      FROM unifi_summary
      WHERE tx_year = ${currentYear.toString()}
    `);

    const mauTotal = result.rows[0]?.mau_total_unifitv || 0;

    return NextResponse.json({
      success: true,
      data: {
        mau_total: Number(mauTotal) || 0,
        year: currentYear
      }
    });

  } catch (error) {
    console.error('KPI UnifiTV API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch UnifiTV KPI data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
