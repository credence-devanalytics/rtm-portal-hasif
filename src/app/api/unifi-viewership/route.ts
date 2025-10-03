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
    if (!programData[item.programName]) {
      programData[item.programName] = {
        programName: item.programName,
        channelName: item.channelName,
        totalMau: 0,
        episodeCount: 0,
        avgDuration: [],
        latestDate: item.programmeDate
      };
    }
    programData[item.programName].totalMau += item.mau || 0;
    programData[item.programName].episodeCount++;
    
    // Convert duration to minutes for averaging
    if (item.duration) {
      const durationParts = item.duration.toString().split(':');
      const durationMinutes = parseInt(String(durationParts[0])) * 60 + parseInt(String(durationParts[1] || 0));
      programData[item.programName].avgDuration.push(durationMinutes);
    }
    
    if (new Date(item.programmeDate) > new Date(programData[item.programName].latestDate)) {
      programData[item.programName].latestDate = item.programmeDate;
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
    if (!channelData[item.channelName]) {
      channelData[item.channelName] = {
        channelName: item.channelName,
        totalMau: 0,
        programCount: 0,
        uniquePrograms: new Set()
      };
    }
    channelData[item.channelName].totalMau += item.mau || 0;
    channelData[item.channelName].programCount++;
    channelData[item.channelName].uniquePrograms.add(item.programName);
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
    const monthYear = item.viewershipMonthYear;
    if (!monthData[monthYear]) {
      monthData[monthYear] = {
        month: monthYear,
        totalMau: 0,
        programCount: 0,
        avgMau: 0
      };
    }
    monthData[monthYear].totalMau += item.mau || 0;
    monthData[monthYear].programCount++;
  });
  
  return Object.values(monthData).map(month => ({
    ...(month as any),
    totalMau: parseInt(String((month as any).totalMau)) || 0,
    avgMau: Math.round((month as any).totalMau / (month as any).programCount),
    displayMonth: `${(month as any).month.slice(0, 4)}-${(month as any).month.slice(4)}`
  })).sort((a, b) => (a as any).month.localeCompare((b as any).month));
}

function generateTopPrograms(data, limit = 10) {
  const programData = {};
  
  data.forEach(item => {
    if (!programData[item.programName]) {
      programData[item.programName] = {
        programName: item.programName,
        channelName: item.channelName,
        totalMau: 0,
        episodeCount: 0,
        latestDate: item.programmeDate
      };
    }
    programData[item.programName].totalMau += item.mau || 0;
    programData[item.programName].episodeCount++;
    
    if (new Date(item.programmeDate) > new Date(programData[item.programName].latestDate)) {
      programData[item.programName].latestDate = item.programmeDate;
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

    // Build where conditions for filters
    const whereConditions = [];
    
    if (channel) {
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

    // Fetch data from the database
    let query = db.select().from(unifiViewership);
    if (whereConditions.length > 0) {
      query = (query as any).where(and(...whereConditions));
    }
    const allData = await query;

    // Sort and paginate in-memory if needed (or use DB query if supported)
    let filteredData = allData;
    filteredData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    const offset = (page - 1) * limit;
    const total = filteredData.length;
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Generate analytics
    const programBreakdown = generateProgramBreakdown(filteredData);
    const channelBreakdown = generateChannelBreakdown(filteredData);
    const monthlyTrends = generateMonthlyTrends(filteredData);
    const topPrograms = generateTopPrograms(filteredData, 50); // Increased limit to ensure we have enough data for channel comparison

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
        pk: parseInt(String(item.pk)) || 0
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
    return NextResponse.json(
      { 
        error: 'Failed to fetch Unifi viewership data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
