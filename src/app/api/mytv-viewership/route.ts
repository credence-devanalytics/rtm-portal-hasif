/**
 * MyTV Viewership API
 * Provides MyTV viewership data with regional and channel analytics
 */

import { NextResponse } from 'next/server';
import { db } from '../../../index';
import { mytvViewership } from '../../../../drizzle/schema';
import { eq, and, gte, lte, like, inArray, sql } from 'drizzle-orm';

function generateChannelBreakdown(data) {
  const channelData = {};
  
  data.forEach(item => {
    if (!channelData[item.channel]) {
      channelData[item.channel] = {
        channel: item.channel,
        totalViewers: 0,
        recordCount: 0,
        uniqueRegions: new Set(),
        programCount: 0 // Will be populated from mytv_v2_top_programs
      };
    }
    channelData[item.channel].totalViewers += Number(item.viewers) || 0;
    channelData[item.channel].recordCount++;
    channelData[item.channel].uniqueRegions.add(item.region);
  });
  
  return Object.values(channelData).map(channel => ({
    channel: (channel as any).channel,
    totalViewers: parseInt(String((channel as any).totalViewers)) || 0,
    recordCount: (channel as any).recordCount,
    regionCount: (channel as any).uniqueRegions.size,
    avgViewers: Math.round((channel as any).totalViewers / (channel as any).recordCount),
    programCount: (channel as any).programCount || 0
  })).sort((a, b) => b.totalViewers - a.totalViewers);
}

function generateRegionalBreakdown(data) {
  const regionData = {};
  
  data.forEach(item => {
    if (!regionData[item.region]) {
      regionData[item.region] = {
        region: item.region,
        totalViewers: 0,
        recordCount: 0,
        uniqueChannels: new Set()
      };
    }
    regionData[item.region].totalViewers += Number(item.viewers) || 0;
    regionData[item.region].recordCount++;
    regionData[item.region].uniqueChannels.add(item.channel);
  });
  
  return Object.values(regionData).map(region => ({
    region: (region as any).region,
    totalViewers: parseInt(String((region as any).totalViewers)) || 0,
    recordCount: (region as any).recordCount,
    channelCount: (region as any).uniqueChannels.size,
    avgViewers: Math.round((region as any).totalViewers / (region as any).recordCount)
  })).sort((a, b) => b.totalViewers - a.totalViewers);
}

function generateMonthlyTrends(data) {
  const monthOrder = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const monthData = {};
  
  data.forEach(item => {
    const monthKey = item.month;
    if (!monthData[monthKey]) {
      monthData[monthKey] = {
        month: monthKey,
        totalViewers: 0,
        recordCount: 0,
        uniqueChannels: new Set()
      };
    }
    monthData[monthKey].totalViewers += Number(item.viewers) || 0;
    monthData[monthKey].recordCount++;
    monthData[monthKey].uniqueChannels.add(item.channel);
  });
  
  return Object.values(monthData)
    .map(month => ({
      month: (month as any).month,
      totalViewers: parseInt(String((month as any).totalViewers)) || 0,
      avgViewers: Math.round((month as any).totalViewers / (month as any).recordCount),
      channelCount: (month as any).uniqueChannels.size
    }))
    .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
}

export async function GET(request: Request) {
  try {
    // Check if database connection exists
    if (!db) {
      console.error('Database connection not initialized');
      throw new Error('Database connection not available');
    }

    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(String(searchParams.get('page'))) || 1;
    const limit = parseInt(String(searchParams.get('limit'))) || 50;
    const sortBy = searchParams.get('sortBy') || 'viewers';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const region = searchParams.get('region');
    const channel = searchParams.get('channel');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const metric = searchParams.get('metric');

    console.log('MyTV Viewership API - Request params:', {
      page, limit, sortBy, sortOrder, region, channel, month, year, metric
    });

    // Build where conditions for filters
    const whereConditions = [];
    
    if (region && region !== 'all') {
      whereConditions.push(eq(mytvViewership.region, region));
    }
    if (channel && channel !== 'all') {
      const channels = channel.split(',');
      whereConditions.push(inArray(mytvViewership.channel, channels));
    }
    if (month && month !== 'all') {
      whereConditions.push(eq(mytvViewership.month, month));
    }
    if (year && year !== 'all') {
      whereConditions.push(eq(mytvViewership.year, parseInt(year)));
    }
    if (metric) {
      whereConditions.push(eq(mytvViewership.metric, metric));
    }

    console.log('Fetching data from database with', whereConditions.length, 'conditions');

    // Fetch data from the database
    let query = db.select().from(mytvViewership);
    if (whereConditions.length > 0) {
      query = (query as any).where(and(...whereConditions));
    }
    const allData = await query;
    
    console.log('Fetched', allData.length, 'records from database');

    // Check if we have data
    if (!allData || allData.length === 0) {
      console.warn('No data found in database with current filters');
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalRecords: 0, totalViewers: 0, avgViewers: 0, totalRegions: 0, totalChannels: 0, totalYears: 0, totalMonths: 0 },
        regionalBreakdown: [],
        channelBreakdown: [],
        monthlyTrends: [],
        filters: { region, channel, month, year, metric, sortBy, sortOrder },
        meta: { queryType: 'mytv_viewership_db', timestamp: new Date().toISOString(), totalRecords: 0 }
      });
    }

    // Sort and paginate in-memory
    let filteredData = [...allData];
    filteredData.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'viewers') {
        aVal = Number(a.viewers) ?? 0;
        bVal = Number(b.viewers) ?? 0;
      } else if (sortBy === 'year') {
        aVal = a.year ?? 0;
        bVal = b.year ?? 0;
      } else if (sortBy === 'channel') {
        aVal = a.channel ?? '';
        bVal = b.channel ?? '';
      } else {
        aVal = a[sortBy] ?? 0;
        bVal = b[sortBy] ?? 0;
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    const offset = (page - 1) * limit;
    const total = filteredData.length;
    const paginatedData = filteredData.slice(offset, offset + limit);

    console.log('Generating analytics for', total, 'records');

    // Generate analytics with error handling
    let channelBreakdown = [];
    let regionalBreakdown = [];
    let monthlyTrends = [];

    try {
      channelBreakdown = generateChannelBreakdown(filteredData);
      
      // Fetch total viewers for year 2024 from mytv_v2_viewership table
      try {
        const viewerCounts = await db.execute(sql`
          SELECT 
            channel,
            SUM(viewers) AS total_viewers
          FROM mytv_v2_viewership
          WHERE year = 2024
            AND channel ILIKE ANY (ARRAY[
              '%TV1%',
              '%TV2%',
              '%TV6%',
              '%OKEY%',
              '%SUKAN%',
              '%BERITA%'
            ])
          GROUP BY channel
        `);
        
        // Map total viewers to channel breakdown
        if (viewerCounts && viewerCounts.rows) {
          viewerCounts.rows.forEach((row: any) => {
            const channelMatch = channelBreakdown.find(ch => {
              const channelName = row.channel.toUpperCase();
              const breakdownName = ch.channel.toUpperCase();
              return channelName.includes(breakdownName) || breakdownName.includes(channelName);
            });
            
            if (channelMatch) {
              channelMatch.totalViewers = parseInt(row.total_viewers) || 0;
            }
          });
        }
        
        console.log('Total viewers for 2024 fetched successfully:', viewerCounts?.rows);
      } catch (viewerError) {
        console.error('Error fetching total viewers:', viewerError);
        // Continue with calculated totals from filtered data
      }
      
      // Fetch program counts from mytv_v2_top_programs table
      try {
        const programCounts = await db.execute(sql`
          SELECT count(*) as program_count, channel
          FROM mytv_v2_top_programs
          WHERE channel ILIKE ANY (ARRAY[
            '%TV1%',
            '%TV2%',
            '%TV6%',
            '%OKEY%',
            '%SUKAN%',
            '%BERITA%'
          ])
          GROUP BY channel
        `);
        
        // Map program counts to channel breakdown
        if (programCounts && programCounts.rows) {
          programCounts.rows.forEach((row: any) => {
            const channelMatch = channelBreakdown.find(ch => {
              const channelName = row.channel.toUpperCase();
              const breakdownName = ch.channel.toUpperCase();
              return channelName.includes(breakdownName) || breakdownName.includes(channelName);
            });
            
            if (channelMatch) {
              channelMatch.programCount = parseInt(row.program_count) || 0;
            }
          });
        }
        
        console.log('Program counts fetched successfully:', programCounts?.rows);
      } catch (programError) {
        console.error('Error fetching program counts:', programError);
        // Continue with 0 program counts
      }
      
      regionalBreakdown = generateRegionalBreakdown(filteredData);
      monthlyTrends = generateMonthlyTrends(filteredData);
      console.log('Analytics generated successfully');
    } catch (analyticsError) {
      console.error('Error generating analytics:', analyticsError);
      // Continue with empty analytics rather than failing completely
    }

    // Calculate summary statistics
    const summaryStats = {
      total_records: filteredData.length,
      total_viewers: filteredData.reduce((sum, item) => sum + (Number(item.viewers) || 0), 0),
      avg_viewers: filteredData.length > 0 ? 
        Math.round(filteredData.reduce((sum, item) => sum + (Number(item.viewers) || 0), 0) / filteredData.length) : 0,
      total_regions: [...new Set(filteredData.map(item => item.region))].length,
      total_channels: [...new Set(filteredData.map(item => item.channel))].length,
      total_years: [...new Set(filteredData.map(item => item.year))].length,
      total_months: [...new Set(filteredData.map(item => item.month))].length
    };

    // Format the response
    const response = {
      data: paginatedData.map(item => ({
        id: parseInt(String(item.id)) || 0,
        channel: item.channel || 'N/A',
        region: item.region || 'N/A',
        month: item.month || 'N/A',
        year: parseInt(String(item.year)) || 0,
        viewers: parseInt(String(item.viewers)) || 0,
        metric: item.metric || 'N/A',
        page_num: parseInt(String(item.page_num)) || 0,
        table_idx: parseInt(String(item.table_idx)) || 0,
        page_title: item.page_title || null,
        inserted_at: item.inserted_at || null,
        updated_at: item.updated_at || null
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
        totalRecords: summaryStats.total_records,
        totalViewers: summaryStats.total_viewers,
        avgViewers: summaryStats.avg_viewers,
        totalRegions: summaryStats.total_regions,
        totalChannels: summaryStats.total_channels,
        totalYears: summaryStats.total_years,
        totalMonths: summaryStats.total_months
      },
      regionalBreakdown,
      channelBreakdown,
      monthlyTrends,
      filters: {
        region,
        channel,
        month,
        year,
        metric,
        sortBy,
        sortOrder
      },
      meta: {
        queryType: 'mytv_viewership_db',
        timestamp: new Date().toISOString(),
        totalRecords: total
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('MyTV Viewership API error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      cause: error?.cause
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch MyTV viewership data', 
        details: error?.message,
        errorType: error?.name,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
