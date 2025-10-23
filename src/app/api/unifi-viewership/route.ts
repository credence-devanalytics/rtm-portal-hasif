/**
 * Unifi TV Viewership API
 * Provides Unifi TV viewership data with MAU analytics and time-based filtering
 */

import { NextResponse } from 'next/server';
import { db } from '../../../index';
import { unifiViewership } from '../../../../drizzle/schema';
import { eq, and, gte, lte, like, inArray } from 'drizzle-orm';

function generateProgramBreakdown(data) {
  const programData = {};
  
  data.forEach(item => {
    const programName = item.programName || 'Unknown';
    const channelName = item.channelName || 'Unknown';
    const programmeDate = item.programmeDate || new Date().toISOString();
    
    if (!programData[programName]) {
      programData[programName] = {
        programName: programName,
        channelName: channelName,
        totalMau: 0,
        episodeCount: 0,
        avgDuration: [],
        latestDate: programmeDate
      };
    }
    programData[programName].totalMau += item.mau || 0;
    programData[programName].episodeCount++;
    
    // Convert duration to minutes for averaging
    // Duration comes as interval object: {hours: 2} or {minutes: 30} or {hours: 1, minutes: 30}
    if (item.duration) {
      try {
        let durationMinutes = 0;
        
        // Handle interval object from PostgreSQL
        if (typeof item.duration === 'object') {
          const dur = item.duration;
          durationMinutes = (dur.years || 0) * 525600 +
                           (dur.months || 0) * 43800 +
                           (dur.days || 0) * 1440 +
                           (dur.hours || 0) * 60 +
                           (dur.minutes || 0) +
                           (dur.seconds || 0) / 60;
        } else {
          // Fallback: parse as string "HH:MM:SS"
          const durationStr = item.duration.toString().trim();
          const durationParts = durationStr.split(':');
          if (durationParts.length >= 2) {
            const hours = parseInt(String(durationParts[0])) || 0;
            const minutes = parseInt(String(durationParts[1])) || 0;
            durationMinutes = hours * 60 + minutes;
          }
        }
        
        if (durationMinutes > 0) {
          programData[programName].avgDuration.push(durationMinutes);
        }
      } catch (e) {
        console.warn('Failed to parse duration:', item.duration, e);
      }
    }
    
    if (new Date(programmeDate) > new Date(programData[programName].latestDate)) {
      programData[programName].latestDate = programmeDate;
    }
  });
  
  return Object.values(programData).map(program => ({
    ...(program as any),
    avgMau: Math.round((program as any).totalMau / (program as any).episodeCount),
    totalMau: parseInt(String((program as any).totalMau)) || 0,
    avgDurationMinutes: (program as any).avgDuration.length > 0 ? Math.round(
      (program as any).avgDuration.reduce((sum: number, dur: number) => sum + dur, 0) / (program as any).avgDuration.length
    ) : 0
  })).sort((a, b) => (b as any).totalMau - (a as any).totalMau);
}

function generateChannelBreakdown(data) {
  const channelData = {};
  
  data.forEach(item => {
    const channelName = item.channelName || 'Unknown';
    const programName = item.programName || 'Unknown';
    
    if (!channelData[channelName]) {
      channelData[channelName] = {
        channelName: channelName,
        totalMau: 0,
        programCount: 0,
        uniquePrograms: new Set()
      };
    }
    channelData[channelName].totalMau += item.mau || 0;
    channelData[channelName].programCount++;
    channelData[channelName].uniquePrograms.add(programName);
  });
  
  return Object.values(channelData).map(channel => ({
    channelName: (channel as any).channelName,
    totalMau: parseInt(String((channel as any).totalMau)) || 0,
    programCount: (channel as any).programCount,
    uniqueProgramCount: (channel as any).uniquePrograms.size,
    avgMau: Math.round((channel as any).totalMau / (channel as any).programCount)
  })).sort((a, b) => b.totalMau - a.totalMau);
}

function generateMonthlyTrends(data) {
  const monthData = {};
  
  data.forEach(item => {
    // Get monthYear from the data
    const monthYear = item.viewershipMonthYear;
    
    // Skip items without valid monthYear
    if (!monthYear) {
      console.warn('Skipping item with missing viewershipMonthYear:', item);
      return;
    }
    
    if (!monthData[monthYear]) {
      monthData[monthYear] = {
        month: monthYear,
        totalMau: 0,
        tv1Mau: 0,
        tv2Mau: 0,
        programCount: 0,
        avgMau: 0
      };
    }
    monthData[monthYear].totalMau += item.mau || 0;
    monthData[monthYear].programCount++;
    
    // Separate MAU by channel
    const channelName = item.channelName || '';
    if (channelName === 'TV1') {
      monthData[monthYear].tv1Mau += item.mau || 0;
    } else if (channelName === 'TV2') {
      monthData[monthYear].tv2Mau += item.mau || 0;
    }
  });
  
  return Object.values(monthData)
    .filter((month: any) => month.month)
    .map(month => ({
      ...(month as any),
      totalMau: parseInt(String((month as any).totalMau)) || 0,
      tv1Mau: parseInt(String((month as any).tv1Mau)) || 0,
      tv2Mau: parseInt(String((month as any).tv2Mau)) || 0,
      avgMau: Math.round((month as any).totalMau / (month as any).programCount),
      displayMonth: `${(month as any).month.slice(0, 4)}-${(month as any).month.slice(4)}`
    }))
    .sort((a, b) => (a as any).month.localeCompare((b as any).month));
}

function generateTopPrograms(data, limit = 10) {
  const programData = {};
  
  data.forEach(item => {
    const programName = item.programName || 'Unknown';
    const channelName = item.channelName || 'Unknown';
    const programmeDate = item.programmeDate || new Date().toISOString();
    
    if (!programData[programName]) {
      programData[programName] = {
        programName: programName,
        channelName: channelName,
        totalMau: 0,
        episodeCount: 0,
        latestDate: programmeDate
      };
    }
    programData[programName].totalMau += item.mau || 0;
    programData[programName].episodeCount++;
    
    if (new Date(programmeDate) > new Date(programData[programName].latestDate)) {
      programData[programName].latestDate = programmeDate;
    }
  });
  
  return Object.values(programData)
    .map(program => ({
      programName: (program as any).programName,
      channelName: (program as any).channelName,
      mau: parseInt(String((program as any).totalMau)) || 0,
      episodeCount: (program as any).episodeCount,
      date: (program as any).latestDate
    }))
    .sort((a, b) => b.mau - a.mau)
    .slice(0, limit);
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
    const sortBy = searchParams.get('sortBy') || 'mau';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const channel = searchParams.get('channel');
    const monthYear = searchParams.get('monthYear');
    const programName = searchParams.get('programName');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    console.log('Unifi Viewership API - Request params:', {
      page, limit, sortBy, sortOrder, channel, monthYear, programName, dateFrom, dateTo
    });

    // Build where conditions for filters
    const whereConditions = [];
    
    if (channel && channel !== 'all') {
      const channels = channel.split(',');
      whereConditions.push(inArray(unifiViewership.channelName, channels));
    }
    if (monthYear) {
      whereConditions.push(eq(unifiViewership.viewershipMonthYear, monthYear));
    }
    if (programName) {
      whereConditions.push(like(unifiViewership.programName, `%${programName}%`));
    }
    if (dateFrom) {
      whereConditions.push(gte(unifiViewership.programmeDate, dateFrom));
    }
    if (dateTo) {
      whereConditions.push(lte(unifiViewership.programmeDate, dateTo));
    }

    console.log('Fetching data from database with', whereConditions.length, 'conditions');

    let allData;
    try {
      // Fetch data from the database
      let query = db.select().from(unifiViewership);
      if (whereConditions.length > 0) {
        query = (query as any).where(and(...whereConditions));
      }
      allData = await query;
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      throw new Error(`Database query error: ${dbError.message}`);
    }
    
    console.log('Fetched', allData.length, 'records from database');

    // Check if we have data
    if (!allData || allData.length === 0) {
      console.warn('No data found in database with current filters');
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalRecords: 0, totalMau: 0, avgMau: 0, totalPrograms: 0, totalChannels: 0, totalMonths: 0 },
        analytics: { programBreakdown: [], channelBreakdown: [], monthlyTrends: [], topPrograms: [] },
        filters: { channel, monthYear, programName, dateFrom, dateTo, sortBy, sortOrder },
        meta: { queryType: 'unifi_viewership_db', timestamp: new Date().toISOString(), totalRecords: 0 }
      });
    }

    // Sort and paginate in-memory if needed (or use DB query if supported)
    let filteredData = [...allData];
    filteredData.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
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
    let programBreakdown = [];
    let channelBreakdown = [];
    let monthlyTrends = [];
    let topPrograms = [];

    try {
      programBreakdown = generateProgramBreakdown(filteredData);
      channelBreakdown = generateChannelBreakdown(filteredData);
      monthlyTrends = generateMonthlyTrends(filteredData);
      topPrograms = generateTopPrograms(filteredData, 50);
      console.log('Analytics generated successfully');
    } catch (analyticsError) {
      console.error('Error generating analytics:', analyticsError);
      // Continue with empty analytics rather than failing completely
    }

    // Calculate summary statistics
    const summaryStats = {
      total_records: filteredData.length,
      total_mau: filteredData.reduce((sum, item) => sum + (item.mau || 0), 0),
      avg_mau: filteredData.length > 0 ? 
        Math.round(filteredData.reduce((sum, item) => sum + (item.mau || 0), 0) / filteredData.length) : 0,
      total_programs: [...new Set(filteredData.map(item => item.programName))].length,
      total_channels: [...new Set(filteredData.map(item => item.channelName))].length,
      total_months: [...new Set(filteredData.map(item => item.viewershipMonthYear))].length
    };

    // Format the response
    const response = {
      data: paginatedData.map(item => ({
        ...item,
        mau: parseInt(String(item.mau)) || 0,
        id: item.id || 0
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
        totalMau: summaryStats.total_mau,
        avgMau: summaryStats.avg_mau,
        totalPrograms: summaryStats.total_programs,
        totalChannels: summaryStats.total_channels,
        totalMonths: summaryStats.total_months
      },
      analytics: {
        programBreakdown,
        channelBreakdown,
        monthlyTrends,
        topPrograms
      },
      filters: {
        channel,
        monthYear,
        programName,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      },
      meta: {
        queryType: 'unifi_viewership_db',
        timestamp: new Date().toISOString(),
        totalRecords: total
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unifi Viewership API error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Unifi viewership data', 
        details: error.message,
        errorType: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
