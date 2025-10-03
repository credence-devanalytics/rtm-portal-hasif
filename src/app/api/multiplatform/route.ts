/**
 * Multiplatform Viewership API
 * Provides Unifi TV viewership data with filtering and aggregation
 */

import { db } from '../../../index';
import { sql, desc, asc, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Define the unifi_viewership table schema (adjust according to your actual schema file)
// You may need to import this from your schema file instead
const unifiViewership = {
  pk: 'pk',
  viewership_month_year: 'viewership_month_year',
  channel_name: 'channel_name',
  program_name: 'program_name',
  program_time: 'program_time',
  programme_date: 'programme_date',
  start_time: 'start_time',
  end_time: 'end_time',
  mau: 'mau',
  avg_access_duration: 'avg_access_duration',
  sheet_name: 'sheet_name',
  downloaddate: 'downloaddate',
  filename: 'filename',
  duration: 'duration'
};

// Mock data generation functions
function generateMockData() {
  // Use the same channels as MyTV for better comparison
  const channels = ['TV1', 'TV2', 'OKEY', 'BERITA RTM', 'SUKAN RTM', 'TV6', 'BERNAMA'];
  const programs = [
    'Upin & Ipin', 'Berita RTM', 'Drama Bersiri', 'Masterchef Malaysia', 
    'Gempak', 'Warna-Warni', 'Selamat Pagi Malaysia', 'Bulletin Utama',
    'Maharaja Lawak Mega', 'My Lovely Sam Soon'
  ];
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
  
  const mockData = [];
  
  for (let i = 0; i < 100; i++) {
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const program = programs[Math.floor(Math.random() * programs.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    const hour = Math.floor(Math.random() * 24);
    const mau = Math.floor(Math.random() * 50000) + 1000;
    const duration = Math.floor(Math.random() * 120) + 15;
    
    mockData.push({
      pk: i + 1,
      viewership_month_year: month,
      channel_name: channel,
      program_name: program,
      program_time: `${hour.toString().padStart(2, '0')}:00`,
      programme_date: `${month}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
      mau: mau,
      avg_access_duration: Math.floor(Math.random() * 60) + 5,
      duration: duration,
      sheet_name: 'Viewership Data',
      downloaddate: new Date().toISOString(),
      filename: 'unifi_data.xlsx'
    });
  }
  
  return mockData;
}

function generateChannelBreakdown(data: any[]) {
  const channelData: Record<string, {
    channel: string;
    programCount: number;
    totalMau: number;
  }> = {};
  
  data.forEach(item => {
    if (!channelData[item.channel_name]) {
      channelData[item.channel_name] = {
        channel: item.channel_name,
        programCount: 0,
        totalMau: 0
      };
    }
    channelData[item.channel_name].programCount++;
    channelData[item.channel_name].totalMau += Number(item.mau);
  });
  
  return Object.values(channelData).map(channel => ({
    ...channel,
    avgMau: Math.round(channel.totalMau / channel.programCount)
  }));
}

function generateTopPrograms(data: any[]) {
  return data
    .sort((a, b) => Number(b.mau) - Number(a.mau))
    .slice(0, 10)
    .map(item => ({
      programName: item.program_name,
      channelName: item.channel_name,
      mau: item.mau,
      date: item.programme_date,
      avgAccessDuration: item.avg_access_duration
    }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = Number(searchParams.get('page') ?? 0) || 1;
    const limit = Number(searchParams.get('limit') ?? 0) || 50;
    const sortBy = searchParams.get('sortBy') || 'programme_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const channel = searchParams.get('channel');
    const monthYear = searchParams.get('monthYear');
    const programName = searchParams.get('programName');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // TEMPORARY: Return mock data until unifi_viewership table is set up
    // TODO: Replace with actual database queries once table exists
    const mockData = generateMockData();
    
    // Format the response
    const response = {
      data: mockData.slice(0, limit),
      pagination: {
        page,
        limit,
        total: mockData.length,
        totalPages: Math.ceil(mockData.length / limit),
        hasNext: page < Math.ceil(mockData.length / limit),
        hasPrev: page > 1
      },
      summary: {
        totalPrograms: mockData.length,
        totalMau: mockData.reduce((sum, item) => sum + item.mau, 0),
        avgMau: Math.round(mockData.reduce((sum, item) => sum + item.mau, 0) / mockData.length),
        totalChannels: [...new Set(mockData.map(item => item.channel_name))].length,
        totalMonths: [...new Set(mockData.map(item => item.viewership_month_year))].length
      },
      channelBreakdown: generateChannelBreakdown(mockData),
      topPrograms: generateTopPrograms(mockData),
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
        queryType: 'unifi_viewership_mock',
        timestamp: new Date().toISOString(),
        totalRecords: mockData.length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Multiplatform Viewership API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch viewership data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST endpoint for bulk operations or data insertion
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'bulk_insert':
        // Handle bulk insert of viewership data
        if (!Array.isArray(data) || data.length === 0) {
          return NextResponse.json(
            { error: 'Data array is required for bulk insert' },
            { status: 400 }
          );
        }

        // Insert data (adjust according to your schema)
        const insertQuery = sql`
          INSERT INTO unifi_viewership (
            viewership_month_year, channel_name, program_name, program_time,
            programme_date, start_time, end_time, mau, avg_access_duration,
            sheet_name, filename, duration
          ) VALUES ${sql.join(
            data.map(item => sql`(
              ${item.viewership_month_year}, ${item.channel_name}, ${item.program_name},
              ${item.program_time}, ${item.programme_date}, ${item.start_time},
              ${item.end_time}, ${item.mau}, ${item.avg_access_duration},
              ${item.sheet_name}, ${item.filename}, ${item.duration}
            )`),
            sql`, `
          )}
        `;

        await db.execute(insertQuery);

        return NextResponse.json({
          success: true,
          message: `Successfully inserted ${data.length} records`,
          insertedCount: data.length
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Multiplatform Viewership POST API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
