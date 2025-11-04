/**
 * KPI Portal Berita API
 * Provides total audience for Portal Berita for the current year
 */

import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get total audience for Portal Berita
    const result = await db.execute(sql`
      SELECT 
        SUM(screenpageviews) as totalAudiencePortalBerita
      FROM pberita_popular_pages
      WHERE EXTRACT(YEAR FROM date) = ${currentYear}
    `);

    const totalAudience = result.rows[0]?.totalaudienceportalberita || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalAudience: Number(totalAudience) || 0,
        year: currentYear
      }
    });

  } catch (error) {
    console.error('KPI Portal Berita API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Portal Berita KPI data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
