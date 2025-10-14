import { NextResponse } from 'next/server';
import { db } from '../../../index';
import { rtmklikGender, rtmklikAge } from '../../../../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Analysis function for advertisement recommendations
function generateRTMKlikAdvertisementAnalysis(data, filters) {
  if (!data || data.length === 0) {
    return {
      targetDemographic: 'No data available',
      recommendations: {
        bestTimes: [],
        peakDays: [],
        peakHours: []
      },
      insights: {
        totalUsers: 0,
        totalSessions: 0,
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

    const targetAgeData = record.ageData.filter(a => ageBrackets.includes(a.age));

    // Calculate total metrics for target demographic (use actual metric names)
    const totalUsers = (targetGender?.activeUsers || targetGender?.users || 0) +
      targetAgeData.reduce((sum, age) => sum + (age.activeUsers || age.users || 0), 0);
    const totalSessions = (targetGender?.screenPageViews || targetGender?.sessions || 0) +
      targetAgeData.reduce((sum, age) => sum + (age.screenPageViews || age.sessions || 0), 0);

    // Calculate engagement score (weighted: users * 1 + sessions * 1.5)
    const engagementScore = totalUsers + (totalSessions * 1.5);

    return {
      date: record.date,
      hour: record.hour,
      dayName: record.dayName,
      totalUsers,
      totalSessions,
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
    users: slot.totalUsers,
    sessions: slot.totalSessions
  }));

  // Analyze peak days
  const dayAnalysis = {};
  timeSlotAnalysis.forEach(slot => {
    if (!dayAnalysis[slot.dayName]) {
      dayAnalysis[slot.dayName] = {
        totalEngagement: 0,
        totalUsers: 0,
        totalSessions: 0,
        slotCount: 0
      };
    }
    dayAnalysis[slot.dayName].totalEngagement += slot.engagementScore;
    dayAnalysis[slot.dayName].totalUsers += slot.totalUsers;
    dayAnalysis[slot.dayName].totalSessions += slot.totalSessions;
    dayAnalysis[slot.dayName].slotCount++;
  });

  const peakDays = Object.entries(dayAnalysis)
    .map(([day, data]) => ({
      day,
      avgEngagement: data.totalEngagement / data.slotCount,
      totalUsers: data.totalUsers,
      totalSessions: data.totalSessions
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 7);

  // Analyze peak hours
  const hourAnalysis = {};
  timeSlotAnalysis.forEach(slot => {
    if (!hourAnalysis[slot.hour]) {
      hourAnalysis[slot.hour] = {
        totalEngagement: 0,
        totalUsers: 0,
        totalSessions: 0,
        slotCount: 0
      };
    }
    hourAnalysis[slot.hour].totalEngagement += slot.engagementScore;
    hourAnalysis[slot.hour].totalUsers += slot.totalUsers;
    hourAnalysis[slot.hour].totalSessions += slot.totalSessions;
    hourAnalysis[slot.hour].slotCount++;
  });

  const peakHours = Object.entries(hourAnalysis)
    .map(([hour, data]) => ({
      hour,
      avgEngagement: data.totalEngagement / data.slotCount,
      totalUsers: data.totalUsers,
      totalSessions: data.totalSessions
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 10);

  // Generate insights
  const totalUsers = timeSlotAnalysis.reduce((sum, slot) => sum + slot.totalUsers, 0);
  const totalSessions = timeSlotAnalysis.reduce((sum, slot) => sum + slot.totalSessions, 0);
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
      totalUsers,
      totalSessions,
      totalDataPoints: timeSlotAnalysis.length,
      peakEngagement,
      trend,
      avgEngagementPerSlot: (totalUsers + (totalSessions * 1.5)) / timeSlotAnalysis.length
    },
    filters
  };
}

export async function GET(request) {
  try {
    console.log('RTMKlik Audience Joined API called');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender') || null;
    const ageRange = searchParams.get('ageRange') || null;
    const dayFilter = searchParams.get('dayFilter') || null;
    const hourFilter = searchParams.get('hourFilter') || null;
    const analysis = searchParams.get('analysis') === 'true';

    console.log('Query parameters:', { gender, ageRange, dayFilter, hourFilter, analysis });

    // Define relevant metrics to include (add actual database metric names)
    const relevantMetrics = ['users', 'sessions', 'activeusers', 'pageviews', 'engagement', 'activeUsers', 'screenPageViews'];

    // Perform the join query using Drizzle ORM
    const joinedData = await db
      .select({
        // Common fields
        date: rtmklikGender.date,
        hour: rtmklikGender.hour,

        // Gender fields
        gender: rtmklikGender.gender,
        genderMetric: rtmklikGender.metric,
        genderValue: rtmklikGender.value,

        // Age fields
        age: rtmklikAge.age,
        ageMetric: rtmklikAge.metric,
        ageValue: rtmklikAge.value,
      })
      .from(rtmklikGender)
      .innerJoin(
        rtmklikAge,
        and(
          eq(rtmklikGender.date, rtmklikAge.date),
          eq(rtmklikGender.hour, rtmklikAge.hour)
        )
      )
      .where(
        and(
          inArray(rtmklikGender.metric, relevantMetrics),
          inArray(rtmklikAge.metric, relevantMetrics)
        )
      )
      .orderBy(
        rtmklikGender.date,
        rtmklikGender.hour,
        rtmklikGender.gender,
        rtmklikAge.age
      )
      .limit(2000); // Higher limit for rtmklik due to metric structure

    console.log(`Retrieved ${joinedData.length} joined records`);

    // Debug: Log sample raw data to understand structure
    if (joinedData.length > 0) {
      console.log('Sample raw data structure:', joinedData.slice(0, 3));
      console.log('Unique metrics found:', [...new Set(joinedData.map(row => row.genderMetric).concat(joinedData.map(row => row.ageMetric)))]);
    }

    // Helper function to get day name from date
    const getDayName = (dateString) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const date = new Date(dateString);
      return days[date.getDay()];
    };

    // Group data by date and hour and organize by metrics
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

      // Process gender data - create entry if doesn't exist
      let genderIndex = acc[key].genderData.findIndex(g => g.gender === row.gender);
      if (genderIndex === -1) {
        // Create new gender entry
        acc[key].genderData.push({
          gender: row.gender,
        });
        genderIndex = acc[key].genderData.length - 1;
      }

      // Add gender metric value
      acc[key].genderData[genderIndex][row.genderMetric] = row.genderValue;

      // Process age data - create entry if doesn't exist
      let ageIndex = acc[key].ageData.findIndex(a => a.age === row.age);
      if (ageIndex === -1) {
        // Create new age entry
        acc[key].ageData.push({
          age: row.age,
        });
        ageIndex = acc[key].ageData.length - 1;
      }

      // Add age metric value
      acc[key].ageData[ageIndex][row.ageMetric] = row.ageValue;

      // Add the specific combination
      acc[key].combinations.push({
        gender: row.gender,
        age: row.age,
        genderMetric: row.genderMetric,
        genderValue: row.genderValue,
        ageMetric: row.ageMetric,
        ageValue: row.ageValue
      });

      return acc;
    }, {});

    // Debug: Log grouped data structure
    const groupedKeys = Object.keys(groupedData);
    if (groupedKeys.length > 0) {
      console.log('Sample grouped data:', groupedData[groupedKeys[0]]);
      console.log('Total grouped records:', groupedKeys.length);
    }

    // Fill in missing metrics with default values and standardize metric names
    Object.values(groupedData).forEach(record => {
      // Standardize gender data
      record.genderData.forEach(gender => {
        gender.users = gender.users || gender.activeusers || 0;
        gender.sessions = gender.sessions || 0;
      });

      // Standardize age data
      record.ageData.forEach(age => {
        age.users = age.users || age.activeusers || 0;
        age.sessions = age.sessions || 0;
      });
    });

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
          const ageMatch = record.ageData.some(a => ageBrackets.includes(a.age));
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
      const analysisResult = generateRTMKlikAdvertisementAnalysis(filteredData, { gender, ageRange, dayFilter, hourFilter });

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

      console.log('RTMKlik Audience Analysis API response prepared');
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

    console.log('RTMKlik Audience Joined API response prepared');
    return NextResponse.json(response);

  } catch (error) {
    console.error('RTMKlik Audience Joined API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rtmklik audience data',
        details: error.message
      },
      { status: 500 }
    );
  }
}