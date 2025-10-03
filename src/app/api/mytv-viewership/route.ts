/**
 * MyTV Viewership API
 * Provides MyTV viewership data with regional and channel analytics
 */

// import { db } from '../../../index';
// import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Mock data generation functions
function generateMockMytvData() {
  const channels = ['TV1', 'TV2', 'OKEY', 'BERITA RTM', 'SUKAN RTM', 'TV6', 'BERNAMA'];
  const regions = ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang', 'Sabah', 'Sarawak'];
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei'];
  const years = [2024, 2025];
  
  const mockData = [];
  
  for (let i = 0; i < 150; i++) {
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const viewers = Math.floor(Math.random() * 5000000) + 100000; // 100K to 5M viewers
    
    mockData.push({
      id: i + 1,
      channel: channel,
      region: region,
      month: month,
      year: year,
      viewers: viewers,
      metric: 'daily_average',
      page_num: Math.floor(i / 10) + 1,
      table_idx: i + 1
    });
  }
  
  return mockData;
}

function generateChannelBreakdown(data: any[]) {
  const channelData: Record<string, {
    channel: string;
    recordCount: number;
    totalViewers: number;
    regionCount: Set<string>;
  }> = {};
  
  data.forEach(item => {
    if (!channelData[item.channel]) {
      channelData[item.channel] = {
        channel: item.channel,
        recordCount: 0,
        totalViewers: 0,
        regionCount: new Set()
      };
    }
    channelData[item.channel].recordCount++;
    channelData[item.channel].totalViewers += Number(item.viewers);
    channelData[item.channel].regionCount.add(item.region);
  });
  
  return Object.values(channelData).map(channel => ({
    channel: channel.channel,
    recordCount: channel.recordCount,
    totalViewers: channel.totalViewers,
    avgViewers: Math.round(channel.totalViewers / channel.recordCount),
    regionCount: channel.regionCount.size
  }));
}

function generateRegionalBreakdown(data: any[]) {
  const regionData: Record<string, {
    region: string;
    recordCount: number;
    totalViewers: number;
    channelCount: Set<string>;
  }> = {};
  
  data.forEach(item => {
    if (!regionData[item.region]) {
      regionData[item.region] = {
        region: item.region,
        recordCount: 0,
        totalViewers: 0,
        channelCount: new Set()
      };
    }
    regionData[item.region].recordCount++;
    regionData[item.region].totalViewers += Number(item.viewers);
    regionData[item.region].channelCount.add(item.channel);
  });
  
  return Object.values(regionData).map(region => ({
    region: region.region,
    recordCount: region.recordCount,
    totalViewers: region.totalViewers,
    avgViewers: Math.round(region.totalViewers / region.recordCount),
    channelCount: region.channelCount.size
  }));
}

function generateMonthlyTrends(data: any[]) {
  const monthData: Record<string, {
    year: number;
    month: number;
    totalViewers: number;
    channelCount: Set<string>;
  }> = {};
  
  data.forEach(item => {
    const key = `${item.year}-${item.month}`;
    if (!monthData[key]) {
      monthData[key] = {
        year: Number(item.year),
        month: Number(item.month),
        totalViewers: 0,
        channelCount: new Set()
      };
    }
    monthData[key].totalViewers += Number(item.viewers);
    monthData[key].channelCount.add(item.channel);
  });
  
  return Object.values(monthData).map(month => ({
    year: month.year,
    month: month.month,
    totalViewers: month.totalViewers,
    avgViewers: Math.round(month.totalViewers / month.channelCount.size),
    channelCount: month.channelCount.size
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = Number(searchParams.get('page') ?? 0) || 1;
    const limit = Number(searchParams.get('limit') ?? 0) || 50;
    const sortBy = searchParams.get('sortBy') || 'viewers';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const region = searchParams.get('region');
    const metric = searchParams.get('metric');
    const channel = searchParams.get('channel');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // TEMPORARY: Return mock data until mytv_viewership table is set up
    // TODO: Replace with actual database queries once table exists
    const mockData = generateMockMytvData();
    
    // Apply filters to mock data
    let filteredData = mockData;
    
    if (region) {
      filteredData = filteredData.filter(item => 
        item.region.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    if (channel) {
      const channels = channel.split(',');
      filteredData = filteredData.filter(item => 
        channels.some(ch => item.channel.toLowerCase().includes(ch.toLowerCase()))
      );
    }
    
    if (month) {
      filteredData = filteredData.filter(item => 
        item.month.toLowerCase().includes(month.toLowerCase())
      );
    }
    
    if (year) {
      filteredData = filteredData.filter(item => 
        item.year === Number()
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    const total = filteredData.length;

    // Get paginated data
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Get summary statistics
    const summaryStats = {
      total_records: filteredData.length,
      total_viewers: filteredData.reduce((sum, item) => sum + item.viewers, 0),
      avg_viewers: filteredData.length > 0 ? 
        filteredData.reduce((sum, item) => sum + item.viewers, 0) / filteredData.length : 0,
      total_regions: [...new Set(filteredData.map(item => item.region))].length,
      total_channels: [...new Set(filteredData.map(item => item.channel))].length,
      total_years: [...new Set(filteredData.map(item => item.year))].length,
      total_months: [...new Set(filteredData.map(item => item.month))].length
    };

    // Format the response
    const response = {
      data: paginatedData.map(item => ({
        ...item,
        viewers: Number() || 0,
        year: Number() || 0,
        page_num: Number() || 0,
        table_idx: Number() || 0
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
        totalRecords: Number() || 0,
        totalViewers: Number() || 0,
        avgViewers: Math.round(Number()) || 0,
        totalRegions: Number() || 0,
        totalChannels: Number() || 0,
        totalYears: Number() || 0,
        totalMonths: Number() || 0
      },
      regionalBreakdown: generateRegionalBreakdown(filteredData),
      channelBreakdown: generateChannelBreakdown(filteredData),
      monthlyTrends: generateMonthlyTrends(filteredData),
      filters: {
        region,
        metric,
        channel,
        month,
        year,
        sortBy,
        sortOrder
      },
      meta: {
        queryType: 'mytv_viewership_mock',
        timestamp: new Date().toISOString(),
        totalRecords: total
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('MyTV Viewership API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch MyTV viewership data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
