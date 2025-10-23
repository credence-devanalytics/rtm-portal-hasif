/**
 * Unifi Summary API
 * Provides Unifi TV summary data with tier and genre analytics
 */

import { db } from '../../../index';
import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(String(searchParams.get('page'))) || 1;
    const limit = parseInt(String(searchParams.get('limit'))) || 50;
    const sortBy = searchParams.get('sortBy') || 'mau_total';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tier = searchParams.get('tier');
    const genre = searchParams.get('genre');
    const programName = searchParams.get('programName');
    const txYear = searchParams.get('txYear');
    const txMonth = searchParams.get('txMonth');

    // Build where conditions
    const whereConditions = [];
    
    if (tier) {
      whereConditions.push(sql`tier ILIKE ${`%${tier}%`}`);
    }
    
    if (genre) {
      whereConditions.push(sql`genre ILIKE ${`%${genre}%`}`);
    }
    
    if (programName) {
      whereConditions.push(sql`programme_name ILIKE ${`%${programName}%`}`);
    }
    
    if (txYear) {
      whereConditions.push(sql`tx_year = ${txYear}`);
    }
    
    if (txMonth) {
      whereConditions.push(sql`tx_month ILIKE ${`%${txMonth}%`}`);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the base query
    let baseQuery = sql`SELECT * FROM unifi_summary`;
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      baseQuery = sql`${baseQuery} WHERE ${sql.join(whereConditions, sql` AND `)}`;
    }

    // Get total count for pagination
    const countQuery = sql`SELECT COUNT(*) as total FROM unifi_summary`;
    const countWithWhere = whereConditions.length > 0 
      ? sql`${countQuery} WHERE ${sql.join(whereConditions, sql` AND `)}`
      : countQuery;
    
    const totalResultArray = await db.execute(countWithWhere);
    const totalResult = (totalResultArray as any)[0];
    const total = parseInt(String(totalResult?.total));

    // Get paginated data
    const sortColumn = sql.identifier(sortBy);
    const dataQuery = sql`${baseQuery} ORDER BY ${sortColumn} ${sql.raw(sortOrder.toUpperCase())} LIMIT ${limit} OFFSET ${offset}`;
    const summaryData = (await db.execute(dataQuery)) as unknown as any[];

    // Get summary statistics
    const summaryStatsQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            COUNT(*) as total_records,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours,
            AVG(duration_total_hour) as avg_duration_hours,
            COUNT(DISTINCT tier) as total_tiers,
            COUNT(DISTINCT genre) as total_genres,
            COUNT(DISTINCT tx_year) as total_years,
            COUNT(DISTINCT tx_month) as total_months
          FROM unifi_summary 
          WHERE ${sql.join(whereConditions, sql` AND `)}
        `
      : sql`
          SELECT 
            COUNT(*) as total_records,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours,
            AVG(duration_total_hour) as avg_duration_hours,
            COUNT(DISTINCT tier) as total_tiers,
            COUNT(DISTINCT genre) as total_genres,
            COUNT(DISTINCT tx_year) as total_years,
            COUNT(DISTINCT tx_month) as total_months
          FROM unifi_summary
        `;

    const summaryStatsArray = await db.execute(summaryStatsQuery);
    const summaryStats = (summaryStatsArray as any)[0];

    // Get tier breakdown
    const tierBreakdownQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            tier,
            COUNT(*) as record_count,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours
          FROM unifi_summary 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY tier 
          ORDER BY total_mau DESC
        `
      : sql`
          SELECT 
            tier,
            COUNT(*) as record_count,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours
          FROM unifi_summary 
          GROUP BY tier 
          ORDER BY total_mau DESC
        `;

    const tierBreakdown = (await db.execute(tierBreakdownQuery)) as unknown as any[];

    // Get genre breakdown
    const genreBreakdownQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            genre,
            COUNT(*) as record_count,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours
          FROM unifi_summary 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY genre 
          ORDER BY total_mau DESC
          LIMIT 10
        `
      : sql`
          SELECT 
            genre,
            COUNT(*) as record_count,
            SUM(mau_total) as total_mau,
            AVG(mau_total) as avg_mau,
            SUM(duration_total_hour) as total_duration_hours
          FROM unifi_summary 
          GROUP BY genre 
          ORDER BY total_mau DESC
          LIMIT 10
        `;

    const genreBreakdown = (await db.execute(genreBreakdownQuery)) as unknown as any[];

    // Get top programs by MAU
    const topProgramsQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            programme_name,
            tier,
            genre,
            mau_total,
            duration_total_hour,
            tx_year,
            tx_month
          FROM unifi_summary 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          AND programme_name IS NOT NULL
          ORDER BY mau_total DESC 
          LIMIT 10
        `
      : sql`
          SELECT 
            programme_name,
            tier,
            genre,
            mau_total,
            duration_total_hour,
            tx_year,
            tx_month
          FROM unifi_summary 
          WHERE programme_name IS NOT NULL
          ORDER BY mau_total DESC 
          LIMIT 10
        `;

    const topPrograms = (await db.execute(topProgramsQuery)) as unknown as any[];

    console.log(summaryData);
    // Format the response
    const response = {
      data: summaryData.map(item => ({
        ...item,
        mau_total: parseInt(String(item.mau_total)) || 0,
        duration_total_hour: parseInt(String(item.duration_total_hour)) || 0,
        duration_live: parseInt(String(item.duration_live)) || 0,
        frequency_total_access_time: parseInt(String(item.frequency_total_access_time)) || 0,
        frequency_live: parseInt(String(item.frequency_live)) || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary: {
        totalRecords: parseInt(String(summaryStats.total_records)) || 0,
        totalMau: parseInt(String(summaryStats.total_mau)) || 0,
        avgMau: Math.round(parseFloat(String(summaryStats.avg_mau))) || 0,
        totalDurationHours: parseInt(summaryStats.total_duration_hours) || 0,
        avgDurationHours: Math.round(parseFloat(summaryStats.avg_duration_hours)) || 0,
        totalTiers: parseInt(summaryStats.total_tiers) || 0,
        totalGenres: parseInt(summaryStats.total_genres) || 0,
        totalYears: parseInt(summaryStats.total_years) || 0,
        totalMonths: parseInt(summaryStats.total_months) || 0
      },
      tierBreakdown: tierBreakdown.map(item => ({
        tier: item.tier,
        recordCount: parseInt(item.record_count),
        totalMau: parseInt(item.total_mau) || 0,
        avgMau: Math.round(parseFloat(item.avg_mau)) || 0,
        totalDurationHours: parseInt(item.total_duration_hours) || 0
      })),
      genreBreakdown: genreBreakdown.map(item => ({
        genre: item.genre,
        recordCount: parseInt(item.record_count),
        totalMau: parseInt(item.total_mau) || 0,
        avgMau: Math.round(parseFloat(item.avg_mau)) || 0,
        totalDurationHours: parseInt(item.total_duration_hours) || 0
      })),
      topPrograms: topPrograms.map(item => ({
        programmeName: item.programme_name,
        tier: item.tier,
        genre: item.genre,
        mauTotal: parseInt(item.mau_total) || 0,
        durationTotalHour: parseInt(item.duration_total_hour) || 0,
        txYear: item.tx_year,
        txMonth: item.tx_month
      })),
      filters: {
        tier,
        genre,
        programName,
        txYear,
        txMonth,
        sortBy,
        sortOrder
      },
      meta: {
        queryType: 'unifi_summary',
        timestamp: new Date().toISOString(),
        totalRecords: total
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unifi Summary API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch unifi summary data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
