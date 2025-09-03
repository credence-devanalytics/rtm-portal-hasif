/**
 * MyTV Analysis API
 * Provides MyTV analysis data with regional and channel analytics
 */

import { db } from '../../../index';
import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'value';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const region = searchParams.get('region');
    const metric = searchParams.get('metric');
    const channel = searchParams.get('channel');
    const year = searchParams.get('year');

    // Build where conditions
    const whereConditions = [];
    
    if (region) {
      whereConditions.push(sql`region ILIKE ${`%${region}%`}`);
    }
    
    if (metric) {
      whereConditions.push(sql`metric ILIKE ${`%${metric}%`}`);
    }
    
    if (channel) {
      whereConditions.push(sql`channel ILIKE ${`%${channel}%`}`);
    }
    
    if (year) {
      whereConditions.push(sql`year = ${parseInt(year)}`);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the base query
    let baseQuery = sql`SELECT * FROM mytv_analysis`;
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      baseQuery = sql`${baseQuery} WHERE ${sql.join(whereConditions, sql` AND `)}`;
    }

    // Get total count for pagination
    const countQuery = sql`SELECT COUNT(*) as total FROM mytv_analysis`;
    const countWithWhere = whereConditions.length > 0 
      ? sql`${countQuery} WHERE ${sql.join(whereConditions, sql` AND `)}`
      : countQuery;
    
    const [totalResult] = await db.execute(countWithWhere);
    const total = parseInt(totalResult.total);

    // Get paginated data
    const sortColumn = sql.identifier(sortBy);
    const dataQuery = sql`${baseQuery} ORDER BY ${sortColumn} ${sql.raw(sortOrder.toUpperCase())} LIMIT ${limit} OFFSET ${offset}`;
    const analysisData = await db.execute(dataQuery);

    // Get summary statistics
    const summaryStatsQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            COUNT(*) as total_records,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            MIN(value) as min_value,
            MAX(value) as max_value,
            COUNT(DISTINCT region) as total_regions,
            COUNT(DISTINCT channel) as total_channels,
            COUNT(DISTINCT year) as total_years,
            COUNT(DISTINCT metric) as total_metrics
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
        `
      : sql`
          SELECT 
            COUNT(*) as total_records,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            MIN(value) as min_value,
            MAX(value) as max_value,
            COUNT(DISTINCT region) as total_regions,
            COUNT(DISTINCT channel) as total_channels,
            COUNT(DISTINCT year) as total_years,
            COUNT(DISTINCT metric) as total_metrics
          FROM mytv_analysis
        `;

    const [summaryStats] = await db.execute(summaryStatsQuery);

    // Get regional breakdown
    const regionalBreakdownQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            region,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT metric) as metric_count
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY region 
          ORDER BY total_value DESC
        `
      : sql`
          SELECT 
            region,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT metric) as metric_count
          FROM mytv_analysis 
          GROUP BY region 
          ORDER BY total_value DESC
        `;

    const regionalBreakdown = await db.execute(regionalBreakdownQuery);

    // Get channel breakdown
    const channelBreakdownQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            channel,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT region) as region_count,
            COUNT(DISTINCT metric) as metric_count
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY channel 
          ORDER BY total_value DESC
        `
      : sql`
          SELECT 
            channel,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT region) as region_count,
            COUNT(DISTINCT metric) as metric_count
          FROM mytv_analysis 
          GROUP BY channel 
          ORDER BY total_value DESC
        `;

    const channelBreakdown = await db.execute(channelBreakdownQuery);

    // Get metric breakdown
    const metricBreakdownQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            metric,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT region) as region_count
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY metric 
          ORDER BY total_value DESC
        `
      : sql`
          SELECT 
            metric,
            COUNT(*) as record_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT region) as region_count
          FROM mytv_analysis 
          GROUP BY metric 
          ORDER BY total_value DESC
        `;

    const metricBreakdown = await db.execute(metricBreakdownQuery);

    // Get top performers by value
    const topPerformersQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            region,
            metric,
            channel,
            value,
            year
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          ORDER BY value DESC 
          LIMIT 10
        `
      : sql`
          SELECT 
            region,
            metric,
            channel,
            value,
            year
          FROM mytv_analysis 
          ORDER BY value DESC 
          LIMIT 10
        `;

    const topPerformers = await db.execute(topPerformersQuery);

    // Get yearly trends
    const yearlyTrendsQuery = whereConditions.length > 0
      ? sql`
          SELECT 
            year,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT region) as region_count
          FROM mytv_analysis 
          WHERE ${sql.join(whereConditions, sql` AND `)}
          GROUP BY year 
          ORDER BY year DESC
        `
      : sql`
          SELECT 
            year,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(DISTINCT channel) as channel_count,
            COUNT(DISTINCT region) as region_count
          FROM mytv_analysis 
          GROUP BY year 
          ORDER BY year DESC
        `;

    const yearlyTrends = await db.execute(yearlyTrendsQuery);

    // Format the response
    const response = {
      data: analysisData.map(item => ({
        ...item,
        value: parseInt(item.value) || 0,
        year: parseInt(item.year) || 0,
        page_num: parseInt(item.page_num) || 0,
        table_idx: parseInt(item.table_idx) || 0
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
        totalRecords: parseInt(summaryStats.total_records) || 0,
        totalValue: parseInt(summaryStats.total_value) || 0,
        avgValue: Math.round(parseFloat(summaryStats.avg_value)) || 0,
        minValue: parseInt(summaryStats.min_value) || 0,
        maxValue: parseInt(summaryStats.max_value) || 0,
        totalRegions: parseInt(summaryStats.total_regions) || 0,
        totalChannels: parseInt(summaryStats.total_channels) || 0,
        totalYears: parseInt(summaryStats.total_years) || 0,
        totalMetrics: parseInt(summaryStats.total_metrics) || 0
      },
      regionalBreakdown: regionalBreakdown.map(item => ({
        region: item.region,
        recordCount: parseInt(item.record_count),
        totalValue: parseInt(item.total_value) || 0,
        avgValue: Math.round(parseFloat(item.avg_value)) || 0,
        channelCount: parseInt(item.channel_count) || 0,
        metricCount: parseInt(item.metric_count) || 0
      })),
      channelBreakdown: channelBreakdown.map(item => ({
        channel: item.channel,
        recordCount: parseInt(item.record_count),
        totalValue: parseInt(item.total_value) || 0,
        avgValue: Math.round(parseFloat(item.avg_value)) || 0,
        regionCount: parseInt(item.region_count) || 0,
        metricCount: parseInt(item.metric_count) || 0
      })),
      metricBreakdown: metricBreakdown.map(item => ({
        metric: item.metric,
        recordCount: parseInt(item.record_count),
        totalValue: parseInt(item.total_value) || 0,
        avgValue: Math.round(parseFloat(item.avg_value)) || 0,
        channelCount: parseInt(item.channel_count) || 0,
        regionCount: parseInt(item.region_count) || 0
      })),
      topPerformers: topPerformers.map(item => ({
        region: item.region,
        metric: item.metric,
        channel: item.channel,
        value: parseInt(item.value) || 0,
        year: parseInt(item.year) || 0
      })),
      yearlyTrends: yearlyTrends.map(item => ({
        year: parseInt(item.year),
        totalValue: parseInt(item.total_value) || 0,
        avgValue: Math.round(parseFloat(item.avg_value)) || 0,
        channelCount: parseInt(item.channel_count) || 0,
        regionCount: parseInt(item.region_count) || 0
      })),
      filters: {
        region,
        metric,
        channel,
        year,
        sortBy,
        sortOrder
      },
      meta: {
        queryType: 'mytv_analysis',
        timestamp: new Date().toISOString(),
        totalRecords: total
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
