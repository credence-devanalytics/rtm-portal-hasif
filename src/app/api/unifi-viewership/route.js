/**
 * Unifi TV Viewership API
 * Provides Unifi TV viewership data with MAU analytics and time-based filtering
 */

import { NextResponse } from 'next/server';

// Mock data generation based on your schema
function generateMockUnifiViewershipData() {
  const channels = ['TV1', 'TV2', 'OKEY', 'BERITA RTM', 'SUKAN RTM', 'TV6', 'BERNAMA'];
  const programs = [
    'Spider-Man : Far From Home', 'Sarpatta Parambarai', 'Pendoa Yang Ikhlas',
    'Paati Aminah', 'Mrs. Chatterjee Vs Norway', 'Mother Gamer', 'Mariposa',
    'Magic To Win', 'Berita RTM', 'Drama Bersiri', 'Masterchef Malaysia', 
    'Gempak', 'Warna-Warni', 'Selamat Pagi Malaysia', 'Bulletin Utama',
    'Maharaja Lawak Mega', 'My Lovely Sam Soon'
  ];
  
  const months = ['202501', '202502', '202503', '202504', '202505'];
  
  const mockData = [];
  
  // Generate data with more balanced distribution across months
  for (let i = 0; i < 300; i++) { // Increased from 200 to 300 for more data
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const program = programs[Math.floor(Math.random() * programs.length)];
    
    // More balanced month distribution for better trends
    let monthYear;
    if (i < 80) {
      monthYear = '202505'; // Current month (about 27%)
    } else if (i < 140) {
      monthYear = '202504'; // Previous month (20%)
    } else if (i < 190) {
      monthYear = '202503'; // 2 months ago (17%)
    } else if (i < 230) {
      monthYear = '202502'; // 3 months ago (13%)
    } else if (i < 260) {
      monthYear = '202501'; // 4 months ago (10%)
    } else {
      // Remaining 13% distributed randomly across all months
      monthYear = months[Math.floor(Math.random() * months.length)];
    }
    
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const startHour = Math.floor(Math.random() * 24);
    const duration = Math.floor(Math.random() * 180) + 30; // 30 min to 3.5 hours
    const endHour = startHour + Math.floor(duration / 60);
    const endMinute = duration % 60;
    
    const mau = Math.floor(Math.random() * 8000) + 1000; // 1K to 9K MAU
    const avgAccessDuration = Math.floor(Math.random() * 60) + 5; // 5 to 65 minutes
    
    const programmeDate = `${monthYear.slice(0, 4)}-${monthYear.slice(4)}-${day}`;
    const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
    const programTime = `${programmeDate} ${startTime}-${programmeDate} ${endTime}`;
    
    mockData.push({
      pk: 2300 + i,
      viewership_month_year: monthYear,
      channel_name: channel,
      program_name: program,
      program_time: programTime,
      programme_date: programmeDate,
      start_time: startTime,
      end_time: endTime,
      mau: mau,
      avg_access_duration: `00:${avgAccessDuration.toString().padStart(2, '0')}:00`,
      sheet_name: `${channel} ${monthYear.slice(0, 4)}.${monthYear.slice(4)}'`,
      downloaddate: new Date().toISOString().split('T')[0],
      filename: `${monthYear}.${monthYear.slice(4)} Monthly Viewership Data -RTM TOP 20.xlsx`,
      duration: `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}:00`
    });
  }
  
  return mockData.sort((a, b) => new Date(b.programme_date) - new Date(a.programme_date));
}

function generateProgramBreakdown(data) {
  const programData = {};
  
  data.forEach(item => {
    if (!programData[item.program_name]) {
      programData[item.program_name] = {
        programName: item.program_name,
        channelName: item.channel_name,
        totalMau: 0,
        episodeCount: 0,
        avgDuration: [],
        latestDate: item.programme_date
      };
    }
    programData[item.program_name].totalMau += item.mau;
    programData[item.program_name].episodeCount++;
    
    // Convert duration to minutes for averaging
    const durationParts = item.duration.split(':');
    const durationMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
    programData[item.program_name].avgDuration.push(durationMinutes);
    
    if (new Date(item.programme_date) > new Date(programData[item.program_name].latestDate)) {
      programData[item.program_name].latestDate = item.programme_date;
    }
  });
  
  return Object.values(programData).map(program => ({
    ...program,
    avgMau: Math.round(program.totalMau / program.episodeCount),
    totalMau: parseInt(program.totalMau) || 0, // Ensure it's a number
    avgDurationMinutes: Math.round(
      program.avgDuration.reduce((sum, dur) => sum + dur, 0) / program.avgDuration.length
    )
  })).sort((a, b) => b.totalMau - a.totalMau);
}

function generateChannelBreakdown(data) {
  const channelData = {};
  
  data.forEach(item => {
    if (!channelData[item.channel_name]) {
      channelData[item.channel_name] = {
        channelName: item.channel_name,
        totalMau: 0,
        programCount: 0,
        uniquePrograms: new Set()
      };
    }
    channelData[item.channel_name].totalMau += item.mau;
    channelData[item.channel_name].programCount++;
    channelData[item.channel_name].uniquePrograms.add(item.program_name);
  });
  
  return Object.values(channelData).map(channel => ({
    channelName: channel.channelName,
    totalMau: parseInt(channel.totalMau) || 0, // Ensure it's a number
    programCount: channel.programCount,
    uniqueProgramCount: channel.uniquePrograms.size,
    avgMau: Math.round(channel.totalMau / channel.programCount)
  })).sort((a, b) => b.totalMau - a.totalMau);
}

function generateMonthlyTrends(data) {
  const monthData = {};
  
  data.forEach(item => {
    const monthYear = item.viewership_month_year;
    if (!monthData[monthYear]) {
      monthData[monthYear] = {
        month: monthYear,
        totalMau: 0,
        programCount: 0,
        avgMau: 0
      };
    }
    monthData[monthYear].totalMau += item.mau;
    monthData[monthYear].programCount++;
  });
  
  return Object.values(monthData).map(month => ({
    ...month,
    totalMau: parseInt(month.totalMau) || 0, // Ensure it's a number
    avgMau: Math.round(month.totalMau / month.programCount),
    displayMonth: `${month.month.slice(0, 4)}-${month.month.slice(4)}`
  })).sort((a, b) => a.month.localeCompare(b.month));
}

function generateTopPrograms(data, limit = 10) {
  // First aggregate the data by program name to get total MAU per program
  const programData = {};
  
  data.forEach(item => {
    if (!programData[item.program_name]) {
      programData[item.program_name] = {
        programName: item.program_name,
        channelName: item.channel_name,
        totalMau: 0,
        episodeCount: 0,
        latestDate: item.programme_date
      };
    }
    programData[item.program_name].totalMau += item.mau;
    programData[item.program_name].episodeCount++;
    
    if (new Date(item.programme_date) > new Date(programData[item.program_name].latestDate)) {
      programData[item.program_name].latestDate = item.programme_date;
    }
  });
  
  // Convert to array and sort by total MAU
  return Object.values(programData)
    .map(program => ({
      programName: program.programName,
      channelName: program.channelName,
      mau: parseInt(program.totalMau) || 0, // Use total MAU for the program
      episodeCount: program.episodeCount,
      date: program.latestDate
    }))
    .sort((a, b) => b.mau - a.mau)
    .slice(0, limit);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'mau';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const channel = searchParams.get('channel');
    const monthYear = searchParams.get('monthYear');
    const programName = searchParams.get('programName');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Generate mock data based on your schema
    const mockData = generateMockUnifiViewershipData();
    
    // Apply filters
    let filteredData = mockData;
    
    if (channel) {
      const channels = channel.split(',');
      filteredData = filteredData.filter(item => 
        channels.some(ch => item.channel_name.toLowerCase().includes(ch.toLowerCase()))
      );
    }
    
    if (monthYear) {
      filteredData = filteredData.filter(item => 
        item.viewership_month_year === monthYear
      );
    }
    
    if (programName) {
      filteredData = filteredData.filter(item => 
        item.program_name.toLowerCase().includes(programName.toLowerCase())
      );
    }
    
    if (dateFrom) {
      filteredData = filteredData.filter(item => 
        new Date(item.programme_date) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filteredData = filteredData.filter(item => 
        new Date(item.programme_date) <= new Date(dateTo)
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    const total = filteredData.length;

    // Sort data
    filteredData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Get paginated data
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Generate analytics
    const programBreakdown = generateProgramBreakdown(filteredData);
    const channelBreakdown = generateChannelBreakdown(filteredData);
    const monthlyTrends = generateMonthlyTrends(filteredData);
    const topPrograms = generateTopPrograms(filteredData);

    // Debug: Check what we're returning
    console.log('API Debug - Top Programs:', topPrograms.slice(0, 3));
    console.log('API Debug - Sample filtered data:', filteredData.slice(0, 2));

    // Calculate summary statistics
    const summaryStats = {
      total_records: filteredData.length,
      total_mau: filteredData.reduce((sum, item) => sum + item.mau, 0),
      avg_mau: filteredData.length > 0 ? 
        Math.round(filteredData.reduce((sum, item) => sum + item.mau, 0) / filteredData.length) : 0,
      total_programs: [...new Set(filteredData.map(item => item.program_name))].length,
      total_channels: [...new Set(filteredData.map(item => item.channel_name))].length,
      total_months: [...new Set(filteredData.map(item => item.viewership_month_year))].length
    };

    // Format the response
    const response = {
      data: paginatedData.map(item => ({
        ...item,
        mau: parseInt(item.mau) || 0,
        pk: parseInt(item.pk) || 0
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
        queryType: 'unifi_viewership_mock',
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
