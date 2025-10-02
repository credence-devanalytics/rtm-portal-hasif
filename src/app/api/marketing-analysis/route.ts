import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { marketingChannelByYear } from '../../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Marketing API called');
    
    // Fetch 2024 data from database
    const currentYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2024),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    // Fetch 2023 data from database
    const previousYearData = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2023),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    // Fetch 2022 data from database
    const year2022Data = await db
      .select()
      .from(marketingChannelByYear)
      .where(and(
        eq(marketingChannelByYear.year, 2022),
        eq(marketingChannelByYear.report_type, 'Chart 1')
      ));

    console.log('2024 data:', currentYearData);
    console.log('2023 data:', previousYearData);
    console.log('2022 data:', year2022Data);

    // Create a map for easy lookup of previous year data
    const previousYearMap = {};
    previousYearData.forEach(item => {
      previousYearMap[item.saluran] = parseFloat(item.value) || 0;
    });

    // Create a map for easy lookup of 2022 data
    const year2022Map = {};
    year2022Data.forEach(item => {
      year2022Map[item.saluran] = parseFloat(item.value) || 0;
    });

    // Calculate percentage change and prepare metrics
    const saluranMetrics = currentYearData.map(item => {
      const currentValue = parseFloat(item.value) || 0;
      const previousValue = previousYearMap[item.saluran] || 0;
      const year2022Value = year2022Map[item.saluran] || 0;
      
      let percentageChange = 0;
      let changeDirection = 'no change';
      
      if (previousValue > 0) {
        percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        changeDirection = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change';
      } else if (currentValue > 0) {
        percentageChange = 100; // New saluran
        changeDirection = 'new';
      }

      return {
        saluran: item.saluran,
        currentValue: currentValue,
        previousValue: previousValue,
        year2022Value: year2022Value,
        percentageChange: Math.abs(percentageChange),
        changeDirection: changeDirection,
        formattedChange: `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`,
        formattedCurrentValue: currentValue.toLocaleString('en-MY', {
          style: 'currency',
          currency: 'MYR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }),
        formattedPreviousValue: previousValue.toLocaleString('en-MY', {
          style: 'currency',
          currency: 'MYR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }),
        formatted2022Value: year2022Value.toLocaleString('en-MY', {
          style: 'currency',
          currency: 'MYR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })
      };
    });

    // Calculate totals
    const totalCurrent = saluranMetrics.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPrevious = saluranMetrics.reduce((sum, item) => sum + item.previousValue, 0);
    const total2022 = saluranMetrics.reduce((sum, item) => sum + item.year2022Value, 0);
    const overallChange = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

    const response = {
      success: true,
      data: {
        saluranMetrics: saluranMetrics,
        summary: {
          totalCurrent,
          totalPrevious,
          total2022,
          overallChange: overallChange.toFixed(1),
          overallDirection: overallChange > 0 ? 'increase' : overallChange < 0 ? 'decrease' : 'no change',
          topSaluran: saluranMetrics[0] || null,
          totalSaluran: saluranMetrics.length,
          activeSaluran: saluranMetrics.length,
          discontinuedSaluran: 0,
          formattedTotalCurrent: totalCurrent.toLocaleString('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }),
          formattedTotalPrevious: totalPrevious.toLocaleString('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }),
          formattedTotal2022: total2022.toLocaleString('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        },
        year: {
          current: 2024,
          previous: 2023,
          year2022: 2022
        }
      }
    };

    console.log('Marketing API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Marketing API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch marketing data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
