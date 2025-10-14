import { NextResponse } from 'next/server';
import { db } from '../../../index';
import { pberitaAudienceGender, pberitaAudienceAge } from '../../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Analysis function for advertisement recommendations
function generateAdvertisementAnalysis(data, filters) {
  if (!data || data.length === 0) {
    return {
      targetDemographic: 'No data available',
      recommendations: {
        bestTimes: [],
        peakDays: [],
        peakHours: []
      },
      insights: {
        totalActiveUsers: 0,
        totalNewUsers: 0,
        peakEngagement: 'No data',
        trend: 'Insufficient data'
      }
    };
  }

  // Calculate engagement scores for each time slot
  const timeSlotAnalysis = data.map(record => {
    // Get target demographic data
    const targetGender = record.genderData.find(g =>
      filters.gender ? g.gender.toLowerCase() === filters.gender.toLowerCase() : g.gender
    );

    const ageBrackets = filters.ageRange ?
      filters.ageRange.split(',').map(age => age.trim()) :
      ['18-24', '25-34', '35-44', '45-54', '55-64']; // Default to all age brackets

    const targetAgeData = record.ageData.filter(a => ageBrackets.includes(a.ageBracket));

    // Calculate total metrics for target demographic
    const totalActiveUsers = (targetGender?.activeUsers || 0) +
      targetAgeData.reduce((sum, age) => sum + age.activeUsers, 0);
    const totalNewUsers = (targetGender?.newUsers || 0) +
      targetAgeData.reduce((sum, age) => sum + age.newUsers, 0);

    // Calculate engagement score (weighted: active users * 1 + new users * 2)
    const engagementScore = totalActiveUsers + (totalNewUsers * 2);

    return {
      date: record.date,
      hour: record.hour,
      dayName: record.dayName,
      totalActiveUsers,
      totalNewUsers,
      engagementScore,
      genderData: targetGender,
      ageData: targetAgeData
    };
  });

  // Sort by engagement score (descending)
  timeSlotAnalysis.sort((a, b) => b.engagementScore - a.engagementScore);

  // Get top recommendations
  const topTimeSlots = timeSlotAnalysis.slice(0, 10);
  const bestTimes = topTimeSlots.map(slot => ({
    day: slot.dayName,
    hour: slot.hour,
    date: slot.date,
    score: slot.engagementScore,
    activeUsers: slot.totalActiveUsers,
    newUsers: slot.totalNewUsers
  }));

  // Analyze peak days
  const dayAnalysis = {};
  timeSlotAnalysis.forEach(slot => {
    if (!dayAnalysis[slot.dayName]) {
      dayAnalysis[slot.dayName] = {
        totalEngagement: 0,
        totalActiveUsers: 0,
        totalNewUsers: 0,
        slotCount: 0
      };
    }
    dayAnalysis[slot.dayName].totalEngagement += slot.engagementScore;
    dayAnalysis[slot.dayName].totalActiveUsers += slot.totalActiveUsers;
    dayAnalysis[slot.dayName].totalNewUsers += slot.totalNewUsers;
    dayAnalysis[slot.dayName].slotCount++;
  });

  const peakDays = Object.entries(dayAnalysis)
    .map(([day, data]) => ({
      day,
      avgEngagement: data.totalEngagement / data.slotCount,
      totalActiveUsers: data.totalActiveUsers,
      totalNewUsers: data.totalNewUsers
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 7);

  // Analyze peak hours
  const hourAnalysis = {};
  timeSlotAnalysis.forEach(slot => {
    if (!hourAnalysis[slot.hour]) {
      hourAnalysis[slot.hour] = {
        totalEngagement: 0,
        totalActiveUsers: 0,
        totalNewUsers: 0,
        slotCount: 0
      };
    }
    hourAnalysis[slot.hour].totalEngagement += slot.engagementScore;
    hourAnalysis[slot.hour].totalActiveUsers += slot.totalActiveUsers;
    hourAnalysis[slot.hour].totalNewUsers += slot.totalNewUsers;
    hourAnalysis[slot.hour].slotCount++;
  });

  const peakHours = Object.entries(hourAnalysis)
    .map(([hour, data]) => ({
      hour,
      avgEngagement: data.totalEngagement / data.slotCount,
      totalActiveUsers: data.totalActiveUsers,
      totalNewUsers: data.totalNewUsers
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 10);

  // Generate insights
  const totalActiveUsers = timeSlotAnalysis.reduce((sum, slot) => sum + slot.totalActiveUsers, 0);
  const totalNewUsers = timeSlotAnalysis.reduce((sum, slot) => sum + slot.totalNewUsers, 0);
  const peakEngagement = topTimeSlots[0] ?
    `${topTimeSlots[0].dayName} ${topTimeSlots[0].hour}` : 'No data';

  // Identify trends
  let trend = 'No clear pattern detected';
  if (peakDays.length >= 2) {
    const topDay = peakDays[0].day;
    const isWeekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(topDay);
    const isWeekend = ['Saturday', 'Sunday'].includes(topDay);

    if (isWeekday) {
      trend = `Higher engagement on weekdays, particularly ${topDay}`;
    } else if (isWeekend) {
      trend = `Higher engagement on weekends, particularly ${topDay}`;
    }
  }

  const targetDemo = [];
  if (filters.gender) targetDemo.push(filters.gender);
  if (filters.ageRange) targetDemo.push(filters.ageRange);

  return {
    targetDemographic: targetDemo.length > 0 ? targetDemo.join(', ') : 'All demographics',
    recommendations: {
      bestTimes,
      peakDays: peakDays.map(d => ({ day: d.day, score: d.avgEngagement })),
      peakHours: peakHours.map(h => ({ hour: h.hour, score: h.avgEngagement }))
    },
    insights: {
      totalActiveUsers,
      totalNewUsers,
      totalDataPoints: timeSlotAnalysis.length,
      peakEngagement,
      trend,
      avgEngagementPerSlot: totalActiveUsers + (totalNewUsers * 2) / timeSlotAnalysis.length
    },
    filters
  };
}

export async function GET(request) {
  try {
    console.log('PBerita Audience Joined API called');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender') || null;
    const ageRange = searchParams.get('ageRange') || null;
    const dayFilter = searchParams.get('dayFilter') || null;
    const hourFilter = searchParams.get('hourFilter') || null;
    const analysis = searchParams.get('analysis') === 'true';

    console.log('Query parameters:', { gender, ageRange, dayFilter, hourFilter, analysis });

    // Perform the join query using Drizzle ORM
    const joinedData = await db
      .select({
        // Common fields
        date: pberitaAudienceGender.date,
        hour: pberitaAudienceGender.hour,

        // Gender fields
        userGender: pberitaAudienceGender.usergender,
        activeUsersGender: pberitaAudienceGender.activeusers,
        newUsersGender: pberitaAudienceGender.newusers,

        // Age fields
        userAgeBracket: pberitaAudienceAge.useragebracket,
        activeUsersAge: pberitaAudienceAge.activeusers,
        newUsersAge: pberitaAudienceAge.newusers,
      })
      .from(pberitaAudienceGender)
      .innerJoin(
        pberitaAudienceAge,
        and(
          eq(pberitaAudienceGender.date, pberitaAudienceAge.date),
          eq(pberitaAudienceGender.hour, pberitaAudienceAge.hour)
        )
      )
      .orderBy(
        pberitaAudienceGender.date,
        pberitaAudienceGender.hour,
        pberitaAudienceGender.usergender,
        pberitaAudienceAge.useragebracket
      )
      .limit(1000); // Limit to prevent excessive data

    console.log(`Retrieved ${joinedData.length} joined records`);

    // Helper function to get day name from date
    const getDayName = (dateString) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const date = new Date(dateString);
      return days[date.getDay()];
    };

    // Group data by date and hour for better structure
    const groupedData = joinedData.reduce((acc, row) => {
      const key = `${row.date}_${row.hour}`;

      if (!acc[key]) {
        acc[key] = {
          date: row.date,
          hour: row.hour,
          dayName: getDayName(row.date),
          genderData: [],
          ageData: [],
          combinations: []
        };
      }

      // Add gender data if not already added
      if (!acc[key].genderData.find(g => g.gender === row.userGender)) {
        acc[key].genderData.push({
          gender: row.userGender,
          activeUsers: row.activeUsersGender,
          newUsers: row.newUsersGender
        });
      }

      // Add age data if not already added
      if (!acc[key].ageData.find(a => a.ageBracket === row.userAgeBracket)) {
        acc[key].ageData.push({
          ageBracket: row.userAgeBracket,
          activeUsers: row.activeUsersAge,
          newUsers: row.newUsersAge
        });
      }

      // Add the specific combination
      acc[key].combinations.push({
        gender: row.userGender,
        ageBracket: row.userAgeBracket,
        genderActiveUsers: row.activeUsersGender,
        genderNewUsers: row.newUsersGender,
        ageActiveUsers: row.activeUsersAge,
        ageNewUsers: row.newUsersAge
      });

      return acc;
    }, {});

    const result = Object.values(groupedData);

    // Apply filters if provided
    let filteredData = result;
    if (gender || ageRange || dayFilter || hourFilter) {
      filteredData = result.filter(record => {
        // Gender filter
        if (gender) {
          const genderMatch = record.genderData.some(g => g.gender.toLowerCase() === gender.toLowerCase());
          if (!genderMatch) return false;
        }

        // Age range filter (comma-separated)
        if (ageRange) {
          const ageBrackets = ageRange.split(',').map(age => age.trim());
          const ageMatch = record.ageData.some(a => ageBrackets.includes(a.ageBracket));
          if (!ageMatch) return false;
        }

        // Day filter
        if (dayFilter) {
          if (dayFilter.toLowerCase() === 'weekdays') {
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            if (!weekdays.includes(record.dayName)) return false;
          } else if (dayFilter.toLowerCase() === 'weekends') {
            const weekends = ['Saturday', 'Sunday'];
            if (!weekends.includes(record.dayName)) return false;
          } else {
            // Specific day name
            if (record.dayName.toLowerCase() !== dayFilter.toLowerCase()) return false;
          }
        }

        // Hour filter (range or specific hour)
        if (hourFilter) {
          if (hourFilter.includes('-')) {
            // Time range like "09:00-17:00"
            const [start, end] = hourFilter.split('-');
            const recordHour = parseInt(record.hour);
            const startHour = parseInt(start.replace(':', ''));
            const endHour = parseInt(end.replace(':', ''));
            if (recordHour < startHour || recordHour > endHour) return false;
          } else {
            // Specific hour
            if (record.hour !== hourFilter) return false;
          }
        }

        return true;
      });
    }

    // If analysis mode, generate recommendations
    if (analysis) {
      const analysisResult = generateAdvertisementAnalysis(filteredData, { gender, ageRange, dayFilter, hourFilter });

      const response = {
        success: true,
        analysis: analysisResult,
        rawData: {
          joinedData: filteredData,
          totalCount: filteredData.length,
          recordCount: joinedData.length,
          filters: { gender, ageRange, dayFilter, hourFilter }
        }
      };

      console.log('PBerita Audience Analysis API response prepared');
      return NextResponse.json(response);
    }

    const response = {
      success: true,
      data: {
        joinedData: filteredData,
        totalCount: filteredData.length,
        recordCount: joinedData.length,
        filters: { gender, ageRange, dayFilter, hourFilter },
        sampleRawData: joinedData.slice(0, 5) // Show first 5 raw records for reference
      }
    };

    console.log('PBerita Audience Joined API response prepared');
    return NextResponse.json(response);

  } catch (error) {
    console.error('PBerita Audience Joined API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch joined audience data',
        details: error.message
      },
      { status: 500 }
    );
  }
}