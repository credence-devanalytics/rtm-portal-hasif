import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { pbAudienceGender } from '../../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('PB Gender Distribution API called');
    
    // Fetch gender distribution data and group by gender
    const genderData = await db
      .select({
        userGender: pbAudienceGender.userGender,
        totalActiveUsers: sql`SUM(${pbAudienceGender.activeUsers})`.as('totalActiveUsers'),
        totalNewUsers: sql`SUM(${pbAudienceGender.newUsers})`.as('totalNewUsers'),
        recordCount: sql`COUNT(*)`.as('recordCount')
      })
      .from(pbAudienceGender)
      .groupBy(pbAudienceGender.userGender);

    console.log('PB Gender data:', genderData);

    // Process data for charts
    const chartData = genderData.map(item => ({
      gender: item.userGender,
      activeUsers: parseInt(item.totalActiveUsers) || 0,
      newUsers: parseInt(item.totalNewUsers) || 0,
      recordCount: parseInt(item.recordCount) || 0,
      percentage: 0 // Will calculate after getting totals
    }));

    // Calculate percentages
    const totalUsers = chartData.reduce((sum, item) => sum + item.activeUsers, 0);
    chartData.forEach(item => {
      item.percentage = totalUsers > 0 ? 
        parseFloat(((item.activeUsers / totalUsers) * 100).toFixed(1)) : 0;
    });

    // Sort for consistent display (female, male, other)
    chartData.sort((a, b) => {
      const genderOrder = { 'female': 1, 'male': 2 };
      return (genderOrder[a.gender] || 999) - (genderOrder[b.gender] || 999);
    });

    // Find dominant gender
    const dominantGender = chartData.reduce((max, item) => 
      item.activeUsers > max.activeUsers ? item : max, chartData[0] || {}
    );

    const response = {
      success: true,
      data: {
        chartData,
        summary: {
          totalUsers,
          totalNewUsers: chartData.reduce((sum, item) => sum + item.newUsers, 0),
          dominantGender: dominantGender.gender || 'N/A',
          dominantPercentage: dominantGender.percentage || 0,
          genderRatio: chartData.length >= 2 ? {
            female: chartData.find(item => item.gender === 'female')?.percentage || 0,
            male: chartData.find(item => item.gender === 'male')?.percentage || 0
          } : null
        }
      }
    };

    console.log('PB Gender Distribution API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('PB Gender Distribution API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PB gender distribution data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}